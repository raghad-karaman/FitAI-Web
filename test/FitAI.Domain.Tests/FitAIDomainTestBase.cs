using Volo.Abp.Modularity;

namespace FitAI;

/* Inherit from this class for your domain layer tests. */
public abstract class FitAIDomainTestBase<TStartupModule> : FitAITestBase<TStartupModule>
    where TStartupModule : IAbpModule
{

}
