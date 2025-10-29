namespace TaskManager.Models
{
    public class TaskItem
    {
    public Guid Id { get; set; }
        public string Description { get; set; }
        public bool IsCompleted { get; set; }
    }
}