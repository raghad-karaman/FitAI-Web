using System.Threading.Tasks;
using FitAI.Yorumlar;
using Microsoft.AspNetCore.Mvc;

namespace FitAI.Web.Pages.Yorumlar;

public class IndexModel : FitAI.Web.Pages.FitAIPageModel
{
    private readonly IYorumAppService _yorumAppService;

    public IndexModel(IYorumAppService yorumAppService)
    {
        _yorumAppService = yorumAppService;
    }

    public void OnGet()
    {
        // Sayfa ilk açıldığında JS tarafı (Index.js → yukleYorumlar()) API'yi çağırıyor.
        // Sunucu tarafında ek veri hazırlamaya gerek yok.
    }

    // POST /Yorumlar?handler=TriggerNlp&id=5
    // (Opsiyonel: JS zaten doğrudan /api/app/yorum/{id}/trigger-nlp çağırıyor,
    //  bu action kullanılmıyor ama ilerisi için bırakıldı.)
    public async Task<IActionResult> OnPostTriggerNlpAsync(int id)
    {
        var guncel = await _yorumAppService.TriggerNlpAsync(id);
        return new JsonResult(guncel);
    }
}