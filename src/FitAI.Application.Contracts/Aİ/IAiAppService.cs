// src/FitAI.Application.Contracts/AI/IAiAppService.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace FitAI.AI;

/// <summary>
/// AI servisi uygulama katmanı arayüzü.
/// Python FastAPI AI servisiyle (port 8000) iletişimi yönetir.
/// </summary>
public interface IAiAppService : IApplicationService
{
    // ---------- Talimat CRUD ----------
    Task<List<TalimatDto>> GetTalimatListesiAsync();
    Task<TalimatDto> GetTalimatAsync(int id);
    Task<TalimatDto> CreateTalimatAsync(TalimatCreateOrUpdateDto input);
    Task<TalimatDto> UpdateTalimatAsync(int id, TalimatCreateOrUpdateDto input);
    Task DeleteTalimatAsync(int id);

    // ---------- AI Çalıştırma ----------
    /// <summary>Bir talimatı Python AI servisinde çalıştırır.</summary>
    Task<TalimatCalistirmaSonucDto> TalimatCalistirAsync(int id);

    /// <summary>Son çalıştırılan talimatı geri alır (undo).</summary>
    Task<object> TalimatGeriAlAsync();

    // ---------- Analiz ----------
    /// <summary>Vücut uyum skorunu Python AI servisinden hesaplatır.</summary>
    Task<AnalizSonucDto> AnalizYapAsync(AnalizIstegiDto input);

    /// <summary>Toplu yorumları Python NLP servisinde analiz ettirir.</summary>
    Task<TopluYorumSonucDto> TopluYorumAnalizAsync(TopluYorumIstegiDto input);
}