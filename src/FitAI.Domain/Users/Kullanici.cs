using FitAI.Domain.Ai;
using System;
using System.Collections.Generic;
using Volo.Abp.Domain.Entities.Auditing;

namespace FitAI.Domain.Users
{
    public class Kullanici : AuditedAggregateRoot<int>
    {
        public int MagazaId { get; set; }

        public string Ad { get; set; } = null!;

        public string Eposta { get; set; } = null!;

        public string SifreHash { get; set; } = null!;

        public string Rol { get; set; } = null!;

        public bool AktifMi { get; set; } = true;

        public DateTime? SonGirisTarihi { get; set; }

        public ICollection<AiTalimat> AiTalimatlar { get; set; } = new List<AiTalimat>();
    }
}