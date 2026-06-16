---
title: "Proxmox 上に Self-Hosted GitHub Actions Runner を構築する方法"
description: "Proxmox VM に GitHub Actions runner をセットアップし、自分の CI/CD パイプラインを動かす手順です。"
pubDate: 2026-04-04
tags: ["github-actions", "ci-cd", "proxmox", "devops"]
featured: true
draft: false
locale: "jp"
translationKey: "selfhost-github-actions-runner-on-proxmox"
---

GitHub Actions には hosted runner の無料枠がありますが、複数のリポジトリや重いビルドを扱うとすぐに足りなくなります。そこで便利なのが、自分のハードウェア上で self-hosted runner を動かす方法です。

すでに Proxmox を導入しているなら、専用 VM を作成し、GitHub Actions runner をインストールして、リポジトリまたは Organization に登録できます。

## Self-Hosted Runner を使う理由

- **分数制限がない**ため、必要なだけ workflow を実行できる
- **ビルドが速い**場合がある。自分の CPU、RAM、SSD を使える
- **キャッシュが残る**ため、依存関係や Docker image を毎回取得し直さなくてよい
- **ローカルリソースにアクセスできる**。内部 API、DB、homelab サービスなど
- **環境を完全に制御できる**。必要な runtime やツールを自由に入れられる

一方で、VM の保守、セキュリティ、アップデートは自分の責任になります。

## 必要なもの

- 稼働中の Proxmox VE
- GitHub アカウントと少なくとも一つのリポジトリ
- Proxmox にアップロード済みの Ubuntu Server 22.04 または 24.04 ISO
- 約 30 分

## Step 1 - Proxmox で VM を作成

Proxmox Web UI で以下を設定します。

1. **Create VM** をクリック
2. **General:** `github-runner` などの名前を付ける
3. **OS:** Ubuntu Server ISO を選択
4. **System:** **Qemu Agent** を有効化
5. **Disks:** VirtIO Block、最低 40 GB
6. **CPU:** 最低 2 core、推奨 4 core
7. **Memory:** 最低 4096 MB、推奨 8192 MB
8. **Network:** bridge は `vmbr0`、model は VirtIO

**Finish** を押して VM を起動し、**Console** から Ubuntu をインストールします。

## Step 2 - Ubuntu Server をインストール

可能なら minimized server を選びます。SSH 管理のため **Install OpenSSH server** を有効化してください。インストール後に再起動し、SSH で接続します。

```bash
ssh runner@<vm-ip-address>
```

ユーザー名を `runner` にしておくと、後の service 登録が分かりやすくなります。

## Step 3 - システム更新と依存パッケージ

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

QEMU guest agent により、Proxmox から VM の状態をより正確に確認できます。

## Step 4 - Docker をインストール

CI/CD では Docker を使うことが多いため、先に入れておくと便利です。

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker runner
sudo docker run hello-world
```

Docker group の変更を反映するため、一度ログアウトして再ログインします。

## Step 5 - 必要な Runtime を追加

Node.js プロジェクトをビルドする場合：

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

必要に応じて Python、Go、Java、pnpm などもインストールします。

## Step 6 - Runner をダウンロードして設定

GitHub リポジトリで以下を開きます。

1. **Settings > Actions > Runners**
2. **New self-hosted runner**
3. **Linux** と **x64** を選択
4. GitHub が表示するコマンドを実行

例：

```bash
mkdir actions-runner && cd actions-runner
curl -o actions-runner-linux-x64-2.321.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.321.0/actions-runner-linux-x64-2.321.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.321.0.tar.gz
```

実際のバージョンと URL は GitHub の画面に従ってください。

## Step 7 - Runner を登録

GitHub が提示する config コマンドを実行します。

```bash
./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPO --token YOUR_TOKEN_HERE
```

入力例：

- **Runner group:** default
- **Runner name:** `proxmox-runner`
- **Labels:** `self-hosted,linux,x64,proxmox`
- **Work folder:** default `_work`

Organization に登録する場合：

```bash
./config.sh --url https://github.com/YOUR_ORG --token YOUR_TOKEN_HERE
```

## Step 8 - Runner をテスト

まず foreground で起動します。

```bash
./run.sh
```

GitHub の Runners ページで **Idle** と表示されれば準備完了です。テスト用 workflow を作成します。

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

Actions タブから手動実行し、自分の runner で job が動くことを確認します。

## Step 9 - Service として起動

ターミナルを開きっぱなしにしないよう、systemd service として登録します。

```bash
cd ~/actions-runner
sudo ./svc.sh install runner
sudo ./svc.sh start
sudo ./svc.sh status
```

VM の再起動後も runner が自動で起動します。

## Step 10 - Proxmox VM を自動起動

Proxmox で `github-runner` VM を選び、**Options** から **Start at boot** を **Yes** にします。依存関係がある場合は起動順も設定します。

## セキュリティ

Self-hosted runner は workflow のコードを自分の VM 上で実行します。知らない人からの pull request を受け付ける public repository では使わないでください。VM を分離し、ネットワークアクセスを絞り、OS を更新し、labels を適切に使いましょう。

## メンテナンス

Runner は自動更新されることが多いですが、ディスク容量と OS パッチは定期的に確認します。Docker cache は必要に応じて削除します。

```bash
docker system prune -af --volumes
```

大きな変更の前には Proxmox snapshot を取ると安心です。

## まとめ

これで、自分の Proxmox サーバー上で GitHub Actions runner を動かせます。分数制限がなく、キャッシュを保持でき、ローカルリソースにもアクセスできます。homelab の実用的な活用例としてかなり便利です。
