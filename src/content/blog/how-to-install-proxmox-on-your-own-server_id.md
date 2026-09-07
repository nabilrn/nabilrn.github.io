---
title: "Cara Install Proxmox VE di Server Sendiri"
description: "Panduan praktis instalasi bare-metal Proxmox VE 9 yang fokus ke keputusan penting: media installer, storage, networking, repository, update, dan VM pertama."
pubDate: 2026-04-01
tags: ["proxmox", "homelab", "virtualisasi", "linux"]
featured: true
draft: false
locale: "id"
translationKey: "how-to-install-proxmox-on-your-own-server"
---

Waktu pertama kali install Proxmox, saya kira bagian installer-nya yang bakal paling merepotkan. Ternyata bukan.

Yang lebih penting justru semua keputusan di sekitarnya: disk mana yang sebentar lagi akan dihapus, seperti apa management network-nya, apakah ZFS memang masuk akal untuk hardware yang dipakai, dan repository apa yang seharusnya digunakan setelah boot pertama. Kalau bagian-bagian itu benar, proses instalasinya sendiri cukup lurus.

Ini adalah alur yang akan saya pakai kalau hari ini menyiapkan single-node lab atau development server baru. Panduan ini menargetkan **Proxmox VE 9.x**; ISO stabil saat ini adalah Proxmox VE 9.2, berbasis Debian 13.5 "Trixie". Proxmox menggabungkan virtual machine KVM dan system container LXC dalam satu web interface.

## Sebelum install, tentukan dulu server ini mau dipakai untuk apa

Kita tidak butuh hardware enterprise hanya untuk belajar Proxmox, tetapi hardware tetap menentukan workload apa yang realistis dijalankan oleh node tersebut.

<a href="https://pve.proxmox.com/pve-docs/pve-admin-guide.pdf" target="_blank" rel="noopener noreferrer">Panduan administrasi resmi Proxmox</a> mencantumkan 2 GB RAM sebagai baseline untuk host dan service Proxmox, **di luar RAM yang dialokasikan ke guest**. Itu angka minimum, bukan target sizing yang nyaman untuk kebanyakan lab. Untuk node kecil saya lebih memilih mulai dari 8 GB, lalu 16 GB atau lebih kalau ingin menjalankan beberapa VM. ZFS dan Ceph juga membutuhkan memori tambahan.

Untuk server x86 biasa, saya menyiapkan:

- CPU Intel atau AMD 64-bit dengan VT-x/AMD-V aktif di firmware
- RAM yang cukup untuk host **dan** seluruh VM atau container yang akan dijalankan
- SSD atau storage lain yang memang siap dihapus sepenuhnya
- Koneksi jaringan kabel
- USB flash drive yang cukup untuk image installer
- Komputer lain di jaringan yang sama untuk mengakses web UI

Kalau nantinya saya butuh PCIe atau GPU passthrough, saya juga memastikan dukungan Intel VT-d atau AMD IOMMU sebelum seluruh setup dibangun di atas asumsi tersebut.

Yang paling penting: **backup dulu apa pun yang ada di disk target**. Installer Proxmox akan mempartisi ulang disk yang dipilih dan menghapus data yang sudah ada.

## 1. Download ISO resmi

Ambil installer dari <a href="https://www.proxmox.com/en/downloads/proxmox-virtual-environment/iso" target="_blank" rel="noopener noreferrer">halaman ISO resmi Proxmox VE</a>. Untuk hardware x86-64, installer stabil saat ini adalah Proxmox VE 9.2-1. Proxmox juga menyediakan installer Arm64 terpisah, jadi pastikan image yang diunduh sesuai dengan arsitektur server.

Saya juga membiasakan mengecek SHA-256 checksum yang ditampilkan di halaman download sebelum menulis installer infrastruktur ke USB. Di Linux, misalnya:

```bash
sha256sum proxmox-ve_*.iso
```

Nilainya harus sama dengan checksum yang dipublikasikan Proxmox untuk ISO tersebut.

## 2. Tulis ISO ke USB

Installer Proxmox adalah hybrid ISO, jadi image sebaiknya ditulis langsung ke USB sebagai disk image, bukan sekadar dicopy ke flash drive yang sudah diformat biasa.

Di Windows, Etcher bisa dipakai langsung. Rufus juga bisa, tetapi dokumentasi Proxmox secara spesifik mengarahkan penggunaan **DD mode**. Kalau Rufus menawarkan download versi GRUB lain, pilih **No**, lalu gunakan DD mode saat diminta.

Di Linux, saya biasanya memakai `dd`:

```bash
lsblk
sudo dd bs=1M conv=fdatasync if=./proxmox-ve_*.iso of=/dev/sdX
```

