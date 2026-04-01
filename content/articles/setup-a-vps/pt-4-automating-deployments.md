---
title: 'Part 4: Automating Deployments'
position: 5
---

You have built a complete infrastructure: a hardened VPS, secure networking, and an application deployment platform (Dokploy). Now comes the final piece: automation. Currently, deploying a new version requires manual steps—pushing code, building a Docker image, uploading it to a registry, and triggering Dokploy. This is slow and error-prone.

CI/CD (Continuous Integration/Continuous Deployment) automates this entire process. When you push code, a pipeline automatically builds your Docker image, tests it, pushes it to a registry, and tells Dokploy to deploy it. What previously took 10 manual steps now takes seconds.

# 1. Configure Dokploy for Automated Deployments

**Why automation starts here:** Dokploy is the system that pulls images and runs containers. Before we automate pushing code, we must configure Dokploy to receive images from your Docker registry and have a way for external systems (like GitHub Actions) to trigger deployments.

## Create a New Project and Service

In the Dokploy dashboard, create a new project. This groups related services together. Next, add a new service and select Docker as the provider.

You will be prompted to provide Docker registry credentials. If you are pushing images to GitHub Container Registry (GHCR) or Docker Hub, provide:

- **Docker Registry URL:** The registry endpoint (e.g., `ghcr.io`, `docker.io`)
- **Username:** Your registry username
- **Password:** Your registry access token (not your password)

Once you provide credentials, Dokploy can pull images from your registry whenever you trigger a deployment.

## Configure Environment Variables

Environment variables configure your application at runtime (database connection strings, API keys, feature flags, etc.).

In Dokploy, navigate to the service settings and add your environment variables. These might include:

```bash
DATABASE_URL=postgresql://user:password@postgres-service:5432/mydb
NODE_ENV=production
LOG_LEVEL=info
```

Once environment variables are configured, return to the **General** tab and click **Deploy** to test that the service starts correctly. Check the **Monitoring** tab to view the container logs and confirm everything is running.

## Generate a Webhook URL for External Triggers

**Why webhooks:** A webhook is an HTTP endpoint that Dokploy exposes. When your CI/CD pipeline makes a request to this URL, Dokploy automatically pulls the latest image and redeploys. This is how GitHub Actions will trigger deployments.

In Dokploy, navigate to **Deployments** and find the webhook URL for your service. It will look like:

```bash
https://dokploy.yourdomain.com/api/webhooks/deploy/<WEBHOOK_TOKEN>
```

Save this URL—you will use it in GitHub Actions.

# 2. Build and Push Docker Images with GitHub Actions

**Why GitHub Actions:** GitHub Actions is a CI/CD platform built into GitHub. When you push code, it can automatically run tests, build Docker images, and push them to a registry—all without leaving GitHub. It's free for public repositories and includes secret management for secure credential storage.

## Create a GitHub Actions Workflow

Create a new file in your repository:

```bash
.github/workflows/server.yml
```

A workflow is a YAML file that describes the steps to run. Here is a complete example that builds and pushes a Docker image:

```yaml
name: Build and Push Server

on:
  push:
    paths:
      - 'server/**'
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
        run: echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin

      - name: Build and Push Docker image
        run: |
          docker buildx build \
            --platform linux/amd64,linux/arm64 \
            --label "org.opencontainers.image.source=https://github.com/${{ github.repository }}" \
            -t ghcr.io/${{ github.repository_owner }}/myapp-server:latest \
            -t ghcr.io/${{ github.repository_owner }}/myapp-server:${{ github.sha }} \
            --push \
            ./server

      - name: Trigger Dokploy Deployment
        run: |
          curl -X POST "${{ secrets.DOKPLOY_WEBHOOK_URL_SERVER }}" \
            -H "CF-Access-Client-Id: ${{ secrets.CF_ACCESS_CLIENT_ID }}" \
            -H "CF-Access-Client-Secret: ${{ secrets.CF_ACCESS_CLIENT_SECRET }}" \
            -H "Content-Type: application/json"
```

**What this workflow does:**

1. **Trigger:** Runs when you push code to the `main` branch in the `server/` directory
2. **Checkout:** Clones your repository
3. **Login:** Authenticates to GitHub Container Registry (GHCR) using a GitHub token
4. **Build & Push:** Builds a multi-architecture Docker image (AMD64 and ARM64) and pushes it to GHCR with two tags:
   - `latest`: Always points to the most recent build
   - `<commit-sha>`: Unique identifier for this specific build
5. **Trigger Deployment:** Tells Dokploy to fetch and deploy the new image

Replace `myapp-server` with your actual image name.

# 3. Secure GitHub Actions with Cloudflare Service Tokens

**Why this step is critical:** Your Dokploy dashboard is protected by Cloudflare Zero Trust, which requires email-based login. GitHub Actions is an automated system that cannot log in with an email. We need a way for GitHub to authenticate without opening Dokploy to the public internet.

Cloudflare Service Tokens solve this. They are API credentials that GitHub can use to pass through the Cloudflare Zero Trust barrier.

## Create a Service Token in Cloudflare

1. Go to **Cloudflare Zero Trust** → **Access** → **Service Tokens**
2. Click **Create Service Token**
3. Name it something descriptive like `GitHub CI/CD`
4. Cloudflare will generate two values:
   - **Client ID**
   - **Client Secret**

**Store these securely** — you will use them in GitHub Actions.

## Attach the Service Token to Your Dokploy Access Policy

1. Go to **Access** → **Applications**
2. Edit your Dokploy application
3. In Access Policies, add a new policy:
   - **Name:** `GitHub CI/CD`
   - **Action:** Allow
   - **Rules:** Service Token selector = the service token you just created

This allows the service token (GitHub) to access Dokploy without email authentication.

## Store Service Token in GitHub Secrets

1. Navigate to your GitHub repository
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Create two new secrets:
   - `CF_ACCESS_CLIENT_ID`: Paste the Client ID from Cloudflare
   - `CF_ACCESS_CLIENT_SECRET`: Paste the Client Secret from Cloudflare

GitHub encrypts these secrets and will never display them in logs. Your workflow file can access them using `${{ secrets.CF_ACCESS_CLIENT_ID }}` syntax.

## Store the Dokploy Webhook URL in GitHub Secrets

1. From your Dokploy dashboard, get the webhook URL for your service (found in **Deployments**)
2. Create another GitHub secret:
   - `DOKPLOY_WEBHOOK_URL_SERVER`: Paste the webhook URL

**Why secrets matter:** Storing credentials directly in your code (even in version control) is a security disaster. GitHub Secrets are encrypted and used only by CI/CD workflows. They never appear in logs or pull requests.

# Conclusion: Completing the Circle

You have successfully built a complete, automated deployment pipeline:

1. **Hardened infrastructure** (Part 1-2): A secure VPS with SSH keys, firewall rules, and automatic security updates
2. **Container orchestration** (Part 3): Dokploy managing your applications, Cloudflare Tunnel providing secure external access
3. **Automation** (Part 4): GitHub Actions building images and triggering deployments, all without manual intervention

**The result is a production-grade system:** When you push code to your repository, everything happens automatically:

- GitHub Actions builds a Docker image of your application
- The image is pushed to a container registry
- Dokploy receives the webhook notification
- Your application is deployed with zero downtime

This is the same workflow used by organizations running millions of deployments per day. You now have it on your own infrastructure, under your complete control, at a fraction of the cost of Platform-as-a-Service providers.

**Next steps for scaling:**

- Add tests to your CI/CD pipeline—fail fast before building images
- Set up logging and monitoring for production containers
- Consider multiple servers for high availability
- Implement automated backups of your databases
- Add integration tests that run on staging before production deployment

You have the foundation. The practices you've built here will scale from a single application to managing dozens of services across multiple servers. Well done.
