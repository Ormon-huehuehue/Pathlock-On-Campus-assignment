using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using ProjectManager.Api.Models;

namespace ProjectManager.Api.Filters
{
    public class ValidationActionFilter : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (!context.ModelState.IsValid)
            {
                var validationErrors = new Dictionary<string, string[]>();
                
                foreach (var modelError in context.ModelState)
                {
                    var errors = modelError.Value.Errors.Select(e => e.ErrorMessage).ToArray();
                    if (errors.Length > 0)
                    {
                        validationErrors[modelError.Key] = errors;
                    }
                }

                var errorResponse = new ErrorResponse
                {
                    Message = "Validation failed",
                    StatusCode = 400,
                    ValidationErrors = validationErrors
                };

                context.Result = new BadRequestObjectResult(errorResponse);
            }
        }
    }
}