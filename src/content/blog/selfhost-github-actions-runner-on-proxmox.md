---
title: "How to Setup a Self-Hosted GitHub Actions Runner on Proxmox"
description: "Run your own CI/CD pipelines for free by setting up a GitHub Actions runner inside a Proxmox VM — step by step from creating the VM to running your first workflow."
pubDate: 2026-04-04
tags: ["github-actions", "ci-cd", "proxmox", "devops"]
featured: true
draft: false
---

GitHub Actions gives you 2,000 free minutes per month on their hosted runners, but those minutes run out fast if you have multiple repositories or long build times. The solution is simple: run your own GitHub Actions runner on hardware you already own.

If you followed the previous post on installing Proxmox, you already have a hypervisor ready to go. In this guide, we will create a dedicated VM on Proxmox, install the GitHub Actions runner software, and register it with your GitHub account so your workflows run on your own machine — with zero minute limits.

## Why Self-Host a Runner?

- **No minute limits** — run as many workflows as you want
- **Faster builds** — your hardware is likely faster than GitHub's shared runners
- **Persistent cache** — build caches, Docker images, and dependencies stay on disk between runs
- **Access to local resources** — the runner can reach services on your local network (databases, APIs, internal tools)
- **Full control** — install any software, use any CPU/GPU, customize the environment

The tradeoff is that you are responsible for maintaining the VM and keeping it secure.

## What You Need

- A running Proxmox VE installation (see the previous post)
- A GitHub account with at least one repository
- An ISO image for Ubuntu Server 22.04 or 24.04 (uploaded to Proxmox)
- About 30 minutes

## Step 1 — Create a VM in Proxmox

Log into your Proxmox web UI and create a new VM for the runner:

1. Click **Create VM** in the top right
2. **General tab:**
   - Node: your Proxmox node
   - VM ID: leave the default or pick one (e.g., `200`)
   - Name: `github-runner`
3. **OS tab:**
   - Select the Ubuntu Server ISO you uploaded
   - Type: Linux, Version: 6.x - 2.6 Kernel
4. **System tab:**
   - Leave defaults (BIOS: SeaBIOS or OVMF for UEFI, Machine: q35)
   - Check "Qemu Agent" — we will install it later
5. **Disks tab:**
   - Bus: VirtIO Block
   - Disk size: 40 GB minimum (64 GB recommended if you build Docker images)
   - Storage: your preferred storage pool
6. **CPU tab:**
   - Cores: 2 minimum (4 recommended for faster builds)
   - Type: host (gives the VM access to your actual CPU features)
7. **Memory tab:**
   - 4096 MB minimum (8192 MB recommended)
8. **Network tab:**
   - Bridge: vmbr0
   - Model: VirtIO

Click **Finish** and then **Start** the VM. Open the **Console** to begin the Ubuntu installation.

## Step 2 — Install Ubuntu Server

Go through the Ubuntu installer:

1. Select your language and keyboard layout
2. Choose **Ubuntu Server (minimized)** if available — we do not need a desktop environment
3. Configure the network — DHCP is fine for now, but a static IP is better for a long-running server
4. Configure the disk — use the entire disk, default LVM layout
5. Set your username and password (e.g., username: `runner`)
6. Enable **Install OpenSSH server** so you can SSH in later
7. Skip the featured snaps — we will install what we need manually
8. Wait for the installation to finish, then reboot

After reboot, log in via the console or SSH:

```bash
ssh runner@<vm-ip-address>
```

## Step 3 — Update the System and Install Dependencies

First, bring everything up to date and install packages that most CI workflows need:

```bash
sudo apt update && sudo apt upgrade -y

# Install common build dependencies
sudo apt install -y \
  curl \
  wget \
  git \
  build-essential \
  jq \
  unzip \
  zip \
  software-properties-common \
  apt-transport-https \
  ca-certificates \
  gnupg \
  lsb-release

# Install the QEMU guest agent for Proxmox integration
sudo apt install -y qemu-guest-agent
sudo systemctl enable qemu-guest-agent
sudo systemctl start qemu-guest-agent
```

## Step 4 — Install Docker (Optional but Recommended)

Most CI pipelines use Docker at some point. Install it now:

```bash
# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add the Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add the runner user to the docker group so it can run Docker without sudo
sudo usermod -aG docker runner

# Verify Docker works
sudo docker run hello-world
```

Log out and back in for the group change to take effect.

## Step 5 — Install Node.js (Optional)

If your workflows build Node.js projects, install it via the NodeSource repository:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

You can also install other runtimes you need (Python, Go, Java, etc.) at this point.

## Step 6 — Download and Configure the GitHub Actions Runner

Now for the main event. Go to your GitHub repository (or organization) settings:

1. Navigate to **Settings > Actions > Runners**
2. Click **New self-hosted runner**
3. Select **Linux** and **x64**
4. GitHub will show you the exact commands to run. They look like this:

```bash
# Create a directory for the runner
mkdir actions-runner && cd actions-runner

# Download the latest runner package
curl -o actions-runner-linux-x64-2.321.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.321.0/actions-runner-linux-x64-2.321.0.tar.gz

# Extract the package
tar xzf ./actions-runner-linux-x64-2.321.0.tar.gz
```

The version number will differ — always use the commands shown on GitHub's page to get the latest version.

## Step 7 — Register the Runner

Still in the `actions-runner` directory, run the configuration command. GitHub provides this on the same page with a unique token:

```bash
./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPO --token YOUR_TOKEN_HERE
```

The interactive setup will ask you:

