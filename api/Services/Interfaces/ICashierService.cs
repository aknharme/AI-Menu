using AiMenu.Api.DTOs;

namespace AiMenu.Api.Services.Interfaces;

public interface ICashierService
{
    Task<IReadOnlyCollection<CashierOrderListDto>?> GetOrdersAsync(
        Guid restaurantId,
        CancellationToken cancellationToken = default);

    Task<CashierOrderDetailDto?> GetOrderAsync(
        Guid restaurantId,
        Guid orderId,
        CancellationToken cancellationToken = default);

    Task<CashierOrderDetailDto?> UpdateOrderStatusAsync(
        Guid restaurantId,
        Guid orderId,
        string status,
        CancellationToken cancellationToken = default);
}
