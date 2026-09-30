// src/FitAI.Application/AI/AiAppService.cs
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

using System.Linq;
using Volo.Abp;
using Volo.Abp.Application.Services;

namespace FitAI.AI;

/// <summary>
/// Python FastAPI AI servisine proxy yapan ABP uygulama servisi.
/// 
/// Konfigürasyon (appsettings.json):
///   "AiService": {
///     "BaseUrl": "http://127.0.0.1:8000"
///   }
/// </summary>
public class AiAppService : ApplicationService, IAiAppService
{
    private readonly HttpClient _http;
    private readonly ILogger<AiAppService> _logger;
    private readonly string _aiBaseUrl;

    // In-memory talimat deposu (veritabanı yoksa)
    // Gerçek projede IRepository<Talimat, int> kullanılır.
    private static readonly List<TalimatDto> _talimatlar = new()
    {
        new() { Id = 1, Ad = "Günlük NLP Analizi",      Aciklama = "Gelen yorumları NLP ile analiz eder",          Tetikleyici = "zamanli", Cron = "0 2 * * *", Durum = "aktif",     SonCalisma = "2024-05-07 02:15:23", Prompt = "Yorumları duygu analizi yaparak pozitif/negatif/nötr olarak sınıflandır." },
        new() { Id = 2, Ad = "Ürün Skor Güncelleme",    Aciklama = "Ürünlerin AI skorlarını günceller",            Tetikleyici = "zamanli", Cron = "0 3 * * *", Durum = "aktif",     SonCalisma = "2024-05-07 03:00:12", Prompt = "Her ürün için vücut uyum skorunu hesapla ve güncelle." },
        new() { Id = 3, Ad = "İade Riski Tespiti",      Aciklama = "Yüksek iade riski olan siparişleri tespit eder",Tetikleyici = "olay",    Cron = "-",        Durum = "aktif",     SonCalisma = "2024-05-06 14:30:45", Prompt = "Sipariş verilerine göre iade riski yüksek olanları işaretle." },
        new() { Id = 4, Ad = "Stok Tahmini",            Aciklama = "Gelecek ay için stok ihtiyacını tahmin eder",  Tetikleyici = "zamanli", Cron = "0 4 1 * *", Durum = "beklemede", SonCalisma = null,                  Prompt = "Satış trendlerine göre stok tahmini yap." },
        new() { Id = 5, Ad = "Rapor Oluşturma",         Aciklama = "Haftalık AI raporunu oluşturur",               Tetikleyici = "manuel",  Cron = "-",        Durum = "pasif",     SonCalisma = "2024-05-01 09:00:00", Prompt = "Haftalık AI performans raporu hazırla." },
    };
    private static int _nextId = 6;

// YENİ (güvenli):
public AiAppService(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<AiAppService> logger)
{
    _logger = logger;
    _aiBaseUrl = configuration["AiService:BaseUrl"] ?? "http://127.0.0.1:8000";
    _http = httpClientFactory.CreateClient();          // ← named client yerine default
    _http.BaseAddress = new Uri(_aiBaseUrl);
    _http.Timeout = TimeSpan.FromSeconds(30);
}

    // ─────────────────────────────────────────
    // Talimat CRUD
    // ─────────────────────────────────────────

    public Task<List<TalimatDto>> GetTalimatListesiAsync()
        => Task.FromResult(_talimatlar);

    public Task<TalimatDto> GetTalimatAsync(int id)
    {
        var t = _talimatlar.Find(x => x.Id == id)
            ?? throw new UserFriendlyException($"Talimat bulunamadı: {id}");
        return Task.FromResult(t);
    }

    public Task<TalimatDto> CreateTalimatAsync(TalimatCreateOrUpdateDto input)
    {
        var dto = new TalimatDto
        {
            Id          = _nextId++,
            Ad          = input.Ad,
            Aciklama    = input.Aciklama,
            Tetikleyici = input.Tetikleyici,
            Cron        = string.IsNullOrWhiteSpace(input.Cron) ? "-" : input.Cron,
            Durum       = "aktif",
            SonCalisma  = null,
            Prompt      = input.Prompt
        };
        _talimatlar.Add(dto);
        return Task.FromResult(dto);
    }

    public Task<TalimatDto> UpdateTalimatAsync(int id, TalimatCreateOrUpdateDto input)
    {
        var t = _talimatlar.Find(x => x.Id == id)
            ?? throw new UserFriendlyException($"Talimat bulunamadı: {id}");
        t.Ad          = input.Ad;
        t.Aciklama    = input.Aciklama;
        t.Tetikleyici = input.Tetikleyici;
        t.Cron        = string.IsNullOrWhiteSpace(input.Cron) ? "-" : input.Cron;
        t.Prompt      = input.Prompt;
        return Task.FromResult(t);
    }

