namespace AiMenu.Api.DTOs;

public class AiMessageResponseDto
{
    public string Intent { get; set; } = AiMessageIntent.MenuRelated.ToResponseValue();
    public string Reply { get; set; } = string.Empty;
    public IReadOnlyCollection<AiSuggestedProductDto> SuggestedProducts { get; set; } = Array.Empty<AiSuggestedProductDto>();
}
