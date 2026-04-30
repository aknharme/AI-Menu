namespace AiMenu.Api.DTOs;

// DashboardSummaryDto, admin dashboard'un ust kisimdaki temel metriklerini ve ozet listelerini tasir.
public class DashboardSummaryDto
{
    public Guid RestaurantId { get; set; }
    public DateOnly? Date { get; set; }
    public int TotalOrderCount { get; set; }
    public int PendingOrderCount { get; set; }
    public IReadOnlyCollection<RecentOrderDto> RecentOrders { get; set; } = Array.Empty<RecentOrderDto>();
    public IReadOnlyCollection<TopProductDto> TopProducts { get; set; } = Array.Empty<TopProductDto>();
    public IReadOnlyCollection<TopProductDto> PopularProducts { get; set; } = Array.Empty<TopProductDto>();
    public IReadOnlyCollection<RecommendationStatDto> TopRecommendedProducts { get; set; } = Array.Empty<RecommendationStatDto>();
}
