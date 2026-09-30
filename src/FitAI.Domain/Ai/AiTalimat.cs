using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace FitAI.Domain.Ai
{
    public class AiTalimat : AuditedAggregateRoot<int>
    {
        public int MagazaId { get; set; }

        public int? KullaniciId { get; set; }

        public string TalimatMetni { get; set; } = null!;

        public string? AnlasilanSenaryo { get; set; }

        public string? IslenenAgirliklar { get; set; }

        public string? OncekiAgirliklar { get; set; }

        public string OnayDurumu { get; set; } = "Onaylandi";

        public string? EtkiRaporu { get; set; }

        public bool EtkiRaporuOlusturulduMu { get; set; }

        public DateTime? PlanlananEtkiTarihi { get; set; }
    }
}