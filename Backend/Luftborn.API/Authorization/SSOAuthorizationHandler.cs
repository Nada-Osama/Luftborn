using Microsoft.AspNetCore.Authorization;

namespace Luftborn.API.Authorization;

/// <summary>
/// Makes SSO a toggle instead of all or nothing decision baked into
/// [Authorize] attributes: 
/// With SSO:Enabled=false (the default, so the app runs and is reviewable with no IdP set up) every request passes.
/// Flip it to true once an IdP is configured and every request needs a valid access token, no code changes needed on either side.
/// </summary>
public class SSOAuthorizationHandler : AuthorizationHandler<SSORequirement>
{
    private readonly IConfiguration _configuration;

    public SSOAuthorizationHandler(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, SSORequirement requirement)
    {
        var ssoEnabled = _configuration.GetValue<bool>("SSO:Enabled");
        if (!ssoEnabled || context.User.Identity?.IsAuthenticated == true)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
