using AiMenu.Api.Data;
using AiMenu.Api.Entities;
using AiMenu.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AiMenu.Api.Repositories;

public class OrderRepository(AppDbContext dbContext) : IOrderRepository
{
    public async Task<Table?> GetTableAsync(Guid restaurantId, Guid tableId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Tables
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.RestaurantId == restaurantId && x.TableId == tableId && x.IsActive,
                cancellationToken);
    }

    public async Task<IReadOnlyCollection<Product>> GetProductsByIdsAsync(
        Guid restaurantId,
        IReadOnlyCollection<Guid> productIds,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Products
            .AsNoTracking()
            .Where(x => x.RestaurantId == restaurantId
                && x.IsActive
                && x.Category.IsActive
                && productIds.Contains(x.ProductId))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<ProductVariant>> GetActiveVariantsByIdsAsync(
        Guid restaurantId,
        IReadOnlyCollection<Guid> variantIds,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.ProductVariants
            .AsNoTracking()
            .Where(x => x.RestaurantId == restaurantId && x.IsActive && variantIds.Contains(x.ProductVariantId))
            .ToListAsync(cancellationToken);
    }

    public async Task<Order> AddOrderAsync(Order order, CancellationToken cancellationToken = default)
    {
        await dbContext.Orders.AddAsync(order, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return order;
    }

    public async Task<Order?> GetOrderAsync(Guid orderId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Orders
            .AsNoTracking()
            .Include(x => x.Items)
                .ThenInclude(x => x.Product)
            .Include(x => x.Items)
                .ThenInclude(x => x.ProductVariant)
            .FirstOrDefaultAsync(x => x.OrderId == orderId, cancellationToken);
    }

    public async Task<IReadOnlyCollection<Order>> GetCashierOrdersAsync(
        Guid restaurantId,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Orders
            .AsNoTracking()
            .Where(x => x.RestaurantId == restaurantId)
            .Include(x => x.Table)
            .Include(x => x.Items)
            .OrderBy(x => x.Status == "Pending" ? 0 : 1)
            .ThenByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<Order?> GetCashierOrderAsync(
        Guid restaurantId,
        Guid orderId,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Orders
            .AsNoTracking()
            .Where(x => x.RestaurantId == restaurantId && x.OrderId == orderId)
            .Include(x => x.Table)
            .Include(x => x.Items)
                .ThenInclude(x => x.Product)
            .Include(x => x.Items)
                .ThenInclude(x => x.ProductVariant)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Order?> GetOrderForUpdateAsync(Guid restaurantId, Guid orderId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Orders
            .FirstOrDefaultAsync(order => order.RestaurantId == restaurantId && order.OrderId == orderId, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
