using System;
using System.Collections.Generic;
using Volo.Abp.Domain.Entities.Auditing;

namespace FitAI.Domain.Users
{
    public class KullaniciProfil : AuditedAggregateRoot<int>
    {
        public string CihazId { get; set; } = null!;

        public string? VucutTipi { get; set; }

        public decimal? Boy { get; set; }

        public decimal? Kilo { get; set; }

        public string? TercihleriJSON { get; set; }
    }
}