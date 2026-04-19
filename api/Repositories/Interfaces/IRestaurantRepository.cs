using AiMenu.Api.Entities;

namespace AiMenu.Api.Repositories.Interfaces;

public interface IRestaurantRepository
{
    Task<Restaurant?> GetRestaurantAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<Category>> GetActiveCategoriesWithProductsAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<Product>> GetActiveProductsAsync(Guid restaurantId, CancellationToken cancellationToken = default);
    Task<Product?> GetActiveProductAsync(Guid restaurantId, Guid productId, CancellationToken cancellationToken = default);
}
