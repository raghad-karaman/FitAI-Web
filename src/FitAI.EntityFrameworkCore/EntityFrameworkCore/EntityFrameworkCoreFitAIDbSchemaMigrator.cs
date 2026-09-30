using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using FitAI.Data;
using Volo.Abp.DependencyInjection;

namespace FitAI.EntityFrameworkCore;

public class EntityFrameworkCoreFitAIDbSchemaMigrator
    : IFitAIDbSchemaMigrator, ITransientDependency
{
    private readonly IServiceProvider _serviceProvider;

    public EntityFrameworkCoreFitAIDbSchemaMigrator(
        IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task MigrateAsync()
    {
        /* We intentionally resolve the FitAIDbContext
         * from IServiceProvider (instead of directly injecting it)
         * to properly get the connection string of the current tenant in the
         * current scope.
         */

        await _serviceProvider
            .GetRequiredService<FitAIDbContext>()
            .Database
            .MigrateAsync();
    }
}
