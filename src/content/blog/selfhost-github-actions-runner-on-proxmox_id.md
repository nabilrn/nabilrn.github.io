---
title: "Menjalankan Self-Hosted GitHub Actions Runner di Proxmox"
description: "Panduan praktis menjalankan self-hosted GitHub Actions runner di VM Proxmox khusus, dengan fokus pada registrasi, service mode, labels, Docker, networking, update, dan security."
pubDate: 2026-04-04
tags: ["github-actions", "ci-cd", "proxmox", "devops"]
featured: true
draft: false
locale: "id"
translationKey: "selfhost-github-actions-runner-on-proxmox"
---

Memasang self-hosted GitHub Actions runner sebenarnya tidak sulit. Bagian yang lebih penting justru menentukan runner itu sebaiknya tinggal di mana dan seberapa besar tingkat kepercayaan yang mau saya berikan kepadanya.

Untuk lab kecil, saya lebih suka menaruh runner di dalam VM Proxmox khusus. Dengan begitu mesin CI terpisah dari hypervisor, saya tetap mendapat backup dan snapshot VM biasa, dan runner bisa dihapus nanti tanpa meninggalkan build tools, Docker images, credentials, dan cache bertebaran di server lain.

GitHub tidak mengenakan biaya Actions minutes untuk job yang berjalan di self-hosted runner. Itu **bukan berarti mesinnya gratis**: hardware, storage, listrik, jaringan, dan maintenance tetap menjadi tanggung jawab saya. Perlu diingat juga bahwa standard GitHub-hosted runners sudah gratis untuk public repository, jadi penghematan hosted-runner minutes lebih relevan untuk private repository atau workload yang memang membutuhkan hardware dan akses jaringan sendiri. GitHub menjelaskan perbedaannya di <a href="https://docs.github.com/en/billing/concepts/product-billing/github-actions" target="_blank" rel="noopener noreferrer">dokumentasi billing GitHub Actions</a>.

## Kenapa saya memilih VM untuk runner

GitHub Actions job pada dasarnya adalah kode yang dieksekusi di mesin yang saya kelola. Itu saja sudah cukup menjadi alasan untuk tidak memasang runner langsung di host Proxmox.

VM khusus memberi boundary yang lebih masuk akal:

- Host Proxmox tetap fokus pada virtualisasi
- Dependency CI tidak mengotori hypervisor
- Docker bisa berjalan normal di Linux VM
- CPU, memory, dan disk bisa diubah secara independen
- VM bisa di-backup, di-snapshot, dibangun ulang, atau dihapus
- Akses jaringan bisa dibatasi terpisah dari bagian lab lainnya

Boundary ini tidak otomatis membuat workflow yang tidak aman menjadi aman, tetapi blast radius-nya jauh lebih kecil dibanding menjalankan arbitrary CI jobs langsung di infrastructure yang penting.

## Sebenarnya runner membutuhkan apa

<a href="https://docs.github.com/en/actions/reference/runners/self-hosted-runners" target="_blank" rel="noopener noreferrer">Referensi self-hosted runner GitHub</a> memang tidak memberi angka hardware minimum yang kaku. Aplikasi runner-nya sendiri ringan; resource yang benar-benar dibutuhkan tergantung job yang nanti dijalankan.

Untuk Linux runner VM kecil, saya biasanya mulai dari sekitar:

```text
CPU:     2 vCPU
Memory:  4 GB
Disk:    32-64 GB
Network: VirtIO di vmbr0
OS:      Ubuntu Server atau Debian
```

Itu bukan minimum resmi GitHub. Frontend build sederhana mungkin membutuhkan lebih sedikit, sedangkan Docker image build, Android build, test suite besar, atau parallel compilation bisa membutuhkan resource jauh lebih besar.

Networking-nya juga lebih sederhana daripada yang terlihat. Runner yang membuka koneksi ke GitHub, jadi saya **tidak perlu membuka inbound port** untuk GitHub Actions. Mesin hanya perlu bisa melakukan koneksi HTTPS keluar melalui port `443` ke endpoint GitHub yang dibutuhkan workflow.

Kalau workflow menggunakan Docker container actions atau service containers, GitHub membutuhkan Linux runner dengan Docker terpasang.

## 1. Buat VM runner di Proxmox

Saya membuat Linux VM biasa. Runner tidak perlu perlakuan khusus di layer hypervisor.

