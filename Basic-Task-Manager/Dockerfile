# Use the official .NET 8 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /build

# Copy csproj and restore dependencies (better caching)
COPY Basic-Task-Manager/backend/*.csproj Basic-Task-Manager/backend/
RUN dotnet restore "Basic-Task-Manager/backend/TaskManager.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/build/Basic-Task-Manager/backend"
RUN dotnet publish "TaskManager.csproj" -c Release -o /app/publish --no-restore

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy published app
COPY --from=build /app/publish .

# Set environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://0.0.0.0:$PORT

# Expose port (Render will set the PORT environment variable)
EXPOSE $PORT

# Start the application
ENTRYPOINT ["dotnet", "TaskManager.dll"]