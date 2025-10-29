using Microsoft.AspNetCore.Mvc;
using TaskManager.Models;

namespace TaskManager.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
    private static List<TaskItem> tasks = new List<TaskItem>();

        [HttpGet]
        public ActionResult<IEnumerable<TaskItem>> GetAll()
        {
            return Ok(tasks);
        }

        [HttpPost]
        public ActionResult<TaskItem> Create(TaskItem task)
        {
            task.Id = Guid.NewGuid();
            tasks.Add(task);
            return CreatedAtAction(nameof(GetAll), new { id = task.Id }, task);
        }

        [HttpPut("{id}")]
        public IActionResult Update(Guid id, TaskItem updatedTask)
        {
            var task = tasks.FirstOrDefault(t => t.Id == id);
            if (task == null)
                return NotFound();
            task.Description = updatedTask.Description;
            task.IsCompleted = updatedTask.IsCompleted;
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(Guid id)
        {
            var task = tasks.FirstOrDefault(t => t.Id == id);
            if (task == null)
                return NotFound();
            tasks.Remove(task);
            return NoContent();
        }
    }
}