Konfigurasi awal yang masuk akal:

1. Buat VM dengan nama yang jelas seperti `github-runner`.
2. Install Ubuntu Server atau Debian release yang masih current.
3. Gunakan VirtIO untuk network device.
4. Sambungkan NIC ke `vmbr0`, atau bridge/VLAN lain kalau runner perlu diisolasi.
5. Aktifkan opsi QEMU Guest Agent di Proxmox.
6. Beri disk cukup untuk source checkout, package cache, build output, dan Docker images.

Saya tidak langsung mengalokasikan CPU atau RAM berlebihan. Setelah beberapa real job berjalan, pola pemakaian resource akan terlihat dan VM bisa di-resize dengan lebih masuk akal.

Setelah Linux terpasang, saya update sistem dan install guest agent:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y qemu-guest-agent curl git ca-certificates
sudo systemctl enable --now qemu-guest-agent
```

Saya juga mengaktifkan SSH kalau runner akan dikelola secara remote.

## 2. Install Docker hanya kalau workflow membutuhkannya

Docker umum dipakai dalam CI, tetapi bukan syarat untuk setiap self-hosted runner.

Kalau workflow saya membangun container image, memakai service containers, atau menjalankan Docker-based actions, saya install Docker mengikuti <a href="https://docs.docker.com/engine/install/" target="_blank" rel="noopener noreferrer">dokumentasi resmi Docker Engine</a> untuk guest OS yang dipakai. Saya lebih memilih itu daripada menyalin command repository lama dari artikel blog yang mungkin sudah outdated.

Setelah terpasang, saya cek daemon-nya:

```bash
sudo systemctl status docker
sudo docker run --rm hello-world
```

Kalau saya memberi user runner akses ke Docker socket tanpa `sudo`, saya menganggapnya sebagai keputusan privilege, bukan sekadar convenience. Membership di group `docker` secara praktis memberi kontrol setara root terhadap mesin karena container bisa memasang filesystem host dan mengakses resource yang sangat privileged.

Untuk dedicated CI VM, tradeoff itu mungkin bisa diterima. Di mesin shared, saya akan jauh lebih hati-hati.

## 3. Biarkan GitHub membuat command instalasi runner

Saya tidak menaruh satu versi runner tertentu secara permanen di panduan ini karena runner sering diperbarui.

Project resmi `actions/runner` terus merilis versi baru. Flow yang lebih aman adalah membiarkan GitHub menghasilkan command sesuai repository atau organization tempat runner akan diregistrasikan.

Untuk repository-level runner:

1. Buka repository di GitHub.
2. Masuk ke **Settings → Actions → Runners**.
3. Pilih **New self-hosted runner**.
4. Pilih operating system dan architecture yang benar.
5. Jalankan command download dan extract yang diberikan GitHub di halaman tersebut.

Bentuk command-nya kurang lebih seperti ini:

```bash
mkdir actions-runner
cd actions-runner

curl -O -L https://github.com/actions/runner/releases/download/v<RUNNER_VERSION>/actions-runner-linux-x64-<RUNNER_VERSION>.tar.gz

tar xzf ./actions-runner-linux-x64-<RUNNER_VERSION>.tar.gz
```

Jangan menyalin `<RUNNER_VERSION>` secara literal. Gunakan command yang GitHub tampilkan ketika menambahkan runner. <a href="https://docs.github.com/en/actions/how-tos/manage-runners/self-hosted-runners/add-runners" target="_blank" rel="noopener noreferrer">Panduan resmi menambahkan self-hosted runner</a> adalah referensi utama untuk langkah ini.

## 4. Registrasikan dengan token sementara

GitHub juga menghasilkan command `config.sh`:

```bash
./config.sh \
  --url https://github.com/OWNER/REPOSITORY \
  --token REGISTRATION_TOKEN
