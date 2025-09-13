from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from supabase import create_client, Client
from supabase_api import SUPABASE_URL, SUPABASE_ANON_KEY

router = APIRouter()
sb: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

class UpdateStatsRequest(BaseModel):
	user_id: str
	points: int = None
	eggs: int = None
	streak: int = None
	level: str = None

# Get stats by user_id
@router.get("/get-stats")
def get_stats(user_id: str = Query(..., description="User ID")):
	try:
		res = sb.table("profiles").select("points,eggs,streak,level").eq("id", user_id).single().execute()
		if not res.data:
			raise HTTPException(404, detail="Stats not found")
		return {
			"points": res.data.get("points"),
			"eggs": res.data.get("eggs"),
			"streak": res.data.get("streak"),
			"level": res.data.get("level")
		}
	except Exception as e:
		raise HTTPException(400, detail=f"Get stats error: {e}")

# Update stats by user_id (partial update allowed)
@router.post("/post-stats")
def post_stats(payload: UpdateStatsRequest):
	try:
		update_fields = {}
		if payload.points is not None:
			update_fields["points"] = payload.points
		if payload.eggs is not None:
			update_fields["eggs"] = payload.eggs
		if payload.streak is not None:
			update_fields["streak"] = payload.streak
		if payload.level is not None:
			update_fields["level"] = payload.level
		if not update_fields:
			raise HTTPException(400, detail="No fields to update")
		sb.table("profiles").update(update_fields).eq("id", payload.user_id).execute()
		return {"message": "Stats updated"}
	except Exception as e:
		raise HTTPException(400, detail=f"Post stats error: {e}")
