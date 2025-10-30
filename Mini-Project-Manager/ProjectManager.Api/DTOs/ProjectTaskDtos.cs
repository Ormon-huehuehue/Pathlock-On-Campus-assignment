using System.ComponentModel.DataAnnotations;

namespace ProjectManager.Api.DTOs
{
    public class ProjectDto
    {
        [Required(ErrorMessage = "Project title is required")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Project title must be between 3 and 100 characters")]
        public required string Title { get; set; }
        
        [StringLength(500, ErrorMessage = "Project description cannot exceed 500 characters")]
        public string? Description { get; set; }
    }

    public class TaskDto
    {
        [Required(ErrorMessage = "Task title is required")]
        [StringLength(200, MinimumLength = 1, ErrorMessage = "Task title must be between 1 and 200 characters")]
        public required string Title { get; set; }
        
        public DateOnly? DueDate { get; set; }
        
        public bool IsCompleted { get; set; }
    }
}
