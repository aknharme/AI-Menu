using AiMenu.Api.Data;
using AiMenu.Api.DTOs;
using AiMenu.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AiMenu.Api.Repositories;

public class RecommendationRepository(AppDbContext dbContext) : IRecommendationRepository
{
    public async Task<IReadOnlyCollection<RecommendationProductDto>> GetRecommendedProductsAsync(
        Guid restaurantId,
        IReadOnlyCollection<string> normalizedTags,
        int limit,
        CancellationToken cancellationToken = default)
    {
        if (normalizedTags.Count == 0)
        {
            return Array.Empty<RecommendationProductDto>();
        }

        // Tek LINQ sorgusunda restoran, aktiflik ve tag eslesmesi filtrelenip alakaya gore siralanir.
        return await dbContext.Products
            .AsNoTracking()
            .Where(product => product.RestaurantId == restaurantId && product.IsActive && product.Category.IsActive)
            .Select(product => new
            {
                Product = product,
                MatchCount = product.ProductTags.Count(productTag => normalizedTags.Contains(productTag.Tag.NormalizedName)),
                PopularityScore = product.OrderItems.Sum(orderItem => (int?)orderItem.Quantity) ?? 0
            })
            .Where(result => result.MatchCount > 0)
            .OrderByDescending(result => result.MatchCount)
            .ThenByDescending(result => result.PopularityScore)
            .ThenBy(result => result.Product.Name)
            .Take(limit)
            .Select(result => new RecommendationProductDto
            {
                ProductId = result.Product.ProductId,
                Name = result.Product.Name,
                Price = result.Product.Price,
                Description = result.Product.Description
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<RecommendationProductDto>> GetFallbackProductsAsync(
        Guid restaurantId,
        int limit,
        CancellationToken cancellationToken = default)
    {
        // Tag bulunamadiginda ayni restoranin aktif ve goreli olarak populer urunleri donulur.
        return await dbContext.Products
            .AsNoTracking()
            .Where(product => product.RestaurantId == restaurantId && product.IsActive && product.Category.IsActive)
            .Select(product => new
            {
                Product = product,
                PopularityScore = product.OrderItems.Sum(orderItem => (int?)orderItem.Quantity) ?? 0
            })
            .OrderByDescending(result => result.PopularityScore)
            .ThenBy(result => result.Product.Name)
            .Take(limit)
            .Select(result => new RecommendationProductDto
            {
                ProductId = result.Product.ProductId,
                Name = result.Product.Name,
                Price = result.Product.Price,
                Description = result.Product.Description
            })
            .ToListAsync(cancellationToken);
    }
}
