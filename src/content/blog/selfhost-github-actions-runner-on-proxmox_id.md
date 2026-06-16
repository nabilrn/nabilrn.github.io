---
title: "Cara Setup Self-Hosted GitHub Actions Runner di Proxmox"
description: "Jalankan pipeline CI/CD sendiri secara gratis dengan memasang GitHub Actions runner di VM Proxmox, dari membuat VM sampai menjalankan workflow pertama."
pubDate: 2026-04-04
tags: ["github-actions", "ci-cd", "proxmox", "devops"]
featured: true
draft: false
locale: "id"
translationKey: "selfhost-github-actions-runner-on-proxmox"
---

GitHub Actions memberi kuota gratis untuk hosted runner, tetapi kuota itu cepat habis jika kamu punya banyak repository atau build yang berat. Solusinya: jalankan runner sendiri di hardware yang sudah kamu miliki.

Kalau kamu sudah memasang Proxmox, kamu tinggal membuat satu VM khusus, menginstall GitHub Actions runner, lalu mendaftarkannya ke repository atau organisasi GitHub.

## Kenapa Self-Host Runner?

- **Tidak ada batas menit** untuk workflow pribadi
- **Build bisa lebih cepat** karena memakai hardware sendiri
- **Cache persisten** untuk dependency, Docker image, dan artifact sementara
- **Akses resource lokal** seperti database internal atau service di homelab
- **Kontrol penuh** atas CPU, RAM, runtime, dan software yang terpasang

Tradeoff-nya jelas: kamu bertanggung jawab menjaga VM tetap aman, stabil, dan ter-update.

## Yang Dibutuhkan

- Proxmox VE yang sudah berjalan
- Akun GitHub dan minimal satu repository
- ISO Ubuntu Server 22.04 atau 24.04 yang sudah di-upload ke Proxmox
- Waktu sekitar 30 menit

## Langkah 1 - Buat VM di Proxmox

Di web UI Proxmox:

1. Klik **Create VM**
2. Tab **General**: beri nama seperti `github-runner`
3. Tab **OS**: pilih ISO Ubuntu Server
4. Tab **System**: centang **Qemu Agent**
5. Tab **Disks**: gunakan VirtIO Block, minimal 40 GB
6. Tab **CPU**: minimal 2 core, lebih baik 4
7. Tab **Memory**: minimal 4096 MB, lebih baik 8192 MB
8. Tab **Network**: gunakan bridge `vmbr0` dan model VirtIO

Klik **Finish**, start VM, lalu buka **Console** untuk instalasi Ubuntu.

## Langkah 2 - Install Ubuntu Server

Gunakan Ubuntu Server minimized jika tersedia. Aktifkan **Install OpenSSH server** agar nanti bisa SSH ke VM. Setelah instalasi selesai, reboot dan login:

```bash
ssh runner@<vm-ip-address>
```

Gunakan user seperti `runner` agar mudah saat menginstall service.

## Langkah 3 - Update Sistem dan Install Dependency

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

QEMU guest agent membuat Proxmox bisa membaca status VM dengan lebih baik.

## Langkah 4 - Install Docker

Docker sangat berguna karena banyak workflow CI/CD menjalankan build atau test di container.

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker runner
sudo docker run hello-world
```

Logout dan login lagi agar perubahan group Docker aktif.

## Langkah 5 - Install Runtime Tambahan

Jika repository memakai Node.js, install NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

Tambahkan runtime lain sesuai kebutuhan, misalnya Python, Go, Java, atau pnpm.

## Langkah 6 - Download dan Konfigurasi Runner

Masuk ke GitHub repository:

1. Buka **Settings > Actions > Runners**
2. Klik **New self-hosted runner**
3. Pilih **Linux** dan **x64**
4. Ikuti command yang diberikan GitHub

Contohnya:

```bash
mkdir actions-runner && cd actions-runner
curl -o actions-runner-linux-x64-2.321.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.321.0/actions-runner-linux-x64-2.321.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.321.0.tar.gz
```

Gunakan versi yang ditampilkan GitHub karena URL dan token bisa berubah.

## Langkah 7 - Register Runner

Jalankan command konfigurasi dari GitHub:

```bash
./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPO --token YOUR_TOKEN_HERE
```

Saat prompt muncul:

- **Runner group:** default
- **Runner name:** misalnya `proxmox-runner`
- **Labels:** `self-hosted,linux,x64,proxmox`
- **Work folder:** default `_work`

Untuk organisasi, gunakan URL organisasi:

```bash
./config.sh --url https://github.com/YOUR_ORG --token YOUR_TOKEN_HERE
```

## Langkah 8 - Test Runner

Jalankan runner di foreground:

```bash
./run.sh
```

Jika berhasil, GitHub akan menampilkan status runner sebagai **Idle**. Buat workflow sederhana:

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

Jalankan workflow dari tab Actions untuk memastikan job masuk ke runner milikmu.

## Langkah 9 - Jadikan Service

Runner sebaiknya berjalan sebagai systemd service:

```bash
cd ~/actions-runner
sudo ./svc.sh install runner
sudo ./svc.sh start
sudo ./svc.sh status
```

Sekarang runner akan hidup otomatis ketika VM reboot.

## Langkah 10 - Auto-Start VM di Proxmox

Agar runner tetap tersedia setelah host reboot:

1. Pilih VM `github-runner`
2. Buka **Options**
3. Set **Start at boot** menjadi **Yes**
4. Atur start order jika ada dependency

## Keamanan

Self-hosted runner menjalankan kode dari workflow di mesinmu sendiri. Jangan pakai runner ini untuk public repository yang menerima pull request dari orang tidak dikenal. Isolasi VM, update sistem secara rutin, pakai label dengan jelas, dan bersihkan Docker image atau artifact lama.

## Maintenance

GitHub biasanya bisa memperbarui runner otomatis, tetapi kamu tetap perlu memantau disk, dependency, dan patch OS. Untuk Docker, jadwalkan cleanup:

```bash
docker system prune -af --volumes
```

Ambil snapshot Proxmox sebelum perubahan besar supaya mudah rollback.

## Penutup

Dengan setup ini, pipeline CI/CD berjalan di hardware sendiri, tanpa batas menit hosted runner, dengan cache yang persisten dan kontrol penuh. Untuk homelab, ini salah satu penggunaan Proxmox yang paling praktis.
