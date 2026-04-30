using AiMenu.Api.DTOs;

namespace AiMenu.Api.Services.Interfaces;

// IAdminService, admin panelin kategori, urun ve masa CRUD akislarini tanimlar.
public interface IAdminService
{
    Task<IReadOnlyCollection<AdminCategoryDto>?> GetCategoriesAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task<AdminCategoryDto?> CreateCategoryAsync(SaveAdminCategoryRequestDto request, CancellationToken cancellationToken = default);
    Task<AdminCategoryDto?> UpdateCategoryAsync(Guid categoryId, SaveAdminCategoryRequestDto request, CancellationToken cancellationToken = default);
    Task<bool?> DeleteCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<AdminProductDto>?> GetProductsAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task<AdminProductDto?> CreateProductAsync(SaveAdminProductRequestDto request, CancellationToken cancellationToken = default);
    Task<AdminProductDto?> UpdateProductAsync(Guid productId, SaveAdminProductRequestDto request, CancellationToken cancellationToken = default);
    Task<bool?> DeleteProductAsync(Guid productId, CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<AdminTableDto>?> GetTablesAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task<AdminTableDto?> CreateTableAsync(SaveAdminTableRequestDto request, CancellationToken cancellationToken = default);
    Task<AdminTableDto?> UpdateTableAsync(Guid tableId, SaveAdminTableRequestDto request, CancellationToken cancellationToken = default);
    Task<bool?> DeleteTableAsync(Guid tableId, CancellationToken cancellationToken = default);
}
