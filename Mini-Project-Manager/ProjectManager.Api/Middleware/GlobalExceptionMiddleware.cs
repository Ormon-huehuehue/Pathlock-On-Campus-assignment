using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ProjectManager.Api.Exceptions;
using ProjectManager.Api.Models;

namespace ProjectManager.Api.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;
        private readonly IWebHostEnvironment _environment;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger, IWebHostEnvironment environment)
        {
            _next = next;
            _logger = logger;
            _environment = environment;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Generate correlation ID for request tracking
            var correlationId = Guid.NewGuid().ToString();
            context.Items["CorrelationId"] = correlationId;
            
            // Add correlation ID to response headers
            context.Response.Headers["X-Correlation-ID"] = correlationId;

            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                // Structured logging with comprehensive context
                using (_logger.BeginScope(new Dictionary<string, object>
                {
                    ["CorrelationId"] = correlationId,
                    ["RequestId"] = context.TraceIdentifier,
                    ["UserId"] = GetUserId(context) ?? "Anonymous",
                    ["UserAgent"] = context.Request.Headers["User-Agent"].ToString(),
                    ["RemoteIpAddress"] = context.Connection.RemoteIpAddress?.ToString() ?? "Unknown",
                    ["RequestPath"] = context.Request.Path.Value ?? "/",
                    ["RequestMethod"] = context.Request.Method,
                    ["QueryString"] = context.Request.QueryString.Value ?? "",
                    ["RequestHeaders"] = GetSafeHeaders(context.Request.Headers),
                    ["ExceptionType"] = ex.GetType().Name,
                    ["StatusCode"] = GetStatusCodeForException(ex)
                }))
                {
                    _logger.LogError(ex, 
                        "Unhandled exception occurred during request processing. " +
                        "CorrelationId: {CorrelationId}, Method: {Method}, Path: {Path}, " +
                        "UserId: {UserId}, RemoteIP: {RemoteIP}, ExceptionType: {ExceptionType}",
                        correlationId,
                        context.Request.Method,
                        context.Request.Path,
                        GetUserId(context),
                        context.Connection.RemoteIpAddress?.ToString(),
                        ex.GetType().Name);
                }
                
                await HandleExceptionAsync(context, ex, correlationId);
            }
        }

        private string? GetUserId(HttpContext context)
        {
            return context.User?.FindFirst("userId")?.Value ?? 
                   context.User?.FindFirst("sub")?.Value ?? 
                   context.User?.Identity?.Name;
        }

        private Dictionary<string, string> GetSafeHeaders(IHeaderDictionary headers)
        {
            var safeHeaders = new Dictionary<string, string>();
            var allowedHeaders = new[] { "Content-Type", "Accept", "Accept-Language", "Cache-Control" };
            
            foreach (var header in headers.Where(h => allowedHeaders.Contains(h.Key, StringComparer.OrdinalIgnoreCase)))
            {
                safeHeaders[header.Key] = header.Value.ToString();
            }
            
            return safeHeaders;
        }

        private int GetStatusCodeForException(Exception exception)
        {
            return exception switch
            {
                BadRequestException => (int)HttpStatusCode.BadRequest,
                UnauthorizedException => (int)HttpStatusCode.Unauthorized,
                NotFoundException => (int)HttpStatusCode.NotFound,
                ValidationException => (int)HttpStatusCode.BadRequest,
                ArgumentException => (int)HttpStatusCode.BadRequest,
                UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
                KeyNotFoundException => (int)HttpStatusCode.NotFound,
                InvalidOperationException => (int)HttpStatusCode.BadRequest,
                DbUpdateException => (int)HttpStatusCode.InternalServerError,
                _ => (int)HttpStatusCode.InternalServerError
            };
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception, string correlationId)
        {
            var response = context.Response;
            response.ContentType = "application/json";

            var errorResponse = new ErrorResponse
            {
                Message = "An error occurred",
                CorrelationId = correlationId
            };

            switch (exception)
            {
                case BadRequestException ex:
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    errorResponse.Message = ex.Message;
                    errorResponse.StatusCode = (int)HttpStatusCode.BadRequest;
                    LogSpecificException("BadRequestException", ex, correlationId, context);
                    break;

                case UnauthorizedException ex:
                    response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    errorResponse.Message = ex.Message;
                    errorResponse.StatusCode = (int)HttpStatusCode.Unauthorized;
                    LogSpecificException("UnauthorizedException", ex, correlationId, context);
                    break;

                case NotFoundException ex:
                    response.StatusCode = (int)HttpStatusCode.NotFound;
                    errorResponse.Message = ex.Message;
                    errorResponse.StatusCode = (int)HttpStatusCode.NotFound;
                    LogSpecificException("NotFoundException", ex, correlationId, context);
                    break;

                case ValidationException ex:
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    errorResponse.Message = ex.Message;
                    errorResponse.StatusCode = (int)HttpStatusCode.BadRequest;
                    errorResponse.ValidationErrors = ex.Errors;
                    LogValidationException(ex, correlationId, context);
                    break;

                case ArgumentException ex:
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    errorResponse.Message = "Invalid argument provided";
                    errorResponse.StatusCode = (int)HttpStatusCode.BadRequest;
                    LogSpecificException("ArgumentException", ex, correlationId, context);
                    break;

                case UnauthorizedAccessException ex:
                    response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    errorResponse.Message = "Access denied";
                    errorResponse.StatusCode = (int)HttpStatusCode.Unauthorized;
                    LogSpecificException("UnauthorizedAccessException", ex, correlationId, context);
                    break;

                case KeyNotFoundException ex:
                    response.StatusCode = (int)HttpStatusCode.NotFound;
                    errorResponse.Message = "Resource not found";
                    errorResponse.StatusCode = (int)HttpStatusCode.NotFound;
                    LogSpecificException("KeyNotFoundException", ex, correlationId, context);
                    break;

                case InvalidOperationException ex:
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    errorResponse.Message = "Invalid operation";
                    errorResponse.StatusCode = (int)HttpStatusCode.BadRequest;
                    LogSpecificException("InvalidOperationException", ex, correlationId, context);
                    break;

                case DbUpdateException ex:
                    response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    errorResponse.Message = "A database error occurred";
                    errorResponse.StatusCode = (int)HttpStatusCode.InternalServerError;
                    LogDatabaseException(ex, correlationId, context);
                    break;

                default:
                    response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    errorResponse.Message = "An internal server error occurred";
                    errorResponse.StatusCode = (int)HttpStatusCode.InternalServerError;
                    LogUnhandledException(exception, correlationId, context);
                    break;
            }

            // Include detailed error information only in development environment
            if (_environment.IsDevelopment())
            {
                errorResponse.Details = exception.ToString();
            }

            var jsonResponse = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await response.WriteAsync(jsonResponse);
        }

        private void LogSpecificException(string exceptionType, Exception ex, string correlationId, HttpContext context)
        {
            _logger.LogWarning(ex,
                "{ExceptionType} occurred. CorrelationId: {CorrelationId}, Message: {Message}, " +
                "Path: {Path}, Method: {Method}, UserId: {UserId}",
                exceptionType,
                correlationId,
                ex.Message,
                context.Request.Path,
                context.Request.Method,
                GetUserId(context));
        }

        private void LogValidationException(ValidationException ex, string correlationId, HttpContext context)
        {
            _logger.LogWarning(ex,
                "ValidationException occurred. CorrelationId: {CorrelationId}, Message: {Message}, " +
                "ValidationErrors: {@ValidationErrors}, Path: {Path}, Method: {Method}, UserId: {UserId}",
                correlationId,
                ex.Message,
                ex.Errors,
                context.Request.Path,
                context.Request.Method,
                GetUserId(context));
        }

        private void LogDatabaseException(DbUpdateException ex, string correlationId, HttpContext context)
        {
            _logger.LogError(ex,
                "Database exception occurred. CorrelationId: {CorrelationId}, " +
                "InnerException: {InnerException}, Path: {Path}, Method: {Method}, UserId: {UserId}",
                correlationId,
                ex.InnerException?.Message,
                context.Request.Path,
                context.Request.Method,
                GetUserId(context));
        }

        private void LogUnhandledException(Exception ex, string correlationId, HttpContext context)
        {
            _logger.LogCritical(ex,
                "Critical unhandled exception occurred. CorrelationId: {CorrelationId}, " +
                "ExceptionType: {ExceptionType}, Message: {Message}, Path: {Path}, Method: {Method}, UserId: {UserId}",
                correlationId,
                ex.GetType().FullName,
                ex.Message,
                context.Request.Path,
                context.Request.Method,
                GetUserId(context));
        }
    }
}