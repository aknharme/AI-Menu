namespace AiMenu.Api.DTOs;

public enum AiMessageIntent
{
    SmallTalk,
    MenuRelated,
    OutOfScope
}

public static class AiMessageIntentExtensions
{
    public static string ToResponseValue(this AiMessageIntent intent)
    {
        return intent switch
        {
            AiMessageIntent.SmallTalk => "small_talk",
            AiMessageIntent.MenuRelated => "menu_related",
            AiMessageIntent.OutOfScope => "out_of_scope",
            _ => "menu_related"
        };
    }
}
