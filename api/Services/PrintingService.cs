using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using AiMenu.Api.Data;
using AiMenu.Api.DTOs;
using AiMenu.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace AiMenu.Api.Services;

public class PrintingService(AppDbContext db)
{
    public static string Hash(string secret) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(secret)));

    public async Task<PairingCodeResponse> CreateCodeAsync(Guid restaurantId, CancellationToken ct)
    {
        if (!await db.Restaurants.AnyAsync(r => r.RestaurantId == restaurantId && r.IsActive, ct))
            throw new InvalidOperationException("Aktif restoran bulunamadı.");
        var now = DateTimeOffset.UtcNow;
        foreach (var old in await db.PrintPairingCodes.Where(p => p.RestaurantId == restaurantId && p.ConsumedAtUtc == null).ToListAsync(ct))
            old.ConsumedAtUtc = now;
        var code = Convert.ToHexString(RandomNumberGenerator.GetBytes(8));
        var expires = now.AddMinutes(10);
        db.PrintPairingCodes.Add(new() { Id = Guid.NewGuid(), RestaurantId = restaurantId, CodeHash = Hash(code), ExpiresAtUtc = expires });
        await db.SaveChangesAsync(ct);
        return new(code, expires);
    }

    public async Task<PairDeviceResponse?> PairAsync(PairDeviceRequest request, CancellationToken ct)
    {
        var hash = Hash(request.Code.Replace("-", "").Trim().ToUpperInvariant());
        var now = DateTimeOffset.UtcNow;
        var code = await db.PrintPairingCodes.SingleOrDefaultAsync(p => p.CodeHash == hash && p.ConsumedAtUtc == null && p.ExpiresAtUtc > now, ct);
        if (code is null || !await db.Restaurants.AnyAsync(r => r.RestaurantId == code.RestaurantId && r.IsActive, ct)) return null;
        var device = await db.PrintDevices.SingleOrDefaultAsync(d => d.RestaurantId == code.RestaurantId, ct);
        if (device is null)
        {
            device = new() { Id = Guid.NewGuid(), RestaurantId = code.RestaurantId };
            db.PrintDevices.Add(device);
        }
        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        device.Name = request.Name.Trim();
        device.TokenHash = Hash(token);
        device.IsActive = true;
        device.LastSeenAtUtc = now;
        code.ConsumedAtUtc = now;
        // Code tüketimi ve yeni kimlik aynı DB transaction'ında. Yanıt kaybolursa yeni kod gerekir.
        await db.SaveChangesAsync(ct);
        return new(device.Id, device.RestaurantId, token);
    }

    public async Task ExpireLeasesAsync(Guid restaurantId, CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;
        var jobs = await db.PrintJobs.Where(j => j.RestaurantId == restaurantId && j.State == "Claimed" && j.LeaseExpiresAtUtc < now).ToListAsync(ct);
        foreach (var job in jobs)
        {
            job.State = "Uncertain";
            job.Error = "Cihaz sonucu zamanında bildirmedi. Fişi kontrol etmeden tekrar yazdırmayın.";
        }
        if (jobs.Count > 0) await db.SaveChangesAsync(ct);
    }

    public async Task<PrintJobDelivery?> ClaimAsync(Guid deviceId, Guid restaurantId, CancellationToken ct)
    {
        await ExpireLeasesAsync(restaurantId, ct);
        var device = await db.PrintDevices.SingleAsync(d => d.Id == deviceId && d.RestaurantId == restaurantId && d.IsActive, ct);
        device.LastSeenAtUtc = DateTimeOffset.UtcNow;
        var job = await db.PrintJobs.Where(j => j.RestaurantId == restaurantId && j.State == "Pending" &&
            db.Orders.Any(o => o.OrderId == j.OrderId && o.Status != "Cancelled"))
            .OrderBy(j => j.CreatedAtUtc).ThenBy(j => j.Id).FirstOrDefaultAsync(ct);
        if (job is null) { await db.SaveChangesAsync(ct); return null; }
        job.DeviceId = deviceId;
        job.LeaseId = Guid.NewGuid();
        job.LeaseExpiresAtUtc = DateTimeOffset.UtcNow.AddMinutes(2);
        job.State = "Claimed";
        job.Attempt++;
        await db.SaveChangesAsync(ct);
        return new(job.Id, job.LeaseId.Value, job.LeaseExpiresAtUtc.Value, job.Attempt,
            JsonSerializer.Deserialize<KitchenTicket>(job.PayloadJson)!);
    }

    public async Task<bool> CompleteAsync(Guid deviceId, Guid restaurantId, Guid id, PrintResultRequest request, CancellationToken ct)
    {
        var job = await db.PrintJobs.SingleOrDefaultAsync(j => j.Id == id && j.RestaurantId == restaurantId && j.DeviceId == deviceId, ct);
        if (job is null || job.LeaseId != request.LeaseId) return false;
        if (job.State == request.Result) return true; // Ağ retry'sında tekrar ACK güvenlidir.
        if (job.State is not ("Claimed" or "Uncertain")) return false;
        job.State = request.Result;
        job.Error = request.Error;
        job.CompletedAtUtc = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return true;
    }

    public async Task SaveSettingsAsync(Guid restaurantId, PrintSettingsRequest request, CancellationToken ct)
    {
        if (request.Routes.Any(r => r is null) || request.Routes.Select(r => r.CategoryId).Distinct().Count() != request.Routes.Count)
            throw new InvalidOperationException("Kategori yönlendirmeleri geçersiz veya tekrarlı.");
        var categories = await db.Categories.Where(c => c.RestaurantId == restaurantId).ToListAsync(ct);
        if (request.Routes.Any(r => !categories.Any(c => c.CategoryId == r.CategoryId)))
            throw new InvalidOperationException("Yalnızca kendi restoranınızın kategorilerini seçebilirsiniz.");
        if (request.Enabled && categories.Where(c => c.IsActive).Any(c => !request.Routes.Any(r => r.CategoryId == c.CategoryId)))
            throw new InvalidOperationException("Yazdırmayı açmadan önce tüm aktif kategorilerin bölümünü seçin.");
        var restaurant = await db.Restaurants.SingleAsync(r => r.RestaurantId == restaurantId && r.IsActive, ct);
        restaurant.PrintingEnabled = request.Enabled;
        var existing = await db.PrintRoutes.Where(r => r.RestaurantId == restaurantId).ToListAsync(ct);
        foreach (var route in existing)
        {
            var replacement = request.Routes.SingleOrDefault(r => r.CategoryId == route.CategoryId);
            if (replacement is null) db.PrintRoutes.Remove(route);
            else route.Station = replacement.Station;
        }
        foreach (var route in request.Routes.Where(r => !existing.Any(e => e.CategoryId == r.CategoryId)))
            db.PrintRoutes.Add(new() { CategoryId = route.CategoryId, RestaurantId = restaurantId, Station = route.Station });
        await db.SaveChangesAsync(ct);
    }

    public async Task RetryAsync(Guid restaurantId, Guid id, RetryPrintRequest request, CancellationToken ct)
    {
        var job = await db.PrintJobs.SingleOrDefaultAsync(j => j.Id == id && j.RestaurantId == restaurantId, ct)
            ?? throw new InvalidOperationException("Baskı işi bulunamadı.");
        if (!request.AcknowledgeDuplicateRisk) throw new InvalidOperationException("Önce yazıcıyı kontrol edip tekrar baskı riskini onaylayın.");
        if (job.Attempt != request.ExpectedAttempt) throw new InvalidOperationException("Baskı denemesi değişti; listeyi yenileyin.");
        if (job.State == "Pending") return;
        if (job.State is "Claimed" or "Cancelled" || await db.Orders.AnyAsync(o => o.OrderId == job.OrderId && o.Status == "Cancelled", ct))
            throw new InvalidOperationException("Devam eden veya iptal edilmiş iş yeniden basılamaz.");
        job.State = "Pending";
        job.LeaseId = null;
        job.LeaseExpiresAtUtc = null;
        job.CompletedAtUtc = null;
        job.Error = null;
        db.AuditLogs.Add(new() { AuditLogId = Guid.NewGuid(), RestaurantId = restaurantId,
            ActionType = "PrintRetry", EntityType = "PrintJob", EntityId = id,
            Description = $"Kontrollü tekrar baskı istendi; önceki deneme: {job.Attempt}", CreatedAtUtc = DateTimeOffset.UtcNow });
        await db.SaveChangesAsync(ct);
    }
}
