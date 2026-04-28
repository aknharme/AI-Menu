namespace AiMenu.Api.DTOs;

// TopProductDto, siparis veya gunluk populerlik tablosunda siralanan urun bilgisini tasir.
public class TopProductDto
{
    public Guid ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Count { get; set; }
}
