---
title: 'Part 2: Securing Your Linux Server'
position: 3
---

Your VPS is now running, but it's not yet secure. By default, the root user is exposed to the public internet with only basic firewall protection. In this guide, we will harden your Linux server by creating a standard user, securing SSH, setting up a local firewall, and enabling automatic security updates.

# 1. User Management: The Principle of Least Privilege

By default, most VPS providers provide access via the **root** user. While powerful, the root user represents a significant risk.

Think of the root user as the "Thanos" of your system. It possesses absolute power to create, modify, or delete any file instantly without a safety net. A simple typo in a command, such as a misplaced space in a deletion script, can destroy your entire server without asking "Are you sure?" To prevent catastrophic human error, we follow the **Principle of Least Privilege** by creating a standard user for daily operations.

## Create a Non-Root User

**Why this matters:** The root user bypasses all permission checks, making a single mistake catastrophic. A standard user enforces accountability and requires conscious elevation of privileges.

Run the following to create your new user:

```bash
$ adduser <username>
```

You will be prompted for a password. You can safely press Enter through the optional metadata fields (Full Name, Room Number, etc.). These are legacy Unix fields and are not required for modern server operation.

## Grant Sudo (Administrative) Access

**Why this matters:** Administrators need the ability to run privileged commands, but requiring explicit `sudo` ensures intentionality and prevents accidental system-level damage. Users must consciously elevate privileges rather than running everything as root.

Add this user to the sudo group so they can execute administrative tasks when necessary:

```bash
$ usermod -aG sudo <USERNAME>
```

The `-aG` flags stand for "append to group." The `-a` (append) ensures the user is added to the sudo group without being removed from any existing groups, and `-G` specifies that we're targeting groups. This approach creates a "safe by default" environment: the user operates with restricted permissions until they explicitly prefix a command with `sudo`.

## Authorize SSH Access

**Why this matters:** SSH is how we'll connect to the server after disabling root login. Key-based authentication is more secure than passwords and cannot be brute-forced.

Currently, only the root user knows your SSH key. We must transfer that authorization to your new user. First, copy your public SSH key from your local machine:

```bash
$ cat ~/.ssh/id_ed25519.pub
```

Then, on the server, set up the SSH directory and keys:

```bash
$ mkdir -p ~/.ssh
$ chmod 700 ~/.ssh
$ nano ~/.ssh/authorized_keys
$ chmod 600 ~/.ssh/authorized_keys
```

**Why these specific permissions?** SSH is highly sensitive to file permissions for security reasons. The `chmod 700` on the `.ssh` directory means only the owner can read, write, or execute it—preventing other users from accessing the directory. The `chmod 600` on `authorized_keys` ensures only the owner can read or write the file. Together, these permissions guarantee that no other user on the system can read or modify your access credentials.

## Sources

