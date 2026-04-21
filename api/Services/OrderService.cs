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
        if (request.RestaurantId == Guid.Empty)
        {
            throw new InvalidOperationException("Restaurant id is required.");
        }

        if (request.TableId == Guid.Empty)
        {
            throw new InvalidOperationException("Table id is required.");
        }

        if (request.Items.Count == 0)
        {
            throw new InvalidOperationException("At least one item is required to create an order.");
        }

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

        var variantIds = request.Items
            .Where(x => x.VariantId.HasValue)
            .Select(x => x.VariantId!.Value)
            .Distinct()
            .ToList();

        var variants = variantIds.Count == 0
            ? Array.Empty<ProductVariant>()
            : (await orderRepository.GetActiveVariantsByIdsAsync(request.RestaurantId, variantIds, cancellationToken)).ToArray();

        var variantMap = variants.ToDictionary(x => x.ProductVariantId);

        if (variantMap.Count != variantIds.Count)
        {
            throw new InvalidOperationException("One or more requested variants were not found in this restaurant menu.");
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
            ProductVariant? variant = null;

            if (item.VariantId.HasValue)
            {
                if (!variantMap.TryGetValue(item.VariantId.Value, out variant))
                {
                    throw new InvalidOperationException("Requested variant was not found.");
                }

                if (variant.ProductId != product.ProductId)
                {
                    throw new InvalidOperationException("Selected variant does not belong to the requested product.");
                }
            }

            // Siparis satiri toplami backend'de hesaplanir; client verisine guvenilmez.
            var unitPrice = product.Price + (variant?.PriceDelta ?? 0m);
            var lineTotal = unitPrice * item.Quantity;

            order.Items.Add(new OrderItem
            {
                OrderItemId = Guid.NewGuid(),
                RestaurantId = request.RestaurantId,
                OrderId = order.OrderId,
                ProductId = product.ProductId,
                ProductVariantId = variant?.ProductVariantId,
                Note = item.Note.Trim(),
                Quantity = item.Quantity,
                UnitPrice = unitPrice,
                LineTotal = lineTotal
            });
        }

        // Genel toplam da yine backend tarafinda hesaplanir.
        order.TotalAmount = order.Items.Sum(x => x.LineTotal);

        var createdOrder = await orderRepository.AddOrderAsync(order, cancellationToken);

        // Response DTO, entity'yi dis dunyaya birebir acmadan API cevabi uretir.
        return MapOrder(createdOrder, productMap, variantMap);
    }

    public async Task<OrderResponseDto?> GetOrderAsync(Guid orderId, CancellationToken cancellationToken = default)
    {
        if (orderId == Guid.Empty)
        {
            return null;
        }

        var order = await orderRepository.GetOrderAsync(orderId, cancellationToken);
        if (order is null)
        {
            return null;
        }

        return MapOrder(order);
    }

    private static OrderResponseDto MapOrder(
        Order order,
        IReadOnlyDictionary<Guid, Product>? productMap = null,
        IReadOnlyDictionary<Guid, ProductVariant>? variantMap = null)
    {
        return new OrderResponseDto
        {
            OrderId = order.OrderId,
            RestaurantId = order.RestaurantId,
            TableId = order.TableId,
            CustomerName = order.CustomerName,
            Note = order.Note,
            Status = order.Status,
            TotalAmount = order.TotalAmount,
            CreatedAtUtc = order.CreatedAtUtc,
            Items = order.Items.Select(item => new OrderItemResponseDto
            {
                OrderItemId = item.OrderItemId,
                ProductId = item.ProductId,
                ProductName = productMap?.GetValueOrDefault(item.ProductId)?.Name ?? item.Product.Name,
                VariantId = item.ProductVariantId,
                VariantName = item.ProductVariantId.HasValue
                    ? variantMap?.GetValueOrDefault(item.ProductVariantId.Value)?.Name
                        ?? item.ProductVariant?.Name
                        ?? string.Empty
                    : string.Empty,
                Note = item.Note,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                LineTotal = item.LineTotal
            }).ToList()
        };
    }
}
