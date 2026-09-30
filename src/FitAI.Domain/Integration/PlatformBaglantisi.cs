using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace FitAI.Domain.Integration
{
    public class PlatformBaglantisi : AuditedAggregateRoot<int>
    {
        public int MagazaId { get; set; }

        public string PlatformTuru { get; set; } = null!;

        public string ApiAnahtari { get; set; } = null!;

        public bool AktifMi { get; set; } = true;
    }
}