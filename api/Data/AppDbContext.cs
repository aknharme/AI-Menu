using AiMenu.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace AiMenu.Api.Data;

// DbContext, EF Core'un uygulamadaki veritabani giris kapisidir.
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    // Her DbSet bir tabloyu temsil eder.
    public DbSet<Restaurant> Restaurants => Set<Restaurant>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    // Urun detayinda gosterilen varyant, alerjen ve tag tablolari.
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<ProductAllergen> ProductAllergens => Set<ProductAllergen>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<ProductTag> ProductTags => Set<ProductTag>();
    public DbSet<Table> Tables => Set<Table>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Restaurant>(entity =>
        {
            entity.HasKey(x => x.RestaurantId);
            entity.Property(x => x.Name).HasMaxLength(150).IsRequired();
            entity.Property(x => x.Slug).HasMaxLength(150).IsRequired();
            entity.HasIndex(x => x.Slug).IsUnique();
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(x => x.CategoryId);
            entity.Property(x => x.Name).HasMaxLength(120).IsRequired();
            entity.HasOne(x => x.Restaurant)
                .WithMany(x => x.Categories)
                .HasForeignKey(x => x.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(x => x.ProductId);
            entity.Property(x => x.Name).HasMaxLength(150).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(500);
            entity.Property(x => x.Ingredients).HasMaxLength(500);
            entity.Property(x => x.Price).HasPrecision(10, 2);

            entity.HasOne(x => x.Restaurant)
                .WithMany(x => x.Products)
                .HasForeignKey(x => x.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Category)
                .WithMany(x => x.Products)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Restoran + aktiflik filtresi onerilerde sik kullanildigi icin index eklenir.
            entity.HasIndex(x => new { x.RestaurantId, x.IsActive });
        });

        modelBuilder.Entity<Tag>(entity =>
        {
            // Tag sozlugu restorana ozel ve normalize edilmis isimle tekil tutulur.
            entity.HasKey(x => x.TagId);
            entity.Property(x => x.Name).HasMaxLength(80).IsRequired();
            entity.Property(x => x.NormalizedName).HasMaxLength(80).IsRequired();

            entity.HasOne(x => x.Restaurant)
                .WithMany(x => x.Tags)
                .HasForeignKey(x => x.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(x => new { x.RestaurantId, x.NormalizedName }).IsUnique();
        });

        modelBuilder.Entity<ProductVariant>(entity =>
        {
            // Varyantlar ürün bazlıdır ve pasif varyantlar müşteri detayında gösterilmez.
            entity.HasKey(x => x.ProductVariantId);
            entity.Property(x => x.Name).HasMaxLength(120).IsRequired();
            entity.Property(x => x.PriceDelta).HasPrecision(10, 2);

            entity.HasOne(x => x.Restaurant)
                .WithMany(x => x.ProductVariants)
                .HasForeignKey(x => x.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Product)
                .WithMany(x => x.Variants)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ProductAllergen>(entity =>
        {
            // Alerjen kayıtları ürün detay response'unda sade isim listesine dönüştürülür.
            entity.HasKey(x => x.ProductAllergenId);
            entity.Property(x => x.Name).HasMaxLength(120).IsRequired();

            entity.HasOne(x => x.Restaurant)
                .WithMany(x => x.ProductAllergens)
                .HasForeignKey(x => x.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Product)
                .WithMany(x => x.Allergens)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ProductTag>(entity =>
        {
            // ProductTags join tablosu urunleri restoran bazli tag sozlugune baglar.
            entity.HasKey(x => x.ProductTagId);

            entity.HasOne(x => x.Restaurant)
                .WithMany(x => x.ProductTags)
                .HasForeignKey(x => x.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Product)
                .WithMany(x => x.ProductTags)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Tag)
                .WithMany(x => x.ProductTags)
                .HasForeignKey(x => x.TagId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(x => new { x.ProductId, x.TagId }).IsUnique();
            entity.HasIndex(x => new { x.RestaurantId, x.TagId });
        });

        modelBuilder.Entity<Table>(entity =>
        {
            entity.HasKey(x => x.TableId);
            entity.Property(x => x.Name).HasMaxLength(80).IsRequired();
            entity.Property(x => x.QrCodeValue).HasMaxLength(200).IsRequired();
            entity.HasOne(x => x.Restaurant)
                .WithMany(x => x.Tables)
                .HasForeignKey(x => x.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(x => x.OrderId);
            entity.Property(x => x.CustomerName).HasMaxLength(120);
            entity.Property(x => x.Note).HasMaxLength(500);
            entity.Property(x => x.Status).HasMaxLength(40).IsRequired();
            entity.Property(x => x.TotalAmount).HasPrecision(10, 2);
            entity.HasOne(x => x.Restaurant)
                .WithMany(x => x.Orders)
                .HasForeignKey(x => x.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(x => x.Table)
                .WithMany(x => x.Orders)
                .HasForeignKey(x => x.TableId)
                // Bir masa silinse bile gecmis siparis verisi kontrolsuz kaybolmasin diye restrict kullaniyoruz.
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(x => x.OrderItemId);
            entity.Property(x => x.UnitPrice).HasPrecision(10, 2);
            entity.Property(x => x.LineTotal).HasPrecision(10, 2);
            entity.HasOne(x => x.Restaurant)
                .WithMany(x => x.OrderItems)
                .HasForeignKey(x => x.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(x => x.Order)
                .WithMany(x => x.Items)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(x => x.Product)
                .WithMany(x => x.OrderItems)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
