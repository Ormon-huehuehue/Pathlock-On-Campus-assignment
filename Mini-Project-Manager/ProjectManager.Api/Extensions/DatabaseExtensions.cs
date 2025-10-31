using Microsoft.EntityFrameworkCore;
using ProjectManager.Api.Data;

namespace ProjectManager.Api.Extensions
{
    public static class DatabaseExtensions
    {
        public static async Task InitializeDatabaseAsync(this IServiceProvider services, ILogger logger, IWebHostEnvironment environment)
        {
            using var scope = services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var scopedLogger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

            const int maxRetries = 3;
            var retryDelay = TimeSpan.FromSeconds(2);

            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    var connectionString = GetConnectionString(services);
                    scopedLogger.LogInformation("Database initialization attempt {Attempt}/{MaxRetries}", attempt, maxRetries);

                    await EnsureDatabaseDirectoryExists(connectionString, scopedLogger);
                    await CreateAndVerifyDatabase(context, scopedLogger);

                    scopedLogger.LogInformation("Database initialization completed successfully");
                    return;
                }
                catch (Exception ex)
                {
                    scopedLogger.LogError(ex, "Database initialization attempt {Attempt} failed", attempt);

                    if (attempt == maxRetries)
                    {
                        if (environment.IsDevelopment())
                        {
                            throw new InvalidOperationException("Database initialization failed. See logs for details.", ex);
                        }
                        else
                        {
                            scopedLogger.LogError("Database initialization failed. Application will start but may not function properly.");
                            return;
                        }
                    }

                    await Task.Delay(retryDelay);
                }
            }
        }

        private static string? GetConnectionString(IServiceProvider services)
        {
            return Environment.GetEnvironmentVariable("DATABASE_URL")
                ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                ?? services.GetRequiredService<IConfiguration>().GetConnectionString("DefaultConnection");
        }

        private static async Task EnsureDatabaseDirectoryExists(string? connectionString, ILogger logger)
        {
            if (string.IsNullOrEmpty(connectionString) || !connectionString.Contains("Data Source="))
                return;

            var dbPath = ExtractSqliteDbPath(connectionString);
            var dbDirectory = Path.GetDirectoryName(dbPath);

            if (string.IsNullOrEmpty(dbDirectory))
                return;

            if (!Directory.Exists(dbDirectory))
            {
                logger.LogInformation("Creating database directory: {Directory}", dbDirectory);
                Directory.CreateDirectory(dbDirectory);
            }

            // Verify write permissions
            var testFile = Path.Combine(dbDirectory, "write_test.tmp");
            try
            {
                await File.WriteAllTextAsync(testFile, "test");
                File.Delete(testFile);
                logger.LogInformation("Database directory write permissions verified");
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Cannot write to database directory: {dbDirectory}", ex);
            }
        }

        private static async Task CreateAndVerifyDatabase(AppDbContext context, ILogger logger)
        {
            var canConnect = await context.Database.CanConnectAsync();
            if (!canConnect)
            {
                logger.LogInformation("Database does not exist, creating...");
            }

            var created = await context.Database.EnsureCreatedAsync();
            logger.LogInformation(created ? "Database created successfully" : "Database already exists");

            // Simple verification by checking if we can query the Users table
            try
            {
                var userCount = await context.Users.CountAsync();
                logger.LogInformation("Database verification successful. Users table accessible with {UserCount} records", userCount);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Database verification had issues, but database appears to be created");
            }
        }

        private static string ExtractSqliteDbPath(string connectionString)
        {
            var dataSourceIndex = connectionString.IndexOf("Data Source=", StringComparison.OrdinalIgnoreCase);
            if (dataSourceIndex == -1) return connectionString;

            var pathStart = dataSourceIndex + "Data Source=".Length;
            var pathEnd = connectionString.IndexOf(';', pathStart);

            return pathEnd == -1
                ? connectionString[pathStart..].Trim()
                : connectionString[pathStart..pathEnd].Trim();
        }
    }
}