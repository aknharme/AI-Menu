using AiMenu.Api.DTOs;

namespace AiMenu.Api.Services.Interfaces;

public interface IRecommendationService
{
    Task<RecommendationResponseDto> ExtractTagsAsync(RecommendationRequestDto request, CancellationToken cancellationToken = default);
}
