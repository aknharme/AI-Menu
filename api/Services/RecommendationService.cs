using AiMenu.Api.DTOs;
using AiMenu.Api.Repositories.Interfaces;
using AiMenu.Api.Services.Interfaces;

namespace AiMenu.Api.Services;

public class RecommendationService(
    IRestaurantRepository restaurantRepository,
    IRecommendationRepository recommendationRepository,
    IAiTagService aiTagService) : IRecommendationService
{
    private const int DefaultRecommendationLimit = 6;

    public async Task<RecommendationResponseDto?> GetProductsByTagsAsync(
        RecommendationProductsRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var restaurant = await restaurantRepository.GetRestaurantAsync(request.RestaurantId, cancellationToken);
        if (restaurant is null)
        {
            return null;
        }

        var normalizedTags = TagNormalizer.NormalizeMany(request.Tags);
        var matchedProducts = await recommendationRepository.GetRecommendedProductsAsync(
            request.RestaurantId,
            normalizedTags,
            DefaultRecommendationLimit,
            cancellationToken);

        if (matchedProducts.Count > 0)
        {
            // Tag bazli eslesme varsa fallback'e dusmeden dogrudan alakali urunler donulur.
            return new RecommendationResponseDto
            {
                RestaurantId = request.RestaurantId,
                Tags = normalizedTags,
                IsFallback = false,
                Message = "Tag eslesmesine gore oneriler getirildi.",
                Products = matchedProducts
            };
        }

        var fallbackProducts = await recommendationRepository.GetFallbackProductsAsync(
            request.RestaurantId,
            DefaultRecommendationLimit,
            cancellationToken);

        return new RecommendationResponseDto
        {
            RestaurantId = request.RestaurantId,
            Tags = normalizedTags,
            IsFallback = true,
            Message = normalizedTags.Count == 0
                ? "AI uygun tag uretemedigi icin populer urunler gosterildi."
                : "Eslesen tag bulunamadigi icin populer urunler gosterildi.",
            Products = fallbackProducts
        };
    }

    public async Task<AiTagResponseDto> GenerateTagsAsync(
        RecommendationPromptRequestDto request,
        CancellationToken cancellationToken = default)
    {
        // Prompt endpoint'i urun secmez; AI ulasilamazsa bos tag listesi donerek akisi kirmaz.
        IReadOnlyCollection<string> tags;
        try
        {
            tags = await aiTagService.GenerateTagsAsync(request.Prompt, cancellationToken);
        }
        catch
        {
            tags = Array.Empty<string>();
        }

        return new AiTagResponseDto
        {
            Tags = tags
        };
    }

    public async Task<RecommendationResponseDto?> GetProductsByPromptAsync(
        RecommendationPromptRequestDto request,
        CancellationToken cancellationToken = default)
    {
        // Prompt akisi once AI'den tag uretir; AI ulasilamazsa deneyim kopmasin diye fallback onerilere iner.
        AiTagResponseDto tags;
        try
        {
            tags = await GenerateTagsAsync(request, cancellationToken);
        }
        catch
        {
            tags = new AiTagResponseDto
            {
                Tags = Array.Empty<string>()
            };
        }

        return await GetProductsByTagsAsync(
            new RecommendationProductsRequestDto
            {
                RestaurantId = request.RestaurantId,
                Tags = tags.Tags
            },
            cancellationToken);
    }
}
