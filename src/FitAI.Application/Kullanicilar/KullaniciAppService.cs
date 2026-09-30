using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using FitAI.Domain.Users;
using FitAI.Domain.Commerce;

namespace FitAI.Kullanicilar
{
    public class KullaniciAppService :
        CrudAppService<Kullanici, KullaniciDto, int, PagedAndSortedResultRequestDto, CreateUpdateKullaniciDto>,
        IKullaniciAppService
    {
        private readonly IRepository<Magaza, int> _magazaRepository;

        public KullaniciAppService(
            IRepository<Kullanici, int> repository,
            IRepository<Magaza, int> magazaRepository)
            : base(repository)
        {
            _magazaRepository = magazaRepository;
        }

        public async Task<List<KullaniciDto>> GetListByMagazaIdAsync(int magazaId)
        {
            var kullanicilar = await Repository.GetListAsync(k => k.MagazaId == magazaId);
            var dtos = ObjectMapper.Map<List<Kullanici>, List<KullaniciDto>>(kullanicilar);
            await DoldurMagazaAdlariAsync(dtos);
            return dtos;
        }

        public async Task<List<KullaniciDto>> GetListByRolAsync(string rol)
        {
            var kullanicilar = await Repository.GetListAsync(k => k.Rol == rol);
            var dtos = ObjectMapper.Map<List<Kullanici>, List<KullaniciDto>>(kullanicilar);
            await DoldurMagazaAdlariAsync(dtos);
            return dtos;
        }

        public override async Task<PagedResultDto<KullaniciDto>> GetListAsync(PagedAndSortedResultRequestDto input)
        {
            var result = await base.GetListAsync(input);
            await DoldurMagazaAdlariAsync(result.Items.ToList());
            return result;
        }

        public override async Task<KullaniciDto> GetAsync(int id)
        {
            var kullanici = await Repository.GetAsync(id);
            var dto = ObjectMapper.Map<Kullanici, KullaniciDto>(kullanici);
            await DoldurMagazaAdlariAsync(new List<KullaniciDto> { dto });
            return dto;
        }

        public override async Task<KullaniciDto> CreateAsync(CreateUpdateKullaniciDto input)
        {
            var kullanici = ObjectMapper.Map<CreateUpdateKullaniciDto, Kullanici>(input);

            if (!string.IsNullOrWhiteSpace(input.Sifre))
            {
                kullanici.SifreHash = HashSifre(input.Sifre);
            }

            await Repository.InsertAsync(kullanici);
            var dto = ObjectMapper.Map<Kullanici, KullaniciDto>(kullanici);
            await DoldurMagazaAdlariAsync(new List<KullaniciDto> { dto });
            return dto;
        }

        public override async Task<KullaniciDto> UpdateAsync(int id, CreateUpdateKullaniciDto input)
        {
            var kullanici = await Repository.GetAsync(id);

            ObjectMapper.Map(input, kullanici);

            // Şifre güncelleme: sadece yeni şifre girilmişse hash'le
            if (!string.IsNullOrWhiteSpace(input.Sifre))
            {
                kullanici.SifreHash = HashSifre(input.Sifre);
            }

            await Repository.UpdateAsync(kullanici);
            var dto = ObjectMapper.Map<Kullanici, KullaniciDto>(kullanici);
            await DoldurMagazaAdlariAsync(new List<KullaniciDto> { dto });
            return dto;
        }

        // ─── Yardımcı Metotlar ───────────────────────────────────────────────

        private async Task DoldurMagazaAdlariAsync(List<KullaniciDto> dtos)
        {
            var magazaIdler = dtos.Select(d => d.MagazaId).Distinct().ToList();
            var magazalar = await _magazaRepository.GetListAsync(m => magazaIdler.Contains(m.Id));
var magazaMap = magazalar.ToDictionary(m => m.Id, m => m.MagazaAdi);

            foreach (var dto in dtos)
            {
                dto.MagazaAdi = magazaMap.TryGetValue(dto.MagazaId, out var ad) ? ad : "-";
            }
        }

        /// <summary>
        /// Basit SHA-256 hash — gerçek projede BCrypt veya PBKDF2 tercih edin.
        /// </summary>
        private static string HashSifre(string sifre)
        {
            using var sha = System.Security.Cryptography.SHA256.Create();
            var bytes = sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(sifre));
            return Convert.ToBase64String(bytes);
        }
    }
}