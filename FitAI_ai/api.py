from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import joblib
import httpx
from bs4 import BeautifulSoup
from sentiment import sentiment_analiz, tema_bul

app = FastAPI()

model    = joblib.load('model.pkl')
le_vucut = joblib.load('le_vucut.pkl')
le_kesim = joblib.load('le_kesim.pkl')

# ← BURAYA TAŞI, en üste
VUCUT_ESLEME = {
    "Üçgen": "Ters Ucgen",
    "Ters Üçgen": "Ters Ucgen",
    "üçgen": "Ters Ucgen",
    "Kum saati": "Kum Saati",
    "kum saati": "Kum Saati",
    "Dikdörtgen": "Dikdortgen",
    "dikdörtgen": "Dikdortgen",
    "Dikdortgen": "Dikdortgen",
}


class AnalizIstegi(BaseModel):
    urun_id: Optional[int] = None
    vucut_tipi: str
    urun_kesim: str
    kumas_esnek: int


class UrlAnalizIstegi(BaseModel):
    productUrl: str
    vucut_tipi: str


def tavsiye_olustur(vucut_tipi, urun_kesim, skor):
    if skor >= 75:
        return f"{vucut_tipi} vücut tipiniz için {urun_kesim} kesim mükemmel uyum sağlar."
    elif skor >= 55:
        return f"{vucut_tipi} vücut tipiniz için {urun_kesim} kesim orta düzeyde uygundur."
    else:
        return f"{vucut_tipi} vücut tipiniz için {urun_kesim} kesim önerilmez."


def scrape_product(url: str) -> dict:
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        resp = httpx.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(resp.text, "html.parser")

        name = soup.find("title").text.strip() if soup.find("title") else "Ürün"

        og_img = soup.find("meta", property="og:image")
        image = og_img.get("content", "") if og_img else ""

        price_tag = soup.find(class_="prc-dsc") or soup.find(class_="product-price")
        price = price_tag.text.strip() if price_tag else ""

        title_lower = name.lower()
        if "slim" in title_lower:
            kesim = "Slim"
        elif "oversize" in title_lower or "over size" in title_lower:
            kesim = "Oversize"
        else:
            kesim = "Regular"

        kumas_esnek = 1 if any(k in title_lower for k in ["elastan", "likra", "streç", "esnek"]) else 0
        platform = "Trendyol" if "trendyol" in url else "Hepsiburada"

        return {
            "productName": name,
            "productImage": image,
            "price": price,
            "platform": platform,
            "kesim": kesim,
            "kumas_esnek": kumas_esnek,
        }
    except:
        return {
            "productName": "Ürün",
            "productImage": "",
            "price": "",
            "platform": "Trendyol",
            "kesim": "Regular",
            "kumas_esnek": 1,
        }


@app.post('/analiz')
def analiz(istek: AnalizIstegi):
    vucut = VUCUT_ESLEME.get(istek.vucut_tipi, istek.vucut_tipi)
    try:
        v = le_vucut.transform([vucut])[0]
        k = le_kesim.transform([istek.urun_kesim])[0]
    except ValueError:
        raise HTTPException(status_code=400, detail='Geçersiz vucut_tipi veya urun_kesim')

    girdi = pd.DataFrame(
        [[v, k, istek.kumas_esnek]],
        columns=['vucut_encoded', 'kesim_encoded', 'kumas_esnek']
    )
    skor = round(model.predict(girdi)[0], 1)
    risk = 'Düşük' if skor >= 75 else ('Orta' if skor >= 55 else 'Yüksek')

    return {
        'urun_id': istek.urun_id,
        'vucut_tipi': istek.vucut_tipi,
        'uyum_skoru': skor,
        'iade_riski': risk,
        'tavsiye': tavsiye_olustur(istek.vucut_tipi, istek.urun_kesim, skor)
    }


@app.post('/url-analiz')
def url_analiz(istek: UrlAnalizIstegi):
    urun = scrape_product(istek.productUrl)

    # ← ESLEME BURAYA EKLENDİ
    vucut = VUCUT_ESLEME.get(istek.vucut_tipi, istek.vucut_tipi)

    try:
        v = le_vucut.transform([vucut])[0]
        k = le_kesim.transform([urun["kesim"]])[0]
    except ValueError:
        raise HTTPException(status_code=400, detail=f'Geçersiz vucut_tipi: {vucut}')

    girdi = pd.DataFrame(
        [[v, k, urun["kumas_esnek"]]],
        columns=['vucut_encoded', 'kesim_encoded', 'kumas_esnek']
    )

    skor = round(float(model.predict(girdi)[0]), 1)
    risk = 'Düşük' if skor >= 75 else ('Orta' if skor >= 55 else 'Yüksek')
    beden = "Normal Beden" if skor >= 75 else ("Büyük Al" if skor >= 55 else "Farklı Kesim Dene")

    omuz  = min(100, int(skor * 1.10))
    gogus = min(100, int(skor * 1.15))
    bel   = int(skor * 0.95)
    kumas = min(100, int(skor + (5 if urun["kumas_esnek"] else -5)))

    return {
        "productName": urun["productName"],
        "productImage": urun["productImage"],
        "price": urun["price"],
        "platform": urun["platform"],
        "productUrl": istek.productUrl,
        "score": int(skor),
        "recommendation": tavsiye_olustur(istek.vucut_tipi, urun["kesim"], skor),
        "riskLevel": risk,
        "sizeRecommendation": beden,
        "details": [
            {"label": "Omuz Genişliği",  "score": omuz},
            {"label": "Göğüs Çevresi",   "score": gogus},
            {"label": "Bel Çevresi",      "score": bel},
            {"label": "Kumaş Esnekliği",  "score": kumas},
        ],
        "aiSuggestions": [
            tavsiye_olustur(istek.vucut_tipi, urun["kesim"], skor),
            f"Kumaş yapısı {'esnek' if urun['kumas_esnek'] else 'sert'}tir.",
            f"Önerilen beden: {beden}",
        ]
    }

class YorumAnalizIstegi(BaseModel):
    reviews: list[str]

@app.post('/yorum-analiz')
def yorum_analiz(istek: YorumAnalizIstegi):
    results = []
    positive = 0
    neutral = 0
    negative = 0

    for text in istek.reviews:
        sentiment = sentiment_analiz(text)
        issue = tema_bul(text)

        # issue'yu Flutter'ın beklediği formata çevir
        issue_label = None
        if issue == "beden":    issue_label = "Beden"
        elif issue == "kumas":  issue_label = "Kumaş"
        elif issue == "kalip":  issue_label = "Kalıp"
        elif issue == "iade":   issue_label = "İade"

        results.append({
            "text": text,
            "sentiment": sentiment,
            "issue": issue_label,
            "time": ""
        })

        if sentiment == "positive":   positive += 1
        elif sentiment == "negative": negative += 1
        else:                         neutral += 1

    total = len(results) or 1

    return {
        "positivePercent": round(positive / total * 100),
        "neutralPercent":  round(neutral  / total * 100),
        "negativePercent": round(negative / total * 100),
        "reviews": results
    }


