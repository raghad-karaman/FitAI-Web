import os
import requests
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# AI servisimizin adresi
AI_URL     = os.getenv("FITAI_AI_URL",      "http://127.0.0.1:8000")
# Backend'in adresi (gerçek backend)
BACKEND_URL = os.getenv("FITAI_BACKEND_URL", "http://localhost:44399")


def skoru_hesapla(urun_id, vucut_tipi, urun_kesim, kumas_esnek):
    """AI modelinden uyum skoru hesaplar."""
    yanit = requests.post(f"{AI_URL}/analiz", json={
        "urun_id":     urun_id,
        "vucut_tipi":  vucut_tipi,
        "urun_kesim":  urun_kesim,
        "kumas_esnek": kumas_esnek
    }, timeout=10)
    yanit.raise_for_status()
    return yanit.json()


def skoru_backend_e_gonder(sonuc):
    """Hesaplanan skoru gerçek backend'e kaydeder."""
    try:
        yanit = requests.post(
            f"{BACKEND_URL}/api/vucut-uyum-skoru",
            json=sonuc,
            timeout=10
        )
        yanit.raise_for_status()
        logger.info(f"✅ Backend'e kaydedildi: urun_id={sonuc.get('urun_id')}")
        return True
    except requests.exceptions.ConnectionError:
        logger.warning(f"⚠️  Backend bağlantısı yok — skor yalnızca hesaplandı: urun_id={sonuc.get('urun_id')}")
        return False
    except requests.exceptions.HTTPError as e:
        logger.warning(f"⚠️  Backend endpoint henüz hazır değil ({e}) — endpoint açıldığında otomatik bağlanacak")
        return False


def skoru_hesapla_ve_kaydet(urun_id, vucut_tipi, urun_kesim, kumas_esnek):
    """Skoru hesaplar ve backend'e gönderir."""
    sonuc = skoru_hesapla(urun_id, vucut_tipi, urun_kesim, kumas_esnek)
    logger.info(f"🧮 Skor hesaplandı: {sonuc}")
    skoru_backend_e_gonder(sonuc)
    return sonuc


# Test
if __name__ == "__main__":
    urunler = [
        {"urun_id": 101, "vucut_tipi": "Kum Saati", "urun_kesim": "Slim",     "kumas_esnek": 1},
        {"urun_id": 102, "vucut_tipi": "Elma",       "urun_kesim": "Oversize", "kumas_esnek": 1},
        {"urun_id": 103, "vucut_tipi": "Armut",      "urun_kesim": "Regular",  "kumas_esnek": 0},
    ]

    print("─" * 50)
    for urun in urunler:
        skoru_hesapla_ve_kaydet(**urun)
        print("─" * 50)