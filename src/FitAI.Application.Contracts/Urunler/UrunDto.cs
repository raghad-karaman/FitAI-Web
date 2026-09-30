using System;
using Volo.Abp.Application.Dtos;

namespace FitAI.Urunler
{
    // EntityDto<int> miras alarak 'Id' alanını otomatik kazanır
    public class UrunDto : EntityDto<int>
    {
        public int MagazaId { get; set; }
        public string MagazaAdi { get; set; }
        public string Ad { get; set; }
        public string Aciklama { get; set; }
        public string KesimTuru { get; set; }
        public bool? KumasEsnek { get; set; }
    }

    // Yeni ürün eklerken veya güncellerken kullanılacak sınıf
    public class CreateUpdateUrunDto
    {
        public int MagazaId { get; set; }
        public string Ad { get; set; }
        public string Aciklama { get; set; }
        public string KesimTuru { get; set; }
        public bool? KumasEsnek { get; set; }
    }
}