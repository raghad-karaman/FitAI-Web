import os
import requests
import logging
from fastapi import FastAPI, BackgroundTasks

from FitAI_ai.sentiment import duygu_skoru_hesapla, tema_bul, tekrar_kontrol
from data.mock_reviews import yorumlar

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

BACKEND_URL = os.getenv("FITAI_BACKEND_URL", "http://localhost:44399")

app = FastAPI(title="FitAI NLP Servisi")


def analiz_sonucunu_backend_e_gonder(bulgu: dict):
    """NLP analiz sonucunu backend'e gönderir."""
    try:
        yanit = requests.post(
            f"{BACKEND_URL}/api/yorum-analiz",
            json=bulgu,
            timeout=10
        )
        yanit.raise_for_status()
        logger.info(f"✅ Yorum analizi backend'e gönderildi: urunId={bulgu.get('urunId')}")
    except requests.exceptions.ConnectionError:
        logger.warning(f"⚠️  Backend bağlantısı yok — analiz yalnızca döndürüldü")
    except requests.exceptions.HTTPError as e:
        logger.warning(f"⚠️  Backend endpoint henüz hazır değil ({e})")


def yorumlari_analiz_et(yorumlar_listesi: list, arka_plan: bool = False, background_tasks=None):
    """Yorum listesini analiz eder ve sonuçları döndürür."""
    bulgular = []

    for yorum in yorumlar_listesi:
        metin = yorum["yorumMetni"]
        duygu = duygu_skoru_hesapla(metin)
        tema  = tema_bul(metin)

        if tema == "beden":
            oneri = "Beden sorunu tekrar ediyor, açıklama güncellenmeli."
        elif tema == "kumas":
            oneri = "Kumaş kalitesi kontrol edilmeli."
        elif tema == "iade":
            oneri = "İade oranı yüksek, ürün açıklaması gözden geçirilmeli."
        elif tema == "kalip":
            oneri = "Kalıp sorunu mevcut, beden tablosu güncellenmeli."
        else:
            oneri = "Genel müşteri geri bildirimi incelenmeli."

        bulgu = {
            "urunId":       yorum["urunId"],
            "magazaId":     yorum.get("magazaId", 1),
            "yorum":        metin,
            "tema":         tema,
            "duyguSkoru":   duygu["skor"],
            "duyguEtiketi": duygu["etiket"],
            "tekrarSayisi": 1,
            "oneriMetni":   oneri,
            "durum":        "Tamamlandı"
        }

        bulgular.append(bulgu)

        # Backend'e arka planda gönder
        if arka_plan and background_tasks:
            background_tasks.add_task(analiz_sonucunu_backend_e_gonder, bulgu)

    return bulgular


@app.get("/")
def home():
    return {"message": "FitAI NLP Servisi çalışıyor", "versiyon": "2.0"}


@app.get("/yorum-analiz")
def yorum_analiz(background_tasks: BackgroundTasks):
    """Mock yorumları analiz eder ve backend'e gönderir."""
    bulgular = yorumlari_analiz_et(yorumlar, arka_plan=True, background_tasks=background_tasks)
    uyarilar = tekrar_kontrol(bulgular)

    return {
        "analizSonuclari": bulgular,
        "uyarilar":        uyarilar,
        "toplamYorum":     len(bulgular)
    }


@app.post("/yorum-analiz/toplu")
def toplu_yorum_analiz(veri: dict, background_tasks: BackgroundTasks):
    """
    Dışarıdan gelen yorum listesini analiz eder.
    Body: {"yorumlar": [{"yorumMetni": "...", "urunId": 1, "magazaId": 1}]}
    """
    gelen_yorumlar = veri.get("yorumlar", [])
    if not gelen_yorumlar:
        return {"hata": "Yorum listesi boş"}

    bulgular = yorumlari_analiz_et(gelen_yorumlar, arka_plan=True, background_tasks=background_tasks)
    uyarilar = tekrar_kontrol(bulgular)

    return {
        "analizSonuclari": bulgular,
        "uyarilar":        uyarilar,
        "toplamYorum":     len(bulgular)
    }