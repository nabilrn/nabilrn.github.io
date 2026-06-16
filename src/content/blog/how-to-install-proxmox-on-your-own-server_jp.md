---
title: "自分のサーバーに Proxmox VE をインストールする方法"
description: "USB インストーラーの作成から Web UI への初回ログインまで、Proxmox Virtual Environment をベアメタルに導入する手順です。"
pubDate: 2026-04-01
tags: ["proxmox", "homelab", "virtualization", "linux"]
featured: true
draft: false
locale: "jp"
translationKey: "how-to-install-proxmox-on-your-own-server"
---

一台の物理サーバーで複数の仮想マシンやコンテナを動かしたいなら、Proxmox VE は非常に使いやすい無料の選択肢です。Debian ベースのハイパーバイザーで、VM、LXC コンテナ、ストレージ、ネットワーク、バックアップを Web UI から管理できます。

このガイドでは、ベアメタルへのクリーンインストールを最初から最後まで説明します。

## 必要なもの

準備するものは次の通りです。

- VT-x/AMD-V に対応した 64-bit CPU 搭載のサーバーまたは PC
- 最低 8 GB RAM、推奨は 16 GB 以上
- 2 GB 以上の USB メモリ
- 安定したインターネット接続
- インストール時に使うモニターとキーボード

Proxmox はハードウェアに直接インストールします。Windows などの上に入れるものではなく、対象ディスクの既存 OS は置き換えられます。

## Step 1 - Proxmox VE ISO をダウンロード

公式ダウンロードページから最新の安定版 ISO を取得します。

```text
https://www.proxmox.com/en/downloads/proxmox-virtual-environment/iso
```

ISO は通常 1 GB 以上あります。

## Step 2 - 起動用 USB を作成

Rufus、Etcher、または `dd` で ISO を USB に書き込みます。

Windows で Rufus を使う場合：

1. Rufus を開く
2. USB ドライブを選ぶ
3. "SELECT" で Proxmox ISO を選択
4. UEFI なら GPT、Legacy BIOS なら MBR を選ぶ
5. "START" を押して完了まで待つ

Linux または macOS の場合：

```bash
lsblk
sudo dd if=proxmox-ve_8.x-x.iso of=/dev/sdX bs=4M status=progress
sync
```

`of=` の対象を間違えるとディスクが消去されます。必ず確認してください。

## Step 3 - USB から起動

USB をサーバーに挿し、BIOS/UEFI に入って USB を最初の起動デバイスに設定します。もしくは一時的な boot menu から USB を選びます。保存して再起動すると Proxmox VE インストーラーが表示されます。

## Step 4 - インストーラーを実行

手順は次の通りです。

1. **Install Proxmox VE (Graphical)** を選択
2. EULA に同意
3. インストール先ディスクを選択。完全にフォーマットされます
4. 国、タイムゾーン、キーボードレイアウトを設定
5. root パスワードとメールアドレスを入力
6. ネットワークを設定：
   - **Management interface:** LAN に接続された NIC
   - **Hostname:** `pve.local` や `proxmox.homelab`
   - **IP address:** `192.168.1.100/24` などの静的 IP
   - **Gateway:** ルーターの IP
   - **DNS server:** ルーターまたは `1.1.1.1`
7. Summary を確認して **Install**

Web UI はこの IP にアクセスするため、静的 IP を使うのがおすすめです。

## Step 5 - Web UI にアクセス

再起動後、コンソールに Web UI の URL が表示されます。

```text
https://192.168.1.100:8006
```

同じネットワーク内のブラウザから開きます。Proxmox は自己署名証明書を使うため証明書警告が出ますが、これは通常の挙動です。

ログイン情報：

- **Username:** root
- **Password:** インストール時に設定したもの
- **Realm:** Linux PAM standard authentication

## Step 6 - システムを更新

有料サブスクリプションを使わない場合は no-subscription repository を設定します。

```bash
echo "deb http://download.proxmox.com/debian/pve bookworm pve-no-subscription" > /etc/apt/sources.list.d/pve-no-subscription.list
sed -i 's/^deb/#deb/' /etc/apt/sources.list.d/pve-enterprise.list
apt update && apt full-upgrade -y
reboot
```

ログイン時の subscription popup は機能には影響しません。個人用 homelab では商用案内として理解しておけば十分です。

## Step 7 - ISO をアップロードして最初の VM を作成

Web UI で以下を行います。

1. 左サイドバーから Proxmox ノードを選択
2. **local** ストレージを開く
3. **ISO Images** タブへ移動
4. Ubuntu Server、Debian、Windows などの ISO をアップロード
5. **Create VM** をクリック
6. 名前、VM ID、ISO、OS タイプ、ディスク、CPU、RAM、ネットワークブリッジを設定
7. **Finish** をクリック
8. VM を Start し、**Console** から OS をインストール

初期構成では `vmbr0` のデフォルトブリッジで十分なことが多いです。

## インストール後のヒント

- GPU や PCIe passthrough を使うなら BIOS で IOMMU を有効化
- Datacenter > Backup でバックアップスケジュールを設定
- Proxmox Backup Server または `vzdump` を利用
- インターネットからアクセスできるなら root に 2FA を設定
- 複数ディスク構成なら ZFS も検討

## よくある問題

**Web UI にアクセスできない：** `https://` とポート `8006` を使っているか確認し、サーバー IP に到達できるか確認します。

**Boot loop や GRUB not found：** BIOS の起動モードがインストール時と合っていない可能性があります。UEFI なら UEFI、Legacy なら Legacy/CSM に合わせます。

**VM が遅い：** ディスクとネットワークに VirtIO を使います。Windows VM では VirtIO driver ISO が必要です。

## まとめ

これで Proxmox VE を自分のサーバーで使える状態になります。USB 作成から Web UI ログインまで、通常は 15-20 分程度です。

この後は開発用 VM、Docker 用 LXC、NAS、Kubernetes クラスターなど、自分の homelab に合わせて自由に拡張できます。
