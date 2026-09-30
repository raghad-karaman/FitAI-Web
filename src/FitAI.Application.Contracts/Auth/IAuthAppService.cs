using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace FitAI.Auth
{
    public interface IAuthAppService : IApplicationService
    {
        Task<string> LoginAsync(UserLoginDto input);
        Task RegisterAsync(UserRegisterDto input);
    }

    public class UserLoginDto
    {
        public string UserName { get; set; } = default!;
        public string Password { get; set; } = default!;
    }

    public class UserRegisterDto
    {
        public string UserName { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
    }
}
