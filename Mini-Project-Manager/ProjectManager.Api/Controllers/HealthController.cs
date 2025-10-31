using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManager.Api.Data;
using System.Reflection;
using System.Diagnostics;

namespace ProjectManager.Api.Controllers;

/// <summary>
/// Health check controller for monitoring application status
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<HealthController> _logger;

    public HealthController(AppDbContext context, ILogger<HealthController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get detailed health status including database connectivity
    /// </summary>
    /// <returns>Health status information</returns>
    [HttpGet]
    public async Task<IActionResult> GetHealth()
    {
        try
        {
            var healthStatus = new
            {
                Status = "Healthy",
                Timestamp = DateTime.UtcNow,
                Version = Assembly.GetExecutingAssembly().GetName().Version?.ToString(),
                Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
                Database = await CheckDatabaseHealth(),
                Uptime = GetUptime()
            };

            return Ok(healthStatus);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Health check failed");
            
            var unhealthyStatus = new
            {
                Status = "Unhealthy",
                Timestamp = DateTime.UtcNow,
                Error = ex.Message,
                Version = Assembly.GetExecutingAssembly().GetName().Version?.ToString(),
                Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown"
            };

            return StatusCode(503, unhealthyStatus);
        }
    }

    /// <summary>
    /// Simple liveness probe endpoint
    /// </summary>
    /// <returns>Simple OK response</returns>
    [HttpGet("live")]
    public IActionResult GetLiveness()
    {
        return Ok(new { Status = "Alive", Timestamp = DateTime.UtcNow });
    }

    /// <summary>
    /// Readiness probe endpoint that checks database connectivity
    /// </summary>
    /// <returns>Readiness status</returns>
    [HttpGet("ready")]
    public async Task<IActionResult> GetReadiness()
    {
        try
        {
            var dbHealth = await CheckDatabaseHealth();
            
            // Use reflection to check the Status property since we're returning anonymous objects
            var statusProperty = dbHealth.GetType().GetProperty("Status");
            var status = statusProperty?.GetValue(dbHealth)?.ToString();
            
            if (status == "Healthy")
            {
                return Ok(new 
                { 
                    Status = "Ready", 
                    Timestamp = DateTime.UtcNow,
                    Database = dbHealth
                });
            }
            else
            {
                return StatusCode(503, new 
                { 
                    Status = "Not Ready", 
                    Timestamp = DateTime.UtcNow,
                    Database = dbHealth
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Readiness check failed");
            return StatusCode(503, new 
            { 
                Status = "Not Ready", 
                Timestamp = DateTime.UtcNow,
                Error = ex.Message
            });
        }
    }

    private async Task<object> CheckDatabaseHealth()
    {
        try
        {
            var startTime = DateTime.UtcNow;
            
            // Test database connectivity by executing a simple query
            var canConnect = await _context.Database.CanConnectAsync();
            
            if (!canConnect)
            {
                return new
                {
                    Status = "Unhealthy",
                    Message = "Cannot connect to database",
                    ResponseTime = (DateTime.UtcNow - startTime).TotalMilliseconds
                };
            }

            // Test a simple query to ensure database is responsive
            var userCount = await _context.Users.CountAsync();
            var projectCount = await _context.Projects.CountAsync();
            
            var responseTime = (DateTime.UtcNow - startTime).TotalMilliseconds;

            return new
            {
                Status = "Healthy",
                Message = "Database is accessible and responsive",
                ResponseTime = responseTime,
                Statistics = new
                {
                    UserCount = userCount,
                    ProjectCount = projectCount
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Database health check failed");
            return new
            {
                Status = "Unhealthy",
                Message = ex.Message,
                ResponseTime = -1
            };
        }
    }

    private static string GetUptime()
    {
        var uptime = DateTime.UtcNow - Process.GetCurrentProcess().StartTime.ToUniversalTime();
        return $"{uptime.Days}d {uptime.Hours}h {uptime.Minutes}m {uptime.Seconds}s";
    }
}