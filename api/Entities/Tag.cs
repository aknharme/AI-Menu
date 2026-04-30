namespace AiMenu.Api.Entities;

// Tag, AI'nin uretecegi kelimelerin restoran bazli tekil sozlugunu temsil eder.
public class Tag
{
    public Guid TagId { get; set; }
    public Guid RestaurantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string NormalizedName { get; set; } = string.Empty;

    public Restaurant Restaurant { get; set; } = null!;
    // ProductTags join tablosu ayni tag'in birden fazla urunle baglanmasini saglar.
    public ICollection<ProductTag> ProductTags { get; set; } = new List<ProductTag>();
}
