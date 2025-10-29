using System.ComponentModel.DataAnnotations;

namespace ProjectManager.Api.DTOs
{
    public class RegisterDto
    {
    [Required, StringLength(100)]
    public string Username { get; set; }

    [Required, StringLength(100, MinimumLength = 8)]
    [RegularExpression(@"^(?=.*[A-Z])(?=.*\d).{8,}$", ErrorMessage = "Password must be at least 8 characters, contain 1 uppercase letter and 1 number.")]
    public string Password { get; set; }
    }

    public class LoginDto
    {
    [Required, StringLength(100)]
    public string Username { get; set; }

    [Required, StringLength(100, MinimumLength = 8)]
    [RegularExpression(@"^(?=.*[A-Z])(?=.*\d).{8,}$", ErrorMessage = "Password must be at least 8 characters, contain 1 uppercase letter and 1 number.")]
    public string Password { get; set; }
    }
}
