# ProjectManager API

A comprehensive project management REST API built with ASP.NET Core 8.0, featuring JWT authentication, global error handling, and comprehensive API documentation.

## Features

- **User Authentication**: JWT-based authentication with secure user registration and login
- **Project Management**: Create, read, update, and delete projects
- **Task Management**: Add, update, and delete tasks within projects
- **Global Error Handling**: Centralized exception handling with detailed error responses
- **API Documentation**: Comprehensive Swagger/OpenAPI documentation with JWT support
- **Data Validation**: Input validation with detailed error messages
- **SQLite Database**: Lightweight database with Entity Framework Core

## Technology Stack

- **Framework**: ASP.NET Core 8.0
- **Database**: SQLite with Entity Framework Core
- **Authentication**: JWT Bearer tokens
- **Documentation**: Swagger/OpenAPI with XML comments
- **Validation**: Data Annotations with custom validation filters

## Getting Started

### Prerequisites

- .NET 8.0 SDK
- SQLite (included with .NET)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ProjectManager.Api
```

2. Restore dependencies:
```bash
dotnet restore
```

3. Apply database migrations:
```bash
dotnet ef database update
```

4. Run the application:
```bash
dotnet run
```

The API will be available at `http://localhost:5000` (or `https://localhost:5001` for HTTPS).

### Swagger Documentation

Access the interactive API documentation at:
- Development: `http://localhost:5152/swagger`

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "Password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "Password123"
}
```

### Projects (Requires Authentication)

#### Get All Projects
```http
GET /api/projects
Authorization: Bearer <jwt-token>
```

#### Get Project by ID
```http
GET /api/projects/{id}
Authorization: Bearer <jwt-token>
```

#### Create Project
```http
POST /api/projects
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "My Project",
  "description": "Project description"
}
```

#### Delete Project
```http
DELETE /api/projects/{id}
Authorization: Bearer <jwt-token>
```

#### Add Task to Project
```http
POST /api/projects/{projectId}/tasks
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Task title",
  "dueDate": "2024-12-31",
  "isCompleted": false
}
```

### Tasks (Requires Authentication)

#### Update Task
```http
PUT /api/tasks/{taskId}
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Updated task title",
  "dueDate": "2024-12-31",
  "isCompleted": true
}
```

#### Delete Task
```http
DELETE /api/tasks/{taskId}
Authorization: Bearer <jwt-token>
```

## Data Models

### User Registration
```json
{
  "username": "string (3-100 chars, alphanumeric + underscore)",
  "password": "string (8-100 chars, 1 uppercase, 1 number)"
}
```

### Project
```json
{
  "title": "string (3-100 chars, required)",
  "description": "string (max 500 chars, optional)"
}
```

### Task
```json
{
  "title": "string (1-200 chars, required)",
  "dueDate": "date in YYYY-MM-DD format (optional)",
  "isCompleted": "boolean"
}
```

## Error Handling

The API uses a global exception middleware that returns consistent error responses:

```json
{
  "message": "Error description",
  "statusCode": 400,
  "details": "Additional error details",
  "correlationId": "unique-request-id",
  "validationErrors": {
    "fieldName": ["validation error messages"]
  }
}
```

### HTTP Status Codes

- `200 OK`: Successful request
- `204 No Content`: Successful deletion
- `400 Bad Request`: Invalid request data or validation errors
- `401 Unauthorized`: Authentication required or invalid credentials
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Unexpected server error

## Authentication

The API uses JWT Bearer token authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens are obtained through the `/api/auth/login` endpoint and should be included in all requests to protected endpoints.

## Database Schema

### Users
- `Id` (int, primary key)
- `Username` (string, unique)
- `PasswordHash` (byte array)
- `PasswordSalt` (byte array)

### Projects
- `Id` (int, primary key)
- `Title` (string)
- `Description` (string, nullable)
- `CreatedAt` (datetime)
- `UserId` (int, foreign key)

### Tasks
- `Id` (int, primary key)
- `Title` (string)
- `DueDate` (date in YYYY-MM-DD format, nullable)
- `IsCompleted` (boolean)
- `ProjectId` (int, foreign key)

## Configuration

### JWT Settings
Configure JWT settings in `appsettings.json`:

```json
{
  "Jwt": {
    "Key": "your-secret-key-here"
  }
}
```

### Database Connection
Configure the SQLite connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=projectmanager.db"
  }
}
```

## Development

### Running Tests
```bash
dotnet test
```

### Database Migrations
Create a new migration:
```bash
dotnet ef migrations add MigrationName
```

Apply migrations:
```bash
dotnet ef database update
```

### Building for Production
```bash
dotnet publish -c Release -o ./publish
```

## Project Structure

```
ProjectManager.Api/
├── Controllers/          # API controllers
├── Data/                # Database context and configurations
├── DTOs/                # Data transfer objects
├── Exceptions/          # Custom exception classes
├── Filters/             # Action filters (validation)
├── Middleware/          # Custom middleware (global exception handling)
├── Migrations/          # Entity Framework migrations
├── Models/              # Domain models
├── Services/            # Business logic services
├── Program.cs           # Application entry point
└── appsettings.json     # Configuration settings
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.