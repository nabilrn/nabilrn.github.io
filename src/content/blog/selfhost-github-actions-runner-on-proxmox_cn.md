---
title: "如何在 Proxmox 上搭建自托管 GitHub Actions Runner"
description: "在 Proxmox VM 中运行自己的 GitHub Actions runner，从创建 VM 到执行第一个 workflow。"
pubDate: 2026-04-04
tags: ["github-actions", "ci-cd", "proxmox", "devops"]
featured: true
draft: false
locale: "cn"
translationKey: "selfhost-github-actions-runner-on-proxmox"
---

GitHub Actions 提供免费的 hosted runner 分钟数，但如果你有多个仓库或较重的构建任务，这些分钟数很快会用完。一个实用的方案是：在自己的硬件上运行 self-hosted runner。

如果你已经安装了 Proxmox，就可以创建一台专用 VM，安装 GitHub Actions runner，并把它注册到仓库或组织中。

## 为什么自托管 Runner？

- **没有分钟数限制**，适合个人项目和私有仓库
- **构建更快**，可以使用自己的 CPU、内存和磁盘
- **缓存持久化**，依赖、Docker image 和中间产物不会每次重来
- **可访问本地资源**，例如内网数据库、API 或 homelab 服务
- **完全控制环境**，可以安装任何需要的软件

代价是你需要自己维护 VM、安全更新和运行稳定性。

## 准备内容

- 已运行的 Proxmox VE
- GitHub 账号和至少一个仓库
- 已上传到 Proxmox 的 Ubuntu Server 22.04 或 24.04 ISO
- 大约 30 分钟时间

## 第 1 步 - 在 Proxmox 创建 VM

在 Proxmox Web UI 中：

1. 点击 **Create VM**
2. **General**：命名为 `github-runner`
3. **OS**：选择 Ubuntu Server ISO
4. **System**：勾选 **Qemu Agent**
5. **Disks**：使用 VirtIO Block，至少 40 GB
6. **CPU**：至少 2 core，推荐 4 core
7. **Memory**：至少 4096 MB，推荐 8192 MB
8. **Network**：bridge 使用 `vmbr0`，model 使用 VirtIO

点击 **Finish**，启动 VM 并打开 **Console** 安装 Ubuntu。

## 第 2 步 - 安装 Ubuntu Server

可以选择 minimized server。安装时启用 **Install OpenSSH server**，方便之后通过 SSH 管理。重启后连接：

```bash
ssh runner@<vm-ip-address>
```

建议创建名为 `runner` 的用户，后续安装服务更直观。

## 第 3 步 - 更新系统并安装依赖

```bash
sudo apt update && sudo apt upgrade -y

sudo apt install -y \
  curl wget git build-essential jq unzip zip \
  software-properties-common apt-transport-https \
  ca-certificates gnupg lsb-release

sudo apt install -y qemu-guest-agent
sudo systemctl enable qemu-guest-agent
sudo systemctl start qemu-guest-agent
```

QEMU guest agent 可以让 Proxmox 更准确地读取 VM 状态。

## 第 4 步 - 安装 Docker

很多 CI/CD workflow 会用 Docker 构建或测试，因此建议提前安装。

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker runner
sudo docker run hello-world
```

重新登录后，Docker group 权限才会生效。

## 第 5 步 - 安装需要的 Runtime

如果 workflow 构建 Node.js 项目，可以安装 Node.js：

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

根据项目需要继续安装 Python、Go、Java、pnpm 等工具。

## 第 6 步 - 下载并配置 Runner

进入 GitHub 仓库：

1. 打开 **Settings > Actions > Runners**
2. 点击 **New self-hosted runner**
3. 选择 **Linux** 和 **x64**
4. 按 GitHub 页面给出的命令执行

示例：

```bash
mkdir actions-runner && cd actions-runner
curl -o actions-runner-linux-x64-2.321.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.321.0/actions-runner-linux-x64-2.321.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.321.0.tar.gz
```

实际版本和 URL 以 GitHub 页面为准。

## 第 7 步 - 注册 Runner

执行 GitHub 提供的配置命令：

```bash
./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPO --token YOUR_TOKEN_HERE
```

交互配置建议：

- **Runner group:** 使用默认
- **Runner name:** 例如 `proxmox-runner`
- **Labels:** `self-hosted,linux,x64,proxmox`
- **Work folder:** 默认 `_work`

如果注册到组织层级，使用组织 URL：

```bash
./config.sh --url https://github.com/YOUR_ORG --token YOUR_TOKEN_HERE
```

## 第 8 步 - 测试 Runner

先在前台启动：

```bash
./run.sh
```

GitHub 页面应该显示 runner 为 **Idle**。然后创建一个简单 workflow：

```yaml
name: Test Self-Hosted Runner

on:
  workflow_dispatch:

jobs:
  test:
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4
      - run: echo "Build completed on self-hosted runner"
```

在 Actions 页面手动触发 workflow，确认 job 运行在你的 runner 上。

## 第 9 步 - 安装为 Service

不要长期保持终端窗口打开。把 runner 安装成 systemd service：

```bash
cd ~/actions-runner
sudo ./svc.sh install runner
sudo ./svc.sh start
sudo ./svc.sh status
```

这样 VM 重启后 runner 会自动启动。

## 第 10 步 - 设置 Proxmox VM 自动启动

在 Proxmox 中选择 `github-runner` VM，进入 **Options**，把 **Start at boot** 设置为 **Yes**。如果有依赖服务，可以配置启动顺序。

## 安全注意事项

Self-hosted runner 会在你的机器上执行 workflow 代码。不要把它用于接受陌生人 pull request 的公共仓库。建议隔离 VM、限制网络访问、定期更新系统、合理使用 labels，并清理旧的 Docker image 和构建产物。

## 维护

GitHub runner 通常可以自动更新，但你仍然需要监控磁盘空间和系统补丁。Docker 缓存可以定期清理：

```bash
docker system prune -af --volumes
```

做重大变更前，建议在 Proxmox 中创建 snapshot。

## 结尾

完成后，你就拥有一个运行在自己硬件上的 CI/CD runner。它没有 hosted runner 的分钟数限制，可以保留缓存，也能访问本地资源。对于 homelab 来说，这是非常实用的 Proxmox 用法。
