using System;
using Volo.Abp.Application.Dtos;

namespace FitAI.Komisyonlar
{
    public class KomisyonDto : AuditedEntityDto<int>
    {
        public int MagazaId { get; set; }

        public int UrunId { get; set; }

        public int? WidgetSorguId { get; set; }

        public string PlatformSiparisKodu { get; set; } = null!;

        public decimal SatisTutari { get; set; }

        public decimal KomisyonTutari { get; set; }

        public decimal KomisyonOrani { get; set; }

        public bool AIAttributionMi { get; set; }

        public DateTime? AttributionTarihi { get; set; }

        public DateTime IslemTarihi { get; set; }

        public int DonemYil { get; set; }

        public int DonemAy { get; set; }
    }
}