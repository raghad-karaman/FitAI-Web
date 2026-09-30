using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using FitAI.Auth;
using Volo.Abp.AspNetCore.Mvc;

namespace FitAI.Controllers
{
    [Route("api/auth")]
    public class AuthController : AbpController
    {
        private readonly IAuthAppService _authService;

        public AuthController(IAuthAppService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterAsync([FromBody] UserRegisterDto input)
        {
            await _authService.RegisterAsync(input);
            return Ok("User registered successfully.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> LoginAsync([FromBody] UserLoginDto input)
        {
            var token = await _authService.LoginAsync(input);
            return Ok(new { message = "Login successful.", user = token });
        }
    }
}
