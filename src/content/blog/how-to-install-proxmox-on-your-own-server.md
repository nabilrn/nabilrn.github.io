---
title: "How to Install Proxmox VE on Your Own Server"
description: "A complete walkthrough for installing Proxmox Virtual Environment on bare-metal hardware — from preparing the USB installer to your first login on the web UI."
pubDate: 2026-04-01
tags: ["proxmox", "homelab", "virtualization", "linux"]
featured: true
draft: false
---

If you have ever wanted to run multiple virtual machines and containers on a single physical server, Proxmox VE is one of the best free options available. It is a Debian-based hypervisor that gives you a full web interface for managing VMs, LXC containers, storage, networking, and backups — all without paying for a VMware or Hyper-V license.

This guide covers a clean bare-metal installation from start to finish.

## What You Need

Before starting, make sure you have:

- A dedicated server or PC (64-bit CPU with VT-x/AMD-V support)
- At least 8 GB of RAM (16 GB or more recommended)
- A USB flash drive (at least 2 GB)
- A stable internet connection
- A monitor and keyboard connected to the server (only needed during install)

Proxmox runs directly on the hardware — you do not install it inside Windows or another OS. It replaces whatever is currently on the disk.

## Step 1 — Download the Proxmox VE ISO

Go to the official Proxmox downloads page and grab the latest ISO image:

```
https://www.proxmox.com/en/downloads/proxmox-virtual-environment/iso
```

At the time of writing, the latest stable release is Proxmox VE 8.x. Download the ISO file (around 1.2 GB).

## Step 2 — Create a Bootable USB Drive

You need to flash the ISO onto a USB drive. Use one of these tools depending on your OS:

- **Windows** — Rufus or Etcher
- **macOS** — Etcher or `dd` via Terminal
- **Linux** — Etcher or `dd`

If using Rufus on Windows:

1. Open Rufus
2. Select your USB drive
3. Click "SELECT" and choose the Proxmox ISO
4. Leave the partition scheme as GPT (for UEFI) or MBR (for legacy BIOS)
5. Click "START"
6. Wait for it to finish

If using `dd` on Linux or macOS:

```bash
# Find your USB device name first
lsblk

# Flash the ISO (replace /dev/sdX with your actual device)
sudo dd if=proxmox-ve_8.x-x.iso of=/dev/sdX bs=4M status=progress
sync
```

Be very careful with the `of=` target — selecting the wrong disk will wipe it.

## Step 3 — Boot from the USB Drive

1. Plug the USB drive into the server
2. Power on or reboot the server
3. Enter the BIOS/UEFI setup (usually by pressing F2, F12, DEL, or ESC during boot)
4. Set the USB drive as the first boot device, or use the one-time boot menu
5. Save and exit

You should see the Proxmox VE installer boot screen.

## Step 4 — Run the Installer

Once the Proxmox installer loads:

1. Select **Install Proxmox VE (Graphical)**
2. Accept the EULA
3. Select the target hard disk where Proxmox will be installed. If you have multiple disks, choose the one you want as the system disk. The installer will format it completely.
4. Set your country, timezone, and keyboard layout
5. Create a root password and enter an email address (used for notifications, can be changed later)
6. Configure the network:
   - **Management interface** — select the network interface connected to your LAN
   - **Hostname** — something like `pve.local` or `proxmox.homelab`
   - **IP address** — assign a static IP on your local network (e.g., `192.168.1.100/24`)
   - **Gateway** — your router's IP (e.g., `192.168.1.1`)
   - **DNS server** — your router's IP or a public DNS like `1.1.1.1`

Using a static IP is important. If the IP changes later, you will lose access to the web interface until you fix it manually.

7. Review the summary and click **Install**

The installation takes a few minutes. When it finishes, remove the USB drive and reboot.

## Step 5 — Access the Web Interface

After the server reboots, it will show a console login screen with the URL to access the web UI:

```
https://192.168.1.100:8006
```

