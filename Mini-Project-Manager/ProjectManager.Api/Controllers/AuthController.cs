using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManager.Api.Data;
using ProjectManager.Api.DTOs;
using ProjectManager.Api.Models;
using ProjectManager.Api.Services;
using ProjectManager.Api.Exceptions;
using System.Security.Cryptography;
using System.Text;

namespace ProjectManager.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ITokenService _tokenService;
        public AuthController(AppDbContext context, ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        /// <summary>
        /// Registers a new user account
        /// </summary>
        /// <param name="dto">User registration data including username and password</param>
        /// <returns>JWT token for the newly created user</returns>
        /// <response code="200">User registered successfully, returns JWT token</response>
        /// <response code="400">Invalid registration data or username already exists</response>
        /// <response code="500">Internal server error during registration</response>
        [HttpPost("register")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(typeof(ErrorResponse), 400)]
        [ProducesResponseType(typeof(ErrorResponse), 500)]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            try
            {
                if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
                    throw new BadRequestException("Username already exists");

                using var hmac = new HMACSHA512();
                var user = new User
                {
                    Username = dto.Username,
                    PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password)),
                    PasswordSalt = hmac.Key
                };
                
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                
                var token = _tokenService.CreateToken(user);
                return Ok(new { token });
            }
            catch (DbUpdateException ex)
            {
                throw new BadRequestException("Failed to create user account. Please try again.");
            }
            catch (Exception ex) when (ex.Message.Contains("token"))
            {
                throw new BadRequestException("Failed to generate authentication token. Please try again.");
            }
        }

        /// <summary>
        /// Authenticates a user and returns a JWT token
        /// </summary>
        /// <param name="dto">User login credentials including username and password</param>
        /// <returns>JWT token for authenticated user</returns>
        /// <response code="200">User authenticated successfully, returns JWT token</response>
        /// <response code="401">Invalid username or password</response>
        /// <response code="400">Database error or token generation failure</response>
        /// <response code="500">Internal server error during authentication</response>
        [HttpPost("login")]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(typeof(ErrorResponse), 400)]
        [ProducesResponseType(typeof(ErrorResponse), 401)]
        [ProducesResponseType(typeof(ErrorResponse), 500)]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            try
            {
                var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == dto.Username);
                if (user == null) 
                    throw new UnauthorizedException("Invalid credentials");

                using var hmac = new HMACSHA512(user.PasswordSalt);
                var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dto.Password));
                if (!computedHash.SequenceEqual(user.PasswordHash))
                    throw new UnauthorizedException("Invalid credentials");

                var token = _tokenService.CreateToken(user);
                
                return Ok(new { token, user = new{ user.Username} });
            }
            catch (DbUpdateException ex)
            {
                throw new BadRequestException("Database error occurred during login. Please try again.");
            }
            catch (Exception ex) when (ex.Message.Contains("token"))
            {
                throw new BadRequestException("Failed to generate authentication token. Please try again.");
            }
        }
    }
}
