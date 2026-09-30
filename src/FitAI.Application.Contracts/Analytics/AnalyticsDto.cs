// src/FitAI.Application.Contracts/Analytics/AnalyticsDto.cs
using System;
using System.Collections.Generic;

namespace FitAI.Analytics;

// ─── Gelir Sekmesi ───────────────────────────────────────────

public class GelirOzetDto
{
    public decimal ToplamKomisyon { get; set; }
    public decimal GunlukOrtKomisyon { get; set; }
    public string EnIyiMagaza { get; set; } = string.Empty;
    public double OrtKomisyonOrani { get; set; }
}

public class GelirNoktasiDto
{
    public string Tarih { get; set; } = string.Empty;   // "1 May", "3 May" vb.
    public decimal Tutar { get; set; }
}

public class PaketGelirDto
{
    public string PaketAdi { get; set; } = string.Empty;
    public decimal Tutar { get; set; }
    public double Yuzde { get; set; }
}

// ─── NLP Trend Sekmesi ───────────────────────────────────────

public class AylikDuyguDto
{
    public string Ay { get; set; } = string.Empty;      // "Ocak", "Şubat" vb.
    public int Pozitif { get; set; }
    public int Negatif { get; set; }
    public int Notr { get; set; }
}

public class KategoriMemnuniyetDto
{
    public string Kategori { get; set; } = string.Empty;
    public double OrtPuan { get; set; }
}

// ─── Mağaza Karşılaştırma ────────────────────────────────────

public class MagazaKarsilastirmaDto
{
    public string MagazaAd { get; set; } = string.Empty;
    public decimal Komisyon { get; set; }
    public int UrunSayisi { get; set; }
    public int YorumSayisi { get; set; }
    public double MemnuniyetPuani { get; set; }
    public int PerformansPuani { get; set; }
}

public class MagazaRadarDto
{
    public string MagazaAd { get; set; } = string.Empty;
    public double Komisyon { get; set; }
    public double UrunSayisi { get; set; }
    public double YorumPuani { get; set; }
    public double AiSkoru { get; set; }
    public double Aktiflik { get; set; }
}

// ─── Aktivite Haritası ───────────────────────────────────────

public class AktiviteHaritaDto
{
    // [saat_index][gun_index] → sorgu sayısı
    public List<List<int>> Veri { get; set; } = new();
    public List<string> Gunler { get; set; } = new();
    public List<string> Saatler { get; set; } = new();
}

public class SaatlikAktiviteDto
{
    public string Saat { get; set; } = string.Empty;   // "08:00"
    public int Sayi { get; set; }
}

public class GunlukAktiviteDto
{
    public string Gun { get; set; } = string.Empty;    // "Pazartesi"
    public int Sayi { get; set; }
}