- **Runner group:** press Enter for default
- **Runner name:** give it a name like `proxmox-runner` or press Enter for the hostname
- **Labels:** add custom labels like `self-hosted,linux,x64,proxmox` — these labels let your workflows target this specific runner
- **Work folder:** press Enter for the default `_work`

If you want to register the runner at the organization level instead of a single repo, use your org URL:

```bash
./config.sh --url https://github.com/YOUR_ORG --token YOUR_TOKEN_HERE
```

## Step 8 — Test the Runner Manually

Start the runner in the foreground to verify it works:

```bash
./run.sh
```

You should see output like:

```
Connected to GitHub
Listening for Jobs
```

The runner should now appear as **Idle** in your GitHub repository's Settings > Actions > Runners page with a green dot.

To test it, create a simple workflow in any repository. Create the file `.github/workflows/test-runner.yml`:

```yaml
name: Test Self-Hosted Runner

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: self-hosted

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: System info
        run: |
          echo "Runner: $(hostname)"
          echo "OS: $(cat /etc/os-release | grep PRETTY_NAME)"
          echo "CPU: $(nproc) cores"
          echo "RAM: $(free -h | awk '/^Mem:/ {print $2}')"
          echo "Disk: $(df -h / | awk 'NR==2 {print $4}') free"
          docker --version || echo "Docker not installed"

      - name: Run a build step
        run: echo "Build completed successfully on self-hosted runner"
```

Push this file and go to the Actions tab in your repository. You should see the workflow running on your self-hosted runner.

Press `Ctrl+C` in the terminal to stop the runner once you have verified it works.

## Step 9 — Install the Runner as a Service

You do not want to keep a terminal open forever. Install the runner as a systemd service so it starts automatically:

```bash
cd ~/actions-runner

# Install the service (this creates a systemd unit file)
sudo ./svc.sh install runner

# Start the service
sudo ./svc.sh start

# Check the status
sudo ./svc.sh status
```

Replace `runner` with your actual username if it is different.

The runner will now start automatically when the VM boots. You can verify with:

```bash
sudo systemctl status actions.runner.*.service
```

## Step 10 — Configure the VM to Auto-Start in Proxmox

You want the runner VM to start automatically if Proxmox reboots:

1. In the Proxmox web UI, select your `github-runner` VM
2. Go to **Options**
3. Double-click **Start at boot** and set it to **Yes**
4. Optionally set **Start/Shutdown order** if you have dependencies

Now the runner survives host reboots without manual intervention.

## Using the Runner in Your Workflows

To use your self-hosted runner in any workflow, set `runs-on` to `self-hosted` or use specific labels:

```yaml
jobs:
  build:
    # Use any self-hosted runner
    runs-on: self-hosted

  deploy:
    # Use a runner with specific labels
    runs-on: [self-hosted, linux, proxmox]
```

You can also mix self-hosted and GitHub-hosted runners in the same workflow:

```yaml
jobs:
  lint:
    # Fast check on GitHub's runners
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run lint

  build:
    # Heavy build on your own hardware
    needs: lint
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
```

## Security Considerations

Running a self-hosted runner means code from your workflows executes on your machine. Keep these points in mind:

- **Never use self-hosted runners on public repositories.** Anyone who submits a pull request can run arbitrary code on your machine via a workflow. Self-hosted runners are safe for private repos and trusted organizations only.
- **Isolate the runner VM.** Do not give it access to sensitive parts of your network unless the workflow specifically needs it. Use Proxmox's firewall or network segmentation.
- **Keep the VM updated.** Run `sudo apt update && sudo apt upgrade -y` regularly, or set up unattended-upgrades.
- **Use labels wisely.** If you have multiple runners, use labels to control which workflows run where.
- **Clean up between jobs.** The runner reuses the same environment between runs. If you need isolation, use Docker containers inside your workflows or enable ephemeral mode (`--ephemeral` flag during configuration, which deregisters the runner after each job).

## Maintaining the Runner

A few maintenance tasks to keep things running smoothly:

**Update the runner software:**

GitHub will notify you in the Actions > Runners page when a new version is available. To update:

```bash
cd ~/actions-runner
sudo ./svc.sh stop
# Download and extract the new version (check GitHub for the latest URL)
curl -o actions-runner-linux-x64-NEW_VERSION.tar.gz -L https://github.com/actions/runner/releases/download/vNEW_VERSION/actions-runner-linux-x64-NEW_VERSION.tar.gz
tar xzf ./actions-runner-linux-x64-NEW_VERSION.tar.gz
sudo ./svc.sh start
```

Actually, in most cases the runner updates itself automatically. But if it gets too far behind, a manual update is needed.

**Monitor disk usage:**

Build artifacts and Docker images can fill up the disk quickly. Set up a cron job to clean up:

```bash
# Add to crontab: clean Docker every Sunday at 3am
echo "0 3 * * 0 docker system prune -af --volumes" | sudo tee -a /var/spool/cron/crontabs/runner
```

**Take snapshots in Proxmox:**

Before making major changes to the runner VM, take a snapshot in the Proxmox UI. This gives you a one-click rollback if something breaks.

## Wrapping Up

You now have a fully functional GitHub Actions runner on your own Proxmox server. Your CI/CD pipelines run on hardware you control, with no minute limits, faster builds, and persistent caches.

The setup takes about 30 minutes and the runner runs quietly in the background. Combined with Proxmox's snapshot and backup features, you have a robust CI/CD setup that costs nothing beyond the electricity to run your server.

This is one of the most practical things you can do with a homelab — turning idle hardware into a real productivity tool for your development workflow.
