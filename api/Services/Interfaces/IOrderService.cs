using AiMenu.Api.DTOs;

namespace AiMenu.Api.Services.Interfaces;

public interface IOrderService
{
    Task<OrderResponseDto> CreateOrderAsync(CreateOrderRequestDto request, CancellationToken cancellationToken = default);
}
