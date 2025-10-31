using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ProjectManager.Api.Converters;
using ProjectManager.Api.Data;
using System.Text;

namespace ProjectManager.Api.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
        {
            // Token service
            services.AddScoped<Services.ITokenService, Services.TokenService>();

            // CORS
            services.AddCors(options =>
            {
                options.AddDefaultPolicy(policy =>
                {
                    var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();

                    var envOrigins = Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS");
                    if (!string.IsNullOrEmpty(envOrigins))
                    {
                        allowedOrigins = envOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                               .Select(origin => origin.Trim())
                                               .ToArray();
                    }

                    if (allowedOrigins.Length > 0 && !allowedOrigins.Contains("*"))
                    {
                        policy.WithOrigins(allowedOrigins)
                              .AllowAnyHeader()
                              .AllowAnyMethod()
                              .AllowCredentials();
                    }
                    else if (environment.IsDevelopment())
                    {
                        policy.AllowAnyOrigin()
                              .AllowAnyHeader()
                              .AllowAnyMethod();
                    }
                    else
                    {
                        policy.WithOrigins("https://localhost:3000")
                              .AllowAnyHeader()
                              .AllowAnyMethod()
                              .AllowCredentials();
                    }
                });
            });

            // JWT Authentication
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY")
                                ?? configuration["Jwt:Key"]
                                ?? throw new InvalidOperationException("JWT Key not configured. Set JWT_KEY environment variable or Jwt:Key in configuration.");

                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
                    };
                });

            // Database
            services.AddDbContext<AppDbContext>(options =>
            {
                var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
                                     ?? configuration.GetConnectionString("DefaultConnection");
                options.UseSqlite(connectionString);
            });

            // Controllers with JSON options
            services.AddControllers(options =>
            {
                options.Filters.Add<Filters.ValidationActionFilter>();
            })
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new DateOnlyJsonConverter());
                options.JsonSerializerOptions.Converters.Add(new NullableDateOnlyJsonConverter());
                options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
                options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
            });

            // Health checks
            services.AddHealthChecks()
                .AddDbContextCheck<AppDbContext>("database");

            services.AddEndpointsApiExplorer();
            services.AddAuthorization();

            return services;
        }

        public static IServiceCollection AddSwaggerServices(this IServiceCollection services)
        {
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
                {
                    Title = "ProjectManager API",
                    Version = "v1",
                    Description = "A comprehensive project management API with authentication and error handling"
                });

                c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
                    Name = "Authorization",
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });

                c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
                {
                    {
                        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                        {
                            Reference = new Microsoft.OpenApi.Models.OpenApiReference
                            {
                                Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            return services;
        }
    }
}