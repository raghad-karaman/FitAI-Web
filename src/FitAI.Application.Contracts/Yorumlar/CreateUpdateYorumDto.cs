using System.ComponentModel.DataAnnotations;

namespace FitAI.Yorumlar
{
    public class CreateUpdateYorumDto
    {
        [Required]
        public int UrunId { get; set; }

        [Required]
        [StringLength(128)]
        public string KullaniciAdi { get; set; }

        [Required]
        [StringLength(500)] 
        public string YorumMetni { get; set; }

        [Range(1, 5)]
        public int Puan { get; set; }
    }
}