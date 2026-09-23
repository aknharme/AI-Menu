using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using AiMenu.Api.DTOs;
using AiMenu.Api.Entities;

namespace AiMenu.Api.Services;

// Sadece bütün mesajın anlamı kesin olduğunda model çağrısını atlar.
public class WaiterQuickReplies
{
    public AiChatResponseDto? Greeting(string message) => Normalize(message) switch
    {
        "merhaba" or "selam" or "selamlar" or "hey" or "gunaydin" or "iyi aksamlar" =>
            Reply("Merhaba, hoş geldiniz! Ben yapay zekâ garsonunuzum. Menüden bir şey önerebilirim; canınız ne çekiyor?"),
        "nasilsin" or "nasilsiniz" or "merhaba nasilsin" or "selam nasilsin" =>
            Reply("İyiyim, teşekkür ederim! Size menüden bir şeyler seçmekte yardımcı olayım. Ne yemek veya içmek istersiniz?"),
        "tesekkurler" or "tesekkur ederim" or "sag ol" or "sagol" =>
            Reply("Rica ederim! Başka bir isteğiniz olursa buradayım."),
        "gorusuruz" or "hosca kal" => Reply("Görüşmek üzere, iyi günler!"),
        _ => null
    };

    public AiChatResponseDto? MenuQuestion(string message, IReadOnlyCollection<Product> products)
    {
        var text = Normalize(message);
        var match = Regex.Match(text, @"^(?<item>[a-z0-9 ]{2,60}) (?:var mi|mevcut mu|ne kadar|kac tl|kac lira)$");
        if (!match.Success) return null;

        var query = match.Groups["item"].Value;
        // Çoklu niyet, alerji, olumsuzluk ve bağlama bağlı soruları modele bırak.
        var excluded = new HashSet<string> { "ve", "veya", "ama", "yok", "degil", "alerji", "alerjim", "alerjen", "gluten", "laktoz", "bu", "o", "bunun", "onun", "sekersiz" };
        var words = query.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (words.Any(excluded.Contains)) return null;

        var matches = products.Where(product =>
        {
            var name = Normalize(product.Name);
            return name == query || $" {name} ".Contains($" {query} ", StringComparison.Ordinal);
        }).ToList();
        // Bilinmeyen veya geniş eşleşmede sessizce yanlış bir cevap verme.
        if (matches.Count is 0 or > 4) return null;
        var lines = matches.Select(product =>
            $"{product.Name}: {product.Price.ToString("0.##", CultureInfo.GetCultureInfo("tr-TR"))} TL" +
            (product.Variants.Any(variant => variant.IsActive) ? " (temel fiyat; seçenekler ayrıca ücretlendirilebilir)" : ""));
        return Reply($"Menümüzde {string.Join("; ", lines)} bulunuyor. Güncel stok için personelimizden teyit alabilirsiniz.");
    }

    public static string Normalize(string value)
    {
        var normalized = value.ToLower(CultureInfo.GetCultureInfo("tr-TR"))
            .Replace('ı', 'i').Normalize(NormalizationForm.FormD);
        normalized = new string(normalized.Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark).ToArray());
        normalized = Regex.Replace(normalized, @"[^a-z0-9\s]", " ");
        normalized = Regex.Replace(normalized, @"\s+", " ").Trim();
        return Regex.Replace(normalized, @"\bcola\b", "kola");
    }

    private static AiChatResponseDto Reply(string text) => new() { Response = text, Source = "quick_reply", UsedModel = false };
}
