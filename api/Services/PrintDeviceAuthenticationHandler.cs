using System.Security.Claims;
using System.Text.Encodings.Web;
using AiMenu.Api.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace AiMenu.Api.Services;

public class PrintDeviceAuthenticationHandler(IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger, UrlEncoder encoder, AppDbContext db)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var header = Request.Headers.Authorization.ToString();
        const string prefix = "PrintDevice ";
        if (!header.StartsWith(prefix, StringComparison.Ordinal)) return AuthenticateResult.NoResult();
        var token = header[prefix.Length..];
        if (token.Length != 64 || !token.All(Uri.IsHexDigit)) return AuthenticateResult.Fail("Geçersiz cihaz.");
        var hash = PrintingService.Hash(token);
        var device = await db.PrintDevices.AsNoTracking().SingleOrDefaultAsync(d => d.TokenHash == hash && d.IsActive &&
            db.Restaurants.Any(r => r.RestaurantId == d.RestaurantId && r.IsActive), Context.RequestAborted);
        if (device is null) return AuthenticateResult.Fail("Geçersiz cihaz.");
        var identity = new ClaimsIdentity(new[] {
            new Claim("deviceId", device.Id.ToString()), new Claim("restaurantId", device.RestaurantId.ToString())
        }, Scheme.Name);
        return AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(identity), Scheme.Name));
    }
}
