namespace AiMenu.Api.DTOs;

public class AiIntentClassifierResponseDto
{
    public string Intent { get; set; } = "menu_related";
    public double Confidence { get; set; } = 0.5;
}
