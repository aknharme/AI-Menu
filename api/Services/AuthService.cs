using Microsoft.AspNetCore.Identity;
using AiMenu.Api.Constants;
using AiMenu.Api.DTOs;
using AiMenu.Api.Entities;
using AiMenu.Api.Repositories.Interfaces;
using AiMenu.Api.Services.Interfaces;

namespace AiMenu.Api.Services;

public class AuthService(
    IAuthRepository authRepository,
    IJwtTokenService jwtTokenService) : IAuthService
{
    private readonly PasswordHasher<User> passwordHasher = new();

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = NormalizeEmail(request.Email);
        var user = await authRepository.GetUserByEmailAsync(normalizedEmail, cancellationToken);
        if (user is null)
        {
            throw new InvalidOperationException("User was not found.");
        }

        var verificationResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verificationResult == PasswordVerificationResult.Failed)
        {
            throw new InvalidOperationException("Password is incorrect.");
        }

        return CreateAuthResponse(user);
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = NormalizeEmail(request.Email);
        if (await authRepository.UserEmailExistsAsync(normalizedEmail, cancellationToken))
        {
            throw new InvalidOperationException("A user with this email already exists.");
        }

        var restaurant = await authRepository.GetRestaurantAsync(request.RestaurantId, cancellationToken);
        if (restaurant is null)
        {
            throw new InvalidOperationException("Restaurant was not found or is inactive.");
        }

        if (request.Role != AppRoles.Admin && request.Role != AppRoles.Cashier)
        {
            throw new InvalidOperationException("Role is invalid.");
        }

        var user = new User
        {
            UserId = Guid.NewGuid(),
            RestaurantId = request.RestaurantId,
            FullName = request.FullName.Trim(),
            Email = normalizedEmail,
            Role = request.Role,
            IsActive = true,
            CreatedAtUtc = DateTimeOffset.UtcNow
        };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        await authRepository.AddUserAsync(user, cancellationToken);
        await authRepository.SaveChangesAsync(cancellationToken);

        user.Restaurant = restaurant;
        return CreateAuthResponse(user);
    }

    public async Task<AuthUserDto?> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await authRepository.GetUserByIdAsync(userId, cancellationToken);
        return user is null ? null : MapUser(user);
    }

    private AuthResponseDto CreateAuthResponse(User user)
    {
        var (token, expiresAtUtc) = jwtTokenService.CreateToken(user);
        return new AuthResponseDto
        {
            Token = token,
            ExpiresAtUtc = expiresAtUtc,
            User = MapUser(user)
        };
    }

    private static AuthUserDto MapUser(User user)
    {
        return new AuthUserDto
        {
            UserId = user.UserId,
            RestaurantId = user.RestaurantId,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role
        };
    }

    private static string NormalizeEmail(string email)
    {
        return (email ?? string.Empty).Trim().ToLowerInvariant();
    }
}
