# Pathlock On-Campus Assignment

A comprehensive task and project management solution featuring two distinct applications: a Basic Task Manager and an Advanced Mini Project Manager. Both applications demonstrate modern web development practices with React/Next.js frontends and ASP.NET Core backends.

## 🚀 Live Deployments

- **Basic Task Manager API**: [https://basic-task-manager-5e7x.onrender.com](https://basic-task-manager-5e7x.onrender.com)
- **Mini Project Manager API**: [https://project-manager-api-f5ok.onrender.com](https://project-manager-api-f5ok.onrender.com)

## 📁 Project Structure

```
pathlock-assignment/
├── Basic-Task-Manager/          # Simple task management application
│   ├── backend/                 # ASP.NET Core API (in-memory storage)
│   └── frontend/               # React application with TypeScript
└── Mini-Project-Manager/       # Advanced project management system
    ├── ProjectManager.Api/     # ASP.NET Core API with SQLite database
    └── client/                 # Next.js application with TypeScript
```

---

## 🎯 Basic Task Manager

A simple, lightweight task management application with CRUD operations and real-time updates.

### Features
- ✅ Create, read, update, and delete tasks
- 🔄 Real-time task status toggling
- 🎨 Clean, responsive UI with Tailwind CSS
- 📱 Mobile-friendly design
- 🌐 Environment-based API configuration
- 💾 Local storage backup for offline functionality

### Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Axios
- **Backend**: ASP.NET Core 8.0, In-memory storage
- **Deployment**: Docker on Render

### API Endpoints

#### Tasks Management
```http
GET    /api/tasks           # Get all tasks
POST   /api/tasks           # Create a new task
PUT    /api/tasks/{id}      # Update a task
DELETE /api/tasks/{id}      # Delete a task
```

#### Request/Response Examples

**Create Task:**
```json
POST /api/tasks
{
  "description": "Complete project documentation",
  "isCompleted": false
}

Response: 201 Created
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "description": "Complete project documentation",
  "isCompleted": false
}
```

**Update Task:**
```json
PUT /api/tasks/{id}
{
  "description": "Complete project documentation",
  "isCompleted": true
}

Response: 204 No Content
```

### Frontend Features
- **Task Filtering**: View all, active, or completed tasks
- **Real-time Updates**: Instant UI updates with API synchronization
- **Error Handling**: Comprehensive error messages and loading states
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Environment Configuration**: Automatic API URL switching between development and production

### Getting Started

#### Backend Setup
```bash
cd Basic-Task-Manager/backend
dotnet restore
dotnet run
# API available at http://localhost:5000
```

#### Frontend Setup
```bash
cd Basic-Task-Manager/frontend
npm install
npm start
# App available at http://localhost:3000
```

#### Environment Configuration
The frontend uses environment variables for API configuration:
- **Development**: Uses `.env.local` → `http://localhost:5000/api/tasks`
- **Production**: Uses `.env` → `https://basic-task-manager-5e7x.onrender.com/api/tasks`

---

## 🏗️ Mini Project Manager

An advanced project management system with user authentication, project organization, task scheduling, and intelligent task prioritization.

### Features
- 🔐 **JWT Authentication**: Secure user registration and login
- 📊 **Project Management**: Create, organize, and manage multiple projects
- ✅ **Advanced Task Management**: Tasks with dependencies, due dates, and effort estimation
- 🤖 **Smart Scheduling**: AI-powered task prioritization and scheduling algorithm
- 📱 **Responsive Design**: Modern UI with smooth animations and transitions
- 🔄 **Real-time Updates**: Live data synchronization
- 🎨 **Modern UI/UX**: Clean design with interactive components
- 📈 **Performance Monitoring**: Built-in performance tracking utilities

### Technology Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, React Hooks
- **Backend**: ASP.NET Core 8.0, Entity Framework Core, SQLite
- **Authentication**: JWT Bearer tokens with secure password hashing
- **Deployment**: Docker on Render with automated CI/CD

### API Endpoints

#### Authentication
```http
POST /api/auth/register      # Register new user
POST /api/auth/login         # User login
```

#### Projects (Requires Authentication)
```http
GET    /api/projects         # Get all user projects
GET    /api/projects/{id}    # Get specific project
POST   /api/projects         # Create new project
DELETE /api/projects/{id}    # Delete project
POST   /api/projects/{id}/tasks  # Add task to project
```

#### Tasks (Requires Authentication)
```http
PUT    /api/tasks/{id}       # Update task
DELETE /api/tasks/{id}       # Delete task
```

#### Smart Scheduling
```http
POST /api/scheduler/schedule # Generate optimized task schedule
```

#### Health Monitoring
```http
GET /health                  # API health status
GET /health/liveness        # Liveness probe
GET /health/readiness       # Readiness probe
GET /health/database        # Database connectivity check
```

#### Detailed API Documentation

**User Registration:**
```json
POST /api/auth/register
{
  "username": "johndoe",
  "password": "SecurePass123"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "username": "johndoe",
    "createdAt": "2024-10-31T10:00:00Z"
  }
}
```

**Create Project:**
```json
POST /api/projects
Authorization: Bearer <token>
{
  "title": "Website Redesign",
  "description": "Complete overhaul of company website"
}

Response: 201 Created
{
  "id": 1,
  "title": "Website Redesign",
  "description": "Complete overhaul of company website",
  "createdAt": "2024-10-31T10:00:00Z",
  "tasks": []
}
```

**Add Task to Project:**
```json
POST /api/projects/1/tasks
Authorization: Bearer <token>
{
  "title": "Design mockups",
  "estimatedHours": 8,
  "dueDate": "2024-11-15",
}

Response: 201 Created
{
  "id": 1,
  "title": "Design mockups",
  "estimatedHours": 8,
  "dueDate": "2024-11-15",
  "isCompleted": false,
  "projectId": 1
}
```

**Smart Scheduling:**
```json
POST /api/scheduler/schedule
Authorization: Bearer <token>
{
  "projectId": 1,
  "tasks": [
    {
      "title": "Research phase",
      "estimatedHours": 16,
      "dueDate": "2024-11-10",
      "dependencies": []
    },
    {
      "title": "Design mockups",
      "estimatedHours": 8,
      "dueDate": "2024-11-15",
      "dependencies": ["Research phase"]
    }
  ]
}

Response: 200 OK
{
  "recommendedOrder": ["Research phase", "Design mockups"],
  "estimatedCompletion": "2024-11-16T17:00:00Z",
  "priorityReasons": {
    "Research phase": "High urgency due to upcoming deadline and dependency requirements",
    "Design mockups": "Medium priority, depends on research completion"
  }
}
```

### Frontend Features

#### Authentication System
- **Secure Login/Register**: Form validation with password strength indicators
- **JWT Token Management**: Automatic token refresh and secure storage
- **Protected Routes**: Route-level authentication guards
- **User Session Management**: Persistent login state across browser sessions

#### Project Dashboard
- **Project Overview**: Visual project cards with task summaries
- **Quick Actions**: Create, edit, delete projects with confirmation modals
- **Search and Filter**: Find projects quickly with real-time search
- **Responsive Grid**: Adaptive layout for different screen sizes

#### Task Management
- **Advanced Task Forms**: Rich task creation with dependencies and scheduling
- **Drag-and-Drop**: Intuitive task reordering (planned feature)
- **Progress Tracking**: Visual progress indicators and completion statistics
- **Due Date Management**: Calendar integration with deadline tracking

#### Smart Scheduler Interface
- **Interactive Scheduling**: Visual task dependency mapping
- **Priority Visualization**: Color-coded priority indicators
- **Timeline View**: Gantt-chart style project timeline
- **Optimization Suggestions**: AI-powered scheduling recommendations

#### Performance Features
- **Optimistic Updates**: Instant UI feedback with background synchronization
- **Error Boundaries**: Graceful error handling with recovery options
- **Loading States**: Skeleton screens and progressive loading
- **Performance Monitoring**: Built-in performance tracking and optimization

### Data Models

#### User Model
```typescript
interface User {
  id: string;
  username: string;
  createdAt: string;
}
```

#### Project Model
```typescript
interface Project {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  tasks?: Task[];
}
```

#### Task Model
```typescript
interface Task {
  id: number;
  title: string;
  description?: string;
  estimatedHours?: number;
  dueDate?: string;
  isCompleted: boolean;
  dependencies: string[];
  projectId: number;
}
```

### Getting Started

#### Backend Setup
```bash
cd Mini-Project-Manager/ProjectManager.Api
dotnet restore
dotnet ef database update
dotnet run
# API available at http://localhost:5152
```

#### Frontend Setup
```bash
cd Mini-Project-Manager/client
npm install
npm run dev
# App available at http://localhost:3000
```

### Authentication Flow
1. **Registration**: Create account with username/password validation
2. **Login**: Authenticate and receive JWT token
3. **Token Storage**: Secure token storage in localStorage
4. **API Requests**: Automatic token inclusion in API calls
5. **Token Refresh**: Automatic token validation and refresh

---

## 🚀 Deployment

Both applications are deployed on Render using Docker containers with automated CI/CD pipelines.

### Deployment Architecture
- **Container Runtime**: Docker with multi-stage builds
- **Platform**: Render (free tier)
- **Database**: SQLite (Mini Project Manager), In-memory (Basic Task Manager)
- **Environment Management**: Environment-specific configurations
- **Health Monitoring**: Built-in health checks and monitoring

### Environment Configuration

#### Basic Task Manager
```yaml
# render.yaml
services:
  - type: web
    name: basic-task-manager-api
    runtime: docker
    healthCheckPath: /api/tasks
```

#### Mini Project Manager
```yaml
# render.yaml
services:
  - type: web
    name: projectmanager-api
    runtime: docker
    healthCheckPath: /health
    envVars:
      - key: Jwt__Key
        generateValue: true
```

---

## 🛠️ Development

### Prerequisites
- .NET 8.0 SDK
- Node.js 18+ and npm
- Docker (for containerization)
- Git

### Development Workflow
1. **Clone Repository**: `git clone <repository-url>`
2. **Install Dependencies**: Run `dotnet restore` and `npm install` in respective directories
3. **Environment Setup**: Configure `.env` files for local development
4. **Database Setup**: Run migrations for Mini Project Manager
5. **Start Development**: Run both frontend and backend in development mode

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting standards
- **Error Boundaries**: Comprehensive error handling
- **Performance Monitoring**: Built-in performance tracking

### Testing Strategy
- **Unit Tests**: Component and service testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full application workflow testing
- **Performance Tests**: Load and stress testing

---

## 📊 Key Differences

| Feature | Basic Task Manager | Mini Project Manager |
|---------|-------------------|---------------------|
| **Authentication** | None | JWT-based |
| **Data Storage** | In-memory | SQLite Database |
| **Task Organization** | Flat list | Project-based hierarchy |
| **Task Features** | Basic CRUD | Dependencies, scheduling, estimation |
| **UI Framework** | React + Tailwind | Next.js + Tailwind |
| **API Complexity** | Simple REST | Advanced REST with auth |
| **Deployment** | Docker on Render | Docker on Render |

---


### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure responsive design compatibility
- Follow established code formatting standards

---

## 📝 License

This project is part of the Pathlock On-Campus Assignment and is intended for educational and evaluation purposes.

---

## 🔗 Additional Resources

- [ASP.NET Core Documentation](https://docs.microsoft.com/en-us/aspnet/core/)
- [React Documentation](https://reactjs.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Render Deployment Guide](https://render.com/docs)

---

## 📞 Support

For questions or issues related to this assignment, please refer to the individual project documentation or create an issue in the repository.
