namespace AiMenu.Api.DTOs;

public class ApiErrorResponseDto
{
    public string Message { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public IReadOnlyCollection<string>? Details { get; set; }

    public static ApiErrorResponseDto Create(string message, string code, IReadOnlyCollection<string>? details = null)
    {
        return new ApiErrorResponseDto
        {
            Message = message,
            Code = code,
            Details = details
        };
    }
}
