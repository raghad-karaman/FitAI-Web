from transformers import pipeline
from collections import Counter

# Türkçe duygu analizi modeli — ilk kullanımda yüklenir
_duygu_modeli = None


def modeli_getir():
    global _duygu_modeli
    if _duygu_modeli is None:
        _duygu_modeli = pipeline(
            "sentiment-analysis",
            model="savasy/bert-base-turkish-sentiment-cased"
        )
    return _duygu_modeli


# Tema anahtar kelimeleri
temalar = {
    'beden': ['beden', 'numara', 'küçük', 'büyük', 'dar', 'bol'],
    'kumas': ['kumaş', 'kalite', 'ince', 'kalın', 'sağlam'],
    'kalip': ['kalıp', 'kesim', 'model', 'şekil'],
    'iade':  ['iade', 'geri gönderdim', 'iade ettim']
}


def duygu_skoru_hesapla(metin):
    """Metni analiz ederek duygu etiketi ve skoru döndürür."""
    sonuc = modeli_getir()(metin)[0]

    if sonuc['label'].lower() == 'positive':
        return {
            "etiket": "Olumlu",
            "skor": round(sonuc['score'], 2)
        }

    return {
        "etiket": "Olumsuz",
        "skor": round(-sonuc['score'], 2)
    }


def tema_bul(metin):
    """Metindeki baskın temayı tespit eder."""
    metin_lower = metin.lower()

    for tema, kelimeler in temalar.items():
        if any(kelime in metin_lower for kelime in kelimeler):
            return tema

    return "genel"


def tekrar_kontrol(bulgular, esik=3):
    """Eşik değerini aşan tekrarlayan temaları uyarı olarak döndürür."""
    tema_listesi = [b['tema'] for b in bulgular]
    sayac = Counter(tema_listesi)
    uyarilar = []

    for tema, sayi in sayac.items():
        if sayi >= esik:
            uyarilar.append(
                f"UYARI: '{tema}' teması {sayi} kez tekrarlandı!"
            )

    return uyarilar

def sentiment_analiz(metin: str) -> str:
    """
    Tek bir metni analiz eder.
    Döndürür: "positive", "negative", veya "neutral"
    """
    try:
        sonuc = modeli_getir()(metin[:512])[0]  # BERT max 512 token
        label = sonuc['label'].lower()
        score = sonuc['score']

        if label == 'positive' and score >= 0.6:
            return "positive"
        elif label == 'negative' and score >= 0.6:
            return "negative"
        else:
            return "neutral"
    except:
        return "neutral"