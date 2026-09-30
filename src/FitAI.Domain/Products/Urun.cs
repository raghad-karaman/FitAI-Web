using System;
using System.ComponentModel.DataAnnotations.Schema;
using Volo.Abp.Domain.Entities.Auditing;
using FitAI.Domain.Commerce;

namespace FitAI.Domain.Products
{
    public class Urun : AuditedAggregateRoot<int>
    {
        public int MagazaId { get; set; }

        [ForeignKey("MagazaId")]
        public virtual Magaza Magaza { get; set; } = null!;

        public string Ad { get; set; } = null!;

        public string? Aciklama { get; set; }

        public string? KesimTuru { get; set; }

        public bool? KumasEsnek { get; set; }

        public bool SilindiMi { get; set; }
    }
}