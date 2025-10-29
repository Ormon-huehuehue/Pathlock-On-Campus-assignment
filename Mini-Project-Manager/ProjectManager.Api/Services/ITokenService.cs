using ProjectManager.Api.Models;

namespace ProjectManager.Api.Services
{
    public interface ITokenService
    {
        string CreateToken(User user);
    }
}
