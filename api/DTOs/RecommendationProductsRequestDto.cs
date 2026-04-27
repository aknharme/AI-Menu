namespace AiMenu.Api.DTOs;

// RecommendationProductsRequestDto, AI'den gelen tag listesini urun onerisine cevirmek icin kullanilir.
public class RecommendationProductsRequestDto
{
    public Guid RestaurantId { get; set; }
    public IReadOnlyCollection<string> Tags { get; set; } = Array.Empty<string>();
}
