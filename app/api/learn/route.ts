import { NextResponse } from "next/server";

// Minimal schema we expect back from Gemini
import type { MiniCourse, ExperienceLevel, MiniCourseResource } from "@/types/mini-course";

type PostBody = {
  topic?: string;
  level?: ExperienceLevel;
};

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function POST(req: Request) {
  try {
    const { topic, level }: PostBody = await req.json();
    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: "Missing 'topic'" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server missing GEMINI_API_KEY/GOOGLE_API_KEY" },
        { status: 500 }
      );
    }

    const prompt = buildPrompt(topic, level ?? "beginner");

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // We request JSON-only output via instruction; parsing logic handles stray fences.
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.6,
          // Some deployments accept responseMimeType; instruction already enforces JSON.
        },
      }),
      // Explicitly ensure this runs on the server
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await safeText(res);
      return NextResponse.json(
        { error: `Gemini request failed: ${res.status} ${res.statusText}`, details: text },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text = extractTextFromCandidates(data);
    if (!text) {
      return NextResponse.json(
        { error: "No content returned from Gemini" },
        { status: 502 }
      );
    }

    const parsed = parseJSON<MiniCourse>(text);
    if (!parsed.ok) {
      return NextResponse.json(
        { error: "Failed to parse Gemini JSON", details: parsed.error, raw: text },
        { status: 502 }
      );
    }

    // Minimal shape validation
    if (!parsed.value.title || !Array.isArray(parsed.value.lessons)) {
      return NextResponse.json(
        { error: "Invalid MiniCourse structure", raw: parsed.value },
        { status: 502 }
      );
    }

    // Sanitize/validate resource URLs to avoid bad or non-existent links
    try {
      parsed.value.resources = sanitizeResources(parsed.value.resources || []);
    } catch {
      // If sanitization fails for any reason, fall back to an empty list
      parsed.value.resources = [];
    }

    return NextResponse.json(parsed.value satisfies MiniCourse);
  } catch (e: any) {
    return NextResponse.json(
      { error: "Unhandled error", details: String(e?.message || e) },
      { status: 500 }
    );
  }
}

function buildPrompt(topic: string, level: ExperienceLevel): string {
  return `You are Honk, a friendly investing tutor. Create a concise mini-course in strict JSON for the topic below.

Rules:
- Output ONLY a single JSON object that matches the schema exactly — no prose, no markdown fences.
- Keep it beginner-friendly unless a higher level is provided.
- Favor practical, actionable steps. Keep it within ~30-45 minutes overall.
 - For 
   resources: provide 2–4 specific, reputable links with fully qualified https:// URLs. Prioritize:
   • RBC Learn (https://www.rbcroyalbank.com/learn/),
   • Investopedia canonical term or ask/answers pages, and
   • Official regulators/government (e.g., https://www.irs.gov, https://www.canada.ca, https://www.sec.gov).
   Do not invent or approximate paths. Avoid homepages and search result pages. Use exact, working pages only.

Schema (use these exact keys and types):
{
  "topic": string,
  "title": string,
  "overview": string,
  "estimatedDuration": string, // e.g. "35 min"
  "level": "beginner" | "intermediate" | "advanced",
  "prerequisites": string[],
  "lessons": [
    {
      "title": string,
      "summary": string,
      "durationMinutes": number,
      "objectives": string[],
      "outline": string[],
      "activity": string,
      "quiz"?: {
        "question": string,
        "options": string[],
        "answerIndex": number,
        "explanation": string
      }
    }
  ],
  "resources": [ { "title": string, "url": string } ]
}

Topic: ${topic}
Audience level: ${level}
`;
}

function extractTextFromCandidates(resp: any): string | undefined {
  try {
    const cands = resp?.candidates;
    if (!Array.isArray(cands) || !cands[0]) return undefined;
    const parts = cands[0]?.content?.parts;
    if (Array.isArray(parts)) {
      const textPart = parts.find((p: any) => typeof p?.text === "string");
      if (textPart?.text) return textPart.text as string;
    }
    // Some responses flatten text
    if (typeof resp?.text === "string") return resp.text as string;
    return undefined;
  } catch {
    return undefined;
  }
}

async function safeText(res: Response): Promise<string | undefined> {
  try {
    return await res.text();
  } catch {
    return undefined;
  }
}

function parseJSON<T>(raw: string): { ok: true; value: T } | { ok: false; error: string } {
  try {
    // Strip Markdown code fences if present
    const cleaned = raw
      .trim()
      .replace(/^```(json)?/i, "")
      .replace(/```$/i, "")
      .trim();
    const val = JSON.parse(cleaned) as T;
    return { ok: true, value: val };
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) };
  }
}

// --- URL sanitization for model-provided resources ---
function sanitizeResources(resources: MiniCourseResource[]): MiniCourseResource[] {
  const allowHosts = new Set([
    "www.investopedia.com",
    "investopedia.com", // will canonicalize to www.
    "www.rbcroyalbank.com",
    "rbcroyalbank.com", // canonicalize
    "www.canada.ca",
    "canada.ca",
    "www.irs.gov",
    "irs.gov",
    "www.sec.gov",
    "sec.gov",
    "www.bankofengland.co.uk",
    "bankofengland.co.uk",
    "www.investor.gov",
    "investor.gov",
  ]);

  const cleaned: MiniCourseResource[] = [];
  for (const r of resources) {
    if (!r || typeof r.title !== "string" || typeof r.url !== "string") continue;
    const title = r.title.trim() || "Resource";
    const url = canonicalizeUrl(r.url);
    if (!url) continue;
    try {
      const u = new URL(url);
      // only allow http/https
      if (!/^https?:$/.test(u.protocol)) continue;
      // only allow known-good hosts
      if (!allowHosts.has(u.hostname)) continue;
      // canonicalize investopedia host to www
      if (u.hostname === "investopedia.com") u.hostname = "www.investopedia.com";
      if (u.hostname === "rbcroyalbank.com") u.hostname = "www.rbcroyalbank.com";

      cleaned.push({ title, url: u.toString() });
    } catch {
      // skip malformed URLs
    }
  }

  // If all resources were filtered out, provide safe generic fallbacks
  if (cleaned.length === 0) {
    cleaned.push(
      { title: "What Is an ETF?", url: "https://www.investopedia.com/terms/e/etf.asp" },
      { title: "Dollar-Cost Averaging", url: "https://www.investopedia.com/terms/d/dollarcostaveraging.asp" }
    );
  }

  // Limit to at most 4 items to keep UI tidy
  return cleaned.slice(0, 4);
}

function canonicalizeUrl(raw: string | undefined | null): string | null {
  if (!raw) return null;
  let s = String(raw).trim();
  // Strip markdown link syntax if present: [text](url)
  const mdMatch = s.match(/\((https?:\/\/[^)]+)\)/);
  if (mdMatch) s = mdMatch[1];

  // If it looks like a bare domain or starts with www., add https://
  if (/^www\./i.test(s)) s = `https://${s}`;
  if (/^[a-z0-9.-]+\.[a-z]{2,}($|\/)/i.test(s) && !/^https?:\/\//i.test(s)) {
    s = `https://${s}`;
  }

  // Basic sanity: must be http(s) URL with a hostname
  try {
    const u = new URL(s);
    if (!/^https?:$/.test(u.protocol) || !u.hostname) return null;
    return u.toString();
  } catch {
    return null;
  }
}
