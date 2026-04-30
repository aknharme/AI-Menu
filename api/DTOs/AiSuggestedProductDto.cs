namespace AiMenu.Api.DTOs;

public class AiSuggestedProductDto
{
    public Guid Id { get; set; }
    public Guid ProductId
    {
        get => Id;
        set => Id = value;
    }

    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Description { get; set; } = string.Empty;
}
