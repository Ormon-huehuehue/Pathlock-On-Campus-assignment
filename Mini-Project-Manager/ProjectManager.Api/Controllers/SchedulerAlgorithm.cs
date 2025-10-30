// using MiniProjectManager.API.Models.Entities;

// namespace MiniProjectManager.API.Helpers
// {
//     public static class SchedulerAlgorithm
//     {
//         public static List<(ProjectTask Task, DateTime ScheduledDate, int Priority)> ScheduleTasks(
//             List<ProjectTask> tasks, 
//             DateTime startDate, 
//             int availableHoursPerDay)
//         {
//             var result = new List<(ProjectTask Task, DateTime ScheduledDate, int Priority)>();
            
//             // Filter only incomplete tasks
//             var incompleteTasks = tasks.Where(t => !t.IsCompleted).ToList();
            
//             if (!incompleteTasks.Any())
//             {
//                 return result;
//             }

//             // Assign priorities based on due date and creation date
//             var tasksWithPriority = incompleteTasks.Select(task => new
//             {
//                 Task = task,
//                 Priority = CalculatePriority(task, startDate)
//             })
//             .OrderBy(x => x.Priority)
//             .ThenBy(x => x.Task.DueDate ?? DateTime.MaxValue)
//             .ThenBy(x => x.Task.CreatedAt)
//             .ToList();

//             // Schedule tasks day by day
//             DateTime currentDate = startDate.Date;
//             int tasksPerDay = Math.Max(1, availableHoursPerDay / 2); // Assume 2 hours per task average
//             int tasksScheduledToday = 0;

//             foreach (var item in tasksWithPriority)
//             {
//                 if (tasksScheduledToday >= tasksPerDay)
//                 {
//                     currentDate = currentDate.AddDays(1);
//                     tasksScheduledToday = 0;
//                 }

//                 result.Add((item.Task, currentDate, item.Priority));
//                 tasksScheduledToday++;
//             }

//             return result;
//         }

//         private static int CalculatePriority(ProjectTask task, DateTime startDate)
//         {
//             // Priority calculation:
//             // 1 = High priority (overdue or due soon)
//             // 2 = Medium priority (due within a week)
//             // 3 = Low priority (due later or no due date)

//             if (task.DueDate == null)
//             {
//                 return 3; // Low priority if no due date
//             }

//             var daysUntilDue = (task.DueDate.Value.Date - startDate.Date).Days;

//             if (daysUntilDue < 0)
//             {
//                 return 1; // Overdue - highest priority
//             }
//             else if (daysUntilDue <= 3)
//             {
//                 return 1; // Due within 3 days - high priority
//             }
//             else if (daysUntilDue <= 7)
//             {
//                 return 2; // Due within a week - medium priority
//             }
//             else
//             {
//                 return 3; // Due later - low priority
//             }
//         }
//     }
// }