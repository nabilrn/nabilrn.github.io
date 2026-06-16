---
title: "Cara Install Proxmox VE di Server Sendiri"
description: "Panduan lengkap untuk memasang Proxmox Virtual Environment di bare-metal, mulai dari membuat USB installer sampai login pertama ke web UI."
pubDate: 2026-04-01
tags: ["proxmox", "homelab", "virtualisasi", "linux"]
featured: true
draft: false
locale: "id"
translationKey: "how-to-install-proxmox-on-your-own-server"
---

Proxmox VE adalah salah satu opsi gratis terbaik kalau kamu ingin menjalankan banyak virtual machine dan container di satu server fisik. Proxmox berbasis Debian dan menyediakan web interface untuk mengelola VM, LXC container, storage, networking, dan backup tanpa perlu lisensi VMware atau Hyper-V.

Panduan ini membahas instalasi bare-metal dari awal sampai siap dipakai.

## Yang Dibutuhkan

Siapkan beberapa hal berikut:

- Server atau PC khusus dengan CPU 64-bit yang mendukung VT-x/AMD-V
- RAM minimal 8 GB, lebih baik 16 GB atau lebih
- USB flash drive minimal 2 GB
- Koneksi internet stabil
- Monitor dan keyboard saat proses instalasi

Proxmox berjalan langsung di hardware. Artinya, Proxmox akan menggantikan sistem operasi yang ada di disk target.

## Langkah 1 - Download ISO Proxmox VE

Buka halaman download resmi Proxmox dan ambil ISO terbaru:

```text
https://www.proxmox.com/en/downloads/proxmox-virtual-environment/iso
```

Gunakan rilis stabil terbaru. Ukuran ISO biasanya sekitar 1 GB lebih.

## Langkah 2 - Buat USB Bootable

Flash file ISO ke USB menggunakan Rufus, Etcher, atau `dd`.

Di Windows dengan Rufus:

1. Buka Rufus
2. Pilih USB drive
3. Klik "SELECT" dan pilih ISO Proxmox
4. Gunakan GPT untuk UEFI atau MBR untuk BIOS legacy
5. Klik "START" dan tunggu selesai

Di Linux atau macOS:

```bash
lsblk
sudo dd if=proxmox-ve_8.x-x.iso of=/dev/sdX bs=4M status=progress
sync
```

Pastikan target `of=` benar. Salah memilih disk akan menghapus data.

## Langkah 3 - Boot dari USB

Colok USB ke server, masuk ke BIOS/UEFI, lalu jadikan USB sebagai boot device pertama atau pilih lewat boot menu. Setelah itu kamu akan melihat layar installer Proxmox VE.

## Langkah 4 - Jalankan Installer

Di installer:

1. Pilih **Install Proxmox VE (Graphical)**
2. Setujui EULA
3. Pilih disk target. Disk ini akan diformat penuh
4. Atur negara, timezone, dan keyboard layout
5. Buat password root dan masukkan email
6. Konfigurasi jaringan:
   - **Management interface:** NIC yang terhubung ke LAN
   - **Hostname:** misalnya `pve.local` atau `proxmox.homelab`
   - **IP address:** gunakan IP statis, misalnya `192.168.1.100/24`
   - **Gateway:** IP router, misalnya `192.168.1.1`
   - **DNS server:** router atau DNS publik seperti `1.1.1.1`
7. Periksa summary, lalu klik **Install**

IP statis penting karena web UI Proxmox diakses lewat alamat itu. Jika IP berubah, akses web UI bisa putus sampai diperbaiki manual.

## Langkah 5 - Akses Web Interface

Setelah reboot, konsol server akan menampilkan URL web UI:

```text
https://192.168.1.100:8006
```

Buka URL itu dari komputer di jaringan yang sama. Browser akan menampilkan peringatan sertifikat karena Proxmox memakai self-signed certificate. Lanjutkan saja.

Login dengan:

- **Username:** root
- **Password:** password yang dibuat saat instalasi
- **Realm:** Linux PAM standard authentication

## Langkah 6 - Update Repository dan Sistem

Jika tidak memakai subscription enterprise, gunakan repository no-subscription:

```bash
echo "deb http://download.proxmox.com/debian/pve bookworm pve-no-subscription" > /etc/apt/sources.list.d/pve-no-subscription.list
sed -i 's/^deb/#deb/' /etc/apt/sources.list.d/pve-enterprise.list
apt update && apt full-upgrade -y
reboot
```

Popup subscription di web UI tidak memengaruhi fungsi. Untuk setup pribadi atau homelab, cukup pahami bahwa itu adalah pengingat komersial dari Proxmox.

## Langkah 7 - Upload ISO dan Buat VM Pertama

Setelah web UI siap:

1. Pilih node Proxmox di sidebar
2. Buka storage **local**
3. Masuk ke tab **ISO Images**
4. Upload ISO seperti Ubuntu Server, Debian, atau Windows
5. Klik **Create VM**
6. Isi nama, VM ID, ISO, tipe OS, disk, CPU, RAM, dan network bridge
7. Klik **Finish**
8. Start VM dan buka **Console** untuk instalasi OS

Default bridge `vmbr0` biasanya cukup untuk setup awal karena VM akan berada di jaringan yang sama dengan server.

## Tips Setelah Instalasi

- Aktifkan IOMMU di BIOS jika ingin GPU atau PCIe passthrough
- Buat jadwal backup melalui Datacenter > Backup
- Gunakan Proxmox Backup Server atau `vzdump`
- Aktifkan 2FA untuk root jika server dapat diakses dari internet
- Pertimbangkan ZFS jika memakai beberapa disk

## Masalah Umum

**Web UI tidak bisa dibuka:** pastikan memakai `https://` dan port `8006`. Cek IP server dengan `ip a`.

**Boot loop atau GRUB tidak ditemukan:** mode boot BIOS mungkin tidak sesuai. Sesuaikan UEFI atau Legacy dengan mode saat instalasi.

**VM terasa lambat:** gunakan VirtIO untuk disk dan network. Untuk Windows VM, siapkan VirtIO driver ISO.

## Penutup

Dengan langkah di atas, Proxmox VE sudah siap dipakai di server sendiri. Prosesnya biasanya memakan 15-20 menit dari membuat USB sampai login ke web UI.

Dari sini kamu bisa membuat VM untuk development, menjalankan Docker host di LXC, membangun NAS dengan TrueNAS, membuat cluster Kubernetes, atau membangun homelab sesuai kebutuhan.
