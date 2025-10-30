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
            try
            {
                // Use the enhanced priority-based scheduling algorithm
                var prioritizedTasks = SchedulerAlgorithm.ScheduleTasksWithPriority(dto.Tasks, DateTime.Now);

                // Extract the recommended order based on priority scores
                var recommendedOrder = prioritizedTasks.Select(t => t.Task.Title).ToList();

                // Calculate estimated completion date
                var totalHours = dto.Tasks.Sum(t => t.EstimatedHours);
                var estimatedCompletion = DateTime.Now.AddDays(Math.Ceiling(totalHours / 8.0)); // Assume 8 hours per day

                return Ok(new
                {
                    recommendedOrder = recommendedOrder,
                    estimatedCompletion = estimatedCompletion,
                    taskPriorities = prioritizedTasks.Select(t => new
                    {
                        title = t.Task.Title,
                        priorityScore = t.PriorityScore,
                        urgencyScore = t.UrgencyScore,
                        effortScore = t.EffortScore,
                        dependencyScore = t.DependencyScore,
                        dependencyLevel = t.DependencyLevel,
                        priorityReason = t.PriorityReason,
                        earliestStartDate = t.EarliestStartDate
                    }).ToList()
                });
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("Circular dependency"))
            {
                return BadRequest(new { error = "Circular dependency detected in task dependencies" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while generating the schedule", details = ex.Message });
            }
        }


    }
}
