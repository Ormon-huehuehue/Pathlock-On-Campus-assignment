using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace ProjectManager.Api.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required, StringLength(100)]
        public string Username { get; set; }

        [Required]
        public byte[] PasswordHash { get; set; }

        [Required]
        public byte[] PasswordSalt { get; set; }

        public ICollection<Project> Projects { get; set; }
    }
}
