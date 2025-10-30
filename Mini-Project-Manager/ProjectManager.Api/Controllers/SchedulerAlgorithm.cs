using ProjectManager.Api.DTOs;

namespace ProjectManager.Api.Controllers
{
    public class TaskPriorityInfo
    {
        public required ScheduleTaskDto Task { get; set; }
        public double PriorityScore { get; set; }
        public int DependencyLevel { get; set; }
        public double UrgencyScore { get; set; }
        public double EffortScore { get; set; }
        public double DependencyScore { get; set; }
        public DateTime? EarliestStartDate { get; set; }
        public required string PriorityReason { get; set; }
    }

    public static class SchedulerAlgorithm
    {
        public static List<TaskPriorityInfo> ScheduleTasksWithPriority(
            List<ScheduleTaskDto> tasks, 
            DateTime startDate)
        {
            // All tasks from ScheduleTaskDto are considered incomplete (they're for scheduling)
            var incompleteTasks = tasks.ToList();
            
            if (incompleteTasks.Count == 0)
            {
                return new List<TaskPriorityInfo>();
            }

            // Create task lookup for dependency resolution
            var taskLookup = incompleteTasks.ToDictionary(t => t.Title, t => t);
            
            // Calculate dependency levels and earliest start dates
            var dependencyInfo = CalculateDependencyInfo(incompleteTasks, taskLookup);
            
            // Calculate priority scores for each task
            var tasksWithPriority = incompleteTasks.Select(task => 
                CalculateTaskPriority(task, startDate, dependencyInfo, taskLookup))
                .ToList();

            // Sort by priority score (higher score = higher priority)
            // Then by dependency level (lower level = can start sooner)
            // Then by due date
            return tasksWithPriority
                .OrderByDescending(x => x.PriorityScore)
                .ThenBy(x => x.DependencyLevel)
                .ThenBy(x => x.Task.DueDate ?? DateTime.MaxValue)
                .ToList();
        }

        private static Dictionary<string, (int Level, DateTime EarliestStart)> CalculateDependencyInfo(
            List<ScheduleTaskDto> tasks, 
            Dictionary<string, ScheduleTaskDto> taskLookup)
        {
            var dependencyInfo = new Dictionary<string, (int Level, DateTime EarliestStart)>();
            var visited = new HashSet<string>();
            var visiting = new HashSet<string>();

            int CalculateDependencyLevel(ScheduleTaskDto task, DateTime currentEarliest)
            {
                if (visited.Contains(task.Title))
                    return dependencyInfo[task.Title].Level;

                if (visiting.Contains(task.Title))
                    throw new InvalidOperationException($"Circular dependency detected involving task: {task.Title}");

                visiting.Add(task.Title);

                int maxDependencyLevel = 0;
                DateTime earliestStart = currentEarliest;

                // Check all dependencies
                if (task.Dependencies != null && task.Dependencies.Count > 0)
                {
                    foreach (var depTitle in task.Dependencies)
                    {
                        if (taskLookup.TryGetValue(depTitle, out var depTask))
                        {
                            var depLevel = CalculateDependencyLevel(depTask, currentEarliest);
                            maxDependencyLevel = Math.Max(maxDependencyLevel, depLevel + 1);
                            
                            // Calculate when this dependency would be finished
                            var depEarliestStart = dependencyInfo[depTitle].EarliestStart;
                            var depDuration = TimeSpan.FromHours(depTask.EstimatedHours); 
                            var depFinishDate = depEarliestStart.Add(depDuration);
                            
                            earliestStart = earliestStart > depFinishDate ? earliestStart : depFinishDate;
                        }
                    }
                }

                visiting.Remove(task.Title);
                visited.Add(task.Title);
                
                dependencyInfo[task.Title] = (maxDependencyLevel, earliestStart);
                return maxDependencyLevel;
            }

            // Calculate dependency levels for all tasks
            foreach (var task in tasks)
            {
                if (!visited.Contains(task.Title))
                {
                    CalculateDependencyLevel(task, DateTime.Now);
                }
            }

            return dependencyInfo;
        }

        private static TaskPriorityInfo CalculateTaskPriority(
            ScheduleTaskDto task, 
            DateTime startDate, 
            Dictionary<string, (int Level, DateTime EarliestStart)> dependencyInfo,
            Dictionary<string, ScheduleTaskDto> taskLookup)
        {
            var depInfo = dependencyInfo[task.Title];
            
            // Calculate individual scores (0-100 scale)
            var urgencyScore = CalculateUrgencyScore(task, startDate);
            var effortScore = CalculateEffortScore(task);
            var dependencyScore = CalculateDependencyScore(task, depInfo.Level, taskLookup);
            
            // Weighted priority calculation
            // Urgency: 50%, Dependencies: 30%, Effort: 20%
            var priorityScore = (urgencyScore * 0.5) + (dependencyScore * 0.3) + (effortScore * 0.2);
            
            var priorityReason = GeneratePriorityReason(task, urgencyScore, effortScore, dependencyScore, depInfo.Level);

            return new TaskPriorityInfo
            {
                Task = task,
                PriorityScore = Math.Round(priorityScore, 2),
                DependencyLevel = depInfo.Level,
                UrgencyScore = Math.Round(urgencyScore, 2),
                EffortScore = Math.Round(effortScore, 2),
                DependencyScore = Math.Round(dependencyScore, 2),
                EarliestStartDate = depInfo.EarliestStart,
                PriorityReason = priorityReason
            };
        }

