from fastapi import FastAPI

app = FastAPI()

@app.get("/api/health")
def read_health():
    return {"status": "ok", "message": "Tarot App API is running on Vercel!"}