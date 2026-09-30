using System.Threading.Tasks;

namespace FitAI.Data;

public interface IFitAIDbSchemaMigrator
{
    Task MigrateAsync();
}