```

Registration token bersifat sementara dan kedaluwarsa setelah satu jam. Token itu hanya dibutuhkan ketika mendaftarkan runner; saya tidak menyimpannya sebagai credential jangka panjang di VM.

Saat konfigurasi, GitHub akan meminta runner name dan work directory. Saya biasanya memberi nama yang jelas, misalnya:

```text
proxmox-runner-01
```

Default work directory `_work` sudah cukup untuk setup sederhana.

Runner yang baru diregistrasikan mendapat default labels seperti:

```text
self-hosted
linux
x64
```

Saya menambah custom label hanya kalau label tersebut benar-benar menjelaskan karakter mesin, misalnya:

```text
proxmox
```

Labels adalah routing metadata, bukan security boundary.

## 5. Test dulu di foreground

Sebelum menjadikannya service, saya jalankan runner secara interaktif:

```bash
./run.sh
```

Runner yang sehat seharusnya tersambung ke GitHub dan menunjukkan bahwa ia sedang menunggu job.

Untuk workflow pertama, saya sengaja membuat test yang sederhana:

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

Semua labels dalam `runs-on` harus cocok. GitHub menjelaskan perilaku ini di <a href="https://docs.github.com/en/actions/how-tos/manage-runners/self-hosted-runners/use-in-a-workflow" target="_blank" rel="noopener noreferrer">Using self-hosted runners in a workflow</a>.

Setelah job benar-benar berjalan di VM yang saya maksud, saya hentikan `run.sh` dengan `Ctrl+C` dan lanjut ke service mode.

## 6. Jalankan runner sebagai systemd service

Di Linux, package runner menyediakan `svc.sh` setelah runner selesai dikonfigurasi.

Dari directory runner:

```bash
sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
```

GitHub juga mendukung pemberian username pada command install kalau service harus berjalan sebagai user tertentu.

Command terbaru didokumentasikan di <a href="https://docs.github.com/en/actions/how-tos/manage-runners/self-hosted-runners/configure-the-application" target="_blank" rel="noopener noreferrer">panduan konfigurasi service GitHub</a>.

Ada satu detail Ubuntu/Debian yang mudah terlewat. Pada sistem yang memakai `needrestart`, GitHub merekomendasikan agar `needrestart` tidak me-restart Actions runner service di tengah workflow job:

```bash
echo '$nrconf{override_rc}{qr(^actions\.runner\..+\.service$)} = 0;' \
  | sudo tee /etc/needrestart/conf.d/actions_runner_services.conf
```

Saya juga mengaktifkan **Start at boot** untuk VM di Proxmox supaya reboot hypervisor tidak membuat runner offline sampai dinyalakan manual.

## 7. Target runner secara sengaja

Saya lebih suka explicit labels daripada mengirim semua self-hosted job ke mesin mana pun yang kebetulan sedang idle.

Contohnya:

```yaml
jobs:
  build:
    runs-on: [self-hosted, linux, x64, proxmox]

    steps:
      - uses: actions/checkout@v6
      - run: ./ci/build.sh
```

Kalau satu organization memiliki beberapa runner, runner groups memberi layer kontrol tambahan yang lebih berguna. GitHub memungkinkan organization owner membatasi repository mana yang boleh menggunakan sebuah runner group. Itu jauh lebih bermakna untuk access control dibanding membuat banyak label tanpa tujuan yang jelas.

## Security model lebih penting daripada instalasinya

Bagian ini yang paling tidak boleh dilewatkan.

<a href="https://docs.github.com/en/actions/reference/security/secure-use" target="_blank" rel="noopener noreferrer">Panduan secure use GitHub</a> menjelaskan bahwa self-hosted runner tidak mendapat jaminan clean isolated VM seperti GitHub-hosted runner. Persistent runner dapat dikompromikan oleh workflow code yang tidak dipercaya dan tetap berada dalam kondisi compromised setelah job selesai.

Dalam deployment normal, GitHub merekomendasikan penggunaan self-hosted runner hanya dengan private repositories. Public repository jauh lebih berisiko karena pull request dari fork dapat menjadi jalur bagi attacker-controlled workflow code untuk dieksekusi di runner.

Private repository pun tidak otomatis berarti trusted. Seseorang dengan akses repository yang cukup tetap bisa membuat branch atau pull request yang menyebabkan kode berjalan di runner.

Baseline saya karena itu sederhana:

- Saya tidak memasang general-purpose persistent runner ke public repository.
- Runner tetap berada di dedicated VM.
- Production credentials tidak saya taruh di VM kecuali workflow benar-benar membutuhkannya.
- Permission `GITHUB_TOKEN` dibuat sesempit yang workflow izinkan.
- Akses jaringan ke internal services dibatasi hanya ke yang benar-benar dibutuhkan.
- Third-party actions dan workflow changes saya perlakukan sebagai executable code.
- Runner groups dipakai ketika beberapa repository berbagi organization-level runner.
- Guest OS, Docker, dan build tooling tetap di-update.

Snapshot berguna untuk recovery setelah kesalahan konfigurasi, tetapi saya tidak menganggap restore snapshot lama sebagai complete security response setelah mesin menjalankan hostile code. Membangun ulang VM dari trusted image jauh lebih bersih.

## Persistent versus ephemeral runner

Self-hosted runner normal bersifat persistent. Mesin yang sama bisa menjalankan banyak job dari waktu ke waktu, sehingga file, cache, process, credentials, Docker images, atau perubahan berbahaya bisa bertahan antar-job kalau workflow tidak membersihkannya.

GitHub juga mendukung registrasi runner dengan:

```bash
./config.sh \
  --url https://github.com/OWNER/REPOSITORY \
  --token REGISTRATION_TOKEN \
  --ephemeral
