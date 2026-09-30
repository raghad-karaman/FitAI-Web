using Microsoft.AspNetCore.Mvc;
namespace FitAI.Web.Pages.Urunler;

public class DetayModel : FitAI.Web.Pages.FitAIPageModel
{
    [BindProperty(SupportsGet = true)]
    public int Id { get; set; }

    public void OnGet()
    {
    }
}
