using AiMenu.Api.Entities;

namespace AiMenu.Api.Repositories.Interfaces;

public interface IOrderRepository
{
    Task<Table?> GetTableAsync(Guid restaurantId, Guid tableId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<Product>> GetProductsByIdsAsync(
        Guid restaurantId,
        IReadOnlyCollection<Guid> productIds,
        CancellationToken cancellationToken = default);
    Task<Order> AddOrderAsync(Order order, CancellationToken cancellationToken = default);
}
