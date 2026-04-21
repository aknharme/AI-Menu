namespace AiMenu.Api.DTOs;

// Müşteri menüsünde bir kategori ve o kategoriye bağlı aktif ürünler için kullanılır.
public class CategoryDto
{
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public IReadOnlyCollection<ProductListDto> Products { get; set; } = Array.Empty<ProductListDto>();
}
