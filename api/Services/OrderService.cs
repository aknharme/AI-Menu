using AiMenu.Api.DTOs;
using AiMenu.Api.Entities;
using AiMenu.Api.Repositories.Interfaces;
using AiMenu.Api.Services.Interfaces;

namespace AiMenu.Api.Services;

// Siparis olusturma akisinin business rule katmani burada bulunur.
public class OrderService(IOrderRepository orderRepository) : IOrderService
{
    public async Task<OrderResponseDto> CreateOrderAsync(CreateOrderRequestDto request, CancellationToken cancellationToken = default)
    {
        // Siparis verilen masa gercekten ilgili restorana ait olmali.
        var table = await orderRepository.GetTableAsync(request.RestaurantId, request.TableId, cancellationToken);
        if (table is null)
        {
            throw new InvalidOperationException("Table was not found for this restaurant.");
        }

        // Client'in gonderdigi urunler bu restoran menusunde var mi diye toplu kontrol yapiyoruz.
        var productIds = request.Items.Select(x => x.ProductId).Distinct().ToList();
        var products = await orderRepository.GetProductsByIdsAsync(request.RestaurantId, productIds, cancellationToken);
        var productMap = products.ToDictionary(x => x.ProductId);

        if (productMap.Count != productIds.Count)
        {
            throw new InvalidOperationException("One or more requested products were not found in this restaurant menu.");
        }

        var order = new Order
        {
            OrderId = Guid.NewGuid(),
            RestaurantId = request.RestaurantId,
            TableId = request.TableId,
            CustomerName = request.CustomerName.Trim(),
            Note = request.Note.Trim(),
            Status = "Pending",
            CreatedAtUtc = DateTimeOffset.UtcNow
        };

        foreach (var item in request.Items)
        {
            var product = productMap[item.ProductId];
            // Siparis satiri toplami backend'de hesaplanir; client verisine guvenilmez.
            var lineTotal = product.Price * item.Quantity;

            order.Items.Add(new OrderItem
            {
                OrderItemId = Guid.NewGuid(),
                RestaurantId = request.RestaurantId,
                OrderId = order.OrderId,
                ProductId = product.ProductId,
                Quantity = item.Quantity,
                UnitPrice = product.Price,
                LineTotal = lineTotal
            });
        }

        // Genel toplam da yine backend tarafinda hesaplanir.
        order.TotalAmount = order.Items.Sum(x => x.LineTotal);

        var createdOrder = await orderRepository.AddOrderAsync(order, cancellationToken);

        // Response DTO, entity'yi dis dunyaya birebir acmadan API cevabi uretir.
        return new OrderResponseDto
        {
            OrderId = createdOrder.OrderId,
            RestaurantId = createdOrder.RestaurantId,
            TableId = createdOrder.TableId,
            CustomerName = createdOrder.CustomerName,
            Note = createdOrder.Note,
            Status = createdOrder.Status,
            TotalAmount = createdOrder.TotalAmount,
            CreatedAtUtc = createdOrder.CreatedAtUtc,
            Items = createdOrder.Items.Select(item => new OrderItemResponseDto
            {
                OrderItemId = item.OrderItemId,
                ProductId = item.ProductId,
                ProductName = productMap[item.ProductId].Name,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                LineTotal = item.LineTotal
            }).ToList()
        };
    }
}
