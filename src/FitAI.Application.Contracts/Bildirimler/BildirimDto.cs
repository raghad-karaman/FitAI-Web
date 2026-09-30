using System;
using Volo.Abp.Application.Dtos;

namespace FitAI.Bildirimler;

public class BildirimDto : EntityDto<int>
{
    public int MagazaId { get; set; }

    public int? KullaniciId { get; set; }

    /// <summary>AI, Sistem, Uyari vb.</summary>
    public string Tip { get; set; }

    public string Baslik { get; set; }

    public string Icerik { get; set; }

    public int? IlgiliKayitId { get; set; }

    public string IlgiliKayitTipi { get; set; }

    /// <summary>Email, Push, InApp</summary>
    public string Kanal { get; set; }

    public bool OkunduMu { get; set; }

    public DateTime GonderimTarihi { get; set; }

    public DateTime? OkunmaTarihi { get; set; }

    // AuditedAggregateRoot'tan gelen alanlar
    public DateTime CreationTime { get; set; }
}

public class CreateBildirimDto
{
    public int MagazaId { get; set; }

    public int? KullaniciId { get; set; }

    public string Tip { get; set; }

    public string Baslik { get; set; }

    public string Icerik { get; set; }

    public int? IlgiliKayitId { get; set; }

    public string IlgiliKayitTipi { get; set; }

    public string Kanal { get; set; }

    public DateTime GonderimTarihi { get; set; }
}