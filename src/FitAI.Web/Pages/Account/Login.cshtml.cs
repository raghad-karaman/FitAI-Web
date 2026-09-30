using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using FitAI.Web.Pages;
using Microsoft.AspNetCore.Identity;
using Volo.Abp.Identity;

namespace FitAI.Web.Pages.Account;

public class LoginModel : FitAIPageModel
{
    [BindProperty]
    public InputModel Input { get; set; } = new();

    public class InputModel
    {
        [Required(ErrorMessage = "E-posta veya kullanıcı adı gereklidir.")]
        public string? EmailOrUsername { get; set; }

        [Required(ErrorMessage = "Şifre gereklidir.")]
        [DataType(DataType.Password)]
        public string? Password { get; set; }

        public bool RememberMe { get; set; }
    }

    public void OnGet() { }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid)
            return Page();

        var userManager = LazyServiceProvider.LazyGetRequiredService<IdentityUserManager>();
        var signInManager = LazyServiceProvider.LazyGetRequiredService<SignInManager<Volo.Abp.Identity.IdentityUser>>();

        Volo.Abp.Identity.IdentityUser? user = null;

        if (Input.EmailOrUsername!.Contains('@'))
            user = await userManager.FindByEmailAsync(Input.EmailOrUsername);

        if (user is null)
            user = await userManager.FindByNameAsync(Input.EmailOrUsername);

        if (user is null)
        {
            ModelState.AddModelError(string.Empty, "E-posta veya şifre hatalı.");
            return Page();
        }

        var result = await signInManager.PasswordSignInAsync(
            user,
            Input.Password!,
            isPersistent: Input.RememberMe,
            lockoutOnFailure: false
        );

        if (result.Succeeded)
            return RedirectToPage("/Index");

        ModelState.AddModelError(string.Empty, "E-posta veya şifre hatalı.");
        return Page();
    }
}