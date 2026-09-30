from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI()

model = joblib.load("model.pkl")

class ReviewRequest(BaseModel):
    text: str

@app.get("/")
def root():
    return {"message": "FitAI NLP Service Running"}

@app.post("/predict")
def predict(request: ReviewRequest):
    result = model.predict([request.text])[0]

    return {
        "text": request.text,
        "prediction": result
    }

@app.post("/review-analysis")
def review_analysis(reviews: list[str]):

    positive = 0
    negative = 0

    issues = []

    for review in reviews:

        result = model.predict([review])[0]

        if result == "pozitif":
            positive += 1
        else:
            negative += 1

            text = review.lower()

            if "dar" in text:
                issues.append("Dar kalıp")

            if "ince" in text:
                issues.append("Kumaş ince")

            if "kısa" in text:
                issues.append("Boy kısa")

    total = positive + negative

    score = round((positive / total) * 100) if total > 0 else 0

    recommendation = (
        "Bu ürün sizin için uygun."
        if score >= 70
        else "Satın almadan önce yorumları dikkatlice inceleyin."
    )

    risk_level = (
        "Düşük"
        if score >= 70
        else "Orta"
        if score >= 40
        else "Yüksek"
    )

    size_recommendation = "Standart beden önerilir"

    if "Dar kalıp" in issues:
        size_recommendation = "Bir beden büyük tercih edebilirsiniz"

    return {
        "score": score,
        "recommendation": recommendation,
        "riskLevel": risk_level,
        "sizeRecommendation": size_recommendation,
        "details": [
            {
                "label": "Olumlu Yorumlar",
                "score": score
            },
            {
                "label": "Olumsuz Yorumlar",
                "score": 100 - score
            }
        ],
        "aiSuggestions": list(set(issues))
    }