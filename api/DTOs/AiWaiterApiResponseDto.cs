namespace AiMenu.Api.DTOs;

// AiWaiterApiResponseDto, AiWaiterApi'den donen model veya fallback cevabini temsil eder.
public class AiWaiterApiResponseDto
{
    public string Reply { get; set; } = string.Empty;
    public string Source { get; set; } = "model";
    public bool UsedModel { get; set; } = true;
}