```

Ephemeral runner otomatis **di-deregister setelah satu job**.

Itu tidak otomatis menghapus mesin. Kalau saya ingin setiap job benar-benar mulai dari environment bersih, tetap dibutuhkan automation yang menghancurkan lalu membuat ulang VM atau container setelah runner selesai. Untuk skala yang lebih besar, GitHub Actions Runner Controller memang dirancang untuk pola ephemeral autoscaling seperti ini.

Untuk satu private homelab repository, persistent VM biasanya jauh lebih sederhana. Yang penting saya memahami trust boundary-nya.

## Update runner sebagian besar otomatis

Aplikasi runner melakukan update otomatis secara default ketika versi baru tersedia. GitHub bisa memperbaruinya ketika sebuah job diberikan, dan runner yang idle biasanya akan mendapat update dalam rentang sekitar satu minggu setelah release baru.

Artinya, pola lama yang mengharuskan download manual setiap release runner biasanya tidak diperlukan lagi.

GitHub juga menyediakan `--disableupdate` untuk environment yang mengelola versi runner secara eksternal, misalnya immutable image. Kalau auto-update dimatikan, saya sendiri yang bertanggung jawab menjaga versi runner tetap cukup dekat dengan release terbaru agar masih bisa menerima job.

Operating system dan semua tool lain di VM tetap menjadi tanggung jawab saya terlepas dari mekanisme auto-update runner.

## Maintenance yang benar-benar saya pedulikan

Problem yang paling realistis pada self-hosted runner kecil biasanya justru problem yang membosankan:

- Disk penuh oleh Docker layers atau build output
- Package upgrade mengubah toolchain
- VM reboot tetapi runner service tidak hidup lagi
- Workflow mengharapkan runtime yang belum terpasang
- Custom label berubah dan job tertahan di queue
- Networking atau DNS membuat runner tidak bisa terhubung ke GitHub

Jadi saya sesekali mengecek:

```bash
sudo ./svc.sh status
df -h
docker system df 2>/dev/null || true
```

Saya lebih suka cleanup yang disengaja daripada cron job yang membabi buta menjalankan `docker system prune -af --volumes`. CI cache bisa berguna, dan menghapus semua unused volume berdasarkan jadwal dapat menghancurkan data yang ternyata memang ingin dipertahankan workflow.

Saya juga membackup konfigurasi VM ketika berguna, tetapi setup runner tetap saya buat cukup reproducible sehingga membangun ulang VM bukan sebuah bencana.

## Setup ini cocok untuk apa

Proxmox VM dengan self-hosted runner cocok ketika saya ingin CI memakai hardware yang saya kendalikan sendiri, membutuhkan akses ke private lab network, membutuhkan disk atau CPU lebih besar daripada hosted environment tertentu, atau sekadar ingin memahami apa yang sebenarnya terjadi di bawah abstraksi CI.

Self-hosted runner tidak otomatis lebih baik daripada GitHub-hosted runner. Hosted runner punya satu keuntungan besar: untuk standard job, GitHub memberikan managed environment baru tanpa meminta saya memelihara long-lived execution machine sendiri.

Untuk infrastructure pribadi saya, tradeoff itulah yang membuat saya tetap memilih self-hosted runner di dalam VM, bukan langsung di host. Saya mendapat kontrol yang saya inginkan, tetapi tetap punya boundary yang relatif disposable di sekitar mesin yang mengeksekusi workflow saya.
