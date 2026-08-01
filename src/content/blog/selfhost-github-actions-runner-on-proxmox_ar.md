---
title: "كيفية إعداد مشغل GitHub Actions ذاتي الاستضافة على Proxmox"
description: "قم بتشغيل مسارات CI/CD الخاصة بك مجانًا عن طريق إعداد مشغل GitHub Actions داخل جهاز افتراضي في Proxmox — خطوة بخطوة من إنشاء الجهاز الافتراضي إلى تشغيل سير العمل الأول الخاص بك."
pubDate: 2026-04-04
tags: ["github-actions", "ci-cd", "proxmox", "devops"]
featured: true
draft: false
---

تمنحك GitHub Actions 2,000 دقيقة مجانية شهريًا على مشغلاتهم المستضافة، ولكن هذه الدقائق تنفد سريعًا إذا كان لديك مستودعات متعددة أو أوقات بناء طويلة. الحل بسيط: قم بتشغيل مشغل GitHub Actions الخاص بك على أجهزة تمتلكها بالفعل.

إذا تابعت المنشور السابق حول تثبيت Proxmox، فلديك بالفعل مراقب أجهزة افتراضية جاهز للعمل. في هذا الدليل، سنقوم بإنشاء جهاز افتراضي مخصص على Proxmox، وتثبيت برنامج مشغل GitHub Actions، وتسجيله مع حساب GitHub الخاص بك حتى تعمل مسارات العمل الخاصة بك على جهازك الخاص — بدون أي حدود زمنية.

## لماذا تستضيف المشغل ذاتيًا؟

- **لا توجد حدود زمنية** — قم بتشغيل العدد الذي تريده من مسارات العمل
- **عمليات بناء أسرع** — من المحتمل أن تكون أجهزتك أسرع من مشغلات GitHub المشتركة
- **تخزين مؤقت دائم** — تظل ذاكرة التخزين المؤقت لعمليات البناء، وصور Docker، والتبعيات على القرص بين عمليات التشغيل
- **الوصول إلى الموارد المحلية** — يمكن للمشغل الوصول إلى الخدمات الموجودة على شبكتك المحلية (قواعد البيانات، واجهات برمجة التطبيقات، الأدوات الداخلية)
- **تحكم كامل** — قم بتثبيت أي برنامج، واستخدم أي وحدة معالجة مركزية (CPU)/بطاقة رسوميات (GPU)، وقم بتخصيص البيئة

المقابل لذلك هو أنك مسؤول عن صيانة الجهاز الافتراضي والحفاظ على أمانه.

## ماذا تحتاج

- تثبيت Proxmox VE قيد التشغيل (راجع المنشور السابق)
- حساب GitHub يحتوي على مستودع واحد على الأقل
- ملف ISO لـ Ubuntu Server 22.04 أو 24.04 (مرفوع على Proxmox)
- حوالي 30 دقيقة من وقتك

## الخطوة 1 — إنشاء جهاز افتراضي في Proxmox

قم بتسجيل الدخول إلى واجهة الويب الخاصة بـ Proxmox وقم بإنشاء جهاز افتراضي جديد للمشغل:

1. انقر على **Create VM** في أعلى اليمين
2. **علامة تبويب General (عام):**
   - العقدة (Node): عقدة Proxmox الخاصة بك
   - معرف الجهاز (VM ID): اترك الافتراضي أو اختر واحدًا (مثال، `200`)
   - الاسم (Name): `github-runner`
3. **علامة تبويب OS (نظام التشغيل):**
   - حدد ملف Ubuntu Server ISO الذي قمت برفعه
   - النوع (Type): Linux، الإصدار (Version): 6.x - 2.6 Kernel
4. **علامة تبويب System (النظام):**
   - اترك الإعدادات الافتراضية (BIOS: SeaBIOS أو OVMF لـ UEFI، Machine: q35)
   - حدد "Qemu Agent" — سنقوم بتثبيته لاحقًا
5. **علامة تبويب Disks (الأقراص):**
   - الناقل (Bus): VirtIO Block
   - حجم القرص: 40 جيجابايت كحد أدنى (يُوصى بـ 64 جيجابايت إذا كنت تبني صور Docker)
   - التخزين (Storage): تجمع التخزين المفضل لديك
6. **علامة تبويب CPU (المعالج):**
   - الأنوية (Cores): 2 كحد أدنى (يُوصى بـ 4 لعمليات بناء أسرع)
   - النوع (Type): host (يمنح الجهاز الافتراضي إمكانية الوصول إلى ميزات وحدة المعالجة المركزية الفعلية الخاصة بك)
