---
title: "Running a Self-Hosted GitHub Actions Runner on Proxmox"
description: "A practical guide to running a GitHub Actions self-hosted runner inside a dedicated Proxmox VM, with the parts that matter most: registration, service mode, labels, Docker, networking, updates, and security."
pubDate: 2026-04-04
tags: ["github-actions", "ci-cd", "proxmox", "devops"]
draft: false
---

A self-hosted GitHub Actions runner is not complicated to install. The interesting part is deciding where that runner should live and how much trust I am willing to give it.

For a small lab, I like putting the runner inside a dedicated Proxmox VM. It keeps the CI machine separate from the hypervisor, gives me normal VM backups and snapshots, and makes it much easier to delete the runner later without leaving build tools, Docker images, credentials, and caches scattered across another server.

GitHub does not charge Actions minutes for jobs that run on self-hosted runners. That does **not** make the machine free: I still pay for the hardware, storage, electricity, network, and maintenance. It is also worth remembering that standard GitHub-hosted runners are already free for public repositories, so saving hosted-runner minutes is mainly relevant to private repositories or to workloads where I specifically want my own hardware and network access. GitHub explains the distinction in its <a href="https://docs.github.com/en/billing/concepts/product-billing/github-actions" target="_blank" rel="noopener noreferrer">Actions billing documentation</a>.

## Why I prefer a VM for the runner

A GitHub Actions job is code executing on a machine I control. That is enough reason for me not to install the runner directly on the Proxmox host.

A dedicated VM gives me a useful boundary:

- The Proxmox host stays focused on virtualization
- CI dependencies do not pollute the hypervisor
- Docker can run normally inside a Linux VM
- CPU, memory, and disk can be resized independently
- The VM can be backed up, snapshotted, rebuilt, or removed
- Network access can be restricted separately from the rest of the lab

This does not magically make an unsafe workflow safe, but it reduces the blast radius compared with running arbitrary CI jobs directly on infrastructure I care about.

## What the runner actually needs

GitHub's <a href="https://docs.github.com/en/actions/reference/runners/self-hosted-runners" target="_blank" rel="noopener noreferrer">self-hosted runner reference</a> is deliberately light on fixed hardware requirements. The runner application itself needs very little; the real sizing depends on the jobs it will execute.

For a small Linux runner VM, I usually start around:

```text
CPU:     2 vCPU
Memory:  4 GB
Disk:    32-64 GB
Network: VirtIO on vmbr0
OS:      Ubuntu Server or Debian
```

That is not a GitHub minimum. A frontend build may need less, while Docker image builds, Android builds, large test suites, or parallel compilation can need much more.

Networking is simpler than it first appears. The runner initiates the connection to GitHub, so I do **not** need to expose an inbound port for GitHub Actions. The machine must be able to make outbound HTTPS connections on port `443` to the GitHub endpoints required by the workflows.

If a workflow uses Docker container actions or service containers, GitHub requires a Linux runner with Docker installed.

## 1. Create the runner VM in Proxmox

I create a normal Linux VM rather than trying to make the runner special at the hypervisor layer.

A reasonable starting configuration is:

1. Create a VM named something obvious such as `github-runner`.
2. Install a current Ubuntu Server or Debian release.
3. Use VirtIO for the network device.
4. Put the NIC on `vmbr0`, or another bridge/VLAN if the runner should be isolated.
5. Enable the QEMU Guest Agent option in Proxmox.
6. Give the disk enough room for source checkouts, package caches, build output, and Docker images.

I do not over-allocate CPU or RAM on day one. CI resource usage becomes obvious after a few real jobs, and the VM can be resized later.

