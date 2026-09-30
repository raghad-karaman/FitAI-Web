using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace FitAI.Accounts;

public interface IAccountAppService : IApplicationService
{
    Task RegisterAsync(RegisterDto input);
}