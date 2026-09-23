using System.Text.Json;
using AiMenu.Api.Data;
using AiMenu.Api.DTOs;
using AiMenu.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace AiMenu.Api.Services;

public static class PrintJobFactory
{
    public static async Task StageApprovalAsync(AppDbContext db, Order order, CancellationToken ct)
    {
        var restaurant = await db.Restaurants.SingleAsync(r => r.RestaurantId == order.RestaurantId, ct);
        if (!restaurant.PrintingEnabled) return;
        var detail = await db.Orders.AsNoTracking().Include(o => o.Table)
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.Items).ThenInclude(i => i.ProductVariant)
            .SingleAsync(o => o.OrderId == order.OrderId && o.RestaurantId == order.RestaurantId, ct);
        var routes = await db.PrintRoutes.Where(r => r.RestaurantId == order.RestaurantId)
            .ToDictionaryAsync(r => r.CategoryId, r => r.Station, ct);
        if (detail.Items.Any(i => !routes.ContainsKey(i.Product.CategoryId)))
            throw new InvalidOperationException("Sipariş onaylanamadı: ürün kategorilerinin mutfak/bar yazıcı yönlendirmesini tamamlayın.");
        foreach (var group in detail.Items.GroupBy(i => routes[i.Product.CategoryId]))
        {
            var ticket = new KitchenTicket(1, order.OrderId, restaurant.Name, detail.Table.Name,
                order.CreatedAtUtc, group.Key, order.Note,
                group.Select(i => new TicketLine(i.Product.Name, i.Quantity, i.ProductVariant?.Name ?? "", i.Note)).ToList());
            db.PrintJobs.Add(new PrintJob
            {
                Id = Guid.NewGuid(), RestaurantId = order.RestaurantId, OrderId = order.OrderId,
                Station = group.Key, PayloadJson = JsonSerializer.Serialize(ticket)
            });
        }
    }
}