After installing Linux, I update it and install the guest agent:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y qemu-guest-agent curl git ca-certificates
sudo systemctl enable --now qemu-guest-agent
```

I also enable SSH if I intend to administer the runner remotely.

## 2. Install Docker only if the workflows need it

Docker is common in CI, but it is not a requirement for every self-hosted runner.

If my workflows build container images, use service containers, or execute Docker-based actions, I install Docker using the <a href="https://docs.docker.com/engine/install/" target="_blank" rel="noopener noreferrer">official Docker Engine installation instructions</a> for the guest OS instead of copying an old repository command from a blog post.

After installation, I verify the daemon:

```bash
sudo systemctl status docker
sudo docker run --rm hello-world
```

If I decide to let the runner user access the Docker socket without `sudo`, I treat that as a privilege decision rather than a convenience tweak. Membership in the `docker` group effectively grants root-equivalent control over the machine because containers can mount host filesystems and interact with privileged resources.

For a dedicated CI VM that may be acceptable. On a shared machine, I would be much more cautious.

## 3. Let GitHub generate the runner installation commands

I do not hard-code a runner version into this guide because the runner is updated frequently.

At the time of writing, the official `actions/runner` project continues to publish new releases regularly. The safer workflow is to let GitHub generate the commands for the repository or organization where the runner will be registered.

For a repository-level runner:

1. Open the repository on GitHub.
2. Go to **Settings → Actions → Runners**.
3. Choose **New self-hosted runner**.
4. Select the correct operating system and architecture.
5. Run the download and extraction commands GitHub shows on that page.

The commands follow this general shape:

```bash
mkdir actions-runner
cd actions-runner

curl -O -L https://github.com/actions/runner/releases/download/v<RUNNER_VERSION>/actions-runner-linux-x64-<RUNNER_VERSION>.tar.gz

tar xzf ./actions-runner-linux-x64-<RUNNER_VERSION>.tar.gz
```

Do not paste `<RUNNER_VERSION>` literally. Use the exact command GitHub generates for the runner you are adding. The official <a href="https://docs.github.com/en/actions/how-tos/manage-runners/self-hosted-runners/add-runners" target="_blank" rel="noopener noreferrer">adding self-hosted runners guide</a> is the canonical reference for this step.

## 4. Register it with a time-limited token

GitHub also generates the `config.sh` command:

```bash
./config.sh \
  --url https://github.com/OWNER/REPOSITORY \
  --token REGISTRATION_TOKEN
```

The registration token is temporary and expires after one hour. It is only needed to register the runner; I do not store it as a long-lived credential on the VM.

During configuration, GitHub asks for a runner name and work directory. I normally give the machine a descriptive name such as:

```text
proxmox-runner-01
```

The default work directory, `_work`, is fine for a simple setup.

A newly registered runner receives default labels such as:

```text
self-hosted
linux
x64
```

I add a custom label only when it describes something useful about the machine, for example:

```text
proxmox
```

Labels are routing metadata, not security boundaries.

## 5. Test it in the foreground first

Before turning the runner into a service, I run it interactively:

```bash
./run.sh
```

A healthy runner should connect to GitHub and report that it is listening for jobs.

For the first workflow, I keep the test intentionally boring:

```yaml
name: Test self-hosted runner

on:
  workflow_dispatch:

jobs:
  test:
    runs-on: [self-hosted, linux, x64, proxmox]

    steps:
      - uses: actions/checkout@v6

      - name: Show runner information
        run: |
          hostname
          uname -a
          nproc
          free -h
          df -h /
```

The labels in `runs-on` are cumulative: the selected runner must match all of them. GitHub documents this behavior in <a href="https://docs.github.com/en/actions/how-tos/manage-runners/self-hosted-runners/use-in-a-workflow" target="_blank" rel="noopener noreferrer">Using self-hosted runners in a workflow</a>.

Once that job finishes on the expected VM, I stop `run.sh` with `Ctrl+C` and configure service mode.

## 6. Run the runner as a systemd service

On Linux, the runner package creates `svc.sh` after the runner has been configured.

From the runner directory:

```bash
sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
```

GitHub also supports passing a username to the install command when the service should run as a particular user.

The official <a href="https://docs.github.com/en/actions/how-tos/manage-runners/self-hosted-runners/configure-the-application" target="_blank" rel="noopener noreferrer">service configuration guide</a> documents the current commands.

There is one Ubuntu/Debian detail that is easy to miss. On systems with `needrestart`, GitHub recommends preventing `needrestart` from restarting the Actions runner service in the middle of a workflow job:

```bash
echo '$nrconf{override_rc}{qr(^actions\.runner\..+\.service$)} = 0;' \
  | sudo tee /etc/needrestart/conf.d/actions_runner_services.conf
```

I also configure the Proxmox VM itself to **Start at boot** so a hypervisor reboot does not leave the runner offline indefinitely.

## 7. Target the runner deliberately

I prefer explicit labels rather than sending every self-hosted job to whichever machine happens to be idle.

For example:

```yaml
jobs:
  build:
    runs-on: [self-hosted, linux, x64, proxmox]

    steps:
      - uses: actions/checkout@v6
      - run: ./ci/build.sh
