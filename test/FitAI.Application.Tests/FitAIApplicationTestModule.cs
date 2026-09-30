using Volo.Abp.Modularity;

namespace FitAI;

[DependsOn(
    typeof(FitAIApplicationModule),
    typeof(FitAIDomainTestModule)
)]
public class FitAIApplicationTestModule : AbpModule
{

}
