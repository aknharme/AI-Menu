using AiMenu.Api.DTOs;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace AiMenu.Api.Swagger;

// Swagger şemalarında gerçek seed veriye benzeyen örnek response gösterir.
public class MenuSchemaExampleFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (context.Type == typeof(MenuResponseDto))
        {
            // Menü endpoint'i kategori bazlı response döndüğü için örnek de aynı yapıda tutulur.
            schema.Example = new OpenApiObject
            {
                ["restaurantId"] = new OpenApiString("11111111-1111-1111-1111-111111111111"),
                ["restaurantName"] = new OpenApiString("Demo Cafe"),
                ["categories"] = new OpenApiArray
                {
                    new OpenApiObject
                    {
                        ["categoryId"] = new OpenApiString("22222222-2222-2222-2222-222222222222"),
                        ["name"] = new OpenApiString("Burgerler"),
                        ["displayOrder"] = new OpenApiInteger(2),
                        ["products"] = new OpenApiArray
                        {
                            ProductListExample()
                        }
                    }
                }
            };
        }

        if (context.Type == typeof(ProductListDto))
        {
            schema.Example = ProductListExample();
        }

        if (context.Type == typeof(ProductDetailDto))
        {
            // Ürün detay örneği alerjen, tag ve varyant alanlarının Swagger'da görünmesini sağlar.
            schema.Example = new OpenApiObject
            {
                ["productId"] = new OpenApiString("33333333-3333-3333-3333-333333333332"),
                ["restaurantId"] = new OpenApiString("11111111-1111-1111-1111-111111111111"),
                ["categoryId"] = new OpenApiString("22222222-2222-2222-2222-222222222222"),
                ["categoryName"] = new OpenApiString("Burgerler"),
                ["name"] = new OpenApiString("Klasik Burger"),
                ["description"] = new OpenApiString("Dana kofte, cheddar ve ozel sos ile servis edilir."),
                ["ingredients"] = new OpenApiString("Dana kofte, cheddar, marul, domates, tursu, burger ekmegi, ozel sos."),
                ["price"] = new OpenApiDouble(220),
                ["allergens"] = new OpenApiArray { new OpenApiString("gluten"), new OpenApiString("sut urunu") },
                ["tags"] = new OpenApiArray { new OpenApiString("ana-yemek"), new OpenApiString("burger") },
                ["variants"] = new OpenApiArray
                {
                    new OpenApiObject
                    {
                        ["productVariantId"] = new OpenApiString("77777777-7777-7777-7777-777777777771"),
                        ["name"] = new OpenApiString("Ekstra cheddar"),
                        ["priceDelta"] = new OpenApiDouble(30),
                        ["finalPrice"] = new OpenApiDouble(250)
                    }
                }
            };
        }

        if (context.Type == typeof(CreateOrderRequestDto))
        {
            schema.Example = new OpenApiObject
            {
                ["restaurantId"] = new OpenApiString("11111111-1111-1111-1111-111111111111"),
                ["tableId"] = new OpenApiString("44444444-4444-4444-4444-444444444441"),
                ["customerName"] = new OpenApiString("Test User"),
                ["note"] = new OpenApiString("Icecekler az buzlu olabilir."),
                ["items"] = new OpenApiArray
                {
                    new OpenApiObject
                    {
                        ["productId"] = new OpenApiString("33333333-3333-3333-3333-333333333332"),
                        ["quantity"] = new OpenApiInteger(1),
                        ["variantId"] = new OpenApiString("77777777-7777-7777-7777-777777777771"),
                        ["note"] = new OpenApiString("Ekstra sos olsun.")
                    }
                }
            };
        }

        if (context.Type == typeof(OrderResponseDto))
        {
            schema.Example = new OpenApiObject
            {
                ["orderId"] = new OpenApiString("88888888-8888-8888-8888-888888888881"),
                ["restaurantId"] = new OpenApiString("11111111-1111-1111-1111-111111111111"),
                ["tableId"] = new OpenApiString("44444444-4444-4444-4444-444444444441"),
                ["customerName"] = new OpenApiString("Test User"),
                ["note"] = new OpenApiString("Icecekler az buzlu olabilir."),
                ["status"] = new OpenApiString("Pending"),
                ["totalAmount"] = new OpenApiDouble(250),
                ["createdAtUtc"] = new OpenApiDateTime(DateTimeOffset.Parse("2026-04-21T18:00:00Z")),
                ["items"] = new OpenApiArray
                {
                    new OpenApiObject
                    {
                        ["orderItemId"] = new OpenApiString("99999999-9999-9999-9999-999999999991"),
                        ["productId"] = new OpenApiString("33333333-3333-3333-3333-333333333332"),
                        ["productName"] = new OpenApiString("Klasik Burger"),
                        ["variantId"] = new OpenApiString("77777777-7777-7777-7777-777777777771"),
                        ["variantName"] = new OpenApiString("Ekstra cheddar"),
                        ["note"] = new OpenApiString("Ekstra sos olsun."),
                        ["quantity"] = new OpenApiInteger(1),
                        ["unitPrice"] = new OpenApiDouble(250),
                        ["lineTotal"] = new OpenApiDouble(250)
                    }
                }
            };
        }
    }

    private static OpenApiObject ProductListExample()
    {
        return new OpenApiObject
        {
            ["productId"] = new OpenApiString("33333333-3333-3333-3333-333333333332"),
            ["categoryId"] = new OpenApiString("22222222-2222-2222-2222-222222222222"),
            ["categoryName"] = new OpenApiString("Burgerler"),
            ["name"] = new OpenApiString("Klasik Burger"),
            ["description"] = new OpenApiString("Dana kofte, cheddar ve ozel sos ile servis edilir."),
            ["price"] = new OpenApiDouble(220),
            ["tags"] = new OpenApiArray { new OpenApiString("ana-yemek"), new OpenApiString("burger") }
        };
    }
}
