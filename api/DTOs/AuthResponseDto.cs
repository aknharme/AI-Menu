namespace AiMenu.Api.DTOs;

// AuthResponseDto, basarili giris veya kayit sonrasinda token ve kullanici ozetini dondurur.
public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public DateTimeOffset ExpiresAtUtc { get; set; }
    public AuthUserDto User { get; set; } = new();
}
