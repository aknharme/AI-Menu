using AiMenu.Api.Entities;

namespace AiMenu.Api.Repositories.Interfaces;

// IAdminRepository, admin panelin kategori, urun ve masa yonetimi icin veri erisimini toplar.
public interface IAdminRepository
{
    Task<Restaurant?> GetRestaurantAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<Category>> GetCategoriesAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task<Category?> GetCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task<bool> HasProductsInCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task<Category> AddCategoryAsync(Category category, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
    Task DeleteCategoryAsync(Category category, CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<Product>> GetProductsAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task<Product?> GetProductAsync(Guid productId, CancellationToken cancellationToken = default);
    Task<Product> AddProductAsync(Product product, CancellationToken cancellationToken = default);
    Task DeleteProductAsync(Product product, CancellationToken cancellationToken = default);
    Task<bool> HasOrdersForProductAsync(Guid productId, CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<Table>> GetTablesAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task<Table?> GetTableAsync(Guid tableId, CancellationToken cancellationToken = default);
    Task<Table> AddTableAsync(Table table, CancellationToken cancellationToken = default);
    Task DeleteTableAsync(Table table, CancellationToken cancellationToken = default);
    Task<bool> HasOrdersForTableAsync(Guid tableId, CancellationToken cancellationToken = default);
}
