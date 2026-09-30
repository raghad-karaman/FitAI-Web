using Volo.Abp.Domain.Entities.Auditing;

namespace FitAI.Domain.Ai
{
    public class NlpBulgusu : AuditedAggregateRoot<int>
    {
        public int UrunId { get; set; }

        public int MagazaId { get; set; }

        public string Tema { get; set; } = null!;

        public int TekrarSayisi { get; set; }

        public decimal? DuyguSkoru { get; set; }

        public string? DuyguEtiketi { get; set; }

        public string? OneriMetni { get; set; }

        public string Durum { get; set; } = "Acik";
    }
}