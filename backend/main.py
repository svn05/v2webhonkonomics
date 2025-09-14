# main.py
# pip install fastapi uvicorn httpx

import asyncio, time
from datetime import datetime
from typing import Optional

import httpx
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException

# ----------------- CONFIG (no .env) -----------------
RBC_BASE = "https://2dcq63co40.execute-api.us-east-1.amazonaws.com/dev"
# Allowed frontend origins for CORS
FRONTEND_ORIGINS = ["http://localhost:3000", "http://localhost:5432","https://v2webhonkonomics.vercel.app"]  # change to your React origin(s)
TEAM_NAME = "TeamSYDE"
CONTACT_EMAIL = "david.olejniczak@icloud.com"
PRESEEDED_JWT: Optional[str] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZWFtSWQiOiI0YmRjMDc0Ny01MWE4LTQ2YTktODBhZC0yNGE0Y2IxMTllMTAiLCJ0ZWFtX25hbWUiOiJUZWFtU1lERSIsImNvbnRhY3RfZW1haWwiOiJkYXZpZC5vbGVqbmljemFrQGljbG91ZC5jb20iLCJleHAiOjE3NTg2MTA3ODQuNzQzODYzfQ.xPGypKCcddtKLGIhvX9qxZYRN6qd9ILD1Ks9dVDt9QU"
PRESEEDED_EXPIRES_AT: Optional[str] = "2025-09-23T06:59:44.743863Z" 
# ----------------------------------------------------

app = FastAPI(title="InvestEase BFF")

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_token: Optional[str] = PRESEEDED_JWT

@app.get("/health")
async def health():
    return {"ok": True}

# Catch-all proxy: your frontend calls /investease/<path>, we forward to RBC
@app.api_route("/investease/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def investease_proxy(request: Request, path: str):
    upstream_url = f"{RBC_BASE}/{path.lstrip('/')}"
    method = request.method
    params = dict(request.query_params.multi_items())
    body_bytes = await request.body()
    send_body = None if method in ("GET", "HEAD") else (body_bytes or None)

    headers = {
        "Authorization": f"Bearer {_token}",
        "Content-Type": request.headers.get("content-type", "application/json"),
        "Accept": request.headers.get("accept", "application/json"),
    }

    async with httpx.AsyncClient() as client:
        r = await client.request(
            method=method,
            url=upstream_url,
            params=params,
            content=send_body,
            headers=headers,
            timeout=30,
        )

    return Response(content=r.content, status_code=r.status_code,
                    media_type=r.headers.get("content-type", "application/json"))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)