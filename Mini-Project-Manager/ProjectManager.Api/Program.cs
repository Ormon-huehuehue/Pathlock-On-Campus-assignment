using ProjectManager.Api.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddApplicationServices(builder.Configuration, builder.Environment);
builder.Services.AddSwaggerServices();

var app = builder.Build();

// Initialize database
await app.Services.InitializeDatabaseAsync(app.Logger, app.Environment);

// Configure pipeline
app.ConfigurePipeline();

app.Run();
