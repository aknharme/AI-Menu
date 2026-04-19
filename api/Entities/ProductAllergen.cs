namespace AiMenu.Api.Entities;

// ProductAllergen, müşteri ürün detayında gösterilecek alerjen bilgisidir.
public class ProductAllergen
{
    public Guid ProductAllergenId { get; set; }
    public Guid RestaurantId { get; set; }
    public Guid ProductId { get; set; }
    public string Name { get; set; } = string.Empty;

    public Restaurant Restaurant { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
