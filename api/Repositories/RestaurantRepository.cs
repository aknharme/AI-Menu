using AiMenu.Api.Data;
using AiMenu.Api.Entities;
using AiMenu.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AiMenu.Api.Repositories;

public class RestaurantRepository(AppDbContext dbContext) : IRestaurantRepository
{
    public async Task<Restaurant?> GetRestaurantAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        // Pasif restoran müşteri menüsünde yok sayılır.
        return await dbContext.Restaurants
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.RestaurantId == restaurantId && x.IsActive, cancellationToken);
    }

    public async Task<IReadOnlyCollection<Category>> GetActiveCategoriesWithProductsAsync(
        Guid restaurantId,
        CancellationToken cancellationToken = default)
    {
        // Include filtresi sayesinde pasif ürünler kategori response'una hiç girmez.
        return await dbContext.Categories
            .AsNoTracking()
            .Where(x => x.RestaurantId == restaurantId && x.IsActive)
            .Include(x => x.Products.Where(product => product.IsActive))
                .ThenInclude(product => product.ProductTags)
                    .ThenInclude(productTag => productTag.Tag)
            .OrderBy(x => x.DisplayOrder)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<Product>> GetActiveProductsAsync(
        Guid restaurantId,
        CancellationToken cancellationToken = default)
    {
        // Düz ürün listesi de kategori aktifliğini kontrol eder; pasif kategorinin ürünü görünmez.
        return await dbContext.Products
            .AsNoTracking()
            .Where(x => x.RestaurantId == restaurantId && x.IsActive && x.Category.IsActive)
            .Include(x => x.Category)
            .Include(x => x.ProductTags)
                .ThenInclude(productTag => productTag.Tag)
            .OrderBy(x => x.Category.DisplayOrder)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Product?> GetActiveProductAsync(
        Guid restaurantId,
        Guid productId,
        CancellationToken cancellationToken = default)
    {
        // Detay endpoint'i sadece aynı restorana ait aktif ürünün alt bilgilerini yükler.
        return await dbContext.Products
            .AsNoTracking()
            .Where(x => x.RestaurantId == restaurantId && x.ProductId == productId && x.IsActive && x.Category.IsActive)
            .Include(x => x.Category)
            .Include(x => x.ProductTags)
                .ThenInclude(productTag => productTag.Tag)
            .Include(x => x.Allergens)
            .Include(x => x.Variants.Where(variant => variant.IsActive))
            .FirstOrDefaultAsync(cancellationToken);
    }
}
