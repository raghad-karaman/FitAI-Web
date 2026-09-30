using System;
using System.ComponentModel.DataAnnotations;

namespace FitAI.Komisyonlar
{
    public class CreateUpdateKomisyonDto
    {
        [Required]
        public int MagazaId { get; set; }

        [Required]
        public int UrunId { get; set; }

        public int? WidgetSorguId { get; set; }

        [Required]
        [MaxLength(100)]
        public string PlatformSiparisKodu { get; set; } = null!;

        [Required]
        [Range(0, double.MaxValue)]
        public decimal SatisTutari { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal KomisyonTutari { get; set; }

        [Required]
        [Range(0, 100)]
        public decimal KomisyonOrani { get; set; }

        public bool AIAttributionMi { get; set; }

        public DateTime? AttributionTarihi { get; set; }

        [Required]
        public DateTime IslemTarihi { get; set; }

        [Required]
        [Range(2000, 2100)]
        public int DonemYil { get; set; }

        [Required]
        [Range(1, 12)]
        public int DonemAy { get; set; }
    }
}