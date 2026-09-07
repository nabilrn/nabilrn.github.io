---
title: "How to Install Proxmox VE on Your Own Server"
description: "A practical bare-metal Proxmox VE 9 guide focused on the decisions that matter most: installation media, storage, networking, repositories, updates, and the first VM."
pubDate: 2026-04-01
tags: ["proxmox", "homelab", "virtualization", "linux"]
featured: true
draft: false
---

The first time I installed Proxmox, I expected the installer itself to be the difficult part. It was not.

The part that deserves more attention is everything around it: which disk you are about to erase, how the management network should be configured, whether ZFS actually makes sense for the hardware, and what repository you should use after the first boot. If those decisions are correct, the installation is fairly straightforward.

This is the version of the process I would use for a new single-node lab or development server today. It targets **Proxmox VE 9.x**; the current stable ISO is Proxmox VE 9.2, which is based on Debian 13.5 "Trixie." Proxmox combines KVM virtual machines and LXC system containers behind the same web interface.

## Before installing, decide what this machine is for

You do not need enterprise hardware to learn Proxmox, but the hardware still determines what the node can realistically run.

Proxmox's <a href="https://pve.proxmox.com/pve-docs/pve-admin-guide.pdf" target="_blank" rel="noopener noreferrer">official administration guide</a> lists 2 GB of memory for the host and Proxmox services as the baseline, **plus the memory assigned to guests**. That is a minimum, not a useful sizing target for most labs. I would rather start with 8 GB for a small test node and 16 GB or more if I plan to run several VMs. ZFS and Ceph need additional memory.

For a normal x86 server, I would prepare:

- A 64-bit Intel or AMD CPU with VT-x/AMD-V enabled in firmware
- Enough RAM for the host **and** every VM or container you plan to run
- An SSD or other storage you are willing to erase completely
- A wired network connection
- A USB flash drive large enough for the installer image
- Another machine on the same network for accessing the web UI

If I need PCIe or GPU passthrough later, I also check for Intel VT-d or AMD IOMMU support before building the rest of the setup around that idea.

Most importantly: **back up anything on the installation disk first**. The Proxmox installer repartitions the selected target and removes the data already on it.

## 1. Download the official ISO

Get the installer from the <a href="https://www.proxmox.com/en/downloads/proxmox-virtual-environment/iso" target="_blank" rel="noopener noreferrer">official Proxmox VE ISO page</a>. For x86-64 hardware, the current installer is Proxmox VE 9.2-1. Proxmox also provides a separate Arm64 installer, so make sure you download the image that matches the server architecture.

I also verify the SHA-256 checksum shown on the download page before writing an infrastructure installer to USB. On Linux, for example:

```bash
sha256sum proxmox-ve_*.iso
```

The value should match the checksum published by Proxmox for that exact ISO.

## 2. Write the ISO to a USB drive

The Proxmox installer is a hybrid ISO, so it should be written as a disk image rather than copied onto a normally formatted USB drive.

On Windows, Etcher works directly. Rufus also works, but Proxmox specifically documents using **DD mode**. If Rufus asks to download a different GRUB version, choose **No**, then select DD mode when prompted.

On Linux, I usually use `dd`:

```bash
lsblk
sudo dd bs=1M conv=fdatasync if=./proxmox-ve_*.iso of=/dev/sdX
```

Replace `/dev/sdX` with the USB device itself, not one of its partitions.

This is one of those commands where reading it twice is faster than recovering from a mistake. A wrong `of=` target can overwrite another disk.

## 3. Boot the server from USB

Connect the installer USB, reboot the server, and open the firmware boot menu. The exact key depends on the hardware: `F2`, `F11`, `F12`, `Delete`, or `Esc` are common.

Choose the USB device and wait for the Proxmox installer menu. The normal choice is **Install Proxmox VE (Graphical)**. There is also a Terminal UI installer, which is useful when the graphical environment does not behave correctly on particular hardware. Both use the same installation backend.

## 4. Choose storage deliberately

The installer will ask which disk and filesystem should hold Proxmox.

For a simple single-disk lab, the default LVM-thin setup is usually enough. I would not choose ZFS just because it appears more advanced. ZFS becomes interesting when I actually want its integrity, snapshot, and storage-management properties and have enough memory and suitable disks for it.

If I do use ZFS, I avoid putting hardware RAID underneath it. Proxmox's own guidance recommends giving ZFS or Ceph direct access to disks rather than hiding them behind a hardware RAID controller.

The important question here is not "which option looks best?" It is **how I expect this server to store and recover guest data later**.

Once the target is correct, set the country, timezone, keyboard layout, root password, and notification email.

## 5. Treat the management network as infrastructure

This is the installer page I spend the most time checking.

Choose the physical NIC that is actually connected to the LAN, then configure:

- A hostname for the node, preferably a proper hostname you can keep long-term
- A static management IP and prefix
- The default gateway
- A working DNS server

For example, on a home `/24` network:

```text
Hostname: pve01.home.arpa
IP:       192.168.1.20/24
Gateway:  192.168.1.1
DNS:      192.168.1.1
```

