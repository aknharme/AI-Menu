using AiMenu.Api.Data;
using AiMenu.Api.DTOs;
using AiMenu.Api.Entities;
using AiMenu.Api.Repositories;
using AiMenu.Api.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace AiMenu.Api.Tests;

public class PrintingTests
{
    [Fact]
    public async Task Approval_IsAtomic_SplitsStations_AndDoesNotDuplicate()
    {
        using var fixture = new Fixture();
        using var db = fixture.Create();
        var repo = new OrderRepository(db);
        var order = await repo.GetOrderForUpdateAsync(fixture.RestaurantId, fixture.OrderId);
        order!.Status = "Preparing";
        await repo.SaveChangesAsync();
        var jobs = await db.PrintJobs.ToListAsync();
        Assert.Equal(2, jobs.Count);
        Assert.Contains(jobs, j => j.Station == "Kitchen" && j.PayloadJson.Contains("Burger") && !j.PayloadJson.Contains("Kola"));
        Assert.Contains(jobs, j => j.Station == "Bar" && j.PayloadJson.Contains("Kola") && !j.PayloadJson.Contains("Burger"));
        Assert.All(jobs, j => Assert.Equal("Pending", j.State));
        await repo.SaveChangesAsync();
        Assert.Equal(2, await db.PrintJobs.CountAsync());
    }

    [Fact]
    public async Task MissingRoute_PreventsApprovalAndPartialTickets()
    {
        using var fixture = new Fixture();
        using (var db = fixture.Create())
        {
            db.PrintRoutes.Remove((await db.PrintRoutes.ToListAsync())[0]);
            await db.SaveChangesAsync();
            var repo = new OrderRepository(db);
            (await repo.GetOrderForUpdateAsync(fixture.RestaurantId, fixture.OrderId))!.Status = "Preparing";
            await Assert.ThrowsAsync<InvalidOperationException>(() => repo.SaveChangesAsync());
        }
        using var verify = fixture.Create();
        Assert.Equal("Pending", (await verify.Orders.SingleAsync()).Status);
        Assert.Empty(await verify.PrintJobs.ToListAsync());
    }

    [Fact]
    public async Task ConcurrentApprovals_OnlyOneCommit_AndOneTicketPerStation()
    {
        using var fixture = new Fixture();
        using var first = fixture.Create(); using var second = fixture.Create();
        var a = new OrderRepository(first); var b = new OrderRepository(second);
        (await a.GetOrderForUpdateAsync(fixture.RestaurantId, fixture.OrderId))!.Status = "Preparing";
        (await b.GetOrderForUpdateAsync(fixture.RestaurantId, fixture.OrderId))!.Status = "Preparing";
        await a.SaveChangesAsync();
        await Assert.ThrowsAnyAsync<DbUpdateException>(() => b.SaveChangesAsync());
        using var verify = fixture.Create();
        Assert.Equal(2, await verify.PrintJobs.CountAsync());
    }

    [Fact]
    public async Task Pairing_IsOneUse_AndExpiredCodesFail()
    {
        using var fixture = new Fixture(); using var db = fixture.Create();
        var service = new PrintingService(db);
        var code = await service.CreateCodeAsync(fixture.RestaurantId, default);
        var paired = await service.PairAsync(new() { Code = code.Code, Name = "Kasa" }, default);
        Assert.NotNull(paired);
        var device = await db.PrintDevices.SingleAsync();
        Assert.NotEqual(paired.DeviceToken, device.TokenHash);
        Assert.Equal(PrintingService.Hash(paired.DeviceToken), device.TokenHash);
        Assert.Null(await service.PairAsync(new() { Code = code.Code, Name = "Tekrar" }, default));
        var expired = await service.CreateCodeAsync(fixture.RestaurantId, default);
        (await db.PrintPairingCodes.SingleAsync(p => p.CodeHash == PrintingService.Hash(expired.Code))).ExpiresAtUtc = DateTimeOffset.UtcNow.AddMinutes(-1);
        await db.SaveChangesAsync();
        Assert.Null(await service.PairAsync(new() { Code = expired.Code, Name = "Gecikmiş" }, default));
    }

    [Fact]
    public async Task ClaimedJob_IsNotReclaimed_AndExpiredLeaseBecomesUncertain()
    {
        using var fixture = new Fixture(); using var db = fixture.Create();
        var service = new PrintingService(db);
        var code = await service.CreateCodeAsync(fixture.RestaurantId, default);
        var device = (await service.PairAsync(new() { Code = code.Code, Name = "Kasa" }, default))!;
        await fixture.Approve(db);
        var first = (await service.ClaimAsync(device.DeviceId, fixture.RestaurantId, default))!;
        var second = (await service.ClaimAsync(device.DeviceId, fixture.RestaurantId, default))!;
        Assert.NotEqual(first.Id, second.Id);
        Assert.Null(await service.ClaimAsync(device.DeviceId, fixture.RestaurantId, default));
        var row = await db.PrintJobs.SingleAsync(j => j.Id == first.Id);
        row.LeaseExpiresAtUtc = DateTimeOffset.UtcNow.AddSeconds(-1);
        await db.SaveChangesAsync();
        Assert.Null(await service.ClaimAsync(device.DeviceId, fixture.RestaurantId, default));
        Assert.Equal("Uncertain", row.State);
        Assert.False(await service.CompleteAsync(device.DeviceId, Guid.NewGuid(), first.Id, new() { LeaseId = first.LeaseId, Result = "Submitted" }, default));
        Assert.False(await service.CompleteAsync(device.DeviceId, fixture.RestaurantId, first.Id, new() { LeaseId = Guid.NewGuid(), Result = "Submitted" }, default));
        Assert.True(await service.CompleteAsync(device.DeviceId, fixture.RestaurantId, first.Id, new() { LeaseId = first.LeaseId, Result = "Submitted" }, default));
        Assert.True(await service.CompleteAsync(device.DeviceId, fixture.RestaurantId, first.Id, new() { LeaseId = first.LeaseId, Result = "Submitted" }, default));
    }

