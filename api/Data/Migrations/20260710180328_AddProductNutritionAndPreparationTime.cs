using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AiMenu.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProductNutritionAndPreparationTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Calories",
                table: "Products",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PreparationTimeMinutes",
                table: "Products",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Calories",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "PreparationTimeMinutes",
                table: "Products");
        }
    }
}
