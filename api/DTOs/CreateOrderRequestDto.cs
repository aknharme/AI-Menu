using System.ComponentModel.DataAnnotations;

namespace AiMenu.Api.DTOs;

public class CreateOrderRequestDto
{
    [Required]
    public Guid RestaurantId { get; set; }

    [Required]
    public Guid TableId { get; set; }

    [MaxLength(120)]
    public string CustomerName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Note { get; set; } = string.Empty;

    [MinLength(1)]
    public IReadOnlyCollection<CreateOrderItemRequestDto> Items { get; set; } = Array.Empty<CreateOrderItemRequestDto>();
}
