using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace ProjectManager.Api.DTOs
{
    public class ScheduleTaskDto
    {
        [Required]
        public string Title { get; set; }
        public int EstimatedHours { get; set; }
        public DateTime? DueDate { get; set; }
        public List<string> Dependencies { get; set; } = new();
    }

    public class ScheduleRequestDto
    {
        [Required]
        public List<ScheduleTaskDto> Tasks { get; set; }
    }

    public class ScheduleResponseDto
    {
        public List<string> RecommendedOrder { get; set; }
    }
}
