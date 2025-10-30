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
    [Route("api/tasks")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;
        public TasksController(AppDbContext context)
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
        /// Updates an existing task for the authenticated user
        /// </summary>
        /// <param name="taskId">The unique identifier of the task to update</param>
        /// <param name="dto">Updated task data including title, due date, and completion status</param>
        /// <returns>The updated task</returns>
        /// <response code="200">Task updated successfully</response>
        /// <response code="400">Invalid task data, database error, or task validation failure</response>
        /// <response code="401">User not authenticated</response>
        /// <response code="404">Task not found or user doesn't have access</response>
        /// <response code="500">Internal server error</response>
        [HttpPut("{taskId}")]
        [ProducesResponseType(typeof(TaskItem), 200)]
        [ProducesResponseType(typeof(ErrorResponse), 400)]
        [ProducesResponseType(typeof(ErrorResponse), 401)]
        [ProducesResponseType(typeof(ErrorResponse), 404)]
        [ProducesResponseType(typeof(ErrorResponse), 500)]
        public async Task<IActionResult> UpdateTask(int taskId, TaskDto dto)
        {
            try
            {
                var userId = GetUserId();
                var task = await _context.Tasks
                    .Include(t => t.Project)
                    .FirstOrDefaultAsync(t => t.Id == taskId && t.Project != null && t.Project.UserId == userId);
                
                if (task == null) 
                    throw new NotFoundException($"Task with ID {taskId} not found");
                
                if (task.Project == null)
                    throw new ValidationException("Task is not associated with a valid project");

                task.Title = dto.Title;
                task.DueDate = dto.DueDate;
                task.IsCompleted = dto.IsCompleted;
                await _context.SaveChangesAsync();
                return Ok(task);
            }
            catch (DbUpdateException ex)
            {
                throw new BadRequestException("Failed to update task. Please try again.");
            }
        }

        /// <summary>
        /// Deletes a specific task for the authenticated user
        /// </summary>
        /// <param name="taskId">The unique identifier of the task to delete</param>
        /// <returns>No content on successful deletion</returns>
        /// <response code="204">Task deleted successfully</response>
        /// <response code="400">Database error during deletion or task validation failure</response>
        /// <response code="401">User not authenticated</response>
        /// <response code="404">Task not found or user doesn't have access</response>
        /// <response code="500">Internal server error</response>
        [HttpDelete("{taskId}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(typeof(ErrorResponse), 400)]
        [ProducesResponseType(typeof(ErrorResponse), 401)]
        [ProducesResponseType(typeof(ErrorResponse), 404)]
        [ProducesResponseType(typeof(ErrorResponse), 500)]
        public async Task<IActionResult> DeleteTask(int taskId)
        {
            try
            {
                var userId = GetUserId();
                var task = await _context.Tasks
                    .Include(t => t.Project)
                    .FirstOrDefaultAsync(t => t.Id == taskId && t.Project != null && t.Project.UserId == userId);
                
                if (task == null) 
                    throw new NotFoundException($"Task with ID {taskId} not found");
                
                if (task.Project == null)
                    throw new ValidationException("Task is not associated with a valid project");

                _context.Tasks.Remove(task);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                throw new BadRequestException("Failed to delete task. Please try again.");
            }
        }
    }
}