    public Task DeleteTalimatAsync(int id)
    {
        var t = _talimatlar.Find(x => x.Id == id)
            ?? throw new UserFriendlyException($"Talimat bulunamadı: {id}");
        _talimatlar.Remove(t);
        return Task.CompletedTask;
    }

    // ─────────────────────────────────────────
    // AI Çalıştırma
    // ─────────────────────────────────────────

public async Task<TalimatCalistirmaSonucDto> TalimatCalistirAsync(int id)
{
    var talimat = await GetTalimatAsync(id);

    TalimatCalistirmaSonucDto sonuc;
    try
    {
        // Prompt'u tek yorum olarak gönder
        var payload = new
        {
            yorumlar = new[]
            {
                new { yorumMetni = talimat.Prompt, urunId = 0, magazaId = 0 }
            }
        };

        var response = await _http.PostAsJsonAsync("/yorum-analiz/toplu", payload);
        response.EnsureSuccessStatusCode();

        var raw = await response.Content.ReadFromJsonAsync<JsonElement>();

        // Python'dan gelen analizSonuclari listesini oku
        var analizler = raw.GetProperty("analizSonuclari");
        var ilk = analizler.GetArrayLength() > 0 ? analizler[0] : default;

        sonuc = new TalimatCalistirmaSonucDto
        {
            Durum     = "Tamamlandı",
            Anlasilan = ilk.ValueKind != JsonValueKind.Undefined
                        ? ilk.GetProperty("tema").GetString() ?? talimat.Ad
                        : talimat.Ad,
            Etkilenen = raw.TryGetProperty("toplamYorum", out var t) ? t.GetInt32() : 0,
            Sonuclar  = new()
        };
    }
    catch (Exception ex)
    {
        _logger.LogWarning("AI servisi ulaşılamadı: {Msg}", ex.Message);
        throw new UserFriendlyException("AI servisi şu anda erişilemiyor. Lütfen servisin çalıştığından emin olun.");
    }

    talimat.SonCalisma = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
    return sonuc;
}
    public async Task<object> TalimatGeriAlAsync()
    {
        try
        {
            var response = await _http.PostAsync("/talimat/undo", null);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<object>(json)!;
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Undo isteği başarısız: {Msg}", ex.Message);
            throw new UserFriendlyException("Geri alma işlemi başarısız oldu.");
        }
    }

    // ─────────────────────────────────────────
    // Analiz
    // ─────────────────────────────────────────

public async Task<AnalizSonucDto> AnalizYapAsync(AnalizIstegiDto input)
{
    try
    {
        var payload = new
        {
            urunId      = input.UrunId,
            vucutTipi   = input.VucutTipi,
            urunKesim   = input.UrunKesim,
            kumasEsnek  = input.KumasEsnek,
            mevcutBeden = input.MevcutBeden,
            yorumOzeti  = input.YorumOzeti
        };

        _logger.LogInformation("AI isteği gönderiliyor: {Url}/analiz", _aiBaseUrl);

        var response = await _http.PostAsJsonAsync("/analiz", payload);

        _logger.LogInformation("AI yanıtı: {Status}", response.StatusCode);

        if (!response.IsSuccessStatusCode)
        {
            var errBody = await response.Content.ReadAsStringAsync();
            _logger.LogError("AI hata yanıtı: {Body}", errBody);
            throw new UserFriendlyException($"AI servisi hata döndürdü: {response.StatusCode}");
        }

        return (await response.Content.ReadFromJsonAsync<AnalizSonucDto>())!;
    }
    catch (HttpRequestException ex)
    {
        _logger.LogError("AI servisine bağlanılamadı: {Url} - {Msg}", _aiBaseUrl, ex.Message);
        throw new UserFriendlyException($"AI servisi erişilemiyor ({_aiBaseUrl}). Python servisi çalışıyor mu?");
    }
    catch (TaskCanceledException)
    {
        _logger.LogError("AI servisi timeout: {Url}", _aiBaseUrl);
        throw new UserFriendlyException("AI servisi zaman aşımına uğradı (30s).");
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Beklenmeyen hata");
        throw new UserFriendlyException($"Beklenmeyen hata: {ex.Message}");
    }
}
    public async Task<TopluYorumSonucDto> TopluYorumAnalizAsync(TopluYorumIstegiDto input)
    {
        try
        {
            // Python API camelCase field adları bekliyor
            var yorumlar = input.Yorumlar.Select(y => new
            {
                yorumMetni = y.YorumMetni,
                urunId     = y.UrunId,
                magazaId   = y.MagazaId
            });
            var payload = new { yorumlar };
            var response = await _http.PostAsJsonAsync("/yorum-analiz/toplu", payload);
            response.EnsureSuccessStatusCode();
            return (await response.Content.ReadFromJsonAsync<TopluYorumSonucDto>())!;
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Toplu yorum analiz isteği başarısız: {Msg}", ex.Message);
            throw new UserFriendlyException("NLP analiz servisi şu anda erişilemiyor.");
        }
    }
}