    [Fact]
    public async Task Retry_RequiresExplicitAcknowledgement_AndNewLeaseRejectsOldAck()
    {
        using var fixture = new Fixture(); using var db = fixture.Create();
        var service = new PrintingService(db);
        var code = await service.CreateCodeAsync(fixture.RestaurantId, default);
        var device = (await service.PairAsync(new() { Code = code.Code, Name = "Kasa" }, default))!;
        await fixture.Approve(db);
        var first = (await service.ClaimAsync(device.DeviceId, fixture.RestaurantId, default))!;
        await service.CompleteAsync(device.DeviceId, fixture.RestaurantId, first.Id, new() { LeaseId = first.LeaseId, Result = "Failed" }, default);
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.RetryAsync(fixture.RestaurantId, first.Id,
            new() { ExpectedAttempt = 1 }, default));
        await service.RetryAsync(fixture.RestaurantId, first.Id, new() { ExpectedAttempt = 1, AcknowledgeDuplicateRisk = true }, default);
        Assert.False(await service.CompleteAsync(device.DeviceId, fixture.RestaurantId, first.Id, new() { LeaseId = first.LeaseId, Result = "Submitted" }, default));
    }

    [Fact]
    public async Task Settings_RejectOtherRestaurantsCategory_AndCancellationStopsPendingJobs()
    {
        using var fixture = new Fixture(); using var db = fixture.Create();
        await Assert.ThrowsAsync<InvalidOperationException>(() => new PrintingService(db).SaveSettingsAsync(fixture.RestaurantId,
            new() { Routes = [new() { CategoryId = Guid.NewGuid(), Station = "Bar" }] }, default));
        await fixture.Approve(db);
        var repo = new OrderRepository(db);
        (await repo.GetOrderForUpdateAsync(fixture.RestaurantId, fixture.OrderId))!.Status = "Cancelled";
        await repo.SaveChangesAsync();
        Assert.All(await db.PrintJobs.ToListAsync(), j => Assert.Equal("Cancelled", j.State));
    }

    private sealed class SqliteContext(DbContextOptions<AppDbContext> options) : AppDbContext(options)
    {
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // SQLite test provider'ın DateTimeOffset sıralama kısıtı için UTC değer dönüştürücü.
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
                foreach (var property in entity.GetProperties())
                    if (property.ClrType == typeof(DateTimeOffset) || property.ClrType == typeof(DateTimeOffset?))
                        property.SetValueConverter(new DateTimeOffsetToBinaryConverter());
        }
    }
    private sealed class Fixture : IDisposable
    {
        private readonly SqliteConnection connection = new("DataSource=:memory:");
        public Guid RestaurantId { get; } = Guid.NewGuid();
        public Guid OrderId { get; } = Guid.NewGuid();
        public Fixture()
        {
            connection.Open();
            using var db = Create(); db.Database.EnsureCreated();
            var restaurant = new Restaurant { RestaurantId = RestaurantId, Name = "Test Restoran", Slug = "test", PrintingEnabled = true };
            var food = new Category { CategoryId = Guid.NewGuid(), Restaurant = restaurant, Name = "Yemek" };
            var drinks = new Category { CategoryId = Guid.NewGuid(), Restaurant = restaurant, Name = "İçecek" };
            var burger = new Product { ProductId = Guid.NewGuid(), Restaurant = restaurant, Category = food, Name = "Burger" };
            var cola = new Product { ProductId = Guid.NewGuid(), Restaurant = restaurant, Category = drinks, Name = "Kola" };
            var table = new Table { TableId = Guid.NewGuid(), Restaurant = restaurant, Name = "Masa 5" };
            db.Orders.Add(new Order { OrderId = OrderId, Restaurant = restaurant, Table = table, Items = [
                new() { OrderItemId = Guid.NewGuid(), Restaurant = restaurant, Product = burger, Quantity = 2, Note = "Soğansız" },
                new() { OrderItemId = Guid.NewGuid(), Restaurant = restaurant, Product = cola, Quantity = 1 }
            ] });
            db.PrintRoutes.AddRange(new PrintRoute { CategoryId = food.CategoryId, RestaurantId = RestaurantId, Station = "Kitchen" },
                new PrintRoute { CategoryId = drinks.CategoryId, RestaurantId = RestaurantId, Station = "Bar" });
            db.SaveChanges();
        }
        public AppDbContext Create() => new SqliteContext(new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options);
        public async Task Approve(AppDbContext db)
        {
            var repo = new OrderRepository(db);
            (await repo.GetOrderForUpdateAsync(RestaurantId, OrderId))!.Status = "Preparing";
            await repo.SaveChangesAsync();
        }
        public void Dispose() => connection.Dispose();
    }
}
