import os
from fastapi import FastAPI, HTTPException
from supabase import create_client, Client

app = FastAPI()

# Vercel Environment Variables ထဲမှ Supabase Keys များကို လှမ်းယူခြင်း
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

# Supabase နဲ့ ချိတ်ဆက်ရန် Client တည်ဆောက်ခြင်း
if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print("Warning: Supabase credentials not found!")

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