7. **علامة تبويب Memory (الذاكرة):**
   - 4096 ميجابايت كحد أدنى (يُوصى بـ 8192 ميجابايت)
8. **علامة تبويب Network (الشبكة):**
   - الجسر (Bridge): vmbr0
   - النموذج (Model): VirtIO

انقر على **Finish** ثم **Start** لبدء الجهاز الافتراضي. افتح **Console** لبدء تثبيت Ubuntu.

## الخطوة 2 — تثبيت Ubuntu Server

استكمل خطوات مثبت Ubuntu:

1. حدد لغتك وتخطيط لوحة المفاتيح
2. اختر **Ubuntu Server (minimized)** إذا كان متاحًا — لسنا بحاجة إلى بيئة سطح مكتب
3. تكوين الشبكة — استخدام DHCP جيد في الوقت الحالي، ولكن عنوان IP الثابت أفضل لخادم يعمل لفترات طويلة
4. تكوين القرص — استخدم القرص بالكامل، مع تخطيط LVM الافتراضي
5. قم بتعيين اسم المستخدم وكلمة المرور (مثال، اسم المستخدم: `runner`)
6. قم بتمكين **Install OpenSSH server** حتى تتمكن من الاتصال عبر SSH لاحقًا
7. تخطَ حزم snaps المميزة — سنقوم بتثبيت ما نحتاجه يدويًا
8. انتظر حتى ينتهي التثبيت، ثم أعد التشغيل

بعد إعادة التشغيل، قم بتسجيل الدخول عبر وحدة التحكم أو SSH:

```bash
ssh runner@<vm-ip-address>
```

## الخطوة 3 — تحديث النظام وتثبيت التبعيات

أولاً، قم بتحديث كل شيء وتثبيت الحزم التي تحتاجها معظم مسارات عمل CI:

```bash
sudo apt update && sudo apt upgrade -y

# Install common build dependencies
sudo apt install -y \
  curl \
  wget \
  git \
  build-essential \
  jq \
  unzip \
  zip \
  software-properties-common \
  apt-transport-https \
  ca-certificates \
  gnupg \
  lsb-release

# Install the QEMU guest agent for Proxmox integration
sudo apt install -y qemu-guest-agent
sudo systemctl enable qemu-guest-agent
sudo systemctl start qemu-guest-agent
```

## الخطوة 4 — تثبيت Docker (اختياري ولكنه موصى به)

تستخدم معظم مسارات CI Docker في مرحلة ما. قم بتثبيته الآن:

```bash
# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add the Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add the runner user to the docker group so it can run Docker without sudo
sudo usermod -aG docker runner

# Verify Docker works
sudo docker run hello-world
```

قم بتسجيل الخروج ثم تسجيل الدخول مرة أخرى حتى يسري مفعول التغيير في المجموعة.

## الخطوة 5 — تثبيت Node.js (اختياري)

إذا كانت مسارات العمل الخاصة بك تبني مشاريع Node.js، فقم بتثبيته عبر مستودع NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

يمكنك أيضًا تثبيت بيئات التشغيل الأخرى التي تحتاجها (Python، Go، Java، إلخ) في هذه المرحلة.

## الخطوة 6 — تنزيل وتكوين مشغل GitHub Actions

الآن إلى الحدث الرئيسي. انتقل إلى إعدادات مستودع GitHub الخاص بك (أو مؤسستك):

1. انتقل إلى **Settings > Actions > Runners**
2. انقر على **New self-hosted runner**
3. حدد **Linux** و **x64**
4. سيعرض لك GitHub الأوامر الدقيقة لتشغيلها. إنها تبدو كالتالي:

```bash
# Create a directory for the runner
mkdir actions-runner && cd actions-runner

# Download the latest runner package
curl -o actions-runner-linux-x64-2.321.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.321.0/actions-runner-linux-x64-2.321.0.tar.gz

# Extract the package
tar xzf ./actions-runner-linux-x64-2.321.0.tar.gz
```

سيختلف رقم الإصدار — استخدم دائمًا الأوامر الموضحة في صفحة GitHub للحصول على أحدث إصدار.

## الخطوة 7 — تسجيل المشغل

بينما لا تزال في مجلد `actions-runner`، قم بتشغيل أمر التكوين. يوفر GitHub هذا على نفس الصفحة باستخدام رمز مميز (token) فريد:

