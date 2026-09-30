using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace FitAI.Domain.Notifications
{
    public class Bildirim : AuditedAggregateRoot<int>
    {
        public int MagazaId { get; set; }

        public int? KullaniciId { get; set; }

        public string Tip { get; set; } = null!; // AI, Sistem, Uyari vs

        public string Baslik { get; set; } = null!;

        public string Icerik { get; set; } = null!;

        public int? IlgiliKayitId { get; set; }

        public string? IlgiliKayitTipi { get; set; }

        public string Kanal { get; set; } = null!; // Email, Push, InApp

        public bool OkunduMu { get; set; }

        public DateTime GonderimTarihi { get; set; }

        public DateTime? OkunmaTarihi { get; set; }
    }
}