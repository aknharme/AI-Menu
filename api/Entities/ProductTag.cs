namespace AiMenu.Api.Entities;

// ProductTag, urun ile restoran bazli tag sozlugu arasindaki join kaydidir.
public class ProductTag
{
    public Guid ProductTagId { get; set; }
    public Guid RestaurantId { get; set; }
    public Guid ProductId { get; set; }
    public Guid TagId { get; set; }

    public Restaurant Restaurant { get; set; } = null!;
    public Product Product { get; set; } = null!;
    public Tag Tag { get; set; } = null!;
}
