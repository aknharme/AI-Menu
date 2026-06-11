using AiMenu.Api.Data;
using AiMenu.Api.DTOs;
using AiMenu.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AiMenu.Api.Services;

public class MenuContextService(AppDbContext dbContext) : IMenuContextService
{
    public async Task<AiMenuContextDto?> GetActiveMenuContextAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        var restaurant = await dbContext.Restaurants
            .AsNoTracking()
            .Where(item => item.RestaurantId == restaurantId && item.IsActive)
            .Select(item => new
            {
                item.RestaurantId,
                item.Name
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (restaurant is null)
        {
            return null;
        }

        var products = await dbContext.Products
            .AsNoTracking()
            .Where(product => product.RestaurantId == restaurantId && product.IsActive && product.Category.IsActive)
            .OrderBy(product => product.Category.DisplayOrder)
            .ThenBy(product => product.Name)
            .Select(product => new AiMenuProductContextDto
            {
                ProductId = product.ProductId,
                Name = product.Name,
                CategoryName = product.Category.Name,
                Description = product.Description,
                Ingredients = product.Ingredients,
                Price = product.Price,
                Allergens = product.Allergens
                    .Where(allergen => allergen.RestaurantId == restaurantId)
                    .OrderBy(allergen => allergen.Name)
                    .Select(allergen => allergen.Name)
                    .ToList(),
                Tags = product.ProductTags
                    .Where(productTag => productTag.RestaurantId == restaurantId)
                    .OrderBy(productTag => productTag.Tag.Name)
                    .Select(productTag => productTag.Tag.Name)
                    .ToList(),
                Variants = product.Variants
                    .Where(variant => variant.IsActive && variant.RestaurantId == restaurantId)
                    .OrderBy(variant => variant.Name)
                    .Select(variant => variant.PriceDelta == 0
                        ? variant.Name
                        : variant.Name + " (" + variant.PriceDelta + " TL fark)")
                    .ToList()
            })
            .ToListAsync(cancellationToken);

        return new AiMenuContextDto
        {
            RestaurantId = restaurant.RestaurantId,
            RestaurantName = restaurant.Name,
            Products = products
        };
    }
}
