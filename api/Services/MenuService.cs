using AiMenu.Api.DTOs;
using AiMenu.Api.Repositories.Interfaces;
using AiMenu.Api.Services.Interfaces;

namespace AiMenu.Api.Services;

// MenuService, veritabani modelini frontend'in rahat kullanacagi menu cevabina donusturur.
public class MenuService(IRestaurantRepository restaurantRepository) : IMenuService
{
    public async Task<MenuResponseDto?> GetMenuAsync(Guid restaurantId, CancellationToken cancellationToken = default)
    {
        var restaurant = await restaurantRepository.GetMenuAsync(restaurantId, cancellationToken);
        if (restaurant is null)
        {
            return null;
        }

        // Kategorileri ve urunleri API tarafinda kontrollu bir response modeline ceviriyoruz.
        return new MenuResponseDto
        {
            RestaurantId = restaurant.RestaurantId,
            RestaurantName = restaurant.Name,
            Categories = restaurant.Categories
                .OrderBy(x => x.DisplayOrder)
                .Select(category => new MenuCategoryDto
                {
                    CategoryId = category.CategoryId,
                    Name = category.Name,
                    DisplayOrder = category.DisplayOrder,
                    Products = category.Products
                        .OrderBy(product => product.Name)
                        .Select(product => new MenuProductDto
                        {
                            ProductId = product.ProductId,
                            Name = product.Name,
                            Description = product.Description,
                            Price = product.Price,
                            Tags = product.Tags
                        })
                        .ToList()
                })
                .ToList()
        };
    }
}
