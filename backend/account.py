from fastapi import Query, APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
from typing import Optional
import os
from dotenv import load_dotenv, find_dotenv

# Load environment from .env if present
load_dotenv(find_dotenv())
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

router = APIRouter()

# Lazy Supabase client so app can boot without env set
_sb: Optional[Client] = None

def get_sb() -> Client:
    global _sb
    if _sb is None:
        if not SUPABASE_URL or not SUPABASE_ANON_KEY:
            raise HTTPException(
                500,
                detail="Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in environment.",
            )
        _sb = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    return _sb

class UpdateNameRequest(BaseModel):
    user_id: str
    name: str

# Get name by user_id
@router.get("/get-name")
def get_name(user_id: str = Query(..., description="User ID")):
    try:
        sb = get_sb()
        res = sb.table("profiles").select("name").eq("id", user_id).single().execute()
        if not res.data or "name" not in res.data:
            raise HTTPException(404, detail="Name not found")
        return {"name": res.data["name"]}
    except Exception as e:
        raise HTTPException(400, detail=f"Get name error: {e}")

# Update name by user_id
@router.post("/post-name")
def post_name(payload: UpdateNameRequest):
    try:
        sb = get_sb()
        sb.table("profiles").update({"name": payload.name}).eq("id", payload.user_id).execute()
        return {"message": "Name updated"}
    except Exception as e:
        raise HTTPException(400, detail=f"Post name error: {e}")

# Get email by user_id
@router.get("/get-email")
def get_email(user_id: str = Query(..., description="User ID")):
    try:
        sb = get_sb()
        res = sb.table("profiles").select("email").eq("id", user_id).single().execute()
        if not res.data or "email" not in res.data:
            raise HTTPException(404, detail="Email not found")
        return {"email": res.data["email"]}
    except Exception as e:
        raise HTTPException(400, detail=f"Get email error: {e}")

class SignUpRequest(BaseModel):
    email: str
    password: str
    name: str

class LoginRequest(BaseModel):
    email: str
    password: str

class SignOutRequest(BaseModel):
    access_token: str

@router.post("/signup")
def signup(payload: SignUpRequest):
    try:
        sb = get_sb()
        # Create user in Supabase Auth
        auth_resp = sb.auth.sign_up({"email": payload.email, "password": payload.password})
        if not auth_resp.user:
            raise HTTPException(400, detail="Sign up failed")
        user_id = auth_resp.user.id
        # Insert into profiles table
        profile = {
            "id": user_id,
            "name": payload.name,
            "email": payload.email
        }
        sb.table("profiles").insert(profile).execute()
        return {"message": "Sign up successful", "user": auth_resp.user}
    except Exception as e:
        raise HTTPException(400, detail=f"Sign up error: {e}")


@router.post("/login")
def login(payload: LoginRequest):
    try:
        sb = get_sb()
        auth_resp = sb.auth.sign_in_with_password({"email": payload.email, "password": payload.password})
        if not auth_resp.session:
            raise HTTPException(401, detail="Invalid credentials")
        return {
            "message": "Login successful",
            "user_id": auth_resp.user.id if auth_resp.user else None,
            "email": auth_resp.user.email if auth_resp.user else None
        }
    except Exception as e:
        raise HTTPException(400, detail=f"Login error: {e}")

@router.post("/signout")
def signout(payload: SignOutRequest):
    try:
        sb = get_sb()
        sb.auth.sign_out()
        return {"message": "Signed out"}
    except Exception as e:
        raise HTTPException(400, detail=f"Sign out error: {e}")


class SetInvestEaseClientRequest(BaseModel):
    email: str
    investEaseClientId: str


@router.post("/set-investease")
def set_investease_client(payload: SetInvestEaseClientRequest):
    """Persist InvestEase (RBC sandbox) client id to profiles by email.

    Tries common column names if schema varies.
    """
    try:
        sb = get_sb()
        columns_try = [
            "investease_client_id",
            "invest_ease_client_id",
            "investEaseClientId",
        ]
        last_err = None
        for col in columns_try:
            try:
                sb.table("profiles").update({col: payload.investEaseClientId}).eq("email", payload.email).execute()
                return {"message": "Saved", "column": col}
            except Exception as e:
                last_err = e
                continue
        raise HTTPException(400, detail=f"Failed to save investEaseClientId: {last_err}")
    except Exception as e:
        raise HTTPException(400, detail=f"set_investease error: {e}")
