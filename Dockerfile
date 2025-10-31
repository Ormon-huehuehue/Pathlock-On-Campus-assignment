# Use the official .NET 8 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /build

# Copy csproj and restore dependencies (better caching)
COPY Mini-Project-Manager/ProjectManager.Api/*.csproj Mini-Project-Manager/ProjectManager.Api/
RUN dotnet restore "Mini-Project-Manager/ProjectManager.Api/ProjectManager.Api.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/build/Mini-Project-Manager/ProjectManager.Api"
RUN dotnet publish "ProjectManager.Api.csproj" -c Release -o /app/publish --no-restore

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Create directory for SQLite database with proper permissions
RUN mkdir -p /app/data && chmod 755 /app/data

# Copy published app
COPY --from=build /app/publish .

# Set environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://0.0.0.0:$PORT

# Expose port (Render will set the PORT environment variable)
EXPOSE $PORT

# Start the application
ENTRYPOINT ["dotnet", "ProjectManager.Api.dll"]