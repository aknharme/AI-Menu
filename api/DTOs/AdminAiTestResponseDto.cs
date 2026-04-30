namespace AiMenu.Api.DTOs;

public class AdminAiTestResponseDto
{
    public string Intent { get; set; } = string.Empty;
    public string QueryType { get; set; } = string.Empty;
    public bool HasSpecificGrounding { get; set; }
    public string Reply { get; set; } = string.Empty;
    public IReadOnlyCollection<AdminAiGroundedProductDto> GroundedProducts { get; set; } = Array.Empty<AdminAiGroundedProductDto>();
}
