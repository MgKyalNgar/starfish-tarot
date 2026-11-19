# StarFish Tarot API — Cloudflare Worker version (Middle Path, 19 Nov 2026)
# ============================================================
# Vercel ရဲ့ api/index.py ကို အခြေခံပြီး ပြန်ရေးထားတာ။
# ကွာခြားချက် ၂ ခု:
#   ၁။ supabase-py မသုံးဘူး — httpx နဲ့ Supabase REST (PostgREST + Auth API) ကို
#      တိုက်ရိုက်ခေါ်တယ်။ (supabase-py import က Free plan CPU 10ms ကျော်လို့)
#   ၂။ Secret တွေကို os.environ ကနေ မယူဘူး — Cloudflare Workers မှာ secret တွေက
#      request.scope["env"] ထဲမှာ ရှိတယ်။
# Endpoint ၇ ခု + တုံ့ပြန်ပုံ + HMAC token ပုံစံ အားလုံး Vercel version အတိုင်း။
# Frontend က relative /api path တွေနဲ့ ခေါ်တာ — ဘာမှ ပြောင်းစရာ မလို။
import hashlib
import hmac
import time
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from workers import asgi
import httpx

app = FastAPI()


def _env(request: Request):
    """Cloudflare Worker ရဲ့ env (secrets) ကို request scope ကနေ ယူခြင်း။"""
    env = request.scope.get("env")
    if env is None:
        raise HTTPException(status_code=500, detail="Worker env is not available")
    return env


def _service_key(env):
    """Admin API အတွက်သာ သုံးသော service-role key။ Server ဘက်မှာသာ ရှိရမည်။"""
    key = getattr(env, "SUPABASE_SERVICE_ROLE_KEY", None)
    if not key:
        raise HTTPException(
            status_code=500,
            detail="Admin API is not configured: SUPABASE_SERVICE_ROLE_KEY is missing",
        )
    return key


def _sb_headers(api_key: str) -> dict:
    return {
        "apikey": api_key,
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }


# Premium Token အတွက် Secret (Token+B, 17 Nov 2026) — Cloudflare secret only။
# /api/me က ထုတ်ပေးသော token ကို /api/reading က ဒီ secret နဲ့ ပြန်စစ်သည်။
PREMIUM_TOKEN_TTL_SECONDS = 24 * 60 * 60  # 24 နာရီ


def issue_premium_token(user_id, secret):
    """Premium user အတွက် HMAC-signed token ထုတ်ပေးသည်။ ပုံစံ: user_id.exp.signature"""
    if not secret:
        print("Warning: PREMIUM_TOKEN_SECRET is not set — no premium token issued")
        return None
    exp = int(time.time()) + PREMIUM_TOKEN_TTL_SECONDS
    payload = f"{user_id}.{exp}"
    sig = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}.{sig}"


def verify_premium_token(token, secret):
    """Token ကို စစ်ပြီး user_id ပြန်ပေးသည်။ မမှန်လျှင် / သက်တမ်းကုန်လျှင် None။"""
    if not token or not secret:
        return None
    try:
        user_id, exp, sig = token.split(".")
        if int(exp) < int(time.time()):
            return None
        payload = f"{user_id}.{exp}"
        expected = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, sig):
            return None
        return user_id
    except (ValueError, TypeError):
        return None


