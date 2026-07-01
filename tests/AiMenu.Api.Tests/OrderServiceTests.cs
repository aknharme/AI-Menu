using AiMenu.Api.DTOs;
using AiMenu.Api.Entities;
using AiMenu.Api.Repositories.Interfaces;
using AiMenu.Api.Services;
using AiMenu.Api.Services.Interfaces;

namespace AiMenu.Api.Tests;

public class OrderServiceTests
{
    [Fact]
    public async Task CreateOrderAsync_MergesDuplicateLinesAndCalculatesServerTotals()
    {
        var restaurantId = Guid.NewGuid();
        var tableId = Guid.NewGuid();
        var productId = Guid.NewGuid();
        var category = new Category { CategoryId = Guid.NewGuid(), RestaurantId = restaurantId, Name = "Food" };
        var product = new Product
        {
            ProductId = productId,
            RestaurantId = restaurantId,
            CategoryId = category.CategoryId,
            Category = category,
            Name = "Burger",
            Price = 120.125m
        };
        var repository = new FakeOrderRepository
        {
            Table = new Table { TableId = tableId, RestaurantId = restaurantId, Name = "Masa 1" },
            Products = [product]
        };
        var service = new OrderService(repository, new FakeLogService());

        var response = await service.CreateOrderAsync(new CreateOrderRequestDto
        {
            RestaurantId = restaurantId,
            TableId = tableId,
            Items =
            [
                new CreateOrderItemRequestDto { ProductId = productId, Quantity = 1, Note = "az tuz" },
                new CreateOrderItemRequestDto { ProductId = productId, Quantity = 2, Note = " az tuz " }
            ]
        });

        var item = Assert.Single(response.Items);
        Assert.Equal(3, item.Quantity);
        Assert.Equal(120.13m, item.UnitPrice);
        Assert.Equal(360.39m, item.LineTotal);
        Assert.Equal(360.39m, response.TotalAmount);
    }

    [Fact]
    public async Task CreateOrderAsync_RejectsTooManyTotalItems()
    {
        var restaurantId = Guid.NewGuid();
        var tableId = Guid.NewGuid();
        var productId = Guid.NewGuid();
        var repository = new FakeOrderRepository
        {
            Table = new Table { TableId = tableId, RestaurantId = restaurantId, Name = "Masa 1" }
        };
        var service = new OrderService(repository, new FakeLogService());

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateOrderAsync(new CreateOrderRequestDto
            {
                RestaurantId = restaurantId,
                TableId = tableId,
                Items =
                [
                    new CreateOrderItemRequestDto { ProductId = productId, Quantity = 100 }
                ]
            }));

        Assert.Contains("at most 99", exception.Message);
    }

    private sealed class FakeOrderRepository : IOrderRepository
    {
        public Table? Table { get; set; }
        public IReadOnlyCollection<Product> Products { get; set; } = Array.Empty<Product>();
        public IReadOnlyCollection<ProductVariant> Variants { get; set; } = Array.Empty<ProductVariant>();
        public Order? SavedOrder { get; private set; }

        public Task<Table?> GetTableAsync(Guid restaurantId, Guid tableId, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(Table?.RestaurantId == restaurantId && Table.TableId == tableId ? Table : null);
        }

        public Task<IReadOnlyCollection<Product>> GetProductsByIdsAsync(
            Guid restaurantId,
            IReadOnlyCollection<Guid> productIds,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyCollection<Product>>(
                Products.Where(product => product.RestaurantId == restaurantId && productIds.Contains(product.ProductId)).ToList());
        }

        public Task<IReadOnlyCollection<ProductVariant>> GetActiveVariantsByIdsAsync(
            Guid restaurantId,
            IReadOnlyCollection<Guid> variantIds,
            CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyCollection<ProductVariant>>(
                Variants.Where(variant => variant.RestaurantId == restaurantId && variantIds.Contains(variant.ProductVariantId)).ToList());
        }

        public Task<Order> AddOrderAsync(Order order, CancellationToken cancellationToken = default)
        {
            SavedOrder = order;
            return Task.FromResult(order);
        }

        public Task<Order?> GetOrderAsync(Guid orderId, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(SavedOrder?.OrderId == orderId ? SavedOrder : null);
        }

        public Task<IReadOnlyCollection<Order>> GetCashierOrdersAsync(Guid restaurantId, CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyCollection<Order>>(Array.Empty<Order>());
        }

        public Task<Order?> GetCashierOrderAsync(Guid restaurantId, Guid orderId, CancellationToken cancellationToken = default)
        {
            return Task.FromResult<Order?>(null);
        }

        public Task<Order?> GetOrderForUpdateAsync(Guid restaurantId, Guid orderId, CancellationToken cancellationToken = default)
        {
            return Task.FromResult<Order?>(null);
        }

        public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }
    }

    private sealed class FakeLogService : ILogService
    {
        public Task LogAuditAsync(Guid restaurantId, string actionType, string entityType, Guid entityId, string description, CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }

        public Task LogOrderStatusAsync(Guid restaurantId, Guid orderId, string? oldStatus, string newStatus, Guid? changedByUserId = null, CancellationToken cancellationToken = default)
        {
            return Task.CompletedTask;
        }

        public Task<IReadOnlyCollection<AuditLogDto>?> GetAuditLogsAsync(Guid restaurantId, CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyCollection<AuditLogDto>?>(Array.Empty<AuditLogDto>());
        }

        public Task<IReadOnlyCollection<OrderStatusLogDto>?> GetOrderStatusLogsAsync(Guid restaurantId, CancellationToken cancellationToken = default)
        {
            return Task.FromResult<IReadOnlyCollection<OrderStatusLogDto>?>(Array.Empty<OrderStatusLogDto>());
        }
    }
}
