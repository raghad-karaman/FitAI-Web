using Microsoft.AspNetCore.Builder;
using FitAI;
using Volo.Abp.AspNetCore.TestBase;

var builder = WebApplication.CreateBuilder();

builder.Environment.ContentRootPath = GetWebProjectContentRootPathHelper.Get("FitAI.Web.csproj");
await builder.RunAbpModuleAsync<FitAIWebTestModule>(applicationName: "FitAI.Web" );

public partial class Program
{
}
