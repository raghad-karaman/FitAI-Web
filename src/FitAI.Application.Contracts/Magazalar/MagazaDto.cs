using System;
using Volo.Abp.Application.Dtos;

namespace FitAI.Magazalar
{
    // Id alanı int olduğu için EntityDto<int> kullanıyoruz
    public class MagazaDto : EntityDto<int>
    {
        public required string MagazaAdi { get; set; }
        public string Eposta { get; set; }
        public decimal KomisyonOrani { get; set; }
        public bool AktifMi { get; set; }
        public string PaketTuru { get; set; }
    }

    public class CreateUpdateMagazaDto
    {
        public string MagazaAdi { get; set; }
        public string Eposta { get; set; }
        public string SifreHash { get; set; }
        public decimal KomisyonOrani { get; set; }
        public decimal? MinimumKomisyonEsigi { get; set; }
        public string PaketTuru { get; set; }
        public bool AktifMi { get; set; }
    }
}