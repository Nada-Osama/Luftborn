A CRUD application built to the brief in `NET_Code_Test.pdf`: 
an ASP.NET Core backend in n-tier architecture (API / BLL / DAL) with a generic repository base + Unit of Work, 
code-first with EF Core Migrations against SQL Server, and an Angular frontend. 
Targets **.NET 9**, Angular 20

## Why "Products & Categories"

The test doesn't mandate a specific domain, just "basic CRUD operations"
A two-entity model (Product ↔ Category, one-to-many) was chosen deliberately
over a single flat entity because it's the smallest example that still lets
you demonstrate things a reviewer actually cares about: a foreign key
relationship, eager-loading to avoid N+1 queries, and a business rule that
spans a relationship (you can't delete a category that still has products).
A single-entity CRUD wouldn't show any of that.

## Architecture

```
Backend/
  Luftborn.API/    <- Controllers, DI wiring, Swagger, CORS, error middleware
  Luftborn.BLL/    <- DTOs, validation, business rules, mapping 
  Luftborn.DAL/    <- EF Core DbContext, entities, repositories 
Frontend/
  src/app/core/       <- models + typed HttpClient services (shared)
  src/app/components/   <- one folder per screen (products, categories)
  src/app/shared/      <- reusable UI pieces (confirm dialog)
```

## SSO

Implemented as **OpenID Connect, Authorization Code + PKCE**, with dummy configurations and
optional config Enabled & RequireHttpsMetadata are set to false so could work locally.
Angular running the interactive login redirect itself. This is the standard shape for a SPA + API pair, and 
it's the same protocol ADFS speaks once configured as an OAuth2/OIDC authorization server.

### It's a toggle, not an all-or-nothing switch

`SSO:Enabled` in `Luftborn.API/appsettings.json` defaults to **`false`**.
Flip it to `true` once an IdP is configured and every `Products`/`Categories` request needs a valid Bearer token.
This is implemented as a custom authorization policy (`Luftborn.API/Authorization/SSOAuthorizationHandler.cs`) rather
than a plain `[Authorize]`, specifically so that toggle exists.

### Backend pieces

- **`Luftborn.API/Authorization/`** — `SSOPolicy` (the policy name),
  `SSORequirement`, `SSOAuthorizationHandler` (succeeds automatically when `SSO:Enabled` is `false`; otherwise requires `User.Identity.IsAuthenticated`).
- **`Program.cs`** — registers `AddJwtBearer` (validates tokens against `Authority`'s discovery document + `Audience`) and the policy above;
  `ProductsController`/`CategoriesController` are decorated with `[Authorize(Policy = SSOPolicy.Name)]`.
- **`AuthController`** — `GET /api/Auth/Config` (anonymous; returns `{ enabled, authority, clientId }` 
  so the Angular app has one source of truth for IdP settings instead of duplicating them into `environment.ts`), 
  and `GET /api/Auth/Me` (protected by the same policy;
  returns the caller's claims — mainly used so Angular can show who's signed in).

### Frontend pieces

No auth library was added — the whole Authorization Code + PKCE flow is hand-written (across `pkce.ts` and `auth.service.ts`), 
which felt more honest for a code test than configuring `angular-oauth2-oidc`.

## Frontend structure

```
Frontend/src/app/
  core/
    models/          <- Product, Category, PagedResult<T>, ApiResponse, Auth
    services/         <- ProductService, CategoryService, AuthService,
                         auth.interceptor, error.interceptor
    guards/           <- authGuard
    utils/            <- pkce.ts
  shared/
    components/
      header/         <- nav + sign-in/sign-out
      modal/           <- generic overlay, used by both forms
      paginator/       <- Prev/Next + page size
      search-box/      <- debounced keyword input
      confirm-dialog/  <- delete confirmation
  components/
    products/
      product-list/    <- table + pager + search + opens the modal
      product-form/     <- modal content: @Input productId, (saved)/(cancelled)
    categories/
      category-list/
      category-form/    <- extracted from what used to be inline in category-list
    auth-callback/       <- OIDC redirect landing page
  app.component.*        <- <app-header/> + <router-outlet/>
  app.config.ts           <- interceptors + provideAppInitializer(AuthService.init)
  app.routes.ts            <- products/categories (guarded), auth-callback
```