Ganti `/dev/sdX` dengan device USB-nya langsung, bukan salah satu partisinya.

Ini jenis command yang lebih baik dibaca dua kali daripada harus recovery karena salah target. `of=` yang keliru bisa menimpa disk lain.

## 3. Boot server dari USB

Colok installer USB, reboot server, lalu buka firmware boot menu. Tombolnya tergantung hardware: `F2`, `F11`, `F12`, `Delete`, atau `Esc` cukup umum.

Pilih USB dan tunggu sampai menu installer Proxmox muncul. Pilihan normal adalah **Install Proxmox VE (Graphical)**. Ada juga Terminal UI installer yang berguna kalau environment grafis bermasalah di hardware tertentu. Keduanya memakai backend instalasi yang sama.

## 4. Pilih storage dengan sengaja

Installer akan meminta disk dan filesystem untuk instalasi Proxmox.

Untuk lab sederhana dengan satu disk, setup default LVM-thin biasanya sudah cukup. Saya tidak akan memilih ZFS hanya karena kelihatan lebih advanced. ZFS baru menarik kalau memang membutuhkan property seperti data integrity, snapshot, dan pengelolaan storage-nya, serta punya RAM dan layout disk yang sesuai.

Kalau memakai ZFS, saya menghindari hardware RAID di bawahnya. Guidance Proxmox sendiri menyarankan ZFS atau Ceph diberi akses langsung ke disk, bukan menyembunyikan disk di balik hardware RAID controller.

Pertanyaan penting di tahap ini bukan "opsi mana yang kelihatan paling bagus?", tetapi **bagaimana guest data nantinya akan disimpan dan dipulihkan**.

Kalau disk target sudah benar, lanjutkan dengan country, timezone, keyboard layout, root password, dan email notifikasi.

## 5. Anggap management network sebagai bagian dari infrastruktur

Ini halaman installer yang paling saya periksa pelan-pelan.

Pilih NIC fisik yang benar-benar terhubung ke LAN, lalu konfigurasi:

- Hostname node yang bisa dipertahankan jangka panjang
- Static management IP beserta prefix
- Default gateway
- DNS server yang berfungsi

Contoh untuk jaringan rumah `/24`:

```text
Hostname: pve01.home.arpa
IP:       192.168.1.20/24
Gateway:  192.168.1.1
DNS:      192.168.1.1
```

Jangan copy alamat itu mentah-mentah. Semuanya harus sesuai jaringan sendiri dan tidak boleh bentrok dengan device lain.

Instalasi standar membuat Linux bridge bernama `vmbr0` yang terhubung ke NIC fisik yang dipilih. Bayangkan bridge ini seperti software switch: host Proxmox dan guest bisa memakai uplink fisik yang sama, sementara setiap VM tetap punya virtual network interface sendiri. <a href="https://pve.proxmox.com/wiki/Network_Configuration" target="_blank" rel="noopener noreferrer">Dokumentasi networking Proxmox</a> sangat layak dibaca sebelum mulai mengubah bridge, VLAN, bond, atau routing.

Saya lebih memilih management IP yang tetap. Kehilangan jejak alamat hypervisor hanya karena DHCP berubah adalah masalah yang sebenarnya mudah dihindari.

## 6. Install, reboot, lalu buka web UI

Periksa summary sekali lagi, terutama disk target dan konfigurasi IP, lalu mulai instalasi.

Setelah node reboot, cabut USB installer. Konsol lokal akan menampilkan management URL. Dari komputer lain di jaringan yang sama, buka:

```text
https://IP-PROXMOX:8006
```

Node baru biasanya memakai certificate dari local cluster CA Proxmox, jadi browser yang belum mempercayai CA tersebut bisa menampilkan certificate warning. Untuk private lab, saya tetap memastikan dulu bahwa host yang dibuka memang host yang benar sebelum lanjut.

Login dengan:

```text
User:  root
Realm: Linux PAM standard authentication
```

beserta root password yang dibuat saat instalasi.

## 7. Konfigurasi package repository dengan benar

Instalasi Proxmox menyediakan enterprise repository untuk sistem yang punya subscription valid. Repository ini direkomendasikan untuk production karena package-nya melewati testing dan validation tambahan.

Untuk homelab atau evaluation node tanpa subscription, gunakan **no-subscription** repository. Cara paling sederhana adalah dari repository management di web UI: disable enterprise repository, lalu tambahkan no-subscription repository.

Untuk Proxmox VE 9, contoh lama berbasis Bookworm dan file `.list` yang masih banyak beredar sudah outdated. Konfigurasi sekarang menggunakan format deb822 `.sources` dan suite `trixie`. Entry no-subscription yang ekuivalen adalah:

