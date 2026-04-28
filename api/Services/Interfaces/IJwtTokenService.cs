using AiMenu.Api.Entities;

namespace AiMenu.Api.Services.Interfaces;

// IJwtTokenService, kullanici claimlerinden JWT token olusturur.
public interface IJwtTokenService
{
    (string Token, DateTimeOffset ExpiresAtUtc) CreateToken(User user);
}
