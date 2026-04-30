using System.ComponentModel.DataAnnotations;
using AiMenu.Api.Validation;

namespace AiMenu.Api.DTOs;

public class CreateOrderItemRequestDto
{
    [NotEmptyGuid(ErrorMessage = "Product id is required.")]
    public Guid ProductId { get; set; }

    [Range(1, 99, ErrorMessage = "Quantity must be between 1 and 99.")]
    public int Quantity { get; set; }

    public Guid? VariantId { get; set; }

    [MaxLength(500, ErrorMessage = "Item note cannot exceed 500 characters.")]
    public string Note { get; set; } = string.Empty;
}
