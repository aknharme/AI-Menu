using System.Text.Json;
using AiMenu.Api.Constants;
using AiMenu.Api.DTOs;

namespace AiMenu.Api.Middleware;

// GlobalExceptionHandlingMiddleware, yakalanmayan hatalari standart API error formatinda disari acar.
public class GlobalExceptionHandlingMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (InvalidOperationException exception)
        {
            logger.LogWarning(exception, "Validation or business rule error");
            await WriteErrorAsync(
                context,
                StatusCodes.Status400BadRequest,
                ApiErrorResponseDto.Create(exception.Message, ApiErrorCodes.BadRequest));
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Unhandled server error");
            await WriteErrorAsync(
                context,
                StatusCodes.Status500InternalServerError,
                ApiErrorResponseDto.Create(
                    "Beklenmeyen bir sunucu hatasi olustu.",
                    ApiErrorCodes.InternalServerError));
        }
    }

    private static async Task WriteErrorAsync(HttpContext context, int statusCode, ApiErrorResponseDto response)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
