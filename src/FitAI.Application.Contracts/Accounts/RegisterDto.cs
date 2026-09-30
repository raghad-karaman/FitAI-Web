using System.ComponentModel.DataAnnotations;

namespace FitAI.Accounts;

public class RegisterDto
{
    [Required]
    public string UserName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string EmailAddress { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string Name { get; set; } = string.Empty;

    public string Surname { get; set; } = string.Empty;
}