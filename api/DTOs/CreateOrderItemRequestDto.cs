using System.ComponentModel.DataAnnotations;

namespace AiMenu.Api.DTOs;

public class CreateOrderItemRequestDto
{
    [Required]
    public Guid ProductId { get; set; }

    [Range(1, 99)]
    public int Quantity { get; set; }

    public Guid? VariantId { get; set; }

    [MaxLength(500)]
    public string Note { get; set; } = string.Empty;
}
