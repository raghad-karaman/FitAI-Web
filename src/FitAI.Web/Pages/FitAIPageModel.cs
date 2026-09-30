using FitAI.Localization;
using Volo.Abp.AspNetCore.Mvc.UI.RazorPages;

namespace FitAI.Web.Pages;

/* Inherit your PageModel classes from this class.
 */
public abstract class FitAIPageModel : AbpPageModel
{
    protected FitAIPageModel()
    {
        LocalizationResourceType = typeof(FitAIResource);
    }
}
