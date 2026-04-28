using System.ComponentModel.DataAnnotations;

namespace AiMenu.Api.DTOs;

// LoginRequestDto, giris isteginde email ve sifre bilgisini tasir.
public class LoginRequestDto
{
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Email format is invalid.")]
    [MaxLength(180, ErrorMessage = "Email cannot exceed 180 characters.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    [MaxLength(100, ErrorMessage = "Password cannot exceed 100 characters.")]
    public string Password { get; set; } = string.Empty;
}
