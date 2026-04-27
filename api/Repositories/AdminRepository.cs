using AiMenu.Api.Data;
using AiMenu.Api.Entities;
using AiMenu.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

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
}