Open this URL in a browser on any computer on the same network. You will see a certificate warning — this is normal because Proxmox uses a self-signed SSL certificate. Click through the warning to proceed.

Log in with:

- **Username:** root
- **Password:** the password you set during installation
- **Realm:** Linux PAM standard authentication

You are now inside the Proxmox web interface.

## Step 6 — Remove the Subscription Nag (Optional)

If you are not using a paid Proxmox subscription, you will see a popup every time you log in. This is just a reminder and does not affect functionality.

To remove it, SSH into your server and run:

```bash
# First, update your package sources to use the no-subscription repository
echo "deb http://download.proxmox.com/debian/pve bookworm pve-no-subscription" > /etc/apt/sources.list.d/pve-no-subscription.list

# Comment out the enterprise repository (requires a subscription key)
sed -i 's/^deb/#deb/' /etc/apt/sources.list.d/pve-enterprise.list

# Update packages
apt update && apt full-upgrade -y
```

For removing the login popup itself, there are community scripts available, but the cleanest approach is to simply click "OK" each time or use a browser extension.

## Step 7 — Update Proxmox

Always update your Proxmox installation after the first boot:

```bash
apt update && apt full-upgrade -y
reboot
```

This ensures you have the latest security patches and bug fixes.

## Step 8 — Upload an ISO and Create Your First VM

Now that Proxmox is running, you can create virtual machines:

1. In the web UI, navigate to your node (e.g., `pve`) in the left sidebar
2. Click on **local** storage under the node
3. Go to the **ISO Images** tab
4. Click **Upload** and select an ISO file (e.g., Ubuntu Server, Debian, Windows)
5. Once uploaded, click **Create VM** in the top right
6. Follow the wizard:
   - Give it a name and VM ID
   - Select the ISO you uploaded as the CD/DVD
   - Choose the OS type (Linux or Windows)
   - Set the disk size, CPU cores, and RAM
   - Configure the network bridge (default `vmbr0` works for most setups)
7. Click **Finish** to create the VM
8. Select the VM, click **Start**, then open the **Console** to begin the OS installation

## Post-Install Tips

Here are a few things worth doing after a fresh Proxmox install:

- **Enable IOMMU** in your BIOS if you plan to do GPU or PCIe passthrough. You also need to add `intel_iommu=on` or `amd_iommu=on` to your kernel boot parameters in `/etc/default/grub`.
- **Set up a backup schedule** using Proxmox Backup Server or the built-in `vzdump` tool. Go to Datacenter > Backup in the web UI.
- **Create a Linux Bridge** for your VMs if you need more complex networking. The default `vmbr0` bridges to your physical NIC.
- **Enable 2FA** on the root account for security if your Proxmox host is accessible over the internet.
- **Consider ZFS** for your storage if you have multiple disks. Proxmox has built-in ZFS support during installation.

## Common Issues

**Cannot access the web UI after install:**
Make sure you are using `https://` (not `http://`) and port `8006`. Check that the server's IP is correct and reachable from your network. You can verify the IP by logging in directly on the server console and running `ip a`.

**Boot loop or GRUB not found:**
This usually means the BIOS is set to the wrong boot mode. If you installed in UEFI mode, make sure the BIOS is set to UEFI boot. If you installed in legacy mode, set it to Legacy/CSM.

**Slow performance in VMs:**
Make sure VirtIO drivers are selected for disk and network when creating VMs. For Windows VMs, you need to load the VirtIO drivers during installation from the VirtIO ISO (available on the Proxmox wiki).

## Wrapping Up

That is all you need to get Proxmox VE running on your own hardware. The entire process takes about 15-20 minutes from flashing the USB to logging into the web UI.

From here, you can create VMs for development environments, spin up Docker hosts inside LXC containers, run a NAS with TrueNAS in a VM, set up a Kubernetes cluster, or build any homelab setup you want — all managed from a single web interface.

In the next post, I will cover how to set up a self-hosted GitHub Actions runner inside a Proxmox VM, which is a great way to get free CI/CD for your projects.
