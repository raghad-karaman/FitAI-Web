from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {
        "message": "FitAI AI Service Running"
    }