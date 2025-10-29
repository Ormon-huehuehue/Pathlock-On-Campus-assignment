using System.ComponentModel.DataAnnotations;

namespace ProjectManager.Api.DTOs
{
    public class ProjectDto
    {
        [Required, StringLength(100, MinimumLength = 3)]
        public string Title { get; set; }
        [StringLength(500)]
        public string? Description { get; set; }
    }

    public class TaskDto
    {
        [Required]
        public string Title { get; set; }
        public DateTime? DueDate { get; set; }
        public bool IsCompleted { get; set; }
    }
}
