using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;
using FitAI.AI;

namespace FitAI.Controllers;

[AllowAnonymous]   // Geliştirme aşamasında; sonra [Authorize] yapılabilir
[IgnoreAntiforgeryToken]   // ← bunu ekle
[Route("api/ai")]
public class AiController : FitAIController
{
    private readonly IAiAppService _aiAppService;

    public AiController(IAiAppService aiAppService)
    {
        _aiAppService = aiAppService;
    }

    // ========== TALİMAT CRUD ==========

    [HttpGet("talimatlar")]
    public async Task<List<TalimatDto>> GetTalimatlar()
        => await _aiAppService.GetTalimatListesiAsync();

    [HttpGet("talimatlar/{id}")]
    public async Task<TalimatDto> GetTalimat(int id)
        => await _aiAppService.GetTalimatAsync(id);

    [HttpPost("talimatlar")]
    public async Task<TalimatDto> CreateTalimat([FromBody] TalimatCreateOrUpdateDto input)
        => await _aiAppService.CreateTalimatAsync(input);

    [HttpPut("talimatlar/{id}")]
    public async Task<TalimatDto> UpdateTalimat(int id, [FromBody] TalimatCreateOrUpdateDto input)
        => await _aiAppService.UpdateTalimatAsync(id, input);

    [HttpDelete("talimatlar/{id}")]
    public async Task DeleteTalimat(int id)
        => await _aiAppService.DeleteTalimatAsync(id);

    // ========== TALİMAT ÇALIŞTIRMA ==========

    [HttpPost("talimatlar/{id}/calistir")]
    public async Task<TalimatCalistirmaSonucDto> TalimatCalistir(int id)
        => await _aiAppService.TalimatCalistirAsync(id);

    [HttpPost("talimatlar/undo")]
    public async Task<object> TalimatGeriAl()
        => await _aiAppService.TalimatGeriAlAsync();

    // ========== MEVCUT ANALİZ ENDPOINT'LERİ ==========
    // (Bunlar zaten vardı, aynen kalıyor)

    [HttpPost("uyum-skoru")]
    public async Task<AnalizSonucDto> UyumSkoru([FromBody] AnalizIstegiDto input)
        => await _aiAppService.AnalizYapAsync(input);

    [HttpPost("yorum-analiz/toplu")]
    public async Task<TopluYorumSonucDto> TopluYorumAnaliz([FromBody] TopluYorumIstegiDto input)
        => await _aiAppService.TopluYorumAnalizAsync(input);
}