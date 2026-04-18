namespace AiMenu.Api.DTOs;

public class MenuProductDto
{
    public Guid ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public IReadOnlyCollection<string> Tags { get; set; } = Array.Empty<string>();
}
