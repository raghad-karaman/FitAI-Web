using System;
using Volo.Abp.Application.Dtos;

namespace FitAI.Kullanicilar
{
    public class KullaniciDto : EntityDto<int>
    {
        public int MagazaId { get; set; }

        public string MagazaAdi { get; set; } = null!;

        public string Ad { get; set; } = null!;

        public string Eposta { get; set; } = null!;

        public string Rol { get; set; } = null!;

        public bool AktifMi { get; set; }

        public DateTime? SonGirisTarihi { get; set; }

        public DateTime CreationTime { get; set; }
    }

    public class CreateUpdateKullaniciDto
    {
        public int MagazaId { get; set; }

        public string Ad { get; set; } = null!;

        public string Eposta { get; set; } = null!;

        /// <summary>
        /// Sadece oluşturma sırasında doldurulur; güncelleme için boş bırakılabilir.
        /// </summary>
        public string? Sifre { get; set; }

        public string Rol { get; set; } = null!;

        public bool AktifMi { get; set; } = true;
    }
}