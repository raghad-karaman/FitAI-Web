using Volo.Abp.Modularity;

namespace FitAI;

[DependsOn(
    typeof(FitAIDomainModule),
    typeof(FitAITestBaseModule)
)]
public class FitAIDomainTestModule : AbpModule
{

}
