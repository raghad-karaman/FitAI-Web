using Microsoft.AspNetCore.Authorization;

namespace FitAI.Web.Pages;
[Authorize]  

public class IndexModel : FitAIPageModel
{
    public void OnGet()
    {

    }
}
