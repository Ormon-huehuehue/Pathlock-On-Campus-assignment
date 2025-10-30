using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManager.Api.Data;
using ProjectManager.Api.DTOs;
using ProjectManager.Api.Models;
using ProjectManager.Api.Exceptions;
using System.Security.Claims;

namespace ProjectManager.Api.Controllers
{
    [ApiController]
    [Route("api/projects")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ProjectsController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            try
            {
                var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdClaim))
                    throw new UnauthorizedException("User ID not found in claims");

                if (!int.TryParse(userIdClaim, out int userId))
                    throw new BadRequestException("Invalid user ID format");

                return userId;
            }
            catch (Exception ex) when (!(ex is UnauthorizedException || ex is BadRequestException))
            {
                throw new UnauthorizedException("Failed to retrieve user information");
            }
        }

        /// <summary>
        /// Retrieves all projects for the authenticated user
        /// </summary>
        /// <returns>List of projects with their associated tasks</returns>
        /// <response code="200">Projects retrieved successfully</response>
        /// <response code="401">User not authenticated</response>
        /// <response code="400">Database error or invalid user ID</response>
        /// <response code="500">Internal server error</response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Project>), 200)]
        [ProducesResponseType(typeof(ErrorResponse), 400)]
        [ProducesResponseType(typeof(ErrorResponse), 401)]
        [ProducesResponseType(typeof(ErrorResponse), 500)]
        public async Task<IActionResult> GetProjects()
        {
            try
            {
                var userId = GetUserId();
                var projects = await _context.Projects
                    .Where(p => p.UserId == userId)
                    .Include(p => p.Tasks)
                    .ToListAsync();
                return Ok(projects);
            }
            catch (DbUpdateException ex)
            {
                throw new BadRequestException("Database error occurred while retrieving projects");
            }
        }

        /// <summary>
        /// Retrieves a specific project by ID for the authenticated user
        /// </summary>
        /// <param name="id">The unique identifier of the project</param>
        /// <returns>Project details with associated tasks</returns>
        /// <response code="200">Project retrieved successfully</response>
        /// <response code="401">User not authenticated</response>
        /// <response code="404">Project not found or user doesn't have access</response>
        /// <response code="400">Database error or invalid user ID</response>
        /// <response code="500">Internal server error</response>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Project), 200)]
        [ProducesResponseType(typeof(ErrorResponse), 400)]
        [ProducesResponseType(typeof(ErrorResponse), 401)]
        [ProducesResponseType(typeof(ErrorResponse), 404)]
        [ProducesResponseType(typeof(ErrorResponse), 500)]
        public async Task<IActionResult> GetProject(int id)
        {
            try
            {
                var userId = GetUserId();
                var project = await _context.Projects
                    .Include(p => p.Tasks)
                    .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
                if (project == null) 
                    throw new NotFoundException($"Project with ID {id} not found");
                return Ok(project);
            }
            catch (DbUpdateException ex)
            {
                throw new BadRequestException("Database error occurred while retrieving project");
            }
        }

        /// <summary>
        /// Creates a new project for the authenticated user
        /// </summary>
        /// <param name="dto">Project creation data including title and description</param>
        /// <returns>The created project with generated ID</returns>
        /// <response code="200">Project created successfully</response>
        /// <response code="400">Invalid project data or database error</response>
        /// <response code="401">User not authenticated</response>
        /// <response code="500">Internal server error</response>
        [HttpPost]
        [ProducesResponseType(typeof(Project), 200)]
        [ProducesResponseType(typeof(ErrorResponse), 400)]
        [ProducesResponseType(typeof(ErrorResponse), 401)]
        [ProducesResponseType(typeof(ErrorResponse), 500)]
        public async Task<IActionResult> CreateProject(ProjectDto dto)
        {
            try
            {
                var userId = GetUserId();
                var project = new Project
                {
                    Title = dto.Title,
                    Description = dto.Description,
                    UserId = userId
                };
                _context.Projects.Add(project);
                await _context.SaveChangesAsync();
                return Ok(project);
            }
            catch (DbUpdateException ex)
            {
                throw new BadRequestException("Failed to create project. Please try again.");
            }
        }

        /// <summary>
        /// Deletes a specific project for the authenticated user
        /// </summary>
        /// <param name="id">The unique identifier of the project to delete</param>
        /// <returns>No content on successful deletion</returns>
        /// <response code="204">Project deleted successfully</response>
        /// <response code="401">User not authenticated</response>
        /// <response code="404">Project not found or user doesn't have access</response>
        /// <response code="400">Database error during deletion</response>
        /// <response code="500">Internal server error</response>
        [HttpDelete("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(typeof(ErrorResponse), 400)]
        [ProducesResponseType(typeof(ErrorResponse), 401)]
        [ProducesResponseType(typeof(ErrorResponse), 404)]
        [ProducesResponseType(typeof(ErrorResponse), 500)]
        public async Task<IActionResult> DeleteProject(int id)
        {
            try
            {
                var userId = GetUserId();
                var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
                if (project == null) 
                    throw new NotFoundException($"Project with ID {id} not found");
                _context.Projects.Remove(project);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                throw new BadRequestException("Failed to delete project. Please try again.");
            }
        }

        /// <summary>
        /// Adds a new task to a specific project
        /// </summary>
        /// <param name="projectId">The unique identifier of the project</param>
        /// <param name="dto">Task creation data including title, due date, and completion status</param>
        /// <returns>The created task with generated ID</returns>
        /// <response code="200">Task added to project successfully</response>
        /// <response code="400">Invalid task data or database error</response>
        /// <response code="401">User not authenticated</response>
        /// <response code="404">Project not found or user doesn't have access</response>
        /// <response code="500">Internal server error</response>
        [HttpPost("{projectId}/tasks")]
        [ProducesResponseType(typeof(TaskItem), 200)]
        [ProducesResponseType(typeof(ErrorResponse), 400)]
        [ProducesResponseType(typeof(ErrorResponse), 401)]
        [ProducesResponseType(typeof(ErrorResponse), 404)]
        [ProducesResponseType(typeof(ErrorResponse), 500)]
        public async Task<IActionResult> AddTask(int projectId, TaskDto dto)
        {
            try
            {
                var userId = GetUserId();
                var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == projectId && p.UserId == userId);
                if (project == null) 
                    throw new NotFoundException($"Project with ID {projectId} not found");
                
                var task = new TaskItem
                {
                    Title = dto.Title,
                    DueDate = dto.DueDate,
                    IsCompleted = dto.IsCompleted,
                    ProjectId = projectId
                };
                _context.Tasks.Add(task);
                await _context.SaveChangesAsync();
                return Ok(task);
            }
            catch (DbUpdateException ex)
            {
                throw new BadRequestException("Failed to add task to project. Please try again.");
            }
        }
    }
}
