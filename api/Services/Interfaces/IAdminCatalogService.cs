using AiMenu.Api.DTOs;

namespace AiMenu.Api.Services.Interfaces;

public interface IAdminCatalogService
{
    Task<IReadOnlyCollection<AdminCategoryDto>?> GetCategoriesAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task<AdminCategoryDto> CreateCategoryAsync(CreateAdminCategoryRequestDto request, CancellationToken cancellationToken = default);
    Task<AdminCategoryDto?> UpdateCategoryAsync(Guid categoryId, UpdateAdminCategoryRequestDto request, CancellationToken cancellationToken = default);
    Task<bool> DeleteCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<AdminProductDto>?> GetProductsAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task<AdminProductDto> CreateProductAsync(CreateAdminProductRequestDto request, CancellationToken cancellationToken = default);
    Task<AdminProductDto?> UpdateProductAsync(Guid productId, UpdateAdminProductRequestDto request, CancellationToken cancellationToken = default);
    Task<bool> DeleteProductAsync(Guid productId, CancellationToken cancellationToken = default);
}
