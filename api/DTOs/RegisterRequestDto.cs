using System.ComponentModel.DataAnnotations;
using AiMenu.Api.Validation;

namespace AiMenu.Api.DTOs;

// RegisterRequestDto, yeni admin veya cashier kullanicisi olusturmak icin kullanilir.
public class RegisterRequestDto
{
    [NotEmptyGuid(ErrorMessage = "Restaurant id is required.")]
    public Guid RestaurantId { get; set; }

    [Required(ErrorMessage = "Full name is required.")]
    [MaxLength(150, ErrorMessage = "Full name cannot exceed 150 characters.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Email format is invalid.")]
    [MaxLength(180, ErrorMessage = "Email cannot exceed 180 characters.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    [MaxLength(100, ErrorMessage = "Password cannot exceed 100 characters.")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Role is required.")]
    [MaxLength(40, ErrorMessage = "Role cannot exceed 40 characters.")]
    public string Role { get; set; } = string.Empty;
}
