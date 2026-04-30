using System.ComponentModel.DataAnnotations;
using AiMenu.Api.Validation;

namespace AiMenu.Api.DTOs;

public class CreateOrderRequestDto
{
    [NotEmptyGuid(ErrorMessage = "Restaurant id is required.")]
    public Guid RestaurantId { get; set; }

    [NotEmptyGuid(ErrorMessage = "Table id is required.")]
    public Guid TableId { get; set; }

    [MaxLength(120, ErrorMessage = "Customer name cannot exceed 120 characters.")]
    public string CustomerName { get; set; } = string.Empty;

    [MaxLength(500, ErrorMessage = "Order note cannot exceed 500 characters.")]
    public string Note { get; set; } = string.Empty;

    [Required]
    [MinLength(1, ErrorMessage = "At least one item is required to create an order.")]
    public IReadOnlyCollection<CreateOrderItemRequestDto> Items { get; set; } = Array.Empty<CreateOrderItemRequestDto>();
}
