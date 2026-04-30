namespace AiMenu.Api.Entities;

// Restaurant, multi-restaurant yapidaki ana kok entity'dir.
public class Restaurant
{
    public Guid RestaurantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<Category> Categories { get; set; } = new List<Category>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
    // RestaurantId ile ayristrilan urun detay alt tablolari.
    public ICollection<ProductVariant> ProductVariants { get; set; } = new List<ProductVariant>();
    public ICollection<ProductAllergen> ProductAllergens { get; set; } = new List<ProductAllergen>();
    // Tag sozlugu ve urun-tag join kayitlari restorana gore izole edilir.
    public ICollection<Tag> Tags { get; set; } = new List<Tag>();
    public ICollection<ProductTag> ProductTags { get; set; } = new List<ProductTag>();
    public ICollection<Table> Tables { get; set; } = new List<Table>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    // Admin ve cashier kullanicilari restoran baglaminda tutulur.
    public ICollection<User> Users { get; set; } = new List<User>();
    // Audit ve is akisi loglari restoran bazinda ayristrilarak tutulur.
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
    public ICollection<RecommendationLog> RecommendationLogs { get; set; } = new List<RecommendationLog>();
    public ICollection<OrderStatusLog> OrderStatusLogs { get; set; } = new List<OrderStatusLog>();
}
