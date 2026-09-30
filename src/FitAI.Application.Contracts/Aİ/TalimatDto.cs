// src/FitAI.Application.Contracts/AI/TalimatDto.cs
using System;
using System.Collections.Generic;
using Volo.Abp.Application.Dtos;

namespace FitAI.AI;

/// <summary>Tek bir AI talimatını temsil eder.</summary>
public class TalimatDto : EntityDto<int>
{
    public string Ad { get; set; } = string.Empty;
    public string Aciklama { get; set; } = string.Empty;
    public string Tetikleyici { get; set; } = "manuel";   // zamanli | olay | manuel
    public string Cron { get; set; } = "-";
    public string Durum { get; set; } = "aktif";           // aktif | beklemede | pasif
    public string? SonCalisma { get; set; }
    public string Prompt { get; set; } = string.Empty;
}

/// <summary>Yeni talimat oluşturmak veya güncellemek için kullanılır.</summary>
public class TalimatCreateOrUpdateDto
{
    public string Ad { get; set; } = string.Empty;
    public string Aciklama { get; set; } = string.Empty;
    public string Tetikleyici { get; set; } = "manuel";
    public string Cron { get; set; } = "-";
    public string Prompt { get; set; } = string.Empty;
}

/// <summary>Python AI servisine gönderilen /talimat isteği.</summary>
public class TalimatCalistirmaIstegiDto
{
    public string Talimat { get; set; } = string.Empty;
}

/// <summary>Python AI servisinden dönen /talimat yanıtı.</summary>
public class TalimatCalistirmaSonucDto
{
    public string Talimat { get; set; } = string.Empty;
    public string Durum { get; set; } = string.Empty;
    public string? Anlasilan { get; set; }
    public int Etkilenen { get; set; }
    public List<SkorDegisimDto> Sonuclar { get; set; } = new();
}

public class SkorDegisimDto
{
    public string VucutTipi { get; set; } = string.Empty;
    public string UrunKesim { get; set; } = string.Empty;
    public double EskiSkor { get; set; }
    public double YeniSkor { get; set; }
    public double Degisim { get; set; }
}

/// <summary>Python AI /analiz endpoint'ine gönderilen istek.</summary>
public class AnalizIstegiDto
{
    public int? UrunId { get; set; }
    public string VucutTipi { get; set; } = string.Empty;
    public string UrunKesim { get; set; } = string.Empty;
    public int KumasEsnek { get; set; }
    public string? MevcutBeden { get; set; }
    public string? YorumOzeti { get; set; }
}

/// <summary>Python AI /analiz endpoint'inden dönen sonuç.</summary>
public class AnalizSonucDto
{
    public int? UrunId { get; set; }
    public string VucutTipi { get; set; } = string.Empty;
    public string UrunKesim { get; set; } = string.Empty;
    public double UyumSkoru { get; set; }
    public string IadeRiski { get; set; } = string.Empty;
    public int IadeRiskPuani { get; set; }
    public string RecommendedSize { get; set; } = string.Empty;
    public string Tavsiye { get; set; } = string.Empty;
}

/// <summary>Toplu yorum analizi için istek DTO'su.</summary>
public class TopluYorumIstegiDto
{
    public List<YorumIstegiDto> Yorumlar { get; set; } = new();
}

public class YorumIstegiDto
{
    public string YorumMetni { get; set; } = string.Empty;
    public int UrunId { get; set; }
    public int MagazaId { get; set; } = 1;
}

/// <summary>Python NLP servisinden dönen toplu yorum analiz sonucu.</summary>
public class TopluYorumSonucDto
{
    public List<YorumAnalizSonucDto> AnalizSonuclari { get; set; } = new();
    public List<string> Uyarilar { get; set; } = new();
    public int ToplamYorum { get; set; }
}

public class YorumAnalizSonucDto
{
    public int UrunId { get; set; }
    public int MagazaId { get; set; }
    public string Yorum { get; set; } = string.Empty;
    public string Tema { get; set; } = string.Empty;
    public double DuyguSkoru { get; set; }
    public string DuyguEtiketi { get; set; } = string.Empty;
    public int TekrarSayisi { get; set; }
    public string OneriMetni { get; set; } = string.Empty;
    public string Durum { get; set; } = string.Empty;
}