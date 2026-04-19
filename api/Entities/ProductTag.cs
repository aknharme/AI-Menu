namespace AiMenu.Api.Entities;

// ProductTag, AI öneri/filtreleme ve müşteri bilgilendirmesi için kullanılan ürün etiketidir.
public class ProductTag
{
    public Guid ProductTagId { get; set; }
    public Guid RestaurantId { get; set; }
    public Guid ProductId { get; set; }
    public string Name { get; set; } = string.Empty;

    public Restaurant Restaurant { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
