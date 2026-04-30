using AiMenu.Api.Entities;

namespace AiMenu.Api.Repositories.Interfaces;

public interface IOrderRepository
{
    Task<Table?> GetTableAsync(Guid restaurantId, Guid tableId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<Product>> GetProductsByIdsAsync(
        Guid restaurantId,
        IReadOnlyCollection<Guid> productIds,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<ProductVariant>> GetActiveVariantsByIdsAsync(
        Guid restaurantId,
        IReadOnlyCollection<Guid> variantIds,
        CancellationToken cancellationToken = default);
    Task<Order> AddOrderAsync(Order order, CancellationToken cancellationToken = default);
    Task<Order?> GetOrderAsync(Guid orderId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<Order>> GetCashierOrdersAsync(
        Guid restaurantId,
        CancellationToken cancellationToken = default);
    Task<Order?> GetCashierOrderAsync(
        Guid restaurantId,
        Guid orderId,
        CancellationToken cancellationToken = default);
    Task<Order?> GetOrderForUpdateAsync(Guid restaurantId, Guid orderId, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
