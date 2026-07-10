namespace AiMenu.Api.DTOs;

// AiWaiterMenuVariantDto, urunun modele acik varyant fiyat etkisini tasir.
public class AiWaiterMenuVariantDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal PriceDelta { get; set; }
    public decimal FinalPrice { get; set; }
}
