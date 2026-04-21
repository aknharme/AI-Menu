using AiMenu.Api.Data;
using AiMenu.Api.Entities;
using AiMenu.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AiMenu.Api.Repositories;

public class AdminCatalogRepository(AppDbContext dbContext) : IAdminCatalogRepository
{
    public async Task<IReadOnlyCollection<Category>> GetCategoriesAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Categories
            .AsNoTracking()
            .Where(x => x.RestaurantId == restaurantId)
            .Include(x => x.Products)
            .OrderBy(x => x.DisplayOrder)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Category?> GetCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Categories.FirstOrDefaultAsync(x => x.CategoryId == categoryId, cancellationToken);
    }

    public async Task<Category?> GetCategoryByRestaurantAsync(Guid restaurantId, Guid categoryId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Categories
            .Include(x => x.Products)
            .FirstOrDefaultAsync(x => x.RestaurantId == restaurantId && x.CategoryId == categoryId, cancellationToken);
    }

    public async Task<Category> AddCategoryAsync(Category category, CancellationToken cancellationToken = default)
    {
        await dbContext.Categories.AddAsync(category, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return category;
    }

    public async Task<Category> UpdateCategoryAsync(Category category, CancellationToken cancellationToken = default)
    {
        dbContext.Categories.Update(category);
        await dbContext.SaveChangesAsync(cancellationToken);
        return category;
    }

    public async Task DeleteCategoryAsync(Category category, CancellationToken cancellationToken = default)
    {
        dbContext.Categories.Remove(category);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> CategoryHasProductsAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Products.AnyAsync(x => x.CategoryId == categoryId, cancellationToken);
    }

    public async Task<IReadOnlyCollection<Product>> GetProductsAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Products
            .AsNoTracking()
            .Where(x => x.RestaurantId == restaurantId)
            .Include(x => x.Category)
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Product?> GetProductAsync(Guid productId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Products.FirstOrDefaultAsync(x => x.ProductId == productId, cancellationToken);
    }

    public async Task<Product?> GetProductByRestaurantAsync(Guid restaurantId, Guid productId, CancellationToken cancellationToken = default)
    {
        return await dbContext.Products
            .Include(x => x.Category)
            .FirstOrDefaultAsync(x => x.RestaurantId == restaurantId && x.ProductId == productId, cancellationToken);
    }

    public async Task<Product> AddProductAsync(Product product, CancellationToken cancellationToken = default)
    {
        await dbContext.Products.AddAsync(product, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        await dbContext.Entry(product).Reference(x => x.Category).LoadAsync(cancellationToken);
        return product;
    }

    public async Task<Product> UpdateProductAsync(Product product, CancellationToken cancellationToken = default)
    {
        dbContext.Products.Update(product);
        await dbContext.SaveChangesAsync(cancellationToken);
        await dbContext.Entry(product).Reference(x => x.Category).LoadAsync(cancellationToken);
        return product;
    }

    public async Task DeleteProductAsync(Product product, CancellationToken cancellationToken = default)
    {
        dbContext.Products.Remove(product);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
