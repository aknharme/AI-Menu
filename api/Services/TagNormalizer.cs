namespace AiMenu.Api.Services;

// TagNormalizer, AI cevabini ve veritabani tag'lerini ayni kuralla karsilastirilabilir hale getirir.
public static class TagNormalizer
{
    public static IReadOnlyCollection<string> NormalizeMany(IEnumerable<string> tags)
    {
        return tags
            .Select(Normalize)
            .Where(tag => !string.IsNullOrWhiteSpace(tag))
            .Distinct(StringComparer.Ordinal)
            .ToList();
    }

    public static string Normalize(string value)
    {
        return (value ?? string.Empty).Trim().ToLowerInvariant();
    }
}
