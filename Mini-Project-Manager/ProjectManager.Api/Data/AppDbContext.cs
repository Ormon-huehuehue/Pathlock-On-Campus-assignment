using Microsoft.EntityFrameworkCore;

namespace ProjectManager.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<ProjectManager.Api.Models.User> Users { get; set; }
    public DbSet<ProjectManager.Api.Models.Project> Projects { get; set; }
    public DbSet<ProjectManager.Api.Models.TaskItem> Tasks { get; set; }
    }
}
