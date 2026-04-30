namespace AiMenu.Api.DTOs;

public class AiMenuGroundingDto
{
    public string QueryType { get; set; } = "general";
    public AiMenuContextDto Context { get; set; } = new();
    public IReadOnlyCollection<AiSuggestedProductDto> SuggestedProducts { get; set; } = Array.Empty<AiSuggestedProductDto>();
    public bool HasSpecificGrounding { get; set; }
}
