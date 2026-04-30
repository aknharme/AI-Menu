using System.ComponentModel.DataAnnotations;

namespace AiMenu.Api.DTOs;

// UpdateOrderStatusRequestDto, kasiyer veya admin tarafindan gonderilen yeni siparis durumunu tasir.
public class UpdateOrderStatusRequestDto
{
    [Required(ErrorMessage = "Order status is required.")]
    [MaxLength(40, ErrorMessage = "Order status cannot exceed 40 characters.")]
    public string Status { get; set; } = string.Empty;
}
