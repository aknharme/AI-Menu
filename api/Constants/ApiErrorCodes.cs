namespace AiMenu.Api.Constants;

// ApiErrorCodes, frontend ile backend arasinda sabit hata kodu sozlesmesi saglar.
public static class ApiErrorCodes
{
    public const string ValidationError = "validation_error";
    public const string Unauthorized = "unauthorized";
    public const string Forbidden = "forbidden";
    public const string NotFound = "not_found";
    public const string InternalServerError = "internal_server_error";
    public const string BadRequest = "bad_request";
}