        private static double CalculateUrgencyScore(ScheduleTaskDto task, DateTime startDate)
        {
            if (task.DueDate == null)
                return 30; // Medium-low urgency for tasks without due dates

            var daysUntilDue = (task.DueDate.Value - startDate.Date).Days;
            var estimatedDays = Math.Ceiling(task.EstimatedHours / 8.0); // Assume 8 hours per day

            // Calculate urgency based on time pressure
            if (daysUntilDue < 0)
                return 100; // Overdue - maximum urgency

            if (daysUntilDue == 0)
                return 95; // Due today

            if (daysUntilDue <= estimatedDays)
                return 90; // Not enough time - very urgent

            if (daysUntilDue <= estimatedDays * 1.5)
                return 75; // Tight deadline - high urgency

            if (daysUntilDue <= 7)
                return 60; // Due within a week - medium-high urgency

            if (daysUntilDue <= 14)
                return 40; // Due within two weeks - medium urgency

            if (daysUntilDue <= 30)
                return 25; // Due within a month - low-medium urgency

            return 10; // Due later - low urgency
        }

        private static double CalculateEffortScore(ScheduleTaskDto task)
        {
            var estimatedHours = task.EstimatedHours;

            // Shorter tasks get higher priority (easier to complete)
            // But very short tasks get slightly lower priority (might be less important)
            if (estimatedHours <= 1)
                return 70; // Quick tasks - high priority

            if (estimatedHours <= 4)
                return 80; // Short tasks - very high priority

            if (estimatedHours <= 8)
                return 75; // Half-day tasks - high priority

            if (estimatedHours <= 16)
                return 60; // 1-2 day tasks - medium-high priority

            if (estimatedHours <= 40)
                return 45; // Week-long tasks - medium priority

            return 30; // Long tasks - lower priority (break them down)
        }

        private static double CalculateDependencyScore(
            ScheduleTaskDto task, 
            int dependencyLevel, 
            Dictionary<string, ScheduleTaskDto> taskLookup)
        {
            var dependencyCount = task.Dependencies?.Count ?? 0;
            
            // Calculate how many tasks depend on this one
            var dependentCount = taskLookup.Values.Count(t => 
                t.Dependencies != null && t.Dependencies.Contains(task.Title));

            // Base score starts at 50
            var score = 50.0;

            // Tasks with no dependencies can start immediately (+20)
            if (dependencyCount == 0)
                score += 20;
            else
                // Penalize tasks with many dependencies (-5 per dependency)
                score -= Math.Min(dependencyCount * 5, 25);

            // Tasks that block others get higher priority (+10 per dependent, max +30)
            score += Math.Min(dependentCount * 10, 30);

            // Tasks at higher dependency levels get lower priority (-5 per level)
            score -= Math.Min(dependencyLevel * 5, 25);

            return Math.Max(score, 0); // Ensure non-negative
        }

        private static string GeneratePriorityReason(
            ScheduleTaskDto task, 
            double urgencyScore, 
            double effortScore, 
            double dependencyScore, 
            int dependencyLevel)
        {
            var reasons = new List<string>();

            if (urgencyScore >= 90)
                reasons.Add("Critical deadline");
            else if (urgencyScore >= 75)
                reasons.Add("Urgent deadline");
            else if (urgencyScore >= 60)
                reasons.Add("Approaching deadline");

            if (effortScore >= 75)
                reasons.Add("Quick to complete");
            else if (effortScore <= 35)
                reasons.Add("Complex task");

            if (dependencyScore >= 70)
                reasons.Add("Blocks other tasks");
            else if (dependencyScore <= 30)
                reasons.Add("Has many dependencies");

            if (dependencyLevel == 0)
                reasons.Add("Can start immediately");
            else if (dependencyLevel >= 3)
                reasons.Add("Deep dependency chain");

            return reasons.Count > 0 ? string.Join(", ", reasons) : "Standard priority";
        }

        // Legacy method for backward compatibility
        public static List<(ScheduleTaskDto Task, DateTime ScheduledDate, int Priority)> ScheduleTasks(
            List<ScheduleTaskDto> tasks, 
            DateTime startDate, 
            int availableHoursPerDay)
        {
            var prioritizedTasks = ScheduleTasksWithPriority(tasks, startDate);
            
            var result = new List<(ScheduleTaskDto Task, DateTime ScheduledDate, int Priority)>();
            var currentDate = startDate.Date;
            var hoursScheduledToday = 0;

            foreach (var taskInfo in prioritizedTasks)
            {
                var taskHours = taskInfo.Task.EstimatedHours;
                
                // Check if task fits in current day
                if (hoursScheduledToday + taskHours > availableHoursPerDay && hoursScheduledToday > 0)
                {
                    currentDate = currentDate.AddDays(1);
                    hoursScheduledToday = 0;
                }

                // Use earliest start date if it's later than current date
                var scheduledDate = taskInfo.EarliestStartDate > currentDate ? 
                    taskInfo.EarliestStartDate.Value.Date : currentDate;

                result.Add((taskInfo.Task, scheduledDate, (int)Math.Round(taskInfo.PriorityScore)));
                
                hoursScheduledToday += taskHours;
                currentDate = scheduledDate;
            }

            return result;
        }
    }
}