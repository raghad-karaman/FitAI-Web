using System;
using System.Collections.Generic;
using Volo.Abp.Domain.Entities.Auditing;

namespace FitAI.Domain.Commerce
{
    public class Magaza : AuditedAggregateRoot<int>
    {
        public string MagazaAdi { get; set; } = null!;

        public string Eposta { get; set; } = null!;

        public string SifreHash { get; set; } = null!;

        public decimal KomisyonOrani { get; set; }

        public decimal? MinimumKomisyonEsigi { get; set; }

        public string? PaketTuru { get; set; }

        public bool AktifMi { get; set; } = true;
    }
}