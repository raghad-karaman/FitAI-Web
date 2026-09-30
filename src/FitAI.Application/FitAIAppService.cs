using System;
using System.Collections.Generic;
using System.Text;
using FitAI.Localization;
using Volo.Abp.Application.Services;

namespace FitAI;

/* Inherit your application services from this class.
 */
public abstract class FitAIAppService : ApplicationService
{
    protected FitAIAppService()
    {
        LocalizationResource = typeof(FitAIResource);
    }
}
