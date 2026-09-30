using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace FitAI.Domain.Analytics
{
    public class WidgetSorguLog : AuditedAggregateRoot<int>
    {
        public int UrunId { get; set; }

        public int MagazaId { get; set; }

        public decimal DonulenUyumSkoru { get; set; }

        public bool SatinAlmaGerceklesti { get; set; }
    }
}