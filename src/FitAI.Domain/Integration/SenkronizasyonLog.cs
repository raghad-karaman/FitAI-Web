using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace FitAI.Domain.Integration
{
    public class SenkronizasyonLog : AuditedAggregateRoot<int>
    {
        public int MagazaId { get; set; }

        public string SyncTipi { get; set; } = null!;

        public string Durum { get; set; } = null!;

        public int IslemSayisi { get; set; }
    }
}