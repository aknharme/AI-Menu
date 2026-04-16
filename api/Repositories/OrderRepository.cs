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
            .Where(x => x.RestaurantId == restaurantId && x.IsActive && productIds.Contains(x.ProductId))
            .ToListAsync(cancellationToken);
    }

    public async Task<Order> AddOrderAsync(Order order, CancellationToken cancellationToken = default)
    {
        await dbContext.Orders.AddAsync(order, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return order;
    }
}
