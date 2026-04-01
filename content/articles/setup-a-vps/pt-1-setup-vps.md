---
title: 'Part 1: Setting Up Your VPS'
position: 2
---

When deploying a new Virtual Private Server (VPS), the infrastructure choices made during provisioning establish the foundation for your application's performance and security. This guide focuses on the specific configuration options available within the Hetzner Cloud Console to ensure a robust initial setup. Thoughtful decisions here prevent expensive mistakes later—you cannot add dedicated CPU or change a server's location without rebuilding from scratch.

# Configure Your New VPS

**Why these choices matter:** Every decision made during provisioning is difficult or impossible to change later. A server in the wrong region cannot be moved without rebuilding; inadequate resources require migration; poor network configuration limits accessibility. The Hetzner Cloud Console guides you through these critical choices, so understand each before clicking "Create & Buy."

Walk through each configuration section in order:

## 1. Location

**Why this matters:** Network latency is the time it takes for a request to travel from a user's device to your server and back. Data travels at the speed of light through fiber optic cables, so every thousand kilometers adds ~5ms of latency. For interactive applications, this compounds: a 100ms request round-trip makes your app feel sluggish. Choose a data center close to your primary users.

For European users, **Falkenstein (FSN)** or **Nuremberg (NBG)** are standard. For North American users, **Ashburn (ASH)** or **Hillsboro (HIL)** are typical. If you have global users, consider deploying multiple servers (future optimization).

## 2. Image (Operating System)

**Why this matters:** The operating system determines which packages are available, how often security patches arrive, and how long the OS is maintained. LTS (Long-Term Support) releases receive security updates for 5 years or more, while standard releases are supported for only 9 months. For production servers, you want this stability.

Choose **Ubuntu 24.04 LTS**. It offers:

- 5 years of security patch support
- Extensive documentation (Ubuntu is the most popular Linux distribution)
- Regular security updates without surprise breaking changes

## 3. Type (Hardware Resources)

**Why this matters:** CPU performance directly affects how quickly your application processes requests. Performance is further affected by whether you share a CPU with other customers:

- **Shared vCPU (CX/CPX series):** Cost-effective ($5-20/month). Multiple customers share the same physical CPU. Performance varies based on what neighbors are doing ("noisy neighbor" problem). Suitable for staging, development, and low-traffic applications where consistent performance is not critical.
- **Dedicated vCPU (CCX series):** More expensive ($10-50/month). Physical CPU cores are reserved exclusively for you. Performance is consistent and predictable. Necessary for production workloads, CPU-intensive tasks (video encoding, machine learning), or when you need guaranteed response times.

## 4. Network Configuration

**Why this matters:** IPv4 addresses are required by the vast majority of internet users. While IPv6 adoption is increasing, many legacy systems and mobile networks still operate exclusively on IPv4. Without a public IPv4 address, portions of your user base will see "Connection Refused" errors.

Hetzner automatically assigns a public IPv4 address (included in all plans). Additionally:

- **IPv4 Requirement:** Needed for email delivery, DNS, and general internet accessibility
- **IPv6 Adoption:** Modern browsers and networks support IPv6. Hetzner includes an IPv6 block with every server, but do not rely on IPv6 alone yet

## 5. SSH Keys

**Why this matters:** Password-based authentication is vulnerable to brute-force attacks. SSH keys use public-key cryptography, which is mathematically impossible to brute-force. Deploying a key during server creation is far more secure than setting a password and changing it later.

**If you do not yet have an SSH key**, generate one on your local machine:

```bash
$ ssh-keygen -t ed25519 -C "your-email@example.com"
```

The tool will prompt you for a passphrase. **Use one—it encrypts your private key on disk.** If someone gains access to your laptop, they cannot use your key without the passphrase.

Display your public key:

```bash
$ cat ~/.ssh/id_ed25519.pub
```

On macOS, copy it directly to the clipboard:

```bash
$ cat ~/.ssh/id_ed25519.pub | pbcopy
```

In the Hetzner console, paste this public key into the SSH Key manager. Your server will be deployed with key-based authentication pre-configured for the root user, allowing you to connect without a password.

## 6. Volumes (Optional)

**Why this matters:** Your server has local NVMe storage (fast, included in your plan). However, NVMe is temporary—if you upgrade your server, the disk is lost. Volumes are external block storage, independent of the server. If your application needs large storage (database backups, media files), attach a Volume. You can increase its size later without downtime, and the data persists if you upgrade or recreate the server.

## 7. Firewalls

**Why this matters:** The Hetzner Cloud Firewall is your first line of defense. It blocks unsolicited traffic before it reaches your server. Configure it to allow only essential traffic; unnecessary open ports are attack vectors. You can modify firewall rules anytime, so if you need to add HTTP or HTTPS later, it is easy.

The firewall acts as a stateless perimeter defense. At minimum, allow:

| Description | Allowed IPs                  | Protocol | Ports |
| ----------- | ---------------------------- | -------- | ----- |
| SSH         | Your personal IP (or any IP) | TCP      | 22    |
| Ping        | Any IPv4, Any IPv6           | ICMP     | --    |

## 8. Backups

**Why this matters:** Configuration errors, data corruption, or security breaches can render a server unusable. Backups (snapshots) are the recovery mechanism. Hetzner's automated backups take daily snapshots at minimal cost (~20% of your server price). This is cheap insurance against catastrophic mistakes. Enable this on day one.

## 9. Placement Groups (For Multi-Server Deployments)

**Why this matters:** If you deploy multiple servers for high availability, placing them on different physical hardware racks prevents a single hardware failure from taking down both. This is only relevant if you are deploying 2+ servers for redundancy.

---

# Verify Your Connection

**Why verification matters:** This confirms that your SSH key works and you can reach the server. If this step fails, you cannot proceed to security hardening.

Once the "Create & Buy" process completes, retrieve your server's IP address from the Hetzner dashboard. From your local terminal, test the connection using the SSH key you configured:

```bash
$ ssh root@<YOUR_SERVER_IP>
```

You should see a shell prompt. If the connection succeeds, the infrastructure is correctly provisioned and ready for the next phase.

**If connection fails:** Check that:

- The server has finished booting (usually 1-2 minutes)
- Your public IP has not changed (if you specified an IP-based firewall rule)
- Your SSH key path is correct (usually `~/.ssh/id_ed25519`)

---

# What's Next

You have successfully provisioned a production server on Hetzner. However, the default configuration is **not secure**. The root user is exposed to the public internet, and only basic firewall rules are in place.

In **Part 2**, we will:

- Create a non-root user with limited privileges
- Harden SSH (disable passwords, disable root login)
- Set up UFW (a local firewall)
- Enable automatic security updates
- Deploy Fail2Ban to block repeated login attempts
