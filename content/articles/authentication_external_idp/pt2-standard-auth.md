---
title: 'Part 2: Integrating Standard Authentication into .NET Applications.'
position: 3
---

In the previous part of this series, we configured Auth0 as our external Identity Provider (IdP) and successfully retrieved a JWT access token using Postman. While Postman is excellent for verifying that our IdP is configured correctly, our users won't be using a console to access our data.

In this part, we move from manual testing to a fully functional application. We are going to build the "Bridge" between our Identity Provider and our users by setting up both a protected .NET API and a React Frontend.

The goal is to create a seamless authentication flow where:

- The Back-end (.NET): Acts as a secure Resource Server, validating incoming tokens and exposing protected data.
- The Front-end (React): Handles the user's login lifecycle, stores the identity context, and securely communicates with our API.
- The Observability Layer: We will use OpenTelemetry and Jaeger to visualize the "silent handshake" that happens when our API talks to Auth0 to verify those tokens.

By the end of this chapter, you’ll have a working end-to-end system where a user can log into a browser, and your backend can verify exactly who they are—all while observing the process under the hood.

# How it works

The authentication and authorization process is based on the OAuth 2.0 Authorization Code Flow with Proof Key for Code Exchange (PKCE). This standard ensures that the exchange of credentials and tokens is secure, even in public clients like a Single-Page Application (SPA) where the source code is accessible to the user.

This flow is standard-based, meaning that once you understand this sequence, you can swap out Auth0 for Azure AD, Keycloak, or Okta, and the logic remains the same.

The following diagram illustrates the interaction between the user, the React frontend, the Identity Provider (Auth0), and the .NET API.

```mermaid
sequenceDiagram
  autonumber
  participant User as User
  participant App as React Frontend (Client)
  participant IDP as Auth0 (Identity Provider)
  participant API as .NET API (Resource Server)

  User ->> App: 1. Initiate login
  App ->> App: 2. Generate PKCE Code Verifier and Challenge
  App ->> IDP: 3. Redirect to /authorize (with Code Challenge)
  IDP ->> User: 4. Prompt for credentials
  User ->> IDP: 5. Provide credentials and consent
  IDP ->> App: 6. Redirect with Authorization Code
  App ->> IDP: 7. Exchange Code + Code Verifier for Tokens
  IDP ->> IDP: 8. Validate PKCE and Authorization Code
  IDP ->> App: 9. Return ID Token and Access Token

  App ->> API: 10. Request protected resource (with Access Token)
  Note right of API: Middleware fetches JWKS if not cached
  API ->> API: 11. Validate Token (Signature, Issuer, Audience)
  API ->> App: 12. Return protected resource
```

The process is divided into two primary stages: obtaining the identity and access tokens, followed by the authorization of requests to the backend.

## 1. The Authentication Process (Steps 1–9)

This stage utilizes the Authorization Code Flow with PKCE. Unlike the implicit flow, this approach does not return tokens directly in the URL fragment, which significantly reduces the risk of token leakage.

- **PKCE (Proof Key for Code Exchange):** In Step 2, the client generates a cryptographically random code_verifier and its transformed version, the code_challenge. The challenge is sent during the initial authorization request.
- **Authorization Code:** After successful authentication (Step 5), the Identity Provider returns a short-lived authorization code. This code is useless on its own.
- **Token Exchange:** In Step 7, the client exchanges the authorization code and the original code_verifier for the tokens. The IDP validates that the verifier matches the challenge sent in Step 3. This ensures that the client requesting the tokens is the same one that initiated the login.
- **Token Types:** The client receives an ID Token (containing user profile information) and an Access Token (a JWT intended for the API).

## 2. Resource Authorization (Steps 10–12)

Once the client has an Access Token, it can interact with the protected API.

- **Bearer Token:** The client includes the Access Token in the Authorization header using the Bearer scheme for every request to a protected endpoint.
- Token Validation: The .NET API acts as a Resource Server. It does not need to communicate with Auth0 for every request. Instead, it validates the JWT locally.
- **Discovery and JWKS:** To perform local validation, the API must know the IDP's public keys. Upon the first request (or at startup), the .NET middleware calls the OIDC Discovery Endpoint of the IDP to download the JSON Web Key Set (JWKS).
- Validation Criteria: The middleware ensures the token is mathematically valid (`signature`), has not expired (`exp`), was issued by the expected domain (`iss`), and was intended for this specific API (`aud`).

Once validated, the middleware populates the `ClaimsPrincipal`, allowing your application logic to access the user's unique identifier and permissions.

# Implementation

Now that we understand the flow of tokens and the "silent handshake" between our API and the Identity Provider, it is time to put it into practice. We will build this in two stages: first, the back-end, where we configure .NET to protect our resources, and second, the front-end, where we build the user interface to handle the login process.