async def verify_user_jwt(request: Request):
    """Caller ၏ JWT ကို စစ်ပြီး Supabase Auth user ကို ပြန်ပေးသည် (dict, id ပါတယ်)။"""
    env = _env(request)
    auth_header = request.headers.get("authorization", "")
    if not auth_header.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Login required")
    jwt = auth_header[7:].strip()
    if not jwt:
        raise HTTPException(status_code=401, detail="Login required")

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(
            f"{env.SUPABASE_URL}/auth/v1/user",
            headers={"apikey": env.SUPABASE_KEY, "Authorization": f"Bearer {jwt}"},
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid login")
    user = resp.json()
    if not isinstance(user, dict) or not user.get("id"):
        raise HTTPException(status_code=401, detail="Invalid login")
    return user


async def _sb_user_row(request: Request, user_id: str, columns: str):
    """Service-role PostgREST နဲ့ User row တစ်ခု ဖတ်ခြင်း။ မရှိလျှင် None။"""
    env = _env(request)
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(
            f"{env.SUPABASE_URL}/rest/v1/User",
            headers=_sb_headers(_service_key(env)),
            params={"select": columns, "id": f"eq.{user_id}"},
        )
    if resp.status_code != 200:
        return None
    rows = resp.json()
    if not rows:
        return None
    return rows[0]


async def _sb_patch_user(request: Request, user_id: str, body: dict):
    """Service-role PostgREST နဲ့ User row တစ်ခု ပြင်ခြင်း။ ပြင်ပြီးသား row (dict) ပြန်ပေးသည်။"""
    env = _env(request)
    headers = _sb_headers(_service_key(env))
    headers["Prefer"] = "return=representation"
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.patch(
            f"{env.SUPABASE_URL}/rest/v1/User",
            headers=headers,
            params={"id": f"eq.{user_id}"},
            json=body,
        )
    if resp.status_code != 200:
        return None
    rows = resp.json()
    if not rows:
        return None
    return rows[0]


async def require_admin(request: Request):
    """Caller ၏ JWT ကို စစ်ပြီး User table ထဲက role က admin ဟုတ်လား စစ်သည်။

    localStorage က role ကို မယုံပါ။ Server ဘက်က DB ထဲက role ကိုသာ ယုံသည်။
    Admin မဟုတ်လျှင် 401 (login မဝင်ထားလျှင်) သို့မဟုတ် 403 ပြန်ပေးသည်။
    """
    user = await verify_user_jwt(request)
    row = await _sb_user_row(request, user["id"], "id,role")
    if not row or row.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    return user["id"]


async def require_user(request: Request):
    """Login ဝင်ထားသော user ၏ DB row (role, isSubscribed) ကို ပြန်ပေးသည်။

    localStorage ကို မယုံပါ — DB ကသာ အမှန်ဖြစ်သည်။ Premium spread သော့ကို
    server ဘက်က စစ်ရန် သုံးသည် (13 Nov 2026)။
    """
    user = await verify_user_jwt(request)
    row = await _sb_user_row(request, user["id"], "id,name,email,role,isSubscribed")
    if not row:
        raise HTTPException(status_code=404, detail="User record not found")
    return row


class RoleBody(BaseModel):
    role: str


class SubscriptionBody(BaseModel):
    isSubscribed: bool


# (၁) Health Check API (အလုပ်လုပ်၊ မလုပ် စမ်းသပ်ရန်)
@app.get("/api/health")
async def read_health():
    return {"status": "ok", "message": "Starfish Tarot API is connected!"}


# (၂) ကတ် ၇၈ ကတ်လုံးကို ဆွဲထုတ်မည့် API (Library Page အတွက်)
@app.get("/api/cards")
async def get_all_cards(request: Request):
    env = _env(request)
    try:
        # "TarotCard" Table ထဲက Data အကုန်လုံးကို လှမ်းယူမည် (public read)
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(
                f"{env.SUPABASE_URL}/rest/v1/TarotCard",
                headers=_sb_headers(env.SUPABASE_KEY),
                params={"select": "*"},
            )
        if resp.status_code != 200:
            raise HTTPException(
                status_code=500, detail=f"TarotCard read failed: {resp.status_code}"
            )
        data = resp.json()
        return {"status": "success", "total_cards": len(data), "data": data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# မိမိ၏ Premium အခြေအနေကို server ဘက်က စစ်ရန် (Login ဝင်ထားသူတိုင်းအတွက်)
# localStorage ကို ပြင်ပြီး Premium ခိုးသုံးတာကို ကာကွယ်ရန် — DB ကသာ အမှန်။
@app.get("/api/me")
async def get_my_status(request: Request):
    env = _env(request)
    me = await require_user(request)
    data = dict(me)
    # Premium user ဆိုလျှင် /api/reading အတွက် token ထုတ်ပေးမည် (Token+B, 17 Nov 2026)။
    if me.get("isSubscribed"):
        token = issue_premium_token(me["id"], getattr(env, "PREMIUM_TOKEN_SECRET", None))
        if token:
            data["premiumToken"] = token
    return {"status": "success", "data": data}


# (၃) Admin API — User အားလုံးကို ကြည့်ရန် (Admin အတွက်သာ)
@app.get("/api/admin/users")
async def admin_list_users(request: Request):
    await require_admin(request)
    env = _env(request)
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(
                f"{env.SUPABASE_URL}/rest/v1/User",
                headers=_sb_headers(_service_key(env)),
                params={"select": "id,name,email,role,isSubscribed", "order": "id"},
            )
        if resp.status_code != 200:
            raise HTTPException(status_code=500, detail=f"User list failed: {resp.status_code}")
        users = resp.json() or []
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
    try:
        row = await _sb_patch_user(request, user_id, {"role": body.role})
        if not row:
            raise HTTPException(status_code=404, detail="User not found")
        return {"status": "success", "data": row}
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
    try:
        row = await _sb_patch_user(request, user_id, {"isSubscribed": body.isSubscribed})
        if not row:
            raise HTTPException(status_code=404, detail="User not found")
        return {"status": "success", "data": row}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Premium Reading — Token+B (17 Nov 2026): token စစ်ပြီး Gemini ကို ခေါ်သည်။
# /api/gemini.js အဟောင်း အစား သုံးသည် — endpoint နာမည်မှာ "gemini" မပါတော့ပါ။
GEMINI_MODELS = ["gemini-3-flash-preview", "gemini-2.5-flash"]


@app.post("/api/reading")
async def premium_reading(request: Request):
    env = _env(request)
    token = request.headers.get("x-premium-token", "")
    if not verify_premium_token(token, getattr(env, "PREMIUM_TOKEN_SECRET", None)):
        raise HTTPException(
            status_code=403, detail="Premium token missing, invalid or expired"
        )
    gemini_key = getattr(env, "GEMINI_API_KEY2", None)
    if not gemini_key:
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
                f"{model}:generateContent?key={gemini_key}"
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


Default = asgi.entrypoint(app)
