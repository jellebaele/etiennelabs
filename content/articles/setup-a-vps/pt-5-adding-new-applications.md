---
title: 'Part 5: Adding new applications'
position: 6
---

This guide outlines the standard procedure for onboarding a new service to your existing deployment pipeline. By following this workflow, you ensure that every new application remains isolated, secure, and integrated with your CI/CD automation.

# 1. Prerequisites: Dockerization

Before a project can be integrated into the pipeline, it must contain a valid `Dockerfile` in its root or a specified subdirectory. Adhering to the following containerization standards ensures compatibility with the remote runner and the production environment:

- **Multi-stage builds:** It is highly recommended to use multi-stage builds to separate the build environment from the runtime environment. This minimizes the final image size and reduces the security attack surface.
- **Non-root users:** Ensure your Dockerfile defines and switches to a non-root user before the entry point to adhere to the principle of least privilege.
- **Port Mapping:** Take note of the internal port your application listens on (e.g., 3000, 8080), as this will be required for the Cloudflare Tunnel configuration.

# 2. Standardized CI/CD Pipeline Configuration

## Add a workflow file

To automate the build and delivery process, create a `.github/workflows/deploy.yml` file. This generic configuration uses GitHub Actions to build the image, push it to the GitHub Container Registry (GHCR), and notify Dokploy to pull the update.

```yml
name: Build and Push Application

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and Push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          platforms: linux/amd64,linux/arm64
          tags: |
            ghcr.io/${{ github.repository_owner }}/myapp:latest
            ghcr.io/${{ github.repository_owner }}/myapp:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

**Note:** Replace `myapp` to your repo name.

**Implementation Details:**

- Caching: The `type=gha` cache utilizes GitHub’s native backend to store Docker layers, significantly reducing subsequent build times
- Authentication: The `GITHUB_TOKEN` is automatically scoped to the repository, removing the need for manual secret management for registry access.

## Verification of the Pipeline

Before proceeding to the Dokploy configuration, ensure the initial pipeline run completes successfully:

- **Monitor the Actions Tab:** Navigate to the "Actions" tab in your GitHub repository to track the build progress.
- **Inspect the Registry:** Confirm that the image appears under the Packages section of your GitHub profile or organization.
- **Validate Image Tags:** Ensure that both the latest tag and the specific commit-sha tag were generated and pushed correctly.

# 3. Add application in dokploy

With the image build established, the service must be registered within the Dokploy management dashboard.

1. Project Creation: Create or select a project to maintain logical grouping of services.
2. Service Definition: Add a new service and select Docker as the provider under the General tab.
3. Registry Configuration: In the general tab, you can configure the following parameters:
   | Name | Value |
   |---|---|
   | Docker Image | `ghcr.io/jellebaele/<app_name>:latest` |
   | Registry URL | `ghcr.io` |
   | Username | Your Github username |
   | Password | A GitHub Personal Access Token (PAT) |

4. Deployment: Execute the first deployment via the Dokploy UI. Once the initial deployment is successful, verify the status by SSH-ing into the VPS and executing `$ docker service ls`.

# 4. Finalizing Automation: Triggering Dokploy via Webhooks

With the Docker image successfully residing in GHCR, the final step is to instruct Dokploy to pull the new image and redeploy the service. We achieve this by adding a deployment trigger to the end of the GitHub Actions workflow.

## Update the GitHub Actions Workflow

Append the following step to your `deploy.yml` file:

```yml

# Rest of your pipeline setup (see above)

- name: Trigger Dokploy Deployment
        run: |
          curl -X POST "${{ secrets.DOKPLOY_WEBHOOK_URL }}" \
            -H "CF-Access-Client-Id: ${{ secrets.CF_CLIENT_ACCESS_ID }}" \
            -H "CF-Access-Client-Secret: ${{ secrets.CF_CLIENT_ACCESS_SECRET }}" \
            -H "Content-Type: application/json"
```

## Configuration of Repository Secrets

This step introduces three sensitive variables that must be stored securely within GitHub to prevent unauthorized access to your infrastructure. Navigate to your repository **Settings** → **Secrets and variables** → **Actions** → **Secrets** → **Repository secrets** to add:

1. `CF_CLIENT_ACCESS_ID` & `CF_CLIENT_ACCESS_SECRET`: These are the Cloudflare Service Token credentials generated in [Part 4: Automating Deployments - Create a Service Token in Cloudflare](/articles/setup-a-vps/pt-4-automating-deployments#create-a-service-token-in-cloudflare). They allow the GitHub runner to bypass the Cloudflare Zero Trust gateway protecting your Dokploy instance.
2. DOKPLOY_WEBHOOK_URL: This is the unique deployment endpoint for your specific service. It can be retrieved from the Dokploy dashboard under the Deployments tab of your application.

## Pipeline Validation

Once the secrets are configured and the workflow file is updated, push the changes to your main branch to trigger a full execution.

A successful run should indicate:

- A green checkmark on the GitHub Actions build.
- A "Deployment Started" status in the Dokploy activity logs.
- An updated image hash when inspecting the service on your VPS.

If these conditions are met, your CI/CD pipeline is fully operational. The remaining task is to expose the newly deployed application to the internet via a Cloudflare Tunnel.

# 5. Network Exposure via Cloudflare Tunnel

The final step is to route external traffic to the internal Docker service. Depending on whether this is your first application or an addition to an existing stack, you have two options:

## Option A: Setting Up a New Tunnel

If you have not yet configured a Cloudflare Tunnel for this VPS, follow the foundational steps outlined in [Part 3: Secure Application Deployment - Cloudflare Tunnel: Secure Remote Access](http://localhost:3000/articles/setup-a-vps/pt-3-secure-application-deployment#2-cloudflare-tunnel-secure-remote-access). This covers the installation of the cloudflared connector and the initial authentication with your domain.

## Option B: Extending an Existing Tunnel

If you already have a tunnel running on your VPS, you can simply add a new route to handle the traffic for this application:

1. Access Cloudflare Dashboard: Navigate to Zero Trust > Networks > Tunnels and select your active tunnel.
2. Add Public Hostname: Click Add a public hostname and define the desired subdomain (e.g. `api.yourdomain.com`).
3. Internal Service Mapping: Route the traffic to the internal Docker Service name and port.
   To retrieve the exact service name required by Cloudflare, execute the following on your VPS:

   ```bash
   $ docker service ls
   ```

   The internal address will follow the format `http://<service_name>:<port>`.

   <details>
    <summary>Technical Note: Service Hashing</summary>
    Dokploy appends a stable hexadecimal hash to service names (e.g., prod_api_8f2d3e). This is standard behavior in Dokploy to ensure unique identification within the Docker Swarm. This name remains constant across deployments and should be used as the target in your Cloudflare Tunnel settings.
    </details>

## Optional: secure the tunnel

As described in [Part 3: Secure Application Deployment - Protect Dokploy with Cloudflare Zero Trust](/articles/setup-a-vps/pt-3-secure-application-deployment#protect-dokploy-with-cloudflare-zero-trust), you can wrap your new subdomain in a Zero Trust Application policy.

# Conclusion

By decoupling the application logic from the deployment infrastructure, you have created a repeatable system for scaling your services. Each new application now benefits from automated builds, multi-architecture support, and secure ingress through Cloudflare Zero Trust, all managed through a single version-controlled configuration. Each subsequent application can now be onboarded in minutes by simply replicating this workflow.
