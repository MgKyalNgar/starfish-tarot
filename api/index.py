import hashlib
import hmac
import os
import time
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from supabase import create_client, Client
import httpx

app = FastAPI()

# Vercel Environment Variables ထဲမှ Supabase Keys များကို လှမ်းယူခြင်း
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
# Admin API အတွက်သာ သုံးသော Secret key (service_role နဲ့ ညီသည်)။
# Server ဘက်မှာသာ ရှိရမည်။ Browser code ထဲမှာ ဘယ်တော့မှ မထည့်ရ။
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

# Premium Token အတွက် Secret (Token+B, 17 Nov 2026) — Vercel env only။
# /api/me က ထုတ်ပေးသော token ကို /api/reading က ဒီ secret နဲ့ ပြန်စစ်သည်။
PREMIUM_TOKEN_SECRET = os.environ.get("PREMIUM_TOKEN_SECRET")
PREMIUM_TOKEN_TTL_SECONDS = 24 * 60 * 60  # 24 နာရီ


def issue_premium_token(user_id):
    """Premium user အတွက် HMAC-signed token ထုတ်ပေးသည်။ ပုံစံ: user_id.exp.signature"""
    if not PREMIUM_TOKEN_SECRET:
        print("Warning: PREMIUM_TOKEN_SECRET is not set — no premium token issued")
        return None
    exp = int(time.time()) + PREMIUM_TOKEN_TTL_SECONDS
    payload = f"{user_id}.{exp}"
    sig = hmac.new(
        PREMIUM_TOKEN_SECRET.encode(), payload.encode(), hashlib.sha256
    ).hexdigest()
    return f"{payload}.{sig}"


def verify_premium_token(token):
    """Token ကို စစ်ပြီး user_id ပြန်ပေးသည်။ မမှန်လျှင် / သက်တမ်းကုန်လျှင် None။"""
    if not token or not PREMIUM_TOKEN_SECRET:
        return None
    try:
        user_id, exp, sig = token.split(".")
        if int(exp) < int(time.time()):
            return None
        payload = f"{user_id}.{exp}"
        expected = hmac.new(
            PREMIUM_TOKEN_SECRET.encode(), payload.encode(), hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(expected, sig):
            return None
        return user_id
    except (ValueError, TypeError):
        return None

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
    data = dict(me)
    # Premium user ဆိုလျှင် /api/reading အတွက် token ထုတ်ပေးမည် (Token+B, 17 Nov 2026)။
    if me.get("isSubscribed"):
        token = issue_premium_token(me["id"])
        if token:
            data["premiumToken"] = token
    return {"status": "success", "data": data}


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
        users = response.data or []
        # 13 Nov 2026: Admin အရင်ဆုံး၊ ပြီးရင် Premium၊ နောက်ဆုံး Free Plan —
        # တူတဲ့ အုပ်စုထဲမှာ မူလ အစီအစဉ်အတိုင်း (Python sort က stable)။
        users.sort(key=lambda u: (0 if u.get("role") == "admin" else 1, 0 if u.get("isSubscribed") else 1))
        return {"status": "success", "data": users}
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


# Premium Reading — Token+B (17 Nov 2026): token စစ်ပြီး Gemini ကို ခေါ်သည်။
# /api/gemini.js အဟောင်း အစား သုံးသည် — endpoint နာမည်မှာ "gemini" မပါတော့ပါ။
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY2")
GEMINI_MODELS = ["gemini-3-flash-preview", "gemini-2.5-flash"]


@app.post("/api/reading")
async def premium_reading(request: Request):
    token = request.headers.get("x-premium-token", "")
    if not verify_premium_token(token):
        raise HTTPException(
            status_code=403, detail="Premium token missing, invalid or expired"
        )
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500, detail="Gemini API key is not configured"
        )
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    last_error = "Unknown error"
    async with httpx.AsyncClient(timeout=60.0) as client:
        for model in GEMINI_MODELS:
            url = (
                "https://generativelanguage.googleapis.com/v1beta/models/"
                f"{model}:generateContent?key={GEMINI_API_KEY}"
            )
            try:
                resp = await client.post(url, json=body)
            except Exception as e:
                last_error = str(e)
                break
            try:
                data = resp.json()
            except Exception:
                data = {}
            if resp.status_code == 429 or (
                isinstance(data, dict)
                and isinstance(data.get("error"), dict)
                and data["error"].get("code") == 429
            ):
                print(f"{model} limit reached, trying next model...")
                last_error = "Token Limit Exhausted"
                continue
            if resp.status_code != 200 or (isinstance(data, dict) and data.get("error")):
                message = ""
                if isinstance(data, dict) and isinstance(data.get("error"), dict):
                    message = data["error"].get("message", "")
                raise HTTPException(status_code=500, detail=message or "Gemini API error")
            return JSONResponse(content=data)
    raise HTTPException(
        status_code=500, detail=f"All AI models failed. ({last_error})"
    )
