namespace AiMenu.Api.DTOs;

// AdminProductVariantDto, admin panelinde urun varyantlarini listelemek ve duzenlemek icin kullanilir.
public class AdminProductVariantDto
{
    public Guid ProductVariantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal PriceDelta { get; set; }
    public bool IsActive { get; set; }
}
