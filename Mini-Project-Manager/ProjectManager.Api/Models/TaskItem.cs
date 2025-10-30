using System;
using System.ComponentModel.DataAnnotations;

namespace ProjectManager.Api.Models
{
    public class TaskItem
    {
        public int Id { get; set; }

        [Required]
        public required string Title { get; set; }

        public DateOnly? DueDate { get; set; }

        public bool IsCompleted { get; set; } = false;

        public int ProjectId { get; set; }
        public Project? Project { get; set; }
    }
}
