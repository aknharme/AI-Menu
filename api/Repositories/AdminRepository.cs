using AiMenu.Api.Data;
using AiMenu.Api.Entities;
using AiMenu.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AiMenu.Api.Repositories;

public class AdminRepository(AppDbContext dbContext) : IAdminRepository
{
    public async Task<Restaurant?> GetRestaurantAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        // Admin islemleri de restoran aktiflik ve sahiplik kontrolu uzerinden ilerler.
        return await dbContext.Restaurants
            .FirstOrDefaultAsync(restaurant => restaurant.RestaurantId == restaurantId && restaurant.IsActive, cancellationToken);
    }

    public async Task<IReadOnlyCollection<Category>> GetCategoriesAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Categories
            .AsNoTracking()
            .Where(category => category.RestaurantId == restaurantId)
            .OrderBy(category => category.DisplayOrder)
            .ThenBy(category => category.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Category?> GetCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Categories
            .FirstOrDefaultAsync(category => category.CategoryId == categoryId, cancellationToken);
    }

    public async Task<bool> HasProductsInCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Products.AnyAsync(product => product.CategoryId == categoryId, cancellationToken);
    }

    public async Task<Category> AddCategoryAsync(Category category, CancellationToken cancellationToken = default)
    {
        await dbContext.Categories.AddAsync(category, cancellationToken);
        return category;
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public Task DeleteCategoryAsync(Category category, CancellationToken cancellationToken = default)
    {
        dbContext.Categories.Remove(category);
        return Task.CompletedTask;
    }

    public async Task<IReadOnlyCollection<Product>> GetProductsAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Products
            .AsNoTracking()
            .Where(product => product.RestaurantId == restaurantId)
            .Include(product => product.Category)
            .OrderBy(product => product.Category.DisplayOrder)
            .ThenBy(product => product.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Product?> GetProductAsync(Guid productId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Products
            .Include(product => product.Category)
            .FirstOrDefaultAsync(product => product.ProductId == productId, cancellationToken);
    }

    public async Task<Product> AddProductAsync(Product product, CancellationToken cancellationToken = default)
    {
        await dbContext.Products.AddAsync(product, cancellationToken);
        return product;
    }

    public Task DeleteProductAsync(Product product, CancellationToken cancellationToken = default)
    {
        dbContext.Products.Remove(product);
        return Task.CompletedTask;
    }

    public async Task<bool> HasOrdersForProductAsync(Guid productId, CancellationToken cancellationToken = default)
    {
        return await dbContext.OrderItems.AnyAsync(orderItem => orderItem.ProductId == productId, cancellationToken);
    }

    public async Task<IReadOnlyCollection<Table>> GetTablesAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Tables
            .AsNoTracking()
            .Where(table => table.RestaurantId == restaurantId)
            .OrderBy(table => table.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Table?> GetTableAsync(Guid tableId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Tables
            .FirstOrDefaultAsync(table => table.TableId == tableId, cancellationToken);
    }

    public async Task<Table> AddTableAsync(Table table, CancellationToken cancellationToken = default)
    {
        await dbContext.Tables.AddAsync(table, cancellationToken);
        return table;
    }

    public Task DeleteTableAsync(Table table, CancellationToken cancellationToken = default)
    {
        dbContext.Tables.Remove(table);
        return Task.CompletedTask;
    }

    public async Task<bool> HasOrdersForTableAsync(Guid tableId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Orders.AnyAsync(order => order.TableId == tableId, cancellationToken);
    }

    public async Task<int> GetOrderCountAsync(
        Guid restaurantId,
        DateTimeOffset? startUtc,
        DateTimeOffset? endUtc,
        CancellationToken cancellationToken = default)
    {
        return await BuildOrderQuery(restaurantId, startUtc, endUtc).CountAsync(cancellationToken);
    }

    public async Task<int> GetPendingOrderCountAsync(
        Guid restaurantId,
        DateTimeOffset? startUtc,
        DateTimeOffset? endUtc,
        CancellationToken cancellationToken = default)
    {
        return await BuildOrderQuery(restaurantId, startUtc, endUtc)
            .CountAsync(order => order.Status == "Pending", cancellationToken);
    }

    public async Task<IReadOnlyCollection<Order>> GetRecentOrdersAsync(
        Guid restaurantId,
        DateTimeOffset? startUtc,
        DateTimeOffset? endUtc,
        int limit,
        CancellationToken cancellationToken = default)
    {
        return await BuildOrderQuery(restaurantId, startUtc, endUtc)
            .AsNoTracking()
            .Include(order => order.Table)
            .OrderByDescending(order => order.CreatedAtUtc)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<(Guid ProductId, string Name, int Count)>> GetTopOrderedProductsAsync(
        Guid restaurantId,
        DateTimeOffset? startUtc,
        DateTimeOffset? endUtc,
        int limit,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.OrderItems
            .AsNoTracking()
            .Where(orderItem => orderItem.RestaurantId == restaurantId);

        if (startUtc.HasValue)
        {
            query = query.Where(orderItem => orderItem.Order.CreatedAtUtc >= startUtc.Value);
        }

        if (endUtc.HasValue)
        {
            query = query.Where(orderItem => orderItem.Order.CreatedAtUtc < endUtc.Value);
        }

        var data = await query
            .GroupBy(orderItem => new { orderItem.ProductId, orderItem.Product.Name })
            .Select(group => new
            {
                group.Key.ProductId,
                group.Key.Name,
                Count = group.Sum(orderItem => orderItem.Quantity)
            })
            .OrderByDescending(result => result.Count)
            .ThenBy(result => result.Name)
            .Take(limit)
            .ToListAsync(cancellationToken);

        return data.Select(result => (result.ProductId, result.Name, result.Count)).ToList();
    }

    public async Task<IReadOnlyCollection<(Guid ProductId, string Name, int Count)>> GetTopRecommendedProductsAsync(
        Guid restaurantId,
        DateTimeOffset? startUtc,
        DateTimeOffset? endUtc,
        int limit,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.RecommendationLogs
            .AsNoTracking()
            .Where(log => log.RestaurantId == restaurantId);

        if (startUtc.HasValue)
        {
            query = query.Where(log => log.CreatedAtUtc >= startUtc.Value);
        }

        if (endUtc.HasValue)
        {
            query = query.Where(log => log.CreatedAtUtc < endUtc.Value);
        }

        var logs = await query.ToListAsync(cancellationToken);
        var counts = new Dictionary<Guid, int>();

        foreach (var log in logs)
        {
            try
            {
                var productIds = JsonSerializer.Deserialize<List<Guid>>(log.RecommendedProducts) ?? [];
                foreach (var productId in productIds)
                {
                    counts[productId] = counts.TryGetValue(productId, out var currentCount) ? currentCount + 1 : 1;
                }
            }
            catch
            {
                // Parse edilemeyen eski kayitlar analitigi bozmasin diye sessizce atlanir.
            }
        }

        if (counts.Count == 0)
        {
            return [];
        }

        var productNames = await dbContext.Products
            .AsNoTracking()
            .Where(product => product.RestaurantId == restaurantId && counts.Keys.Contains(product.ProductId))
            .ToDictionaryAsync(product => product.ProductId, product => product.Name, cancellationToken);

        return counts
            .Where(result => productNames.ContainsKey(result.Key))
            .OrderByDescending(result => result.Value)
            .ThenBy(result => productNames[result.Key])
            .Take(limit)
            .Select(result => (result.Key, productNames[result.Key], result.Value))
            .ToList();
    }

    private IQueryable<Order> BuildOrderQuery(Guid restaurantId, DateTimeOffset? startUtc, DateTimeOffset? endUtc)
    {
        var query = dbContext.Orders.Where(order => order.RestaurantId == restaurantId);

        if (startUtc.HasValue)
        {
            query = query.Where(order => order.CreatedAtUtc >= startUtc.Value);
        }

        if (endUtc.HasValue)
        {
            query = query.Where(order => order.CreatedAtUtc < endUtc.Value);
        }

        return query;
    }
}
