using Luftborn.API.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Luftborn.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public AuthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpGet("Config")]
    [AllowAnonymous]
    public IActionResult Config()
    {
        var sso = _configuration.GetSection("SSO");

        return Ok(new
        {
            enabled = sso.GetValue<bool>("Enabled"),
            authority = sso["Authority"],
            clientId = sso["SpaClientId"],
        });
    }

    // Returns the caller's identity. Useful for the frontend to confirm the token it holds is valid and to display who's signed in.
    [HttpGet("Me")]
    [Authorize(Policy = SSOPolicy.Name)]
    public IActionResult Me()
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            // SSO is disabled, so the policy let the request through anonymously.
            return Ok(new { authenticated = false, name = (string?)null });
        }

        var name = User.Identity?.Name
            ?? User.FindFirst("preferred_username")?.Value
            ?? User.FindFirst("name")?.Value
            ?? "Unknown user";

        return Ok(new
        {
            authenticated = true,
            name,
            claims = User.Claims.Select(c => new { c.Type, c.Value }),
        });
    }
}