```bash
./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPO --token YOUR_TOKEN_HERE
```

سيسألك الإعداد التفاعلي:

- **مجموعة المشغل (Runner group):** اضغط على Enter للافتراضي
- **اسم المشغل (Runner name):** أعطه اسمًا مثل `proxmox-runner` أو اضغط على Enter لاستخدام اسم المضيف
- **التسميات (Labels):** أضف تسميات مخصصة مثل `self-hosted,linux,x64,proxmox` — تتيح هذه التسميات لمسارات العمل الخاصة بك استهداف هذا المشغل المحدد
- **مجلد العمل (Work folder):** اضغط على Enter للافتراضي `_work`

إذا كنت تريد تسجيل المشغل على مستوى المؤسسة بدلاً من مستودع واحد، فاستخدم عنوان URL الخاص بمؤسستك:

```bash
./config.sh --url https://github.com/YOUR_ORG --token YOUR_TOKEN_HERE
```

## الخطوة 8 — اختبار المشغل يدويًا

قم بتشغيل المشغل في الواجهة الأمامية للتحقق من أنه يعمل:

```bash
./run.sh
```

يجب أن ترى مخرجات مثل:

```
Connected to GitHub
Listening for Jobs
```

يجب أن يظهر المشغل الآن كـ **Idle** (خامل) في صفحة Settings > Actions > Runners الخاصة بمستودع GitHub مع نقطة خضراء.

لاختباره، قم بإنشاء مسار عمل بسيط في أي مستودع. قم بإنشاء الملف `.github/workflows/test-runner.yml`:

```yaml
name: Test Self-Hosted Runner

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: self-hosted

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: System info
        run: |
          echo "Runner: $(hostname)"
          echo "OS: $(cat /etc/os-release | grep PRETTY_NAME)"
          echo "CPU: $(nproc) cores"
          echo "RAM: $(free -h | awk '/^Mem:/ {print $2}')"
          echo "Disk: $(df -h / | awk 'NR==2 {print $4}') free"
          docker --version || echo "Docker not installed"

      - name: Run a build step
        run: echo "Build completed successfully on self-hosted runner"
```

قم بدفع (Push) هذا الملف وانتقل إلى علامة التبويب Actions في مستودعك. يجب أن ترى سير العمل قيد التشغيل على المشغل ذاتي الاستضافة.

اضغط على `Ctrl+C` في الوحدة الطرفية لإيقاف المشغل بمجرد التحقق من أنه يعمل.

## الخطوة 9 — تثبيت المشغل كخدمة

أنت لا ترغب في إبقاء الوحدة الطرفية مفتوحة إلى الأبد. قم بتثبيت المشغل كخدمة systemd حتى يبدأ تلقائيًا:

```bash
cd ~/actions-runner

# Install the service (this creates a systemd unit file)
sudo ./svc.sh install runner

# Start the service
sudo ./svc.sh start

# Check the status
sudo ./svc.sh status
```

استبدل `runner` باسم المستخدم الفعلي الخاص بك إذا كان مختلفًا.

سيبدأ المشغل الآن تلقائيًا عند تمهيد الجهاز الافتراضي. يمكنك التحقق باستخدام:

```bash
sudo systemctl status actions.runner.*.service
```

## الخطوة 10 — تكوين الجهاز الافتراضي للبدء التلقائي في Proxmox

أنت تريد أن يبدأ الجهاز الافتراضي للمشغل تلقائيًا في حالة إعادة تشغيل Proxmox:

1. في واجهة ويب Proxmox، حدد الجهاز الافتراضي `github-runner` الخاص بك
2. انتقل إلى **Options**
3. انقر نقرًا مزدوجًا فوق **Start at boot** وقم بتعيينه إلى **Yes**
4. يمكنك اختياريًا تعيين **Start/Shutdown order** (ترتيب التشغيل/الإيقاف) إذا كان لديك تبعيات

الآن ينجو المشغل من عمليات إعادة تشغيل المضيف دون تدخل يدوي.

## استخدام المشغل في مسارات العمل الخاصة بك

لاستخدام المشغل ذاتي الاستضافة في أي مسار عمل، قم بتعيين `runs-on` إلى `self-hosted` أو استخدم تسميات محددة:

```yaml
jobs:
  build:
    # Use any self-hosted runner
    runs-on: self-hosted

  deploy:
    # Use a runner with specific labels
    runs-on: [self-hosted, linux, proxmox]
```

