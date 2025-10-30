using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace ProjectManager.Api.DTOs
{
    public class ScheduleTaskDto
    {
        [Required(ErrorMessage = "Task title is required")]
        [StringLength(200, MinimumLength = 1, ErrorMessage = "Task title must be between 1 and 200 characters")]
        public required string Title { get; set; }
        
        [Range(1, 168, ErrorMessage = "Estimated hours must be between 1 and 168 (1 week)")]
        public int EstimatedHours { get; set; }
        
        public DateTime? DueDate { get; set; }
        
        public List<string> Dependencies { get; set; } = new();
    }

    public class ScheduleRequestDto
    {
        [Required(ErrorMessage = "Tasks list is required")]
        [MinLength(1, ErrorMessage = "At least one task is required")]
        public required List<ScheduleTaskDto> Tasks { get; set; }
    }

    public class ScheduleResponseDto
    {
        public required List<string> RecommendedOrder { get; set; }
    }
}
