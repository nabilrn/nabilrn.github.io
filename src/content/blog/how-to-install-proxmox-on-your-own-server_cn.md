---
title: "如何在自己的服务器上安装 Proxmox VE"
description: "从制作 USB 安装盘到首次登录 Web UI，完整说明如何在裸机服务器上安装 Proxmox Virtual Environment。"
pubDate: 2026-04-01
tags: ["proxmox", "homelab", "virtualization", "linux"]
featured: true
draft: false
locale: "cn"
translationKey: "how-to-install-proxmox-on-your-own-server"
---

如果你想在一台物理服务器上运行多个虚拟机和容器，Proxmox VE 是非常实用的免费方案。它基于 Debian，提供完整的 Web 管理界面，可以管理 VM、LXC 容器、存储、网络和备份。

这篇指南会从裸机安装开始，一直到你第一次登录 Proxmox Web UI。

## 准备内容

你需要：

- 一台专用服务器或 PC，CPU 支持 64-bit 和 VT-x/AMD-V
- 至少 8 GB RAM，推荐 16 GB 或更多
- 至少 2 GB 的 USB 闪存盘
- 稳定的网络连接
- 安装阶段使用的显示器和键盘

Proxmox 会直接安装在硬件上，不是在 Windows 或其他系统里面运行。目标磁盘上的原有系统会被替换。

## 第 1 步 - 下载 Proxmox VE ISO

打开官方下载页面并下载最新稳定版 ISO：

```text
https://www.proxmox.com/en/downloads/proxmox-virtual-environment/iso
```

ISO 文件通常约 1 GB 以上。

## 第 2 步 - 制作可启动 USB

可以使用 Rufus、Etcher 或 `dd` 将 ISO 写入 USB。

Windows 使用 Rufus：

1. 打开 Rufus
2. 选择 USB 设备
3. 点击 "SELECT" 并选择 Proxmox ISO
4. UEFI 使用 GPT，Legacy BIOS 使用 MBR
5. 点击 "START" 并等待完成

Linux 或 macOS 可以使用：

```bash
lsblk
sudo dd if=proxmox-ve_8.x-x.iso of=/dev/sdX bs=4M status=progress
sync
```

务必确认 `of=` 指向正确的 USB 设备，选错磁盘会清除数据。

## 第 3 步 - 从 USB 启动

将 USB 插入服务器，进入 BIOS/UEFI，把 USB 设置为第一启动项，或者使用一次性启动菜单。保存后重启，你会看到 Proxmox VE 安装界面。

## 第 4 步 - 运行安装程序

安装过程如下：

1. 选择 **Install Proxmox VE (Graphical)**
2. 接受 EULA
3. 选择目标磁盘，安装器会完整格式化它
4. 设置国家、时区和键盘布局
5. 创建 root 密码并填写邮箱
6. 配置网络：
   - **Management interface:** 连接 LAN 的网卡
   - **Hostname:** 例如 `pve.local` 或 `proxmox.homelab`
   - **IP address:** 设置静态 IP，例如 `192.168.1.100/24`
   - **Gateway:** 路由器 IP，例如 `192.168.1.1`
   - **DNS server:** 路由器或公共 DNS，如 `1.1.1.1`
7. 检查摘要并点击 **Install**

建议使用静态 IP。之后访问 Web UI 会依赖这个地址。

## 第 5 步 - 访问 Web UI

重启后，服务器控制台会显示 Web UI 地址：

```text
https://192.168.1.100:8006
```

在同一网络中的电脑浏览器打开这个地址。浏览器会出现证书警告，这是因为 Proxmox 默认使用自签名证书，可以继续访问。

登录信息：

- **Username:** root
- **Password:** 安装时设置的密码
- **Realm:** Linux PAM standard authentication

## 第 6 步 - 更新系统

如果没有企业订阅，可以使用 no-subscription repository：

```bash
echo "deb http://download.proxmox.com/debian/pve bookworm pve-no-subscription" > /etc/apt/sources.list.d/pve-no-subscription.list
sed -i 's/^deb/#deb/' /etc/apt/sources.list.d/pve-enterprise.list
apt update && apt full-upgrade -y
reboot
```

登录时的订阅提示不会影响功能。对于个人 homelab，理解它只是商业提醒即可。

## 第 7 步 - 上传 ISO 并创建第一台 VM

在 Web UI 中：

1. 选择左侧的 Proxmox 节点
2. 打开 **local** 存储
3. 进入 **ISO Images** 标签
4. 上传 Ubuntu Server、Debian 或 Windows ISO
5. 点击 **Create VM**
6. 设置名称、VM ID、ISO、系统类型、磁盘、CPU、内存和网络桥接
7. 点击 **Finish**
8. 启动 VM 并打开 **Console** 安装系统

默认的 `vmbr0` 桥接网络通常足够用于基础 homelab。

## 安装后的建议

- 如果需要 GPU 或 PCIe passthrough，在 BIOS 开启 IOMMU
- 通过 Datacenter > Backup 设置备份计划
- 可以使用 Proxmox Backup Server 或内置 `vzdump`
- 如果服务器暴露到互联网，给 root 开启 2FA
- 多磁盘场景可以考虑 ZFS

## 常见问题

**无法访问 Web UI：** 确认使用 `https://` 和端口 `8006`，并检查服务器 IP 是否可达。

**启动循环或找不到 GRUB：** BIOS 启动模式可能和安装模式不一致。UEFI 安装就使用 UEFI 启动，Legacy 安装就使用 Legacy/CSM。

**VM 性能慢：** 创建 VM 时尽量使用 VirtIO 磁盘和网络。Windows VM 需要 VirtIO 驱动 ISO。

## 结尾

完成这些步骤后，你就有了一台可用的 Proxmox VE 服务器。整个过程通常只需要 15-20 分钟。

接下来你可以创建开发环境 VM、在 LXC 中运行 Docker、搭建 NAS、创建 Kubernetes 集群，或者继续扩展自己的 homelab。