To make the "invisible" parts of authentication visible, we will also integrate OpenTelemetry. This will allow us to use Jaeger to watch our API as it communicates with Auth0 to fetch security keys, giving us a transparent look at the lifecycle of an authenticated request.

## Back-end

Our .NET API's primary job is to be skeptical. It needs to receive a token, verify it hasn't been tampered with, and ensure it was issued specifically for this application. We will achieve this using the `Microsoft.AspNetCore.Authentication.JwtBearer` package.

### Basic setup

In the `Program.cs` below, we configure the authentication schemes and set up `OpenTelemetry` to export traces to Jaeger via the OTLP protocol.

```cs
using Authentication.Api.Endpoints;
using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://{builder.Configuration["Auth0:Domain"]}/";
        options.Audience = builder.Configuration["Auth0:Audience"];
    });

builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource.AddService("Authentication.Api"))
    .WithTracing(tracing =>
    {
        tracing
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation();

        tracing.AddOtlpExporter();
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers();

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app
    .MapGroup("api/")
    .MapAuthenticationEndpoints();

app.Run();
```

<details>
<summary>`AddJwtBearer` setup</summary>
Note that you can also setup the JwtBearer-config yourself like this:

```cs
builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.MetadataAddress = builder.Configuration["Auth0:MetadataAddress"];
        options.Audience = builder.Configuration["Auth0:Audience"];
        options.TokenValidationParameters = new TokenValidationParameters()
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidIssuer = builder.Configuration["Auth0:ValidIssuer"]
        };
    });
```

However, this is not recommended for most production scenarios. By manually defining `TokenValidationParameters` and the `MetadataAddress`, you are opting out of the automatic OIDC Discovery process. The primary risk here is Key Rotation. Security best practices dictate that Identity Providers like Auth0 rotate their signing keys periodically.

When you use the Authority property (as we did in our main example), the .NET middleware automatically monitors the discovery document and updates its internal cache when keys change. If you hardcode these parameters manually, your API will fail to validate new tokens the moment Auth0 rotates its keys, leading to immediate `401 Unauthorized` errors that require a code change and redeploy to fix.

</details>

### Defining the endpoints

To keep our `Program.cs` clean, we use an extension method to map our endpoints. We have a public endpoint accessible to everyone and a private endpoint that requires a valid token, enforced by `.RequireAuthorization()`.

```cs
using System.Security.Claims;

namespace Authentication.Api.Endpoints;

public static class AuthenticationEndpoints
{
    public static IEndpointRouteBuilder MapAuthenticationEndpoints(this IEndpointRouteBuilder builder)
    {
        builder.MapGet("public", GetPublic);

        builder.MapGet("private", GetPrivate)
            .RequireAuthorization();

        return builder;
    }

    private static IResult GetPublic()
    {
        return Results.Ok(new
        {
            Message = "You have reached the public API.",
            Timestamp = DateTime.UtcNow
        });
    }

    private static IResult GetPrivate(ClaimsPrincipal user)
    {
        var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var name = user.Identity?.Name;

        return Results.Ok(new
        {
            message = "This is a protected endpoint - authentication required!",
            user = name,
            userId = userId,
            allClaims = user.Claims.Select(c => new { c.Type, c.Value }),
            timestamp = DateTime.UtcNow
        });
    }
}
```

### Running Jaeger

To visualize how .NET interacts with Auth0, we need to run Jaeger. You can start the Jaeger "all-in-one" container using Docker with the following command:

```bash
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 4317:4317 \
  jaegertracing/all-in-one:latest
```

We expose the following ports:

- Port 16686: The dashboard where you can view your traces.
- Port 4317: The gRPC receiver for OpenTelemetry data.

### Observing the "Silent Handshake"

Once the API and Jaeger are running, we can trigger the protected endpoint using the Access Token we obtained earlier:

```bash
curl --location 'https://localhost:5003/api/private' --header 'Authorization: ••••••'
```

When the very first authenticated request hits the API, the JwtBearer middleware realizes it doesn't yet have the public keys needed to verify the token's signature. As seen in the Jaeger trace below, the API automatically performs an outgoing HTTP call to Auth0's `.well-known/openid-configuration` and `jwks.json` endpoints.

<p align="center">
  <img src="/images/articles/authentication_external_idp/tracing_1.png" alt="jaeger tracing first request"/>
</p>

Because .NET caches these security keys in memory, a second request to the same endpoint looks entirely different. There is no outgoing call to Auth0; the validation happens locally and near-instantaneously.

<p align="center">
  <img src="/images/articles/authentication_external_idp/tracing_2.png" alt="jaeger tracing second request"/>
</p>

This demonstrates the efficiency of OIDC: we get the security of an external Identity Provider with the performance of local token validation.

## Front-end
