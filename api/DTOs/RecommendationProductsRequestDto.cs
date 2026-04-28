using System.ComponentModel.DataAnnotations;
using AiMenu.Api.Validation;

namespace AiMenu.Api.DTOs;

// RecommendationProductsRequestDto, AI'den gelen tag listesini urun onerisine cevirmek icin kullanilir.
public class RecommendationProductsRequestDto
{
    [NotEmptyGuid(ErrorMessage = "Restaurant id is required.")]
    public Guid RestaurantId { get; set; }

    [MaxLength(10, ErrorMessage = "At most 10 tags can be sent.")]
    public IReadOnlyCollection<string> Tags { get; set; } = Array.Empty<string>();
}
