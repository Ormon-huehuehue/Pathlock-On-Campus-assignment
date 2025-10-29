using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjectManager.Api.DTOs;

namespace ProjectManager.Api.Controllers
{
    [ApiController]
    [Route("api/v1/projects/{projectId}/schedule")]
    [Authorize]
    public class SchedulerController : ControllerBase
    {
        [HttpPost]
        public IActionResult Schedule(int projectId, ScheduleRequestDto dto)
        {
            var order = TopologicalSort(dto.Tasks);
            return Ok(new { recommendedOrder = order });
        }

        private List<string> TopologicalSort(List<ScheduleTaskDto> tasks)
        {
            var result = new List<string>();
            var visited = new HashSet<string>();
            var visiting = new HashSet<string>();
            var taskDict = tasks.ToDictionary(t => t.Title);

            // Helper: compare two tasks by due date, then estimated hours
            int CompareTasks(string a, string b)
            {
                var ta = taskDict[a];
                var tb = taskDict[b];
                if (ta.DueDate.HasValue && tb.DueDate.HasValue)
                {
                    int cmp = ta.DueDate.Value.CompareTo(tb.DueDate.Value);
                    if (cmp != 0) return cmp;
                }
                else if (ta.DueDate.HasValue) return -1;
                else if (tb.DueDate.HasValue) return 1;
                // If due dates are equal or missing, compare estimated hours
                return ta.EstimatedHours.CompareTo(tb.EstimatedHours);
            }

            bool Visit(string title)
            {
                if (visited.Contains(title)) return true;
                if (visiting.Contains(title)) return false; // cycle
                visiting.Add(title);
                // Sort dependencies before visiting
                var deps = taskDict[title].Dependencies
                    .Where(dep => taskDict.ContainsKey(dep))
                    .OrderBy(dep => dep, Comparer<string>.Create(CompareTasks))
                    .ToList();
                foreach (var dep in deps)
                {
                    if (!Visit(dep))
                        return false;
                }
                visiting.Remove(title);
                visited.Add(title);
                result.Add(title);
                return true;
            }

            // Sort tasks with no dependencies first by due date/estimated hours
            var sortedTasks = tasks.OrderBy(t => t.DueDate ?? DateTime.MaxValue)
                                   .ThenBy(t => t.EstimatedHours)
                                   .ToList();
            foreach (var task in sortedTasks)
            {
                if (!Visit(task.Title))
                    throw new Exception("Cyclic dependency detected");
            }
            // After topological sort, sort by due date and estimated hours, preserving dependency order
            result = result
                .Select(title => taskDict[title])
                .OrderBy(t => t.DueDate ?? DateTime.MaxValue)
                .ThenBy(t => t.EstimatedHours)
                .Select(t => t.Title)
                .ToList();
            return result;
        }
    }
}
