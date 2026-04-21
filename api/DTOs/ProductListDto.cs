namespace AiMenu.Api.DTOs;

// Liste ekranında ihtiyaç duyulan sade ürün bilgisini taşır.
public class ProductListDto
{
    public Guid ProductId { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public IReadOnlyCollection<string> Tags { get; set; } = Array.Empty<string>();
}
