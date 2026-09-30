using FitAI.Localization;
using Volo.Abp.AspNetCore.Mvc;

namespace FitAI.Controllers;

/* Inherit your controllers from this class.
 */
public abstract class FitAIController : AbpControllerBase
{
    protected FitAIController()
    {
        LocalizationResource = typeof(FitAIResource);
    }
}
