using AiMenu.Api.DTOs;

namespace AiMenu.Api.Services.Interfaces;

public interface IMenuGroundingService
{
    AiMenuGroundingDto Ground(string message, AiMenuContextDto menuContext);
}
