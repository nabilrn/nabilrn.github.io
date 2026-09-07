---
title: "Saya Sudah Pakai Linux Sebelum Peduli Siapa yang Membuatnya"
description: "Saya sudah memakai Linux, Git, Docker, dan server Ubuntu jauh sebelum benar-benar belajar tentang Linus Torvalds. Ceritanya mengubah cara saya melihat kerja engineering."
pubDate: "2026-08-01"
tags: ["Tech", "History", "Open Source"]
locale: "id"
translationKey: "linus-torvalds-and-linux"
---

Saya sudah memakai Linux jauh sebelum peduli siapa yang membuatnya.

Buat saya, Linux pertama kali muncul sebagai bagian dari kerja infrastruktur. VM <a href="https://ubuntu.com/" target="_blank" rel="noopener noreferrer">Ubuntu</a>, host <a href="https://docs.docker.com/" target="_blank" rel="noopener noreferrer">Docker</a>, server di lab, sesi <a href="https://www.openssh.com/" target="_blank" rel="noopener noreferrer">SSH</a>, update package, log, service, dan hal-hal biasa yang mulai sering disentuh ketika bekerja dengan sistem. <a href="https://git-scm.com/" target="_blank" rel="noopener noreferrer">Git</a> malah lebih tidak terasa lagi. Saya mengetik `git pull`, bikin branch, beresin conflict, lalu push code tanpa pernah terlalu memikirkan siapa yang awalnya membuat tool itu.

Baru belakangan saya benar-benar membaca tentang **Linus Torvalds**. Yang menarik buat saya bukan cerita klasik tentang “satu orang mengubah dunia”, tetapi betapa praktisnya asal-usul Linux dan Git. Keduanya lahir karena ada masalah engineering yang nyata, tool yang tersedia saat itu tidak cukup untuk kebutuhannya, lalu dia membuat sesuatu yang lebih cocok. Buat saya, bagian itu jauh lebih menarik daripada mitologi tentang programmer terkenal.

## Linux bermula dari masalah yang sangat pribadi

Pada 1991, Linus masih mahasiswa ilmu komputer di University of Helsinki. Saat itu dia memakai <a href="https://www.minix3.org/" target="_blank" rel="noopener noreferrer">MINIX</a>, sistem operasi kecil mirip Unix yang terutama dibuat untuk pendidikan, dan dia ingin punya lebih banyak kontrol atas sistem yang dipakainya. Dari situ dia mulai menulis kernel sendiri.

Pengumumannya di Usenet kemudian terkenal karena ekspektasinya terdengar sangat kecil:

> “I'm doing a (free) operating system (just a hobby, won't be big and professional like GNU).”

Prediksi itu meleset dengan cara terbaik. Linux tidak menjadi penting karena satu orang terus menulis semua bagiannya sendirian. Linux menjadi berguna karena developer lain bisa melihat kodenya, mengubahnya, mengirim patch, menambahkan dukungan hardware, memperbaiki bug, dan terus membuatnya lebih baik.

Bagian open source seperti ini gampang saya lupakan ketika cuma memakai hasil akhirnya. Kita install Ubuntu, pull image container, menyalakan server, atau deploy aplikasi dan semuanya terasa seperti sesuatu yang sudah jadi. Yang jarang kelihatan justru jumlah maintenance besar di belakangnya.

## Saya biasanya bertemu Linux ketika sesuatu perlu dijalankan

Saya tidak memakai Linux karena punya keterikatan ideologis dengan satu sistem operasi. Saya memakainya karena banyak pekerjaan infrastruktur pada akhirnya membawa saya ke Linux. Sebuah VM butuh OS. Docker host butuh tempat untuk berjalan. Server butuh SSH, systemd, log, networking, permission, package, dan process yang tetap hidup setelah terminal ditutup. Biasanya Linux muncul di situ.

