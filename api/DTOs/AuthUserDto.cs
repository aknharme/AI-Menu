namespace AiMenu.Api.DTOs;

// AuthUserDto, frontend'in girisli oturumda ihtiyac duydugu kullanici ozetini tasir.
public class AuthUserDto
{
    public Guid UserId { get; set; }
    public Guid RestaurantId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
