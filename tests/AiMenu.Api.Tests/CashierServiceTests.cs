using AiMenu.Api.DTOs;
using AiMenu.Api.Entities;
using AiMenu.Api.Repositories.Interfaces;
using AiMenu.Api.Services;
using AiMenu.Api.Services.Interfaces;

namespace AiMenu.Api.Tests;

public class CashierServiceTests
{
    [Fact]
    public async Task UpdateOrderStatusAsync_RejectsTerminalStatusRollback()
    {
        var restaurantId = Guid.NewGuid();
        var orderId = Guid.NewGuid();
        var orderRepository = new FakeOrderRepository
        {
            OrderForUpdate = new Order
            {
                RestaurantId = restaurantId,
                OrderId = orderId,
                Status = "Paid"
            }
        };
        var service = new CashierService(
            orderRepository,
            new FakeRestaurantRepository(new Restaurant { RestaurantId = restaurantId, Name = "Test" }),
            new FakeLogService());

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.UpdateOrderStatusAsync(restaurantId, orderId, "Pending"));

        Assert.Contains("cannot transition", exception.Message);
    }

    [Fact]
    public async Task UpdateOrderStatusAsync_AllowsPendingToPreparing()
    {
        var restaurantId = Guid.NewGuid();
        var orderId = Guid.NewGuid();
        var tableId = Guid.NewGuid();
        var order = new Order
        {
            RestaurantId = restaurantId,
            OrderId = orderId,
            TableId = tableId,
            Status = "Pending",
            Table = new Table { RestaurantId = restaurantId, TableId = tableId, Name = "Masa 1" },
            Items = []
        };
        var orderRepository = new FakeOrderRepository
        {
            OrderForUpdate = order,
            CashierOrder = order
        };
        var service = new CashierService(
            orderRepository,
            new FakeRestaurantRepository(new Restaurant { RestaurantId = restaurantId, Name = "Test" }),
            new FakeLogService());

        var response = await service.UpdateOrderStatusAsync(restaurantId, orderId, "Preparing");

        Assert.NotNull(response);
        Assert.Equal("Preparing", response.Status);
        Assert.True(orderRepository.SaveWasCalled);
    }

    private sealed class FakeRestaurantRepository(Restaurant? restaurant) : IRestaurantRepository
    {
        public Task<Restaurant?> GetRestaurantAsync(Guid restaurantId, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(restaurant?.RestaurantId == restaurantId ? restaurant : null);
        }

        public Task<IReadOnlyCollection<Category>> GetActiveCategoriesWithProductsAsync(Guid restaurantId, CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyCollection<Category>>(Array.Empty<Category>());
        }

        public Task<IReadOnlyCollection<Product>> GetActiveProductsAsync(Guid restaurantId, CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyCollection<Product>>(Array.Empty<Product>());
        }

        public Task<Product?> GetActiveProductAsync(Guid restaurantId, Guid productId, CancellationToken cancellationToken = default)
        {
            return Task.FromResult<Product?>(null);
        }
    }

    private sealed class FakeOrderRepository : IOrderRepository
    {
        public Order? OrderForUpdate { get; set; }
        public Order? CashierOrder { get; set; }
        public bool SaveWasCalled { get; private set; }

        public Task<Table?> GetTableAsync(Guid restaurantId, Guid tableId, CancellationToken cancellationToken = default)
        {
            return Task.FromResult<Table?>(null);
        }

        public Task<IReadOnlyCollection<Product>> GetProductsByIdsAsync(Guid restaurantId, IReadOnlyCollection<Guid> productIds, CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyCollection<Product>>(Array.Empty<Product>());
        }

        public Task<IReadOnlyCollection<ProductVariant>> GetActiveVariantsByIdsAsync(Guid restaurantId, IReadOnlyCollection<Guid> variantIds, CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyCollection<ProductVariant>>(Array.Empty<ProductVariant>());
        }

        public Task<Order> AddOrderAsync(Order order, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(order);
        }

        public Task<Order?> GetOrderAsync(Guid orderId, CancellationToken cancellationToken = default)
        {
            return Task.FromResult<Order?>(null);
        }

        public Task<IReadOnlyCollection<Order>> GetCashierOrdersAsync(Guid restaurantId, CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyCollection<Order>>(Array.Empty<Order>());
        }

        public Task<Order?> GetCashierOrderAsync(Guid restaurantId, Guid orderId, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(CashierOrder?.RestaurantId == restaurantId && CashierOrder.OrderId == orderId ? CashierOrder : null);
        }

        public Task<Order?> GetOrderForUpdateAsync(Guid restaurantId, Guid orderId, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(OrderForUpdate?.RestaurantId == restaurantId && OrderForUpdate.OrderId == orderId ? OrderForUpdate : null);
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            SaveWasCalled = true;
            return Task.CompletedTask;
        }
    }

    private sealed class FakeLogService : ILogService
    {
        public Task LogAuditAsync(Guid restaurantId, string actionType, string entityType, Guid entityId, string description, CancellationToken cancellationToken = default) => Task.CompletedTask;

        public Task LogOrderStatusAsync(Guid restaurantId, Guid orderId, string? oldStatus, string newStatus, Guid? changedByUserId = null, CancellationToken cancellationToken = default) => Task.CompletedTask;

        public Task<IReadOnlyCollection<AuditLogDto>?> GetAuditLogsAsync(Guid restaurantId, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyCollection<AuditLogDto>?>(Array.Empty<AuditLogDto>());

        public Task<IReadOnlyCollection<OrderStatusLogDto>?> GetOrderStatusLogsAsync(Guid restaurantId, CancellationToken cancellationToken = default) => Task.FromResult<IReadOnlyCollection<OrderStatusLogDto>?>(Array.Empty<OrderStatusLogDto>());
    }
}