Hal yang sama terjadi dalam skala yang jauh lebih besar. Linux banyak dipakai di server dan cloud infrastructure. Android dibangun di atas <a href="https://www.kernel.org/" target="_blank" rel="noopener noreferrer">Linux kernel</a>. Linux juga muncul di embedded system, perangkat jaringan, dan supercomputer.

Yang lucu, infrastruktur yang berhasil biasanya justru terasa membosankan. Ketika semuanya berjalan, hampir tidak ada yang memikirkannya. Yang dilihat user adalah aplikasinya, sementara sistem operasi di bawahnya menghilang ke background. Saya justru suka bagian itu. Infrastruktur sering kali bekerja paling baik ketika tidak ada yang perlu membicarakannya.

## Lalu ada Git

Git mungkin alasan yang lebih kuat kenapa Linus akhirnya menarik buat saya secara pribadi. Pada 2005, development Linux kernel sudah punya masalah version control. Project-nya tumbuh terlalu besar untuk dikoordinasikan secara sederhana, jadi Linus membuat Git untuk mendukung workflow yang dibutuhkan development kernel.

Sekarang saya pakai Git terus-menerus, dan kalau dipikir-pikir rasanya agak aneh. Tool yang saya anggap seperti plumbing dasar ternyata dibuat karena project engineering lain sudah terlalu sulit dikelola dengan tool yang ada.

Git juga menunjukkan satu hal yang saya suka dari tool engineering yang bagus: bagian pentingnya bukan sekadar karena implementasinya pintar, tetapi karena tool itu menyelesaikan masalah koordinasi yang menyakitkan sampai generasi berikutnya menganggap masalah tersebut biasa saja. Branch, commit, merge, distributed history, dan repository sekarang sudah menjadi bagian normal dari software development. Saya mempelajarinya sebagai workflow dasar, bukan sebagai terobosan sejarah besar. Biasanya memang seperti itu ketika sebuah ide teknis menang: generasi setelahnya menerima ide tersebut sebagai default.

## Yang sebenarnya saya ambil dari Linus

Menurut saya, pelajarannya bukan “jadilah seperti Linus” atau “buat Linux berikutnya”. Kesimpulan seperti itu terlalu gampang. Hal yang saya ambil justru lebih kecil: **pahami masalahnya sebelum terlalu terikat dengan tool**.

Linux bermula dari keinginan punya lebih banyak kontrol atas sebuah sistem. Git bermula dari kebutuhan mengelola development kernel dengan cara yang lebih baik. Keduanya tidak dimulai dari “saya ingin membuat kategori produk baru”. Keduanya dimulai dari constraint teknis yang konkret. Cara berpikir ini penting buat saya karena di dunia tech gampang sekali bekerja dari arah sebaliknya: menemukan Kubernetes, AI, framework baru, database, atau tool infrastruktur, lalu mencari alasan supaya tool itu bisa dipakai. Saya juga pernah melakukan itu.

Project yang lebih baik biasanya berjalan dari arah sebaliknya. Ada masalah yang mengganggu dulu. Kita pahami kenapa masalah itu ada. Baru setelah itu kita memutuskan apakah tool yang sudah ada cukup. Kadang cukup. Kadang memang perlu membuat sesuatu sendiri. Kedengarannya sederhana, tetapi gampang sekali dilupakan.

Saya juga belum paham Linux cukup dalam untuk menyebut diri saya Linux expert, dan jelas belum memahami kernel di level orang-orang yang memang memeliharanya. Sebagian besar interaksi saya dengan Linux jauh lebih biasa: deploy aplikasi, konfigurasi server, debug service, dan sebisa mungkin tidak merusak networking di waktu yang salah. Tapi sekarang, setiap kali SSH ke VM Ubuntu lain atau mengetik command Git lagi, kadang saya ingat bahwa dua tool ini lahir dari seseorang yang tidak puas dengan tooling di depannya lalu memilih untuk benar-benar mengerjakan masalahnya.

Buat saya, itu sudah cukup menjadi alasan untuk tahu siapa Linus Torvalds.
