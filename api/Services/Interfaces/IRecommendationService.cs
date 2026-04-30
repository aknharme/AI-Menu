using AiMenu.Api.DTOs;

namespace AiMenu.Api.Services.Interfaces;

// IRecommendationService, tag bazli ve prompt bazli urun onerisi akislarini tanimlar.
public interface IRecommendationService
{
    Task<RecommendationResponseDto?> GetProductsByTagsAsync(RecommendationProductsRequestDto request, CancellationToken cancellationToken = default);
    Task<AiTagResponseDto> GenerateTagsAsync(RecommendationPromptRequestDto request, CancellationToken cancellationToken = default);
    Task<RecommendationResponseDto?> GetProductsByPromptAsync(RecommendationPromptRequestDto request, CancellationToken cancellationToken = default);
}
