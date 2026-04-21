using AiMenu.Api.DTOs;

namespace AiMenu.Api.Services.Interfaces;

public interface IMenuService
{
    Task<MenuResponseDto?> GetMenuAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<CategoryDto>?> GetCategoriesAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<ProductListDto>?> GetProductsAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task<ProductDetailDto?> GetProductAsync(Guid restaurantId, Guid productId, CancellationToken cancellationToken = default);
}
