using System.Security.Claims;
using AiMenu.Api.Constants;
using AiMenu.Api.DTOs;
using AiMenu.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AiMenu.Api.Controllers;

[ApiController]
[Route("api/auth")]
// AuthController, login, register ve mevcut kullanici bilgisini donduren auth endpoint'lerini toplar.
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(ApiErrorResponseDto.Create("Email and password are required.", ApiErrorCodes.BadRequest));
        }

        try
        {
            return Ok(await authService.LoginAsync(request, cancellationToken));
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(ApiErrorResponseDto.Create(exception.Message, ApiErrorCodes.BadRequest));
        }
    }

    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request, CancellationToken cancellationToken)
    {
        if (request.RestaurantId == Guid.Empty ||
            string.IsNullOrWhiteSpace(request.FullName) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.Role))
        {
            return BadRequest(ApiErrorResponseDto.Create("Restaurant id, full name, email, password and role are required.", ApiErrorCodes.BadRequest));
        }

        try
        {
            var response = await authService.RegisterAsync(request, cancellationToken);
            return Created("/api/auth/me", response);
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(ApiErrorResponseDto.Create(exception.Message, ApiErrorCodes.BadRequest));
        }
    }

    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(AuthUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponseDto), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(ApiErrorResponseDto.Create("Token is invalid.", ApiErrorCodes.Unauthorized));
        }

        var user = await authService.GetCurrentUserAsync(userId, cancellationToken);
        return user is null
            ? NotFound(ApiErrorResponseDto.Create("User was not found.", ApiErrorCodes.NotFound))
            : Ok(user);
    }
}
