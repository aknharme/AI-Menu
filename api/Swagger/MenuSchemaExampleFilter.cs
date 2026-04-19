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
