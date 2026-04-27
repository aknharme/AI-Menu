using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AiMenu.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRecommendationTags : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Eski ProductTags.Name degerleri once restoran bazli Tags sozlugune tasinir.
            migrationBuilder.CreateTable(
                name: "Tags",
                columns: table => new
                {
                    TagId = table.Column<Guid>(type: "uuid", nullable: false),
                    RestaurantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    NormalizedName = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tags", x => x.TagId);
                    table.ForeignKey(
                        name: "FK_Tags_Restaurants_RestaurantId",
                        column: x => x.RestaurantId,
                        principalTable: "Restaurants",
                        principalColumn: "RestaurantId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.Sql(
                """
                INSERT INTO "Tags" ("TagId", "RestaurantId", "Name", "NormalizedName")
                SELECT
                    ('00000000-0000-0000-0000-' || LPAD((ROW_NUMBER() OVER (ORDER BY "RestaurantId", "NormalizedName"))::text, 12, '0'))::uuid,
                    "RestaurantId",
                    "Name",
                    "NormalizedName"
                FROM (
                    SELECT
                        "RestaurantId",
                        MIN("Name") AS "Name",
                        LOWER(BTRIM("Name")) AS "NormalizedName"
                    FROM "ProductTags"
                    GROUP BY "RestaurantId", LOWER(BTRIM("Name"))
                ) AS "DistinctTags";
                """);

            // Yeni TagId alani once nullable eklenir; boylece mevcut kayitlar SQL ile guvenle eslenebilir.
            migrationBuilder.AddColumn<Guid>(
                name: "TagId",
                table: "ProductTags",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE "ProductTags" AS pt
                SET "TagId" = t."TagId"
                FROM "Tags" AS t
                WHERE pt."RestaurantId" = t."RestaurantId"
                  AND LOWER(BTRIM(pt."Name")) = t."NormalizedName";
                """);

            migrationBuilder.DropIndex(
                name: "IX_ProductTags_ProductId",
                table: "ProductTags");

            migrationBuilder.DropIndex(
                name: "IX_ProductTags_RestaurantId",
                table: "ProductTags");

            migrationBuilder.DropIndex(
                name: "IX_Products_RestaurantId",
                table: "Products");

            migrationBuilder.AlterColumn<Guid>(
                name: "TagId",
                table: "ProductTags",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "Name",
                table: "ProductTags");

            migrationBuilder.CreateIndex(
                name: "IX_ProductTags_ProductId_TagId",
                table: "ProductTags",
                columns: new[] { "ProductId", "TagId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductTags_RestaurantId_TagId",
                table: "ProductTags",
                columns: new[] { "RestaurantId", "TagId" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductTags_TagId",
                table: "ProductTags",
                column: "TagId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_RestaurantId_IsActive",
                table: "Products",
                columns: new[] { "RestaurantId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_Tags_RestaurantId_NormalizedName",
                table: "Tags",
                columns: new[] { "RestaurantId", "NormalizedName" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductTags_Tags_TagId",
                table: "ProductTags",
                column: "TagId",
                principalTable: "Tags",
                principalColumn: "TagId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Geri donuste eski Name kolonu tag sozlugunden geri doldurulur.
            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "ProductTags",
                type: "character varying(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE "ProductTags" AS pt
                SET "Name" = t."Name"
                FROM "Tags" AS t
                WHERE pt."TagId" = t."TagId";
                """);

            migrationBuilder.DropForeignKey(
                name: "FK_ProductTags_Tags_TagId",
                table: "ProductTags");

            migrationBuilder.DropTable(
                name: "Tags");

            migrationBuilder.DropIndex(
                name: "IX_ProductTags_ProductId_TagId",
                table: "ProductTags");

            migrationBuilder.DropIndex(
                name: "IX_ProductTags_RestaurantId_TagId",
                table: "ProductTags");

            migrationBuilder.DropIndex(
                name: "IX_ProductTags_TagId",
                table: "ProductTags");

            migrationBuilder.DropIndex(
                name: "IX_Products_RestaurantId_IsActive",
                table: "Products");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "ProductTags",
                type: "character varying(80)",
                maxLength: 80,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(80)",
                oldMaxLength: 80,
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "TagId",
                table: "ProductTags");

            migrationBuilder.CreateIndex(
                name: "IX_ProductTags_ProductId",
                table: "ProductTags",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductTags_RestaurantId",
                table: "ProductTags",
                column: "RestaurantId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_RestaurantId",
                table: "Products",
                column: "RestaurantId");
        }
    }
}