```text
Types: deb
URIs: http://download.proxmox.com/debian/pve
Suites: trixie
Components: pve-no-subscription
Signed-By: /usr/share/keyrings/proxmox-archive-keyring.gpg
```

di:

```text
/etc/apt/sources.list.d/proxmox.sources
```

Repository no-subscription bisa digunakan tanpa biaya, tetapi Proxmox sendiri menyebutnya lebih cocok untuk testing dan non-production karena package-nya tidak divalidasi pada level yang sama dengan enterprise repository.

Subscription reminder di UI bukan tanda hypervisor rusak atau fiturnya dibatasi. Saya lebih memilih membiarkannya daripada memodifikasi file aplikasi hanya untuk menghilangkan popup.

## 8. Update node sebelum membuat workload

ISO installer hanyalah snapshot pada satu titik waktu. Setelah fresh install, node sebaiknya di-update ke package terbaru yang tersedia.

Dari shell:

```bash
apt update
apt dist-upgrade
```

Kalau update memasang kernel baru atau komponen yang membutuhkan restart, reboot node:

```bash
reboot
```

Flow update yang sama juga tersedia dari web UI.

## 9. Upload ISO dan buat VM pertama

Untuk guest pertama, saya biasanya membuat sesuatu yang membosankan dulu, misalnya Ubuntu atau Debian VM, sebelum bermain dengan passthrough, nested virtualization, atau network yang kompleks.

Di web UI:

1. Pilih node dan storage yang menerima ISO image, biasanya `local`.
2. Buka **ISO Images** lalu upload installer guest.
3. Klik **Create VM**.
4. Pilih ISO yang tadi di-upload.
5. Berikan CPU, memory, dan disk secara konservatif.
6. Hubungkan virtual NIC ke `vmbr0` kecuali desain network memang membutuhkan bridge lain.
7. Start VM dan selesaikan instalasi guest OS dari console.

Untuk guest modern, saya lebih memilih virtual device berbasis VirtIO kalau driver-nya tersedia. Guidance Proxmox juga merekomendasikan VirtIO networking karena overhead-nya rendah, sementara VirtIO SCSI adalah default yang kuat untuk disk VM. Windows guest mungkin membutuhkan VirtIO driver ISO saat instalasi.

Saya juga memasang QEMU Guest Agent di dalam VM yang mendukungnya. Dengan itu host mendapat visibility yang lebih baik dan komunikasi dengan guest OS menjadi lebih bersih.

## Beberapa hal yang tidak perlu saya konfigurasi di hari pertama

Fresh install sering membuat kita tergoda untuk langsung mengaktifkan semua fitur. Menurut saya lebih berguna membangun baseline yang membosankan tetapi stabil dulu.

Saya akan menunda PCIe passthrough sampai node stabil dan IOMMU group-nya dipahami. Saya tidak akan membuat cluster sebelum desain storage dan network satu node saja sudah masuk akal. Saya tidak akan mengekspos port `8006` langsung ke internet publik hanya karena web UI-nya nyaman. Dan saya tidak akan memakai ZFS, Ceph, VLAN, atau bonding sebelum tahu problem apa yang sebenarnya ingin diselesaikan.

Hal yang sama berlaku untuk Docker. Proxmox LXC adalah **system container**, bukan application container seperti Docker. Dokumentasi Proxmox merekomendasikan menjalankan Docker application containers di dalam QEMU VM ketika kita menginginkan isolation yang lebih kuat dan lifecycle VM yang normal. Itu juga model yang lebih saya pilih untuk Docker host.

## Yang saya cek setelah VM pertama berhasil boot

Secara teknis instalasi sudah selesai, tetapi sebelum mempercayai node tersebut saya tetap memeriksa beberapa hal:

- Host tetap mendapatkan management IP yang benar setelah reboot
- DNS dan default gateway bekerja
- Package update selesai tanpa repository error
- VM pertama bisa menjangkau LAN atau internet sesuai desain
- Guest storage benar-benar berada di datastore yang saya maksud
- Backup punya tujuan **di luar disk milik guest itu sendiri**
- Masih ada local console atau recovery path lain kalau networking rusak

Pemeriksaan seperti itu jauh lebih berguna daripada membuat dashboard kelihatan selesai.

Install Proxmox sendiri sebenarnya tidak sulit. Bagian yang lebih bernilai adalah memahami keputusan-keputusan kecil di sekitar installer, karena itulah yang menentukan apakah server masih mudah dioperasikan enam bulan kemudian.

Bagian berikutnya dari setup saya adalah self-hosted GitHub Actions runner di dalam Proxmox VM. Di titik itu hypervisor ini mulai berubah dari server kosong menjadi sesuatu yang benar-benar melakukan pekerjaan.