```

For an organization with several runners, runner groups add another useful layer. GitHub lets organization owners limit which repositories are allowed to use a runner group. That is much more meaningful for access control than inventing dozens of labels.

## The security model matters more than the installation

This is the part I would not skip.

GitHub's <a href="https://docs.github.com/en/actions/reference/security/secure-use" target="_blank" rel="noopener noreferrer">secure use guidance</a> explicitly warns that self-hosted runners do not get the clean, isolated VM guarantee of GitHub-hosted runners. A persistent runner can be compromised by untrusted workflow code and remain compromised after the job finishes.

GitHub recommends using self-hosted runners only with private repositories in normal deployments. Public repositories are especially dangerous because pull requests from forks can become a path for attacker-controlled workflow code to execute on the runner.

Even a private repository is not automatically trusted. Someone with enough repository access may still be able to create a branch or pull request that causes code to execute on the runner.

My baseline rules are therefore:

- I do not attach a general-purpose persistent runner to public repositories.
- I keep the runner in a dedicated VM.
- I do not place production credentials on the VM unless the workflow genuinely needs them.
- I keep `GITHUB_TOKEN` permissions as narrow as the workflow allows.
- I restrict network access to internal services the runner actually needs.
- I treat third-party actions and workflow changes as executable code.
- I use runner groups when several repositories share organization-level runners.
- I keep the guest OS, Docker, and build tooling updated.

A snapshot is useful for recovery from an accidental configuration change, but I would not treat restoring an old snapshot as a complete security response after running hostile code. Rebuilding the VM from a trusted image is much cleaner.

## Persistent versus ephemeral runners

A normal self-hosted runner is persistent. The same machine can execute many jobs over time, and files, caches, processes, credentials, Docker images, or malicious changes may survive between jobs if the workflow does not clean them up.

GitHub also supports registering a runner with:

```bash
./config.sh \
  --url https://github.com/OWNER/REPOSITORY \
  --token REGISTRATION_TOKEN \
  --ephemeral
```

An ephemeral runner is automatically **de-registered after one job**.

That does not automatically erase the machine. If I want each job to start from a genuinely clean environment, I still need automation that destroys and recreates the VM or container after the runner finishes. At larger scale, GitHub's Actions Runner Controller is designed for this kind of ephemeral autoscaling model.

For one private homelab repository, a persistent VM is usually much simpler. I just have to be honest about the trust boundary.

## Runner updates are mostly automatic

The runner application updates itself by default when new runner software becomes available. GitHub can update it when a job is assigned, and an idle runner will normally update within about a week of a new release.

That means the old pattern of manually downloading every runner release is usually unnecessary.

GitHub also supports `--disableupdate` for environments where the runner version is managed externally, such as immutable images. If automatic updates are disabled, I become responsible for keeping the runner current. GitHub requires manually managed runners to stay close enough to current releases to continue receiving jobs.

The operating system and every other tool on the VM are still my responsibility regardless of runner auto-update behavior.

## Maintenance I actually care about

The failures I expect from a small self-hosted runner are boring ones:

- The disk fills with Docker layers or build output
- A package upgrade changes a toolchain
- The VM reboots and the runner service does not come back
- A workflow expects a runtime that is not installed
- A custom label changes and jobs sit queued
- Networking or DNS prevents the runner from reaching GitHub

So I periodically check:

```bash
sudo ./svc.sh status
df -h
docker system df 2>/dev/null || true
```

I prefer deliberate cleanup over a cron job that blindly runs `docker system prune -af --volumes`. CI caches are useful, and deleting every unused volume on a schedule can destroy data that a workflow actually expects to persist.

I also back up the VM configuration when it is useful, but I keep the actual runner setup reproducible enough that rebuilding the VM is not a disaster.

## What this setup is good for

A Proxmox VM with a self-hosted runner is useful when I want CI jobs to use hardware I already control, need access to a private lab network, want more disk or CPU than a particular hosted environment gives me, or simply want to understand what is happening underneath the CI abstraction.

It is not automatically better than GitHub-hosted runners. Hosted runners have one enormous advantage: GitHub gives each standard job a managed environment instead of asking me to maintain a long-lived execution machine.

For my own infrastructure, that tradeoff is exactly why I like running a self-hosted runner in a VM rather than directly on the host. I get the control I want, but I still have a disposable boundary around the thing that executes my workflows.
