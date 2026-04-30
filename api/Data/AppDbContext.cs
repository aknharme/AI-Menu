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
    public DbSet<User> Users => Set<User>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<RecommendationLog> RecommendationLogs => Set<RecommendationLog>();
    public DbSet<OrderStatusLog> OrderStatusLogs => Set<OrderStatusLog>();

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

        modelBuilder.Entity<User>(entity =>
        {
            // Kullanici tablosu JWT login icin email ve hash bilgilerini restoran baglaminda saklar.
            entity.HasKey(x => x.UserId);
            entity.Property(x => x.FullName).HasMaxLength(150).IsRequired();
            entity.Property(x => x.Email).HasMaxLength(180).IsRequired();
            entity.Property(x => x.PasswordHash).HasMaxLength(500).IsRequired();
            entity.Property(x => x.Role).HasMaxLength(40).IsRequired();

            entity.HasOne(x => x.Restaurant)
                .WithMany(x => x.Users)
                .HasForeignKey(x => x.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(x => x.Email).IsUnique();
            entity.HasIndex(x => new { x.RestaurantId, x.Role });
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            // Audit loglari degisen kayit ve yapan kullanici baglamini sade tutar.
            entity.HasKey(x => x.AuditLogId);
            entity.Property(x => x.ActionType).HasMaxLength(80).IsRequired();
            entity.Property(x => x.EntityType).HasMaxLength(80).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(600).IsRequired();

            entity.HasOne(x => x.Restaurant)
                .WithMany(x => x.AuditLogs)
                .HasForeignKey(x => x.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.User)
                .WithMany(x => x.AuditLogs)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(x => new { x.RestaurantId, x.CreatedAtUtc });
        });

        modelBuilder.Entity<RecommendationLog>(entity =>
        {
            // Prompt, tag listesi ve onerilen urun id'leri JSON string olarak saklanir.
            entity.HasKey(x => x.RecommendationLogId);
            entity.Property(x => x.Prompt).HasMaxLength(1000).IsRequired();
            entity.Property(x => x.ExtractedTags).HasColumnType("text").IsRequired();
            entity.Property(x => x.RecommendedProducts).HasColumnType("text").IsRequired();

            entity.HasOne(x => x.Restaurant)
                .WithMany(x => x.RecommendationLogs)
                .HasForeignKey(x => x.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(x => new { x.RestaurantId, x.CreatedAtUtc });
        });

        modelBuilder.Entity<OrderStatusLog>(entity =>
        {
            // Siparis durum loglari olusturma ve sonraki durum gecislerini ayni tabloda toplar.
            entity.HasKey(x => x.OrderStatusLogId);
            entity.Property(x => x.OldStatus).HasMaxLength(40);
            entity.Property(x => x.NewStatus).HasMaxLength(40).IsRequired();

            entity.HasOne(x => x.Restaurant)
                .WithMany(x => x.OrderStatusLogs)
                .HasForeignKey(x => x.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Order)
                .WithMany(x => x.StatusLogs)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.ChangedByUser)
                .WithMany(x => x.OrderStatusLogs)
                .HasForeignKey(x => x.ChangedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(x => new { x.RestaurantId, x.ChangedAtUtc });
            entity.HasIndex(x => new { x.OrderId, x.ChangedAtUtc });
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
            entity.Property(x => x.Note).HasMaxLength(500);
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
            entity.HasOne(x => x.ProductVariant)
                .WithMany(x => x.OrderItems)
                .HasForeignKey(x => x.ProductVariantId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
