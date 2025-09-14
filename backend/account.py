from fastapi import Query, APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
import os
# Load .env if needed
from dotenv import load_dotenv
load_dotenv()
SUPABASE_URL = "https://tsdqdpwprlhilajqurue.supabase.co"
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

router = APIRouter()

# Create Supabase client
sb: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

class UpdateNameRequest(BaseModel):
    user_id: str
    name: str

# Get name by user_id
@router.get("/get-name")
def get_name(user_id: str = Query(..., description="User ID")):
    try:
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
        res = sb.table("profiles").update({"name": payload.name}).eq("id", payload.user_id).execute()
        return {"message": "Name updated"}
    except Exception as e:
        raise HTTPException(400, detail=f"Post name error: {e}")

# Get email by user_id
@router.get("/get-email")
def get_email(user_id: str = Query(..., description="User ID")):
    try:
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
        sb.auth.sign_out()
        return {"message": "Signed out"}
    except Exception as e:
        raise HTTPException(400, detail=f"Sign out error: {e}")