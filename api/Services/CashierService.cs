using AiMenu.Api.DTOs;
using AiMenu.Api.Entities;
using AiMenu.Api.Repositories.Interfaces;
using AiMenu.Api.Services.Interfaces;

namespace AiMenu.Api.Services;

public class CashierService(IOrderRepository orderRepository, IRestaurantRepository restaurantRepository) : ICashierService
{
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