يمكنك أيضًا المزج بين المشغلات ذاتية الاستضافة ومشغلات GitHub في نفس مسار العمل:

```yaml
jobs:
  lint:
    # Fast check on GitHub's runners
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run lint

  build:
    # Heavy build on your own hardware
    needs: lint
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
```

## اعتبارات أمنية

تشغيل مشغل ذاتي الاستضافة يعني أن التعليمات البرمجية من مسارات العمل الخاصة بك يتم تنفيذها على جهازك. ضع هذه النقاط في الاعتبار:

- **لا تستخدم أبدًا مشغلات ذاتية الاستضافة في المستودعات العامة.** يمكن لأي شخص يقدم طلب سحب (pull request) تشغيل تعليمات برمجية عشوائية على جهازك عبر مسار العمل. المشغلات ذاتية الاستضافة آمنة للمستودعات الخاصة والمؤسسات الموثوقة فقط.
- **اعزل الجهاز الافتراضي للمشغل.** لا تمنحه حق الوصول إلى الأجزاء الحساسة من شبكتك ما لم يكن مسار العمل يحتاج إلى ذلك تحديدًا. استخدم جدار حماية Proxmox أو تجزئة الشبكة.
- **حافظ على تحديث الجهاز الافتراضي.** قم بتشغيل `sudo apt update && sudo apt upgrade -y` بانتظام، أو قم بإعداد ترقيات غير مراقبة (unattended-upgrades).
- **استخدم التسميات بحكمة.** إذا كان لديك مشغلات متعددة، فاستخدم التسميات للتحكم في مسارات العمل التي تعمل وأين.
- **نظف بين الوظائف.** يعيد المشغل استخدام نفس البيئة بين عمليات التشغيل. إذا كنت بحاجة إلى العزل، فاستخدم حاويات Docker داخل مسارات العمل الخاصةيف الخاص بك أو قم بتمكين الوضع العابر (علامة `--ephemeral` أثناء التكوين، والتي تلغي تسجيل المشغل بعد كل وظيفة).

## صيانة المشغل

بعض مهام الصيانة للحفاظ على سير الأمور بسلاسة:

**تحديث برنامج المشغل:**

سيخطرك GitHub في صفحة Actions > Runners عند توفر إصدار جديد. للتحديث:

```bash
cd ~/actions-runner
sudo ./svc.sh stop
# Download and extract the new version (check GitHub for the latest URL)
curl -o actions-runner-linux-x64-NEW_VERSION.tar.gz -L https://github.com/actions/runner/releases/download/vNEW_VERSION/actions-runner-linux-x64-NEW_VERSION.tar.gz
tar xzf ./actions-runner-linux-x64-NEW_VERSION.tar.gz
sudo ./svc.sh start
```

في الواقع، في معظم الحالات يقوم المشغل بتحديث نفسه تلقائيًا. ولكن إذا تأخر كثيرًا، فستكون هناك حاجة إلى تحديث يدوي.

**مراقبة استخدام القرص:**

يمكن لملفات البناء (artifacts) وصور Docker أن تملأ القرص بسرعة. قم بإعداد وظيفة cron للتنظيف:

```bash
# Add to crontab: clean Docker every Sunday at 3am
echo "0 3 * * 0 docker system prune -af --volumes" | sudo tee -a /var/spool/cron/crontabs/runner
```

**أخذ لقطات (snapshots) في Proxmox:**

قبل إجراء تغييرات كبيرة على الجهاز الافتراضي للمشغل، خذ لقطة في واجهة مستخدم Proxmox. يمنحك هذا تراجعًا بنقرة واحدة إذا تعطل شيء ما.

## الخاتمة

لديك الآن مشغل GitHub Actions يعمل بكامل طاقته على خادم Proxmox الخاص بك. تعمل مسارات CI/CD الخاصة بك على أجهزة تتحكم فيها، بدون حدود زمنية، وبناء أسرع، وذاكرة تخزين مؤقت دائمة.

يستغرق الإعداد حوالي 30 دقيقة ويعمل المشغل بهدوء في الخلفية. بالاقتران مع ميزات اللقطات والنسخ الاحتياطي في Proxmox، لديك إعداد CI/CD قوي لا يكلف شيئًا سوى الكهرباء لتشغيل الخادم الخاص بك.

هذا أحد أكثر الأشياء العملية التي يمكنك القيام بها مع الخادم المنزلي (homelab) — تحويل الأجهزة الخاملة إلى أداة إنتاجية حقيقية لسير عمل التطوير الخاص بك.
