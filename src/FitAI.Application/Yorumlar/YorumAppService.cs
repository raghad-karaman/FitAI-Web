using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using FitAI.Domain.Products;

namespace FitAI.Yorumlar
{
    public class YorumGetListInput : PagedAndSortedResultRequestDto
    {
        public int? UrunId   { get; set; }
        public int? MagazaId { get; set; }
    }

    public class YorumAppService :
        CrudAppService<Yorum, YorumDto, int, YorumGetListInput, CreateUpdateYorumDto>,
        IYorumAppService
    {
        private readonly IHttpClientFactory         _httpClientFactory;
        private readonly IConfiguration             _configuration;
        private readonly ILogger<YorumAppService>   _logger;

        public YorumAppService(
            IRepository<Yorum, int>     repository,
            IHttpClientFactory          httpClientFactory,
            IConfiguration              configuration,
            ILogger<YorumAppService>    logger) : base(repository)
        {
            _httpClientFactory = httpClientFactory;
            _configuration     = configuration;
            _logger            = logger;
        }

        // ------------------------------------------------------------------ //
        // GET /api/app/yorum?urunId=5&maxResultCount=100
        // WithDetailsAsync → EF Include olmadan navigation property yükler
        // ------------------------------------------------------------------ //
        protected override async Task<IQueryable<Yorum>> CreateFilteredQueryAsync(YorumGetListInput input)
        {
            // WithDetailsAsync navigation property'leri otomatik yükler
            // (IRepository.Include yerine ABP'nin kendi mekanizması)
            var query = await Repository.WithDetailsAsync(y => y.Urun, y => y.Magaza);

            if (input.UrunId.HasValue)
                query = query.Where(y => y.UrunId == input.UrunId.Value);

            if (input.MagazaId.HasValue)
                query = query.Where(y => y.MagazaId == input.MagazaId.Value);

            return query;
        }

        public override async Task<YorumDto> GetAsync(int id)
        {
            var query  = await Repository.WithDetailsAsync(y => y.Urun, y => y.Magaza);
            var yorum  = await AsyncExecuter.FirstOrDefaultAsync(query.Where(y => y.Id == id));

            if (yorum == null)
                throw new Volo.Abp.Domain.Entities.EntityNotFoundException(typeof(Yorum), id);

            return ObjectMapper.Map<Yorum, YorumDto>(yorum);
        }

        public async Task<List<YorumDto>> GetListByUrunIdAsync(int urunId)
        {
            var query   = await Repository.WithDetailsAsync(y => y.Urun, y => y.Magaza);
            var yorumlar = await AsyncExecuter.ToListAsync(query.Where(y => y.UrunId == urunId));
            return ObjectMapper.Map<List<Yorum>, List<YorumDto>>(yorumlar);
        }

        // POST /api/app/yorum/{id}/trigger-nlp
        public async Task<YorumDto> TriggerNlpAsync(int id)
        {
            var yorum    = await Repository.GetAsync(id);
            var nlpSonuc = await _NlpServisiniCagirAsync(yorum);

            yorum.Duygu      = nlpSonuc.DuyguEtiketi;
            yorum.GuvenSkoru = nlpSonuc.DuyguSkoru;
            yorum.NlpIslendi = true;

            await Repository.UpdateAsync(yorum, autoSave: true);

            var query  = await Repository.WithDetailsAsync(y => y.Urun, y => y.Magaza);
            var guncel = await AsyncExecuter.FirstOrDefaultAsync(query.Where(y => y.Id == id));
            return ObjectMapper.Map<Yorum, YorumDto>(guncel ?? yorum);
        }

        // ------------------------------------------------------------------ //
        // NLP servisi HTTP çağrısı  (main.py — port 8001)
        // ------------------------------------------------------------------ //
        private async Task<NlpSonucDto> _NlpServisiniCagirAsync(Yorum yorum)
        {
            var nlpUrl = _configuration["FitAI:NlpServiceUrl"] ?? "http://127.0.0.1:8001";

            try
            {
                var client = _httpClientFactory.CreateClient("NlpServisi");

                var istek = new
                {
                    yorumlar = new[]
                    {
                        new
                        {
                            yorumMetni = yorum.YorumMetni,
                            urunId     = yorum.UrunId,
                            magazaId   = yorum.MagazaId
                        }
                    }
                };

                var yanit = await client.PostAsJsonAsync($"{nlpUrl}/yorum-analiz/toplu", istek);
                yanit.EnsureSuccessStatusCode();

                var sonuc = await yanit.Content.ReadFromJsonAsync<NlpTopluYanitDto>();
                var ilk   = sonuc?.AnalizSonuclari?.FirstOrDefault();

                if (ilk != null)
                    return ilk;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(
                    "NLP servisi ulaşılamadı ({Url}), keyword fallback kullanılıyor: {Hata}",
                    nlpUrl, ex.Message);
            }

            return _KeywordFallback(yorum.YorumMetni);
        }

        private static NlpSonucDto _KeywordFallback(string? metin)
        {
            var m = (metin ?? "").ToLowerInvariant();

            if (m.Contains("memnun") || m.Contains("harika") ||
                m.Contains("güzel")  || m.Contains("iyi")    ||
                m.Contains("rahat")  || m.Contains("kaliteli"))
                return new NlpSonucDto { DuyguEtiketi = "Olumlu",  DuyguSkoru = 0.88 };

            if (m.Contains("kötü")   || m.Contains("iade")  ||
                m.Contains("dar")    || m.Contains("sorun") ||
                m.Contains("beklentimi karşılamadı"))
                return new NlpSonucDto { DuyguEtiketi = "Olumsuz", DuyguSkoru = 0.82 };

            return new NlpSonucDto { DuyguEtiketi = "Nötr", DuyguSkoru = 0.65 };
        }

        private class NlpSonucDto
        {
            public string DuyguEtiketi { get; set; } = string.Empty;
            public double DuyguSkoru   { get; set; }
        }

        private class NlpTopluYanitDto
        {
            public List<NlpSonucDto> AnalizSonuclari { get; set; } = new();
        }
    }
}