using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace FitAI.Data;

/* This is used if database provider does't define
 * IFitAIDbSchemaMigrator implementation.
 */
public class NullFitAIDbSchemaMigrator : IFitAIDbSchemaMigrator, ITransientDependency
{
    public Task MigrateAsync()
    {
        return Task.CompletedTask;
    }
}
