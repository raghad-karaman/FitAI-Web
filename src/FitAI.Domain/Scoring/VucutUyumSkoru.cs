using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace FitAI.Domain.Scoring
{
    public class VucutUyumSkoru : AuditedAggregateRoot<int>
    {
        public int UrunId { get; set; }

        public int MagazaId { get; set; }

        public string VucutTipi { get; set; } = null!;

        public decimal UyumSkoru { get; set; }

        public decimal IadeRiski { get; set; }

        public bool GecerliMi { get; set; }
    }
}