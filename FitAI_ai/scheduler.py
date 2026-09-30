"""
Scheduler — belirli aralıklarla otomatik analiz çalıştırır.
Çalıştırma: python scheduler.py
"""
import os
import time
import logging
import requests
from datetime import datetime
from data.mock_reviews import yorumlar as mock_yorumlar

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

AI_URL      = os.getenv("FITAI_AI_URL",      "http://127.0.0.1:8000")
NLP_URL     = os.getenv("FITAI_NLP_URL",     "http://127.0.0.1:8001")
BACKEND_URL = os.getenv("FITAI_BACKEND_URL", "http://localhost:44399")

# Kaç dakikada bir çalışsın
UYUM_SKORU_ARALIK_DK  = int(os.getenv("UYUM_SKORU_ARALIK_DK",  "60"))   # 1 saat
YORUM_ANALIZ_ARALIK_DK = int(os.getenv("YORUM_ANALIZ_ARALIK_DK", "30"))  # 30 dakika


def urunleri_backend_den_cek():
    """Backend'den ürün listesini çeker."""
    try:
        yanit = requests.get(f"{BACKEND_URL}/api/urunler", timeout=10)
        yanit.raise_for_status()
        return yanit.json()
    except Exception as e:
        logger.warning(f"⚠️  Ürünler çekilemedi: {e} — mock veri kullanılıyor")
        # Backend hazır olana kadar mock veri
        return [
            {"urun_id": 1, "vucut_tipi": "Kum Saati", "urun_kesim": "Slim",     "kumas_esnek": 1},
            {"urun_id": 2, "vucut_tipi": "Elma",       "urun_kesim": "Oversize", "kumas_esnek": 1},
            {"urun_id": 3, "vucut_tipi": "Armut",      "urun_kesim": "Regular",  "kumas_esnek": 0},
            {"urun_id": 4, "vucut_tipi": "Atletik",    "urun_kesim": "Slim",     "kumas_esnek": 1},
            {"urun_id": 5, "vucut_tipi": "Dikdortgen", "urun_kesim": "Oversize", "kumas_esnek": 0},
        ]


def yorumlari_backend_den_cek():
    """Backend'den yorum listesini çeker."""
    try:
        yanit = requests.get(f"{BACKEND_URL}/api/yorumlar?durum=beklemede", timeout=10)
        yanit.raise_for_status()
        return yanit.json()
    except Exception as e:
        logger.warning(f"⚠️  Yorumlar çekilemedi: {e} — mock veri kullanılıyor")
        yorumlar = mock_yorumlar
        return yorumlar


def uyum_skoru_gorevi():
    """Tüm ürünler için uyum skoru hesaplar."""
    logger.info("🔄 Uyum skoru görevi başladı...")
    urunler = urunleri_backend_den_cek()
    basarili = 0

    for urun in urunler:
        try:
            yanit = requests.post(f"{AI_URL}/analiz", json=urun, timeout=10)
            yanit.raise_for_status()
            sonuc = yanit.json()

            # Backend'e kaydet
            try:
                requests.post(f"{BACKEND_URL}/api/vucut-uyum-skoru", json=sonuc, timeout=10)
            except Exception:
                pass  # Backend henüz hazır değilse atla

            basarili += 1
        except Exception as e:
            logger.error(f"❌ Ürün {urun.get('urun_id')} hatası: {e}")

    logger.info(f"✅ Uyum skoru görevi tamamlandı: {basarili}/{len(urunler)} ürün işlendi")


def yorum_analiz_gorevi():
    """Bekleyen yorumları analiz eder."""
    logger.info("🔄 Yorum analiz görevi başladı...")

    yorumlar = yorumlari_backend_den_cek()
    if not yorumlar:
        logger.info("ℹ️  Analiz bekleyen yorum yok")
        return

    try:
        yanit = requests.post(
            f"{NLP_URL}/yorum-analiz/toplu",
            json={"yorumlar": yorumlar},
            timeout=30
        )
        yanit.raise_for_status()
        sonuc = yanit.json()
        logger.info(f"✅ Yorum analiz görevi tamamlandı: {sonuc.get('toplamYorum', 0)} yorum işlendi")
    except Exception as e:
        logger.error(f"❌ Yorum analiz hatası: {e}")


def calistir():
    """Scheduler'ı başlatır."""
    logger.info("🚀 FitAI Scheduler başlatıldı")
    logger.info(f"   ⏱  Uyum skoru: her {UYUM_SKORU_ARALIK_DK} dakikada bir")
    logger.info(f"   ⏱  Yorum analizi: her {YORUM_ANALIZ_ARALIK_DK} dakikada bir")

    son_uyum_skoru  = 0
    son_yorum_analiz = 0

    # Başlangıçta hemen çalıştır
    uyum_skoru_gorevi()
    yorum_analiz_gorevi()

    while True:
        simdi = time.time()

        if simdi - son_uyum_skoru >= UYUM_SKORU_ARALIK_DK * 60:
            uyum_skoru_gorevi()
            son_uyum_skoru = simdi

        if simdi - son_yorum_analiz >= YORUM_ANALIZ_ARALIK_DK * 60:
            yorum_analiz_gorevi()
            son_yorum_analiz = simdi

        time.sleep(60)  # Her dakika kontrol et


if __name__ == "__main__":
    calistir()