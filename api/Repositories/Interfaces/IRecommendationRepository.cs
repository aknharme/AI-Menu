using AiMenu.Api.DTOs;

namespace AiMenu.Api.Repositories.Interfaces;

// IRecommendationRepository, oneriler icin optimize edilmis urun sorgularini tek yerde toplar.
public interface IRecommendationRepository
{
    Task<IReadOnlyCollection<RecommendationProductDto>> GetRecommendedProductsAsync(
        Guid restaurantId,
        IReadOnlyCollection<string> normalizedTags,
        int limit,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<RecommendationProductDto>> GetFallbackProductsAsync(
        Guid restaurantId,
        int limit,
        CancellationToken cancellationToken = default);
}
