import os
from typing import Any, Dict, Iterable, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

# Load .env into environment variables
load_dotenv()

# If GOOGLE_API_KEY (or GEMINI_API_KEY) is set, the client will pick it up automatically
client = genai.Client()

app = FastAPI(title="Honkonomics Gemini API")

# Enable CORS for local dev and frontend access (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------- Models --------------
class ChatMessage(BaseModel):
    role: str = Field(description="'user' or 'assistant' (aka 'model')")
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(default_factory=list)
    model: str = Field(default="gemini-2.5-flash")
    system_instruction: Optional[str] = Field(
        default="You are a financial advisor in investing. Your name is Honk."
    )
    temperature: Optional[float] = 0.8
    max_output_tokens: Optional[int] = 1024


class ChatResponse(BaseModel):
    text: str
    model: Optional[str] = None
    finish_reason: Optional[str] = None


# -------------- Helpers --------------
def _require_api_key():
    if not (os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")):
        raise HTTPException(status_code=500, detail="Missing GOOGLE_API_KEY/GEMINI_API_KEY in environment")


def _to_contents(messages: List[ChatMessage]) -> List[types.Content]:
    contents: List[types.Content] = []
    for m in messages:
        role = m.role.strip().lower()
        if role in ("assistant", "model", "ai", "bot"):
            role = "model"
        else:
            role = "user"
        contents.append(
            types.Content(
                role=role,
                parts=[types.Part.from_text(m.content)],
            )
        )
    return contents


def _sse(data: str, event: Optional[str] = None) -> str:
    lines = []
    if event:
        lines.append(f"event: {event}")
    # Split into lines to be SSE-compliant
    for line in (data.splitlines() or [""]):
        lines.append(f"data: {line}")
    lines.append("")  # end of message
    return "\n".join(lines) + "\n"


# -------------- Routes --------------
@app.get("/health")
def health():
    return {"ok": True}


@app.post("/gemini/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    """Non-streaming endpoint: returns the full model text."""
    _require_api_key()

    contents = _to_contents(req.messages)
    config = types.GenerateContentConfig(
        system_instruction=req.system_instruction,
        temperature=req.temperature,
        max_output_tokens=req.max_output_tokens,
    )

    try:
        result = client.models.generate_content(
            model=req.model,
            contents=contents,
            config=config,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini error: {e}")

    # result.text aggregates text across candidates/parts
    finish_reason = None
    try:
        # best-effort extraction if available
        if result.candidates and len(result.candidates) > 0:
            finish_reason = getattr(result.candidates[0], "finish_reason", None)
    except Exception:
        pass

    return ChatResponse(text=getattr(result, "text", ""), model=req.model, finish_reason=finish_reason)


@app.post("/gemini/chat/stream")
def chat_stream(req: ChatRequest):
    """Streaming endpoint via Server-Sent Events (SSE). Yields incremental tokens in 'data:' frames.

    Note: Use fetch() with a ReadableStream on the frontend (EventSource is GET-only).
    """
    _require_api_key()

    contents = _to_contents(req.messages)
    config = types.GenerateContentConfig(
        system_instruction=req.system_instruction,
        temperature=req.temperature,
        max_output_tokens=req.max_output_tokens,
    )

    def event_generator() -> Iterable[bytes]:
        try:
            stream = client.models.generate_content_stream(
                model=req.model,
                contents=contents,
                config=config,
            )
            for chunk in stream:
                text = getattr(chunk, "text", None)
                if text:
                    yield _sse(text).encode("utf-8")
            # signal completion
            yield _sse("[DONE]", event="done").encode("utf-8")
        except Exception as e:
            yield _sse(f"error: {e}", event="error").encode("utf-8")

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            # CORS preflight handled by middleware
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.gemini_api:app", host="0.0.0.0", port=8002, reload=True)
    
