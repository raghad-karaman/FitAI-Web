using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace FitAI.Domain.Onboarding
{
    public class OnboardingAdim : AuditedAggregateRoot<int>
    {
        public int MagazaId { get; set; }

        public int SiraNo { get; set; }

        public string AdimKodu { get; set; } = null!;

        public string AdimAdi { get; set; } = null!;

        public bool Tamamlandi { get; set; }

        public DateTime? TamamlanmaTarihi { get; set; }
    }
}