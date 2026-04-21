using AiMenu.Api.Entities;

namespace AiMenu.Api.Repositories.Interfaces;

public interface IAdminCatalogRepository
{
    Task<IReadOnlyCollection<Category>> GetCategoriesAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task<Category?> GetCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task<Category?> GetCategoryByRestaurantAsync(Guid restaurantId, Guid categoryId, CancellationToken cancellationToken = default);
    Task<Category> AddCategoryAsync(Category category, CancellationToken cancellationToken = default);
    Task<Category> UpdateCategoryAsync(Category category, CancellationToken cancellationToken = default);
    Task DeleteCategoryAsync(Category category, CancellationToken cancellationToken = default);
    Task<bool> CategoryHasProductsAsync(Guid categoryId, CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<Product>> GetProductsAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task<Product?> GetProductAsync(Guid productId, CancellationToken cancellationToken = default);
    Task<Product?> GetProductByRestaurantAsync(Guid restaurantId, Guid productId, CancellationToken cancellationToken = default);
    Task<Product> AddProductAsync(Product product, CancellationToken cancellationToken = default);
    Task<Product> UpdateProductAsync(Product product, CancellationToken cancellationToken = default);
    Task DeleteProductAsync(Product product, CancellationToken cancellationToken = default);
}
