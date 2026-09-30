using FitAI.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.Autofac;
using Volo.Abp.Data;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.Modularity;

namespace FitAI.DbMigrator;

[DependsOn(
    typeof(AbpAutofacModule),
    typeof(FitAIEntityFrameworkCoreModule),
    typeof(FitAIApplicationContractsModule)
)]
public class FitAIDbMigratorModule : AbpModule
{
    public override void PreConfigureServices(ServiceConfigurationContext context)
    {
        var configuration = context.Services.GetConfiguration();
        
        PreConfigure<AbpDbContextOptions>(options =>
        {
            options.Configure(c =>
            {
                c.UseSqlServer();
            });
        });
    }

    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        Configure<AbpDbConnectionOptions>(options =>
        {
            options.Databases.Configure("Default", database =>
            {
                database.MappedConnections.Add("FitAI");
            });
        });
    }
}