using AiMenu.Api.DTOs;

namespace AiMenu.Api.Services.Interfaces;

// IAuthService, login, register ve mevcut kullanici bilgisini donme akislarini tanimlar.
public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default);
    Task<AuthUserDto?> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default);
}
