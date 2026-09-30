using System;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Domain.Entities.Auditing;
using FitAI.Domain.Products;
using FitAI.Domain.Commerce;

namespace FitAI.Domain.Products 
{
    public class Yorum : AuditedAggregateRoot<int>
    {
        public int UrunId { get; set; }

        public virtual Urun Urun { get; set; } = null!;

        public int MagazaId { get; set; }

        public virtual Magaza Magaza { get; set; } = null!;

        public string YorumMetni { get; set; } = null!;

        public int? Puan { get; set; }

        public bool NlpIslendi { get; set; } // Hafta 2'nin kilit noktası

        // ======================================================================
        // DERLEME HATALARINI ÇÖZMEK İÇİN EKLENEN NLP ANALİZ ALANLARI
        // ======================================================================

        // Yorumu yazan kullanıcının adı (görünen ad, giriş adı vb.)
        // Nullable: misafir kullanıcılar veya eski kayıtlar için boş kalabilir.
        public string? KullaniciAdi { get; set; }

        // NLP analizi sonucu çıkacak duygu durumu (Örn: "Pozitif", "Negatif", "Nötr")
        // Nullable (string?) yapıldı, çünkü henüz NLP'den geçmemiş yorumlar için boş kalabilir.
        public string? Duygu { get; set; }

        // NLP modelinin tahmin güven oranı (Örn: 0.95 veya 85.5)
        // Nullable (double?) yapıldı, analiz edilmemiş yorumlarda null kalabilmesi için.
        public double? GuvenSkoru { get; set; }
        public string? Tema { get; set; }   // e.g., "Ürün kalitesi", "Kargo süresi", etc.
    }
}