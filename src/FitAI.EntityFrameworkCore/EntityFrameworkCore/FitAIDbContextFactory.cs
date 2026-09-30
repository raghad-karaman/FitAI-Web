using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace FitAI.EntityFrameworkCore;

public class FitAIDbContextFactory : IDesignTimeDbContextFactory<FitAIDbContext>
{
    public FitAIDbContext CreateDbContext(string[] args)
    {
        FitAIEfCoreEntityExtensionMappings.Configure();

        var builder = new DbContextOptionsBuilder<FitAIDbContext>();

        builder.UseSqlServer(
            "Server=DESKTOP-RC79S3H\\SQLEXPRESS;Database=FitAI_New;Trusted_Connection=True;TrustServerCertificate=True"
        );

        return new FitAIDbContext(builder.Options);
    }
}