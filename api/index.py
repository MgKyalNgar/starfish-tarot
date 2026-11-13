import os
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from supabase import create_client, Client

app = FastAPI()

# Vercel Environment Variables ထဲမှ Supabase Keys များကို လှမ်းယူခြင်း
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
# Admin API အတွက်သာ သုံးသော Secret key (service_role နဲ့ ညီသည်)။
# Server ဘက်မှာသာ ရှိရမည်။ Browser code ထဲမှာ ဘယ်တော့မှ မထည့်ရ။
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

# Supabase နဲ့ ချိတ်ဆက်ရန် Client တည်ဆောက်ခြင်း
if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print("Warning: Supabase credentials not found!")

_admin_client = None


def get_admin_client():
    """Service-role client (RLS ကို ကျော်သည်)။ Admin API အတွက်သာ သုံးသည်။"""
    global _admin_client
    if _admin_client is not None:
        return _admin_client
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(
            status_code=500,
            detail="Admin API is not configured: SUPABASE_SERVICE_ROLE_KEY is missing",
        )
    _admin_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _admin_client


async def verify_user_jwt(request: Request):
    """Caller ၏ JWT ကို စစ်ပြီး Supabase Auth user ကို ပြန်ပေးသည်။"""
    auth_header = request.headers.get("authorization", "")
    if not auth_header.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Login required")
    jwt = auth_header[7:].strip()
    if not jwt:
        raise HTTPException(status_code=401, detail="Login required")

    admin_client = get_admin_client()
    try:
        auth_response = admin_client.auth.get_user(jwt)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid login: {e}")
    user = getattr(auth_response, "user", None)
    if user is None or not getattr(user, "id", None):
        raise HTTPException(status_code=401, detail="Invalid login")
    return user


async def require_admin(request: Request):
    """Caller ၏ JWT ကို စစ်ပြီး User table ထဲက role က admin ဟုတ်လား စစ်သည်။

    localStorage က role ကို မယုံပါ။ Server ဘက်က DB ထဲက role ကိုသာ ယုံသည်။
    Admin မဟုတ်လျှင် 401 (login မဝင်ထားလျှင်) သို့မဟုတ် 403 ပြန်ပေးသည်။
    """
    user = await verify_user_jwt(request)

    admin_client = get_admin_client()
    try:
        result = (
            admin_client.table("User")
            .select("id,role")
            .eq("id", user.id)
            .single()
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=403, detail=f"Admin check failed: {e}")
    if not result.data or result.data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    return user.id


async def require_user(request: Request):
    """Login ဝင်ထားသော user ၏ DB row (role, isSubscribed) ကို ပြန်ပေးသည်။

    localStorage ကို မယုံပါ — DB ကသာ အမှန်ဖြစ်သည်။ Premium spread သော့ကို
    server ဘက်က စစ်ရန် သုံးသည် (13 Nov 2026)။
    """
    user = await verify_user_jwt(request)

    admin_client = get_admin_client()
    try:
        result = (
            admin_client.table("User")
            .select("id,name,email,role,isSubscribed")
            .eq("id", user.id)
            .single()
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"User record not found: {e}")
    if not result.data:
        raise HTTPException(status_code=404, detail="User record not found")
    return result.data


class RoleBody(BaseModel):
    role: str


class SubscriptionBody(BaseModel):
    isSubscribed: bool


# (၁) Health Check API (အလုပ်လုပ်၊ မလုပ် စမ်းသပ်ရန်)
@app.get("/api/health")
def read_health():
    return {"status": "ok", "message": "Starfish Tarot API is connected!"}


# (၂) ကတ် ၇၈ ကတ်လုံးကို ဆွဲထုတ်မည့် API (Library Page အတွက်)
@app.get("/api/cards")
def get_all_cards():
    try:
        # "TarotCard" Table ထဲက Data အကုန်လုံးကို လှမ်းယူမည်
        response = supabase.table("TarotCard").select("*").execute()

        return {
            "status": "success",
            "total_cards": len(response.data),
            "data": response.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# မိမိ၏ Premium အခြေအနေကို server ဘက်က စစ်ရန် (Login ဝင်ထားသူတိုင်းအတွက်)
# localStorage ကို ပြင်ပြီး Premium ခိုးသုံးတာကို ကာကွယ်ရန် — DB ကသာ အမှန်။
@app.get("/api/me")
async def get_my_status(request: Request):
    me = await require_user(request)
    return {"status": "success", "data": me}


# (၃) Admin API — User အားလုံးကို ကြည့်ရန် (Admin အတွက်သာ)
@app.get("/api/admin/users")
async def admin_list_users(request: Request):
    await require_admin(request)
    admin_client = get_admin_client()
    try:
        response = (
            admin_client.table("User")
            .select("id,name,email,role,isSubscribed")
            .order("id")
            .execute()
        )
        return {"status": "success", "data": response.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# (၄) Admin API — User တစ်ယောက်၏ role ကို ပြောင်းရန် (Admin အတွက်သာ)
@app.post("/api/admin/users/{user_id}/role")
async def admin_set_role(user_id: str, body: RoleBody, request: Request):
    caller_id = await require_admin(request)
    if body.role not in ("admin", "user"):
        raise HTTPException(status_code=400, detail="role must be 'admin' or 'user'")
    if user_id == caller_id and body.role == "user":
        raise HTTPException(
            status_code=400, detail="You cannot remove your own admin role"
        )
    admin_client = get_admin_client()
    try:
        response = (
            admin_client.table("User")
            .update({"role": body.role})
            .eq("id", user_id)
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        return {"status": "success", "data": response.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# (၅) Admin API — User တစ်ယောက်၏ Premium / Free ကို ပြောင်းရန် (Admin အတွက်သာ)
@app.post("/api/admin/users/{user_id}/subscription")
async def admin_set_subscription(
    user_id: str, body: SubscriptionBody, request: Request
):
    await require_admin(request)
    admin_client = get_admin_client()
    try:
        response = (
            admin_client.table("User")
            .update({"isSubscribed": body.isSubscribed})
            .eq("id", user_id)
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        return {"status": "success", "data": response.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
