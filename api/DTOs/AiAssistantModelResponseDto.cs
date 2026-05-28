namespace AiMenu.Api.DTOs;

public class AiAssistantModelResponseDto
{
    public string Reply { get; set; } = string.Empty;
    public IReadOnlyCollection<string> SuggestedProductIds { get; set; } = Array.Empty<string>();
    public IReadOnlyCollection<string> SuggestedProductNames { get; set; } = Array.Empty<string>();
}
