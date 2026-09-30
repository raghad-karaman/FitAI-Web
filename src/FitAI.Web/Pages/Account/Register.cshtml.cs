using System;
using FitAI.Accounts;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace FitAI.Web.Pages.Account;

public class RegisterModel : FitAI.Web.Pages.FitAIPageModel
{
    private readonly IAccountAppService _accountAppService;

    public RegisterModel(IAccountAppService accountAppService)
    {
        _accountAppService = accountAppService;
    }

    [BindProperty]
    public InputModel Input { get; set; } = new InputModel();

    public class InputModel
    {
        [Required(ErrorMessage = "Ad soyad gereklidir.")]
        [Display(Name = "Ad Soyad")]
        public string? FullName { get; set; }

        [Required(ErrorMessage = "E-posta adresi gereklidir.")]
        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz.")]
        public string? Email { get; set; }

        [Required(ErrorMessage = "Şifre gereklidir.")]
        [DataType(DataType.Password)]
        [MinLength(8, ErrorMessage = "Şifre en az 8 karakter olmalıdır.")]
        public string? Password { get; set; }

        [Required(ErrorMessage = "Şifre tekrarı gereklidir.")]
        [DataType(DataType.Password)]
        [Compare("Password", ErrorMessage = "Şifreler eşleşmiyor.")]
        public string? ConfirmPassword { get; set; }

        [Required(ErrorMessage = "Kullanım koşullarını kabul etmelisiniz.")]
        public bool AcceptTerms { get; set; }
    }

    public void OnGet()
    {
    }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid)
        {
            return Page();
        }

        try
        {
            var names = Input.FullName?.Split(' ', 2);

            await _accountAppService.RegisterAsync(new RegisterDto
            {
                UserName = Input.Email!,
                EmailAddress = Input.Email!,
                Password = Input.Password!,
                Name = names?[0] ?? string.Empty,
                Surname = names?.Length > 1 ? names[1] : string.Empty
            });

            return RedirectToPage("/Account/Login", new { registered = true });
        }
        catch (Exception ex)
        {
            ModelState.AddModelError(string.Empty, ex.Message);
            return Page();
        }
    }
}