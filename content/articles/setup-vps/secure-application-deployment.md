---
title: 'Part 3: Secure Application Deployment'
position: 4
---

Your VPS is now hardened with strong SSH security and a firewall. The next step is deploying applications. Rather than installing software directly on the server (which creates dependency conflicts and makes updates difficult), we'll use Docker containers—isolated, reproducible application environments.

However, containers need management: how do we start/stop them, monitor their health, route traffic to them, and update them without downtime? That's where Dokploy comes in. It provides a web dashboard for managing Docker containers on your VPS, similar to expensive platforms like Heroku or Vercel, but fully under your control.

For secure access to the Dokploy dashboard and future web applications, we'll use Cloudflare Tunnel, which creates an encrypted connection between your server and Cloudflare's edge network without opening ports on your firewall.

# 1. Docker & Dokploy: Container Management

**Why Dokploy?** Installing applications directly on the server leads to conflicts—different apps need different versions of Python, Node, or other dependencies. Docker solves this by containerizing each app in an isolated environment. Dokploy simplifies Docker management with a web UI, letting you manage deployments without memorizing Docker commands.

## Install Dokploy

**What happens:** The Dokploy installer sets up Docker Swarm (a container orchestration system), creates a PostgreSQL database for storing configuration, and a Redis instance for caching. Dokploy itself runs as a service on port 3000.

Run this command on the VPS as a non-root user with `sudo` access:

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

Once installed, verify that the services are running:

```bash
$ docker service ls
wmv9sklhpgg4   dokploy            replicated   1/1        dokploy/dokploy:v0.28.2
k47x28mj3w4f   dokploy-postgres   replicated   1/1        postgres:16
l7x53qlp1vpq   dokploy-redis      replicated   1/1        redis:7
```

**Why we cannot access it yet:** Your firewall (configured in [Part 2](./2026-02-27-pt2-linux-server-setup.md) only allows SSH traffic. Port 3000 (where Dokploy runs) is blocked. To access the dashboard securely, we will set up a Cloudflare Tunnel in the next section.

# 2. Cloudflare Tunnel: Secure Remote Access

**Why Cloudflare Tunnel?** Normally, to access a web application on your VPS, you would open a firewall port (e.g., 443 for HTTPS). This exposes your server to the public internet and requires certificate management. Cloudflare Tunnel solves this elegantly:

- Your server initiates a persistent encrypted tunnel to Cloudflare's edge network
- Traffic flows through Cloudflare, which handles TLS certificates automatically
- Your firewall remains closed; no ports are exposed
- Cloudflare can add authentication (Zero Trust) to protect applications
- You can protect multiple applications (Dokploy, blogs, APIs) through one tunnel

## Setup Your Domain with Cloudflare

**Why move DNS to Cloudflare?** Cloudflare acts as your DNS provider, which is necessary for Tunnel to work. When you access your domain, DNS queries are handled by Cloudflare, which then routes traffic through your tunnel.

Follow these steps:

1. Go to [cloudflare.com](https://cloudflare.com) and sign up (or log in)
2. Click "Add a site" and enter your domain name
3. Choose a plan (free tier is sufficient for this guide)
4. Cloudflare will display the nameservers it assigned to you (e.g., `nadia.ns.cloudflare.com` and `max.ns.cloudflare.com`)
5. Go to your domain registrar (GoDaddy, Namecheap, etc.) and update the nameservers to the ones Cloudflare provided
6. Wait 24-48 hours for propagation (though usually faster)

**What this does:** Once propagated, all DNS queries for your domain resolve through Cloudflare, enabling the Tunnel to function.

## Create a Cloudflare Tunnel

**Why run Tunnel in Docker?** Cloudflare provides an installation command, but running it directly on the server has drawbacks: it requires extra system packages, does not auto-restart on failure, and cannot connect to Dokploy (which runs in Docker). Running it in a Docker container ensures automatic restarts and connects it to the same Dokploy network.

First, go to `Cloudflare Zero Trust → Networking → Tunnels` and create a new tunnel. Name it something like "vps-tunnel". Cloudflare will generate a tunnel token—save this.

On your server, create a directory for the Cloudflare configuration:

```bash
$ sudo mkdir -p /opt/cloudflare
$ sudo chown -R $(whoami):$(whoami) /opt/cloudflare
$ cd /opt/cloudflare
```

Create a `.env` file with your tunnel token:

```bash
$ nano .env
```

Add this line:

```
CF_TUNNEL_TOKEN=<your-tunnel-token-from-cloudflare>
```

Now create a `docker-compose.yml` file:

```bash
$ nano docker-compose.yml
```

Paste this configuration:

```yml
services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared
    restart: unless-stopped
    command: tunnel --no-autoupdate run --token ${CF_TUNNEL_TOKEN}
    networks:
      - dokploy-network
    environment:
      - CF_TUNNEL_TOKEN=${CF_TUNNEL_TOKEN}

networks:
  dokploy-network:
    external: true
```

**Why the `dokploy-network`?** Dokploy runs services in Docker Swarm on the `dokploy-network`. By adding Cloudflared to this same network, traffic from Cloudflare can reach Dokploy at `http://dokploy:3000` without exposing any ports to the public internet.

Start the tunnel:

```bash
$ docker-compose up -d
```

Verify it is running:

```bash
$ docker-compose logs cloudflared
```

You should see a message like: "Connection XXXXX registered with TUN provider"

## Protect Dokploy with Cloudflare Zero Trust

**Why authentication?** Without protection, anyone on the internet could access your Dokploy dashboard and deploy or delete applications. Cloudflare Zero Trust adds a login screen (email-based), ensuring only you can access it.

**Step 1: Create an Access Application**

Go to Cloudflare Zero Trust:

1. Navigate to `Access > Applications`
2. Click `Add an application`
3. Choose `Self-hosted`
4. Configure the application:
   - **Application name:** `Dokploy`
   - **Subdomain:** `dokploy` (or any name you prefer)
   - **Domain:** Select your domain
   - **Path:** Leave empty (or `/` to cover all paths)

5. For **Access policies**, create a new policy called "Allow Me":
   - **Selector:** "Emails"
   - **Value:** Your email address

This configuration creates a login requirement; only the specified email can access the application.

**Step 2: Connect the Tunnel to the Application**

Now link your tunnel to this application:

1. Go to `Networking → Tunnels`
2. Select the tunnel you created earlier
3. Click `Configure` and add a new public hostname:
   - **Subdomain:** `dokploy` (must match the Access application)
   - **Domain:** Your domain
   - **Path:** Leave empty
   - **Type:** Select "Published Service" or "HTTP"
   - **URL:** `http://dokploy:3000`

The tunnel now routes traffic from `dokploy.yourdomain.com` through Cloudflare, validates the email via the Access policy, and forwards authenticated requests to `http://dokploy:3000` inside the Dokploy network.

**Verify access:** Open `dokploy.yourdomain.com` in your browser. You should see a Cloudflare login screen asking for your email, followed by the Dokploy dashboard.

## Next Steps

Now that Dokploy is installed and accessible via Cloudflare Tunnel, you can:

1. **Deploy your first application** through the Dokploy dashboard
2. **Set up a domain for your app** using the same Cloudflare Tunnel approach
3. **Configure auto-deploy** from GitHub/GitLab repositories
4. **Monitor containers** through Dokploy's built-in health checks and logs

You have successfully built a modern, secure deployment pipeline:

- **Hardened Linux server** (SSH security, firewall, automated updates)
- **Container orchestration** (Dokploy for managing Docker containers)
- **Secure access** (Cloudflare Tunnel + Zero Trust authentication)
