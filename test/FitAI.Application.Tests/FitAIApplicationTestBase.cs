using Volo.Abp.Modularity;

namespace FitAI;

public abstract class FitAIApplicationTestBase<TStartupModule> : FitAITestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