- [Your First 5 Minutes: How to Secure Your New VPS (By Not Using Root!)](https://tedante.medium.com/your-first-5-minutes-how-to-secure-your-new-vps-by-not-using-root-9a688798b00e)
- [How to Add a New User With SSH to Your VPS](https://itnext.io/how-to-add-a-new-user-with-ssh-to-your-vps-f44276c02b4b)

# 2. Hardening the SSH Daemon

Most automated attacks on the internet consist of "dictionary attacks"—bots trying thousands of common passwords against the `root` user. By disabling password logins and root access, you effectively render these automated attacks useless. At this stage, we move security from "human behavior" (using strong passwords) to "system architecture" (keys cannot be guessed).

## Disabling Root Access & Passwords

**Why this matters:** Automated attackers know that many systems still have a root user and will target it first. By removing direct root access and requiring keys instead of passwords, we eliminate two massive attack vectors.

Edit the SSH configuration file:

```bash
$ sudo nano /etc/ssh/sshd_config
```

Modify the following lines:

- `PermitRootLogin no`: Prevents anyone from logging in as root, even with a valid SSH key. This forces attackers to guess both a username (unknown) and authenticate with a key they don't have.
- `PasswordAuthentication no`: Disables password-based authentication entirely. SSH keys use cryptographic mathematics—there are $ 2^{256} $ possible keys in Ed25519. Even with a million guesses per second, it would take longer than the age of the universe to try them all.

Restart the service to apply changes:

```bash
$ sudo systemctl restart ssh
```

## Changing the Default SSH Port

**Why this matters:** While changing the port is "security by obfuscation" (not true security), it provides practical benefits. Most automated scanners target port 22 by default. Changing it doesn't stop targeted attackers, but it eliminates noise from generic bots, keeping your logs clean and making it easier to spot real security threats.

Follow these steps to change your SSH port:

**Find an available port:** To ensure the TCP port is available on your system:

```bash
$ sudo ss -tuln
```

This displays all listening ports. Choose one that is not in use (e.g., 2200).

**Update SSH config:** Edit the configuration file and change the `Port` line:

```bash
$ sudo nano /etc/ssh/sshd_config
```

Change to `Port 2200`.

**Update Firewall:** Before restarting SSH, ensure port 2200 is open in your firewall. This prevents you from being locked out:

```bash
$ sudo ufw allow 2200/tcp
```

**Restart SSH:**

```bash
$ sudo systemctl restart ssh
```

**Once confirmed working:** If SSH on 2200 is successful, remove port 22 from your hosting provider's firewall (Hetzner, etc.) to prevent direct attacks on the default port.

Now SSH only works via:

```bash
ssh -p 2200 <USERNAME>@<SERVER_IP>
```

## Sources

- [SSH disable password login: securing your Linux VPS](https://www.hostinger.com/tutorials/how-to-disable-ssh-password-login-on-vps)
- [Disabling SSH root access on your Linux VPS](https://www.transip.eu/knowledgebase/1724-disabling-root-access-your-linux)
- [How To Disable Root Login on Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/how-to-disable-root-login-on-ubuntu-20-04)

# 3. Create Local SSH Config

**Why this matters:** Typing the same SSH command every time is tedious and error-prone. SSH allows you to create shortcuts for frequently-used connections. This keeps your commands simple and reduces the chance of typos.

On your local machine, create a rule in your SSH config file:

```bash
$ nano ~/.ssh/config
```

Add:

```bash
Host <CHOOSE A NAME>
    HostName <SERVER_IP>
    User <USERNAME>
    Port <SSH_PORT>
```

# 4. Setup Fail2Ban

**Why this matters:** Even with perfect SSH configuration, attackers still probe your server looking for weaknesses. Fail2Ban automatically detects and responds to suspicious behavior without requiring manual intervention. It shifts security from "prevent all attacks" (impossible) to "identify and block active threats quickly."

No protocol or software stack is completely foolproof. SSH is widely deployed and therefore a predictable attack surface. On any publicly reachable server, you will see repeated login attempts in your logs—typically automated brute-force attacks.

Even with key-only authentication and disabled password login, SSH remains a visible entry point. While properly configured SSH is extremely secure, adding an automated defensive layer is insurance against zero-days and unexpected vulnerabilities.

Fail2Ban monitors log files and automatically bans IP addresses after a defined number of failed login attempts. It integrates directly with your firewall and reacts instantly without manual intervention.

## Install Fail2Ban

Begin by running the following commands as a non-root user to update your package listings and install Fail2ban:

```bash
$ sudo apt update
$ sudo apt install fail2ban
```

To check the status you can do:

```bash
$ systemctl status fail2ban.service
```

## Configure Fail2Ban

**Why this approach:** The `jail.conf` file contains all defaults and may be overwritten when Fail2Ban updates. Creating a separate `jail.local` file allows your custom settings to persist across updates without conflicts.

Fail2Ban configuration files are located in `/etc/fail2ban`. Examine the defaults:

```bash
$ sudo cat /etc/fail2ban/jail.conf
```

You'll see that comments direct you not to modify this file directly. The `[DEFAULT]` section applies to all services, while service-specific sections like `[sshd]` contain overrides.

Create a new `jail.local` file with your custom settings:

```bash
$ sudo nano /etc/fail2ban/jail.local
```

Add this configuration:

```bash
[sshd]
enabled = true
port = 2200
filter = sshd[mode=aggressive]
backend = systemd
bantime = 1h
findtime = 10m
maxretry = 3
```

**What these settings mean:**

- `enabled = true`: Activates the SSH protection rule
- `port = 2200`: Monitors your custom SSH port (adjust if different)
- `filter = sshd[mode=aggressive]`: Uses aggressive detection patterns for more comprehensive matching
- `bantime = 1h`: Blocks an IP for 1 hour after trigger (prevents permanent bans for misconfigured clients)
- `findtime = 10m`: Time window to count failures—3 failures within 10 minutes triggers a ban
- `maxretry = 3`: Number of failures before banning

When finished, save and close the file. Now enable the service to run automatically:

```bash
$ sudo systemctl enable fail2ban
$ sudo systemctl start fail2ban
```

Verify that the service is running:

```bash
$ sudo systemctl status fail2ban
```

You can inspect the SSH jail with:

```bash
sudo fail2ban-client status sshd
```

## Test Fail2Ban

**Why test:** Verifying that Fail2Ban works prevents discovering broken security controls during an actual attack.

From a different IP address (or using a VPN), attempt multiple failed SSH logins to trigger the ban:

```bash
ssh wrong_user@<your_server_ip> -p 2200
```

Repeat this 3+ times to exceed `maxretry`. Then, on the server, check if the IP is banned:

```bash
$ sudo fail2ban-client status sshd
```

You should see output similar to:

```bash
Status for the jail: sshd
|- Filter
|  |- Currently failed:    0
|  |- Total failed:        4
|  `- Journal matches:     _SYSTEMD_UNIT=sshd.service + _COMM=sshd
`- Actions
   |- Currently banned:     1
   |- Total banned:        1
   `- Banned IP list:     203.0.113.45
```

This confirms Fail2Ban is actively monitoring and blocking attempts. The IP will be unbanned after `bantime` (1 hour in our config).

## Sources

- [How to secure a VPS](https://help.ovhcloud.com/csm/en-vps-security-tips?id=kb_article_view&sysparm_article=KB0047703#fail2ban)
- [How To Protect SSH with Fail2Ban on Ubuntu 20.04](https://www.digitalocean.com/community/tutorials/how-to-protect-ssh-with-fail2ban-on-ubuntu-20-04)
- [How to Use Fail2ban to Secure Your Linux Server (CentOS, Ubuntu, Debian, Fedora, and Plesk)](https://www.plesk.com/blog/various/using-fail2ban-to-secure-your-server/)

# 5. Setup Firewall with UFW

**Why a firewall:** Even with SSH hardening and Fail2Ban, a firewall follows the "defense in depth" principle. It provides a hardware-level barrier that blocks traffic before it reaches your services. UFW (Uncomplicated Firewall) is a simple interface for the Linux firewall (`iptables`).

### Confirm IPv6 Support

**Why this matters:** If IPv6 is enabled on your system but not in UFW, traffic over IPv6 will bypass your firewall rules entirely. Modern Linux enables IPv6 by default, so we must ensure UFW rules apply to both IPv4 and IPv6.

To confirm IPv6 support is enabled in UFW, check the configuration file:

```bash
$ sudo nano /etc/default/ufw
```

Then make sure the value of `IPV6` is set to `yes`. It should look like this:

```
IPV6=yes
```

## Set Default Firewall Policies

**Why this approach:** This follows the "whitelist everything else" principle. We explicitly allow only services we want to expose, and block everything else by default. This prevents accidental exposure of new services.

Configure UFW to:

- **Deny incoming** connections (block everything by default)
- **Allow outgoing** connections (let the server reach the internet)

This ensures external traffic is blocked unless explicitly allowed:

```bash
$ sudo ufw default deny incoming
$ sudo ufw default allow outgoing
```

## Allow SSH Connections

**Why rate limiting:** UFW's `limit` rule blocks an IP if it attempts more than 6 connections in 30 seconds. This stops port-scanning tools and brute-force attempts while still allowing legitimate users to connect (humans never make 6 connection attempts in 30 seconds).

Allow SSH on your custom port with rate limiting:

```bash
$ sudo ufw limit 2200/tcp
```

This permits SSH connections on port 2200 while rate-limiting them. All other ports remain closed.

## Enable UFW

**⚠️ Critical:** Make sure you've allowed SSH (port 2200) before enabling UFW. If you enable the firewall before allowing SSH, you will be locked out of your server.

Activate UFW:

```bash
$ sudo ufw enable
```

This enables the firewall immediately and ensures it starts automatically on every reboot, applying all configured rules.

To verify rules and active status:

```bash
$ sudo ufw status
```

For more detailed output (including IPv6 rules):

```bash
$ sudo ufw status verbose
```

You should see your allowed SSH port and default deny policy reflected in the output.

If you ever need to disable the firewall:

```bash
$ sudo ufw disable
```

This stops UFW without removing your rules (they remain saved and can be re-enabled).

## Sources

- [How to Set Up a Firewall with UFW on Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-with-ufw-on-ubuntu)

# 6. Automatic Security Updates

**Why this matters:** Security vulnerabilities are continuously discovered in software. Manual patching is error-prone and leaves systems vulnerable while waiting for human intervention. Automated updates close security holes within hours of patches becoming available.

The `unattended-upgrades` package automatically installs security patches on Debian-based systems (Ubuntu, Debian). It can be configured to install security patches only (conservative) or all updates (aggressive), and can manage system reboots when required.

## Install Unattended-Upgrades

Most modern Ubuntu/Debian systems include this package by default. To ensure it is installed:

```bash
$ sudo apt update
$ sudo apt install unattended-upgrades
```

## Configure Automatic Reboots

**Why scheduled reboots:** Some updates (like kernel patches) require a system restart to take effect. Automatic reboots ensure patches are applied even if no human is monitoring the server. Scheduling reboots at 3 AM minimizes impact on running services and users.

Open the main configuration file:

```bash
$ sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
```

Locate and modify the following lines (ensure the double slashes // are removed to uncomment the lines):

```bash
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "03:00";
```

With this configuration, if an update requires a restart, the system will wait until the specified time to perform the reboot.

## Enable the Update Schedule

To activate automatic updates, configure the periodic update interval:

```bash
$ sudo nano /etc/apt/apt.conf.d/20auto-upgrades
```

Ensure the file contains:

```bash
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
```

**What these settings mean:**

- A value of `1` means the check runs daily
- Set to `0` to disable that check
- Higher numbers (e.g., `7`) run weekly

## Verify and Activate the Service

After modifying the configuration, reconfigure the package to ensure all scripts are correctly linked:

```bash
$ sudo dpkg-reconfigure -plow unattended-upgrades
```

Select `Yes` when prompted to "Automatically download and install stable updates."

To verify that the service is running and enabled to start on boot:

```bash
$ sudo systemctl status unattended-upgrades
```

## Monitor Updates

**Why monitoring matters:** Automated systems can fail silently. Regular log checks confirm patches are being applied and identify issues before they become problems.

Review logs to confirm updates are applied successfully:

- **Update History:** `/var/log/unattended-upgrades/unattended-upgrades.log`
- **Reboot History:** `/var/log/unattended-upgrades/unattended-upgrades-shutdown.log`

To test the configuration without applying changes:

```bash
$ sudo unattended-upgrade --dry-run --debug
```

## Sources

- [Ubuntu Server Guide: Automatic Updates](https://ubuntu.com/server/docs/package-management)
- [How to Keep Ubuntu Servers Updated](https://www.digitalocean.com/community/tutorials/how-to-keep-ubuntu-20-04-servers-updated)

# 7. Next Steps: Docker & Beyond

Once your base server is hardened, you can install Docker and deploy applications. The security foundation you've built applies to containers as well—keep them updated, run them with limited privileges, and expose only necessary ports.

To install docker, you can follow the official documentation:
[Install docker](https://docs.docker.com/engine/install/ubuntu/)

And add your user to the docker group:

```bash
$ sudo usermod -aG docker $USER
$ newgrp docker
```

## Important Note on Firewall Configuration

If using a hosting provider other than Hetzner, ensure you configure their firewall rules (Linode, AWS, etc.). The firewall configuration shown above is local to the server; your provider's firewall is typically the first line of defense.

# Conclusion: Defense in Depth

You have now implemented a multi-layered security approach:

| Layer                  | Defense                             | Benefit                                       |
| ---------------------- | ----------------------------------- | --------------------------------------------- |
| **Authentication**     | SSH keys only; no passwords         | Eliminates dictionary attacks                 |
| **Access Control**     | Disabled root login; standard users | Enforces principle of least privilege         |
| **Port Obscurity**     | Non-default SSH port                | Reduces noise from generic scanners           |
| **Automated Response** | Fail2Ban monitoring                 | Blocks active threats in real-time            |
| **Network Filtering**  | UFW firewall                        | Restricts traffic to allowed services         |
| **Patch Management**   | Unattended-upgrades                 | Closes security vulnerabilities automatically |

When combined, these layers significantly reduce your attack surface. No single tool is bulletproof, but together they create a professional, hardened server environment.

**The biggest advantage of this approach is automation:** Your server detects threats and applies patches without manual intervention. In production, this is essential—you cannot monitor 24/7, but your firewall and Fail2Ban can.

**Remember:** Security is not about one perfect tool. It's about stacking small, correct decisions. And at this point, your server is far more secure than 95% of VPS instances on the internet.

# General sources

- [How to Secure Your VPS Server: Essential Tips for 2026 and Beyond](https://medium.com/@bhattira.26/how-to-secure-your-vps-server-essential-tips-for-2026-and-beyond-5ed97f8f98c7)
- [15 Security Tips for Linux VPS Hosting](https://blog.imunify360.com/15-security-tips-for-linux-vps-hosting)
