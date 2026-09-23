using System.ComponentModel.DataAnnotations;

namespace AiMenu.Api.DTOs;

public class AiChatRequestDto : IValidatableObject
{
    [Required, StringLength(1000, MinimumLength = 1)]
    public string Message { get; set; } = string.Empty;

    [Required, MaxLength(8)]
    public List<AiChatMessageDto> History { get; set; } = [];

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (History is null) yield break;
        if (History.Any(message => message is null))
            yield return new ValidationResult("Geçmişte boş mesaj olamaz.", [nameof(History)]);
        if (History.Sum(message => message?.Content?.Length ?? 0) > 6000)
            yield return new ValidationResult("Konuşma geçmişi en fazla 6000 karakter olabilir.", [nameof(History)]);
    }
}

public class AiChatMessageDto
{
    [Required, RegularExpression("^(user|assistant)$")]
    public string Role { get; set; } = "user";

    [Required, StringLength(1600, MinimumLength = 1)]
    public string Content { get; set; } = string.Empty;
}
