using System.Collections.Generic;

namespace ProjectManager.Api.Models
{
    public class ErrorResponse
    {
        public required string Message { get; set; }
        public int StatusCode { get; set; }
        public string? Details { get; set; }
        public string? CorrelationId { get; set; }
        public Dictionary<string, string[]>? ValidationErrors { get; set; }

        public ErrorResponse()
        {
            ValidationErrors = new Dictionary<string, string[]>();
        }
    }
}