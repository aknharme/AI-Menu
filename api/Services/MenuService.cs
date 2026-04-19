using AiMenu.Api.DTOs;
using AiMenu.Api.Entities;
using AiMenu.Api.Repositories.Interfaces;
using AiMenu.Api.Services.Interfaces;

namespace AiMenu.Api.Services;

// MenuService, veritabani modelini frontend'in rahat kullanacagi menu cevabina donusturur.
public class MenuService(IRestaurantRepository restaurantRepository) : IMenuService
{
    public async Task<MenuResponseDto?> GetMenuAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        var restaurant = await restaurantRepository.GetRestaurantAsync(restaurantId, cancellationToken);
        if (restaurant is null)
        {
            return null;
        }

        // Menü response'u, customer-web'in doğrudan kategori bazlı render edebileceği yapıdır.
        var categories = await restaurantRepository.GetActiveCategoriesWithProductsAsync(restaurantId, cancellationToken);

        return new MenuResponseDto
        {
            RestaurantId = restaurant.RestaurantId,
            RestaurantName = restaurant.Name,
            Categories = MapCategories(categories)
        };
    }

    public async Task<IReadOnlyCollection<CategoryDto>?> GetCategoriesAsync(
        Guid restaurantId,
        CancellationToken cancellationToken = default)
    {
        if (await restaurantRepository.GetRestaurantAsync(restaurantId, cancellationToken) is null)
        {
            return null;
        }

        var categories = await restaurantRepository.GetActiveCategoriesWithProductsAsync(restaurantId, cancellationToken);
        return MapCategories(categories);
    }

    public async Task<IReadOnlyCollection<ProductListDto>?> GetProductsAsync(
        Guid restaurantId,
        CancellationToken cancellationToken = default)
    {
        if (await restaurantRepository.GetRestaurantAsync(restaurantId, cancellationToken) is null)
        {
            return null;
        }

        var products = await restaurantRepository.GetActiveProductsAsync(restaurantId, cancellationToken);
        return products.Select(MapProductList).ToList();
    }

    public async Task<ProductDetailDto?> GetProductAsync(
        Guid restaurantId,
        Guid productId,
        CancellationToken cancellationToken = default)
    {
        if (await restaurantRepository.GetRestaurantAsync(restaurantId, cancellationToken) is null)
        {
            return null;
        }

        var product = await restaurantRepository.GetActiveProductAsync(restaurantId, productId, cancellationToken);
        if (product is null)
        {
            return null;
        }

        // Entity ilişkileri dışarı açılmadan temiz ürün detay DTO'suna dönüştürülür.
        return new ProductDetailDto
        {
            ProductId = product.ProductId,
            RestaurantId = product.RestaurantId,
            CategoryId = product.CategoryId,
            CategoryName = product.Category.Name,
            Name = product.Name,
            Description = product.Description,
            Ingredients = product.Ingredients,
            Price = product.Price,
            Allergens = product.Allergens
                .OrderBy(x => x.Name)
                .Select(x => x.Name)
                .ToList(),
            Tags = product.Tags
                .OrderBy(x => x.Name)
                .Select(x => x.Name)
                .ToList(),
            Variants = product.Variants
                .OrderBy(x => x.Name)
                .Select(variant => new ProductVariantDto
                {
                    ProductVariantId = variant.ProductVariantId,
                    Name = variant.Name,
                    PriceDelta = variant.PriceDelta,
                    FinalPrice = product.Price + variant.PriceDelta
                })
                .ToList()
        };
    }

    private static IReadOnlyCollection<CategoryDto> MapCategories(IReadOnlyCollection<Category> categories)
    {
        // Sıralama backend'de yapılır; frontend aynı sırayı direkt gösterir.
        return categories
            .OrderBy(x => x.DisplayOrder)
            .ThenBy(x => x.Name)
            .Select(category => new CategoryDto
            {
                CategoryId = category.CategoryId,
                Name = category.Name,
                DisplayOrder = category.DisplayOrder,
                Products = category.Products
                    .OrderBy(product => product.Name)
                    .Select(product => new ProductListDto
                    {
                        ProductId = product.ProductId,
                        CategoryId = product.CategoryId,
                        CategoryName = category.Name,
                        Name = product.Name,
                        Description = product.Description,
                        Price = product.Price,
                        Tags = product.Tags
                            .OrderBy(x => x.Name)
                            .Select(x => x.Name)
                            .ToList()
                    })
                    .ToList()
            })
            .ToList();
    }

    private static ProductListDto MapProductList(Product product)
    {
        // Liste DTO'su detay alanlarını değil, kart görünümüne yetecek bilgiyi taşır.
        return new ProductListDto
        {
            ProductId = product.ProductId,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name ?? string.Empty,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            Tags = product.Tags
                .OrderBy(x => x.Name)
                .Select(x => x.Name)
                .ToList()
        };
    }
}
