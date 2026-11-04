using AiMenu.Api.Controllers;
using AiMenu.Api.Data;
using AiMenu.Api.DTOs;
using AiMenu.Api.Entities;
using AiMenu.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AiMenu.Api.Tests;

public class MenuTableTests
{
    [Theory]
    [InlineData(true, true, true)]
    [InlineData(false, true, false)]
    [InlineData(true, false, false)]
    public async Task Menu_ResolvesOnlyAnActiveTableOfTheRequestedRestaurant(bool active, bool sameRestaurant, bool expected)
    {
        await using var db = CreateDb();
        var restaurantId = Guid.NewGuid();
        var tableId = Guid.NewGuid();
        db.Tables.Add(new Table
        {
            TableId = tableId,
            RestaurantId = sameRestaurant ? restaurantId : Guid.NewGuid(),
            Name = "Teras 7",
            IsActive = active
        });
        await db.SaveChangesAsync();
        var controller = new MenuController(new MenuStub(restaurantId), db);

        var result = await controller.GetMenu(restaurantId, default, tableId);

        if (expected)
        {
            var response = Assert.IsType<MenuResponseDto>(Assert.IsType<OkObjectResult>(result).Value);
            Assert.Equal("Teras 7", response.TableName);
        }
        else
        {
            Assert.IsType<NotFoundObjectResult>(result);
        }
    }

    [Fact]
    public async Task Menu_WithoutTable_KeepsExistingMenuAccess()
    {
        await using var db = CreateDb();
        var restaurantId = Guid.NewGuid();
        var controller = new MenuController(new MenuStub(restaurantId), db);
        var response = Assert.IsType<MenuResponseDto>(Assert.IsType<OkObjectResult>(
            await controller.GetMenu(restaurantId, default)).Value);
        Assert.Null(response.TableName);
    }

    [Fact]
    public async Task Menu_RejectsUnknownTable()
    {
        await using var db = CreateDb();
        var restaurantId = Guid.NewGuid();
        var controller = new MenuController(new MenuStub(restaurantId), db);
        Assert.IsType<NotFoundObjectResult>(await controller.GetMenu(restaurantId, default, Guid.NewGuid()));
    }

    private static AppDbContext CreateDb() => new(new DbContextOptionsBuilder<AppDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private sealed class MenuStub(Guid restaurantId) : IMenuService
    {
        public Task<MenuResponseDto?> GetMenuAsync(Guid id, CancellationToken ct = default) =>
            Task.FromResult<MenuResponseDto?>(id == restaurantId ? new MenuResponseDto { RestaurantId = id, RestaurantName = "Cafe" } : null);
        public Task<IReadOnlyCollection<CategoryDto>?> GetCategoriesAsync(Guid id, CancellationToken ct = default) => throw new NotSupportedException();
        public Task<IReadOnlyCollection<ProductListDto>?> GetProductsAsync(Guid id, CancellationToken ct = default) => throw new NotSupportedException();
        public Task<ProductDetailDto?> GetProductAsync(Guid id, Guid productId, CancellationToken ct = default) => throw new NotSupportedException();
    }
}
