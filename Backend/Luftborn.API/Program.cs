using Luftborn.API.Authorization;
using Luftborn.API.Middleware;
using Luftborn.BLL.Services.Contracts;
using Luftborn.BLL.Services.Services;
using Luftborn.DAL.Context;
using Luftborn.DAL.Repositories.Contracts;
using Luftborn.DAL.Repositories.Repositories;
using Luftborn.DAL.Seed;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

const string AngularClientCorsPolicy = "AngularClient";

builder.Services.AddDbContext<LuftbornDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("LuftbornDb")));
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy(AngularClientCorsPolicy, policy =>
        policy.WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? ["http://localhost:4200"])
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddTransient<IWrapperRepository, WrapperRepository>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IProductService, ProductService>();

// --- SSO (optional task) -----------------------------------------------
// SSO:Enabled defaults to false in appsettings.json, so API behaves exactly as before this feature - no IdP required to run or review the app.
// Flip it to true once an OIDC provider (ADFS, Keycloak, etc - see README) is configured;
// every Products/Categories request then needs a valid Bearer access token.
var ssoSection = builder.Configuration.GetSection("SSO");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = ssoSection["Authority"]; // OpenId Connect
        options.Audience = ssoSection["Audience"];
        options.RequireHttpsMetadata = ssoSection.GetValue("RequireHttpsMetadata", true); // Set false to bypass HTTPS check on development locally
    });

builder.Services.AddSingleton<IAuthorizationHandler, SSOAuthorizationHandler>();
builder.Services.AddAuthorization(options =>
    options.AddPolicy(SSOPolicy.Name, policy => policy.Requirements.Add(new SSORequirement())));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<LuftbornDbContext>();
    await dbContext.Database.MigrateAsync();
    await DataSeeder.SeedAsync(dbContext);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseHttpsRedirection();
app.UseCors(AngularClientCorsPolicy);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
