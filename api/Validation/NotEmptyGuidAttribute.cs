using System.ComponentModel.DataAnnotations;

namespace AiMenu.Api.Validation;

// NotEmptyGuidAttribute, Guid alanlarinda bos deger gonderilmesini validation seviyesinde engeller.
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class NotEmptyGuidAttribute : ValidationAttribute
{
    public override bool IsValid(object? value)
    {
        return value is Guid guid && guid != Guid.Empty;
    }
}
