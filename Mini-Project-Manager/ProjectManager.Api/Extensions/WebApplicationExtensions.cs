using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using ProjectManager.Api.Middleware;

namespace ProjectManager.Api.Extensions
{
    public static class WebApplicationExtensions
    {
        public static WebApplication ConfigurePipeline(this WebApplication app)
        {
            // Global exception handling
            app.UseMiddleware<GlobalExceptionMiddleware>();

            // Development tools
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // Security and CORS
            app.UseHttpsRedirection();
            app.UseCors();
            app.UseAuthentication();
            app.UseAuthorization();

            // Health checks
            app.MapHealthChecks("/health", new HealthCheckOptions
            {
                ResponseWriter = async (context, report) =>
                {
                    context.Response.ContentType = "application/json";
                    var response = new
                    {
                        status = report.Status.ToString(),
                        checks = report.Entries.Select(x => new
                        {
                            name = x.Key,
                            status = x.Value.Status.ToString(),
                            exception = x.Value.Exception?.Message,
                            duration = x.Value.Duration.ToString()
                        }),
                        totalDuration = report.TotalDuration.ToString()
                    };
                    await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response));
                }
            });

            app.MapHealthChecks("/health/ready");
            app.MapControllers();

            return app;
        }
    }
}