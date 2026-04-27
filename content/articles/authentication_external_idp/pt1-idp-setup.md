---
title: 'Part 1: External Identity Provider Setup'
position: 2
---

Before implementing server-side architecture, it is essential to understand the underlying mechanics of the OAuth 2.0 Authorization Code flow. This article demonstrates how to configure an Identity Provider and highlights the inherent security limitations of client-side authentication.

# Setting up the Provider (Auth0)

Auth0 serves as the example provider, although the principles below apply to any OpenID Connect (OIDC)-compliant system.

- Application Configuration: Create a "Single Page Web Application" within the IdP dashboard.
- Callback URL: Set the Allowed Callback URL to `https://oauth.pstmn.io/v1/callback` to facilitate testing via Postman.
- API Definition: Navigate to the APIs section and define a new API. This establishes an Audience (e.g. `https://localhost:5001`), identifying the resource protected by the token.
- Authorization: Ensure the application is granted permission to request access tokens for the defined API.

# Testing the Flow with Postman

Postman provides an environment for simulating the browser-based OAuth 2.0 handshake. To begin, retrieve the metadata from the IdP discovery endpoint:

```bash
GET https://{{auth0_domain}}/.well-known/openid-configuration
```

From the response, extract the `authorization_endpoint` and `token_endpoint`.

Before configuring authentication, attempt to access the protected user information endpoint directly to confirm the lack of authorization:

```bash
GET https://{{auth0_domain}}/userinfo
```

This request will return a `401 Unauthorized status`, confirming the endpoint is properly protected.

To obtain a valid JWT, configure the authentication process within Postman. Navigate to the Authorization tab of your request and apply the following configuration:

| **Field**                 | **Value**                                           |
| ------------------------- | --------------------------------------------------- |
| Auth Type                 | OAuth 2.0                                           |
| Add authorization data to | Request headers                                     |
| Grant Type                | Authorization Code (With PKCE)                      |
| Callback URL              | https://oauth.pstmn.io/v1/callback                  |
| Authorize using browser   | Checked                                             |
| Auth URL                  | The authorization_endpoint from your discovery GET  |
| Access Token URL          | The token_endpoint from your discovery GET          |
| Client ID                 | Found in your Auth0 Application Settings            |
| Client Secret             | Found in your Auth0 Application Settings            |
| Code Challenge Method     | SHA-256                                             |
| Scope                     | openid                                              |
| Audience                  | "The API Identifier (e.g., https://localhost:5001)" |

Click **"Get New Access Token"** to initiate the browser-based login flow. Upon successful authentication, Postman will capture the JWT, which can then be used to perform authorized requests to the `/userinfo` endpoint.

<details>
<summary>PCKE</summary>
TEST
</details>

# Inspecting the Token and Fetching UserInfo

The Access Token can be inspected via [jwt.io](https://jwt.io) to analyze the payload. A standard payload appears as follows:

```json
{
  "iss": "https://your-tenant.auth0.com/",
  "sub": "auth0|69eb8c721d4731384e6986df",
  "aud": ["https://localhost:5001", "https://your-tenant.auth0.com/userinfo"],
  "iat": 1777306957,
  "exp": 1777393357,
  "scope": "openid",
  "azp": "qXSWzTdQUzQ85t7VAL215FR2dnEc6bYG"
}
```

## The Impact of Scopes

The retrieved token contains only the claims explicitly requested during the handshake. If a GET request is performed to the UserInfo endpoint using this token, the response is minimal:

```json
{
  "sub": "auth0|111111111111111111111111"
}
```

By updating the Scope field in the Postman configuration to `openid profile email offline_access` and re-generating the token, the `UserInfo` response becomes significantly more descriptive:

```json
{
  "sub": "auth0|111111111111111111111111",
  "nickname": "etiennelabs",
  "name": "jelle@etiennelabs",
  "picture": "https://s.gravatar.com/...",
  "updated_at": "2026-04-27T15:13:23.224Z",
  "email": "jelle@etiennelabs",
  "email_verified": false
}
```

This granular control demonstrates the power of OIDC, but it also reveals a significant architectural risk.

# The Architectural Trap: Why "Public Clients" Can't Keep Secrets

The preceding testing required the use of a Client Secret. In the context of a Single Page Application (SPA) or mobile app, this creates a critical security vulnerability.

In OAuth 2.0 terminology, browsers and mobile applications are classified as "Public Clients." By definition, a public client is incapable of maintaining the confidentiality of a secret.

## Why is it unsafe?

1. **Source Code Visibility:** Frontend code (HTML, CSS, JavaScript) is effectively public. Any credentials embedded within this code are accessible to any user via browser developer tools or "View Source."
2. **Network Interception:** Even with obfuscation, network traffic is visible. An attacker can inspect the "Network" tab in the browser to identify request headers and payloads sent to the IdP, allowing the extraction of secrets and the simulation of the authentication handshake.
3. **Impersonation:** Once a Client ID and Secret are compromised, an attacker can programmatically generate tokens on behalf of the application, bypassing all intended security controls.

As noted by standards such as **OWASP** and the **IETF OAuth 2.1** specification, relying on client-side secret storage is prohibited.

> "An SPA is deemed a public client since it cannot hold a secret. Such a secret would be part of the JavaScript loaded by the website and, thus, be accessible to anyone inspecting the source code." — [Best Practices: OAuth for Single Page Applications](https://curity.io/resources/learn/spa-best-practices/)

Storing sensitive credentials on the client side converts a secure system into an open book. Authentication logic cannot rely on the client to handle secrets; this responsibility must be offloaded to a secure, server-side environment.

# The Path Forward: The BFF Pattern

The testing phase confirms that the authentication flow is functional, but it also demonstrates that the current implementation is unsuitable for production. The next article in this series will focus on the Backend for Frontend (BFF) pattern. By shifting secret management and token handling to a protected server-side component, the application can remain secure, using encrypted cookies to facilitate authentication without exposing sensitive credentials to the browser.
