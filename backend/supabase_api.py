# supabase_api.py
# Minimal FastAPI → Supabase bridge with no .env
# Run: uvicorn supabase_api:app --reload --port 8001

from __future__ import annotations
from typing import Any, Dict, List, Optional, Union
from dataclasses import dataclass

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from supabase import create_client, Client
import os
from dotenv import load_dotenv

 # ----------------- CONFIG (edit these) -----------------
# Load .env into environment variables
load_dotenv()

SUPABASE_URL = "https://tsdqdpwprlhilajqurue.supabase.co"
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
if not SUPABASE_ANON_KEY:
    raise RuntimeError("Missing SUPABASE_ANON_KEY in environment")

# The frontend origin allowed to call this API:
FRONTEND_ORIGINS = ["http://localhost:8000", "http://localhost:3000","https://htn2025-508985230aed.herokuapp.com","https://v2webhonkonomics.vercel.app"]  # list of strings

# Optional table allowlist. Keep [] to allow all during dev.
ALLOWED_TABLES: List[str] = []  
# -------------------------------------------------------

# Create a single Supabase client
try:
    sb: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
except Exception as e:
    raise RuntimeError(f"Failed to create Supabase client: {e}")



app = FastAPI(title="Supabase Bridge")

# Mount the stats router
from stats import router as stats_router
app.include_router(stats_router)

# Mount the account router
from account import router as account_router
app.include_router(account_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Pydantic models for safe requests ----------

class Filter(BaseModel):
    column: str
    op: str = Field(
        "eq",
        description="One of: eq, neq, gt, gte, lt, lte, like, ilike, is, in"
    )
    value: Any

    @field_validator("op")
    def validate_op(cls, v: str):
        allowed = {"eq","neq","gt","gte","lt","lte","like","ilike","is","in"}
        if v not in allowed:
            raise ValueError("Unsupported op")
        return v

class Order(BaseModel):
    column: str
    ascending: bool = True
    nullsfirst: bool = False

class SelectQuery(BaseModel):
    columns: str = "*"
    filters: Optional[List[Filter]] = None
    limit: Optional[int] = Field(None, ge=1, le=10000)
    order: Optional[Order] = None

class InsertPayload(BaseModel):
    rows: Union[Dict[str, Any], List[Dict[str, Any]]]

class UpsertPayload(BaseModel):
    rows: Union[Dict[str, Any], List[Dict[str, Any]]]
    on_conflict: Optional[str] = None  # e.g., "id"

class UpdatePayload(BaseModel):
    values: Dict[str, Any]
    filters: List[Filter]

class DeletePayload(BaseModel):
    filters: List[Filter]

# ------------- Small helpers -------------
def _check_table_allowed(table: str) -> None:
    if ALLOWED_TABLES and table not in ALLOWED_TABLES:
        raise HTTPException(status_code=403, detail="Table not allowed")

def _apply_filters(q, filters: Optional[List[Filter]]):
    if not filters:
        return q
    for f in filters:
        op = f.op
        col = f.column
        val = f.value
        if op == "eq":
            q = q.eq(col, val)
        elif op == "neq":
            q = q.neq(col, val)
        elif op == "gt":
            q = q.gt(col, val)
        elif op == "gte":
            q = q.gte(col, val)
        elif op == "lt":
            q = q.lt(col, val)
        elif op == "lte":
            q = q.lte(col, val)
        elif op == "like":
            q = q.like(col, val)   # e.g. "%foo%"
        elif op == "ilike":
            q = q.ilike(col, val)  # e.g. "%foo%"
        elif op == "is":
            q = q.is_(col, val)    # None/true/false
        elif op == "in":
            if not isinstance(val, (list, tuple)):
                raise HTTPException(400, detail="Filter 'in' expects list value")
            q = q.in_(col, list(val))
        else:
            raise HTTPException(400, detail=f"Unsupported op: {op}")
    return q

# ------------- Routes -------------

@app.get("/sb/health")
def health():
    # Hide the key; just confirm URL looks OK.
    return {"ok": True, "url": SUPABASE_URL}

@app.post("/sb/select/{table}")
def select_rows(table: str, payload: SelectQuery):
    _check_table_allowed(table)
    try:
        q = sb.table(table).select(payload.columns)
        q = _apply_filters(q, payload.filters)
        if payload.order:
            q = q.order(payload.order.column, desc=not payload.order.ascending, nullsfirst=payload.order.nullsfirst)
        if payload.limit:
            q = q.limit(payload.limit)
        res = q.execute()
        return {"data": res.data}
    except Exception as e:
        raise HTTPException(400, detail=f"Select failed: {e}")

@app.post("/sb/insert/{table}")
def insert_rows(table: str, payload: InsertPayload):
    _check_table_allowed(table)
    rows = payload.rows if isinstance(payload.rows, list) else [payload.rows]
    try:
        res = sb.table(table).insert(rows).execute()
        return {"data": res.data}
    except Exception as e:
        raise HTTPException(400, detail=f"Insert failed: {e}")

@app.post("/sb/upsert/{table}")
def upsert_rows(table: str, payload: UpsertPayload):
    _check_table_allowed(table)
    rows = payload.rows if isinstance(payload.rows, list) else [payload.rows]
    try:
        q = sb.table(table).upsert(rows)
        if payload.on_conflict:
            q = q.on_conflict(payload.on_conflict)
        res = q.execute()
        return {"data": res.data}
    except Exception as e:
        raise HTTPException(400, detail=f"Upsert failed: {e}")

@app.post("/sb/update/{table}")
def update_rows(table: str, payload: UpdatePayload):
    _check_table_allowed(table)
    try:
        q = sb.table(table).update(payload.values)
        q = _apply_filters(q, payload.filters)
        res = q.execute()
        return {"data": res.data}
    except Exception as e:
        raise HTTPException(400, detail=f"Update failed: {e}")

@app.post("/sb/delete/{table}")
def delete_rows(table: str, payload: DeletePayload):
    _check_table_allowed(table)
    try:
        q = sb.table(table).delete()
        q = _apply_filters(q, payload.filters)
        res = q.execute()
        return {"data": res.data}
    except Exception as e:
        raise HTTPException(400, detail=f"Delete failed: {e}")