Do not copy those addresses blindly. They must match your own network and must not collide with another device.

A standard installation creates a Linux bridge named `vmbr0` connected to the selected physical NIC. Think of that bridge like a software switch: the Proxmox host and its guests can use the same physical uplink while each VM still has its own virtual network interface. The <a href="https://pve.proxmox.com/wiki/Network_Configuration" target="_blank" rel="noopener noreferrer">Proxmox network documentation</a> is worth reading before changing bridges, VLANs, bonds, or routing later.

I prefer a fixed management address because losing track of the hypervisor's address is an unnecessary way to make maintenance harder.

## 6. Install, reboot, and open the web UI

Review the summary carefully, especially the target disk and IP configuration, then start the installation.

After the node reboots, remove the USB drive. The local console should show the management URL. From another machine on the same network, open:

```text
https://YOUR-PROXMOX-IP:8006
```

A fresh node normally uses a certificate issued by Proxmox's local cluster CA, so a browser that does not trust that CA can show a certificate warning. For a private lab, I verify that I am connecting to the expected host before proceeding rather than treating certificate warnings as meaningless.

Log in with:

```text
User:  root
Realm: Linux PAM standard authentication
```

and the root password created during installation.

## 7. Configure the package repository correctly

A fresh Proxmox installation has the enterprise repository available for systems with a valid subscription. That repository is the recommended one for production because its packages receive additional testing and validation.

For a homelab or evaluation node without a subscription, use the **no-subscription** repository instead. The easiest method is through the web UI repository management panel: disable the enterprise repository and add the no-subscription repository.

For Proxmox VE 9, the old Bookworm `.list` examples that are still scattered around blog posts are outdated. The current configuration uses Debian's deb822-style `.sources` files and the `trixie` suite. The equivalent no-subscription entry is:

```text
Types: deb
URIs: http://download.proxmox.com/debian/pve
Suites: trixie
Components: pve-no-subscription
Signed-By: /usr/share/keyrings/proxmox-archive-keyring.gpg
```

in:

```text
/etc/apt/sources.list.d/proxmox.sources
```

The no-subscription repository is free to access, but Proxmox explicitly describes it as appropriate for testing and non-production use because packages are not validated to the same level as the enterprise repository.

The subscription reminder in the UI does not mean the hypervisor is broken or feature-limited. I leave application files alone instead of patching the web interface just to hide the message.

## 8. Update the node before creating workloads

The installer ISO is only a snapshot. Proxmox recommends updating a fresh installation to the latest available packages.

From the shell:

```bash
apt update
apt dist-upgrade
```

Then reboot if the update installed a new kernel or other components that require it:

```bash
reboot
```

The same update flow is available in the web UI.

## 9. Upload an ISO and create the first VM

For my first guest, I normally create something boring, such as an Ubuntu or Debian VM, before experimenting with passthrough, nested virtualization, or complicated networking.

In the web UI:

1. Select the node and a storage that accepts ISO images, commonly `local`.
2. Open **ISO Images** and upload the guest installer.
3. Click **Create VM**.
4. Choose the uploaded ISO.
5. Assign CPU, memory, and disk resources conservatively.
6. Connect the virtual NIC to `vmbr0` unless the network design requires something else.
7. Start the VM and complete the guest OS installation from the console.

For modern guests I prefer VirtIO-based virtual devices where the guest has the required drivers. Proxmox's migration guidance recommends VirtIO networking because of its low overhead, and VirtIO SCSI is a strong default for VM disks. Windows guests may need the VirtIO driver ISO during installation.

I also install the QEMU Guest Agent inside VMs where it is supported. That gives the host better visibility and allows cleaner communication with the guest operating system.

## A few things I would not configure on day one

It is tempting to finish a new Proxmox installation by immediately enabling every feature. I have found it more useful to establish a boring working baseline first.

I would postpone PCIe passthrough until the node is stable and the IOMMU groups are understood. I would not build a cluster before one node's storage and network design make sense. I would not expose port `8006` directly to the public internet just because the web interface is convenient. And I would not use ZFS, Ceph, VLANs, or bonding without first understanding what problem each one is solving.

The same applies to Docker. Proxmox LXC containers are **system containers**, not Docker-style application containers. Proxmox's documentation recommends running Docker application containers inside a QEMU VM when you want stronger isolation and normal VM lifecycle behavior. That is the model I prefer for Docker hosts as well.

## What I check after the first VM boots

At that point, the installation is technically finished, but I still verify a few things before trusting the node:

- The host keeps the expected management IP after reboot
- DNS and the default gateway work
- Package updates complete without repository errors
- The first VM can reach the LAN or internet as intended
- Guest storage is on the datastore I expected
- Backups have somewhere **outside the guest's own disk** to go
- I can still reach the node through a local console or another recovery path if networking breaks

Those checks are much more valuable than making the dashboard look finished.

Proxmox itself is not difficult to install. The useful part is understanding the small infrastructure decisions around the installer, because those decisions are what determine whether the server is still easy to operate six months later.

The next part of my setup is a self-hosted GitHub Actions runner inside a Proxmox VM. That is where this stops being an empty hypervisor and starts doing actual work.
