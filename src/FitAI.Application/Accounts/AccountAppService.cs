using System;
using System.Linq;
using System.Threading.Tasks;
using Volo.Abp;
using Volo.Abp.Identity;
using Volo.Abp.Application.Services;

namespace FitAI.Accounts;

public class AccountAppService : FitAIAppService, IAccountAppService
{
    private readonly IdentityUserManager _userManager;

    public AccountAppService(IdentityUserManager userManager)
    {
        _userManager = userManager;
    }

    public async Task RegisterAsync(RegisterDto input)
    {
        var user = new IdentityUser(
            GuidGenerator.Create(),
            input.UserName,
            input.EmailAddress,
            CurrentTenant.Id
        );

        user.Name = input.Name;
        user.Surname = input.Surname;

        var result = await _userManager.CreateAsync(user, input.Password);

        if (!result.Succeeded)
        {
            var errorDetail = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new UserFriendlyException("Kayıt oluşturulamadı: " + errorDetail);
        }
    }
}