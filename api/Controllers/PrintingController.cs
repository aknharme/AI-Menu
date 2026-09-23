using System.Security.Claims;
using AiMenu.Api.Constants;
using AiMenu.Api.Data;
using AiMenu.Api.DTOs;
using AiMenu.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace AiMenu.Api.Controllers;

[ApiController, Route("api/printing"), RequestSizeLimit(65536)]
public class PrintingController(PrintingService service, AppDbContext db) : ControllerBase
{
    private Guid RestaurantId => Guid.Parse(User.FindFirstValue("restaurantId")!);
    private Guid DeviceId => Guid.Parse(User.FindFirstValue("deviceId")!);

    [Authorize(Roles = AppRoles.Admin), HttpPost("pairing-codes")]
    public async Task<IActionResult> CreateCode(CancellationToken ct) => Ok(await service.CreateCodeAsync(RestaurantId, ct));

    [AllowAnonymous, EnableRateLimiting("PrinterPairing"), HttpPost("pair")]
    public async Task<IActionResult> Pair(PairDeviceRequest request, CancellationToken ct)
    {
        var result = await service.PairAsync(request, ct);
        return result is null ? Unauthorized(new { message = "Eşleştirme kodu geçersiz, kullanılmış veya süresi dolmuş." }) : Ok(result);
    }

    [Authorize(AuthenticationSchemes = "PrintDevice"), HttpPost("device/claim")]
    public async Task<IActionResult> Claim(CancellationToken ct)
    {
        var job = await service.ClaimAsync(DeviceId, RestaurantId, ct);
        return job is null ? NoContent() : Ok(job);
    }

    [Authorize(AuthenticationSchemes = "PrintDevice"), HttpPost("device/jobs/{id:guid}/result")]
    public async Task<IActionResult> Complete(Guid id, PrintResultRequest request, CancellationToken ct) =>
        await service.CompleteAsync(DeviceId, RestaurantId, id, request, ct) ? NoContent() : Conflict(new { message = "İş veya cihaz teslim bilgisi değişti." });

    [Authorize(Roles = AppRoles.Admin), HttpGet("settings")]
    public async Task<IActionResult> Settings(CancellationToken ct)
    {
        var id = RestaurantId;
        var enabled = await db.Restaurants.Where(r => r.RestaurantId == id).Select(r => r.PrintingEnabled).SingleAsync(ct);
        var routes = await db.PrintRoutes.Where(r => r.RestaurantId == id).ToListAsync(ct);
        var categories = await db.Categories.Where(c => c.RestaurantId == id && c.IsActive).OrderBy(c => c.DisplayOrder)
            .Select(c => new { c.CategoryId, c.Name }).ToListAsync(ct);
        return Ok(new { enabled, routes, categories });
    }

    [Authorize(Roles = AppRoles.Admin), HttpPut("settings")]
    public async Task<IActionResult> Settings(PrintSettingsRequest request, CancellationToken ct)
    {
        await service.SaveSettingsAsync(RestaurantId, request, ct);
        return NoContent();
    }

    [Authorize(Roles = AppRoles.Admin), HttpDelete("device")]
    public async Task<IActionResult> Revoke(CancellationToken ct)
    {
        var id = RestaurantId;
        var device = await db.PrintDevices.SingleOrDefaultAsync(d => d.RestaurantId == id, ct);
        if (device is not null) device.IsActive = false;
        // Bekleyen eşleştirme kodları da iptal edilir.
        foreach (var code in await db.PrintPairingCodes.Where(p => p.RestaurantId == id && p.ConsumedAtUtc == null).ToListAsync(ct))
            code.ConsumedAtUtc = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [Authorize(Roles = "Admin,Cashier"), HttpGet("status")]
    public async Task<IActionResult> Status(CancellationToken ct)
    {
        var id = RestaurantId;
        await service.ExpireLeasesAsync(id, ct);
        var device = await db.PrintDevices.AsNoTracking().Where(d => d.RestaurantId == id)
            .Select(d => new { d.Id, d.Name, d.IsActive, d.LastSeenAtUtc }).SingleOrDefaultAsync(ct);
        var jobs = await db.PrintJobs.AsNoTracking().Where(j => j.RestaurantId == id).OrderByDescending(j => j.CreatedAtUtc)
            .Take(100).Select(j => new { j.Id, j.OrderId, j.Station, j.State, j.Attempt, j.CreatedAtUtc, j.CompletedAtUtc, j.Error }).ToListAsync(ct);
        return Ok(new { device, jobs });
    }

    [Authorize(Roles = "Admin,Cashier"), HttpPost("jobs/{id:guid}/retry")]
    public async Task<IActionResult> Retry(Guid id, RetryPrintRequest request, CancellationToken ct)
    {
        await service.RetryAsync(RestaurantId, id, request, ct);
        return NoContent();
    }
}
