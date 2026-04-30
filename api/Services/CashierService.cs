using AiMenu.Api.DTOs;
using AiMenu.Api.Entities;
using AiMenu.Api.Repositories.Interfaces;
using AiMenu.Api.Services.Interfaces;

namespace AiMenu.Api.Services;

public class CashierService(
    IOrderRepository orderRepository,
    IRestaurantRepository restaurantRepository,
    ILogService logService) : ICashierService
{
    private static readonly HashSet<string> AllowedStatuses =
    [
        "Pending",
        "Preparing",
        "Ready",
        "Paid",
        "Cancelled"
    ];

    public async Task<IReadOnlyCollection<CashierOrderListDto>?> GetOrdersAsync(
        Guid restaurantId,
        CancellationToken cancellationToken = default)
    {
        if (await restaurantRepository.GetRestaurantAsync(restaurantId, cancellationToken) is null)
        {
            return null;
        }

        var orders = await orderRepository.GetCashierOrdersAsync(restaurantId, cancellationToken);

        return orders
            .Select(order => new CashierOrderListDto
            {
                OrderId = order.OrderId,
                RestaurantId = order.RestaurantId,
                TableId = order.TableId,
                TableName = order.Table.Name,
                Status = order.Status,
                CreatedAtUtc = order.CreatedAtUtc,
                TotalAmount = order.TotalAmount,
                ItemCount = order.Items.Sum(item => item.Quantity)
            })
            .ToList();
    }

    public async Task<CashierOrderDetailDto?> GetOrderAsync(
        Guid restaurantId,
        Guid orderId,
        CancellationToken cancellationToken = default)
    {
        if (await restaurantRepository.GetRestaurantAsync(restaurantId, cancellationToken) is null)
        {
            return null;
        }

        var order = await orderRepository.GetCashierOrderAsync(restaurantId, orderId, cancellationToken);
        if (order is null)
        {
            return null;
        }

        return MapDetail(order);
    }

    public async Task<CashierOrderDetailDto?> UpdateOrderStatusAsync(
        Guid restaurantId,
        Guid orderId,
        string status,
        CancellationToken cancellationToken = default)
    {
        if (await restaurantRepository.GetRestaurantAsync(restaurantId, cancellationToken) is null)
        {
            return null;
        }

        var normalizedStatus = (status ?? string.Empty).Trim();
        if (!AllowedStatuses.Contains(normalizedStatus))
        {
            throw new InvalidOperationException("Order status is invalid.");
        }

        var order = await orderRepository.GetOrderForUpdateAsync(restaurantId, orderId, cancellationToken);
        if (order is null)
        {
            return null;
        }

        if (order.Status == normalizedStatus)
        {
            var currentOrder = await orderRepository.GetCashierOrderAsync(restaurantId, orderId, cancellationToken);
            return currentOrder is null ? null : MapDetail(currentOrder);
        }

        var previousStatus = order.Status;
        order.Status = normalizedStatus;
        await orderRepository.SaveChangesAsync(cancellationToken);
        await logService.LogOrderStatusAsync(
            restaurantId,
            order.OrderId,
            previousStatus,
            normalizedStatus,
            null,
            cancellationToken);

        var updatedOrder = await orderRepository.GetCashierOrderAsync(restaurantId, orderId, cancellationToken);
        return updatedOrder is null ? null : MapDetail(updatedOrder);
    }

    private static CashierOrderDetailDto MapDetail(Order order)
    {
        return new CashierOrderDetailDto
        {
            OrderId = order.OrderId,
            RestaurantId = order.RestaurantId,
            TableId = order.TableId,
            TableName = order.Table.Name,
            CustomerName = order.CustomerName,
            Note = order.Note,
            Status = order.Status,
            CreatedAtUtc = order.CreatedAtUtc,
            TotalAmount = order.TotalAmount,
            Items = order.Items.Select(item => new CashierOrderItemDto
            {
                OrderItemId = item.OrderItemId,
                ProductId = item.ProductId,
                ProductName = item.Product.Name,
                Quantity = item.Quantity,
                Note = item.Note,
                VariantName = item.ProductVariant?.Name ?? string.Empty,
                UnitPrice = item.UnitPrice,
                LineTotal = item.LineTotal
            }).ToList()
        };
    }
}
