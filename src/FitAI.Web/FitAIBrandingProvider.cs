using Microsoft.Extensions.Localization;
using FitAI.Localization;
using Volo.Abp.Ui.Branding;
using Volo.Abp.DependencyInjection;

namespace FitAI.Web;

[Dependency(ReplaceServices = true)]
public class FitAIBrandingProvider : DefaultBrandingProvider
{
    private IStringLocalizer<FitAIResource> _localizer;

    public FitAIBrandingProvider(IStringLocalizer<FitAIResource> localizer)
    {
        _localizer = localizer;
    }

    public override string AppName => _localizer["AppName"];
}
