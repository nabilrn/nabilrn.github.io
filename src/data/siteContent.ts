export type SiteLocale = 'en' | 'id' | 'cn' | 'jp';

export const defaultLocale: SiteLocale = 'en';
export const supportedLocales = ['en', 'id', 'cn', 'jp'] as const satisfies readonly SiteLocale[];
export const localizedLocales = ['id', 'cn', 'jp'] as const satisfies readonly SiteLocale[];
export const siteUrl = 'https://portfolio.nabilrn.space';
export const authorName = 'Nabil Rizki Navisa';
export const localeMeta: Record<SiteLocale, { label: string; htmlLang: string; ogLocale: string; pathPrefix: string; dateLocale: string }> = {
    en: { label: 'English', htmlLang: 'en', ogLocale: 'en_US', pathPrefix: '', dateLocale: 'en-US' },
    id: { label: 'Indonesia', htmlLang: 'id', ogLocale: 'id_ID', pathPrefix: '/id', dateLocale: 'id-ID' },
    cn: { label: '中文', htmlLang: 'zh-CN', ogLocale: 'zh_CN', pathPrefix: '/cn', dateLocale: 'zh-CN' },
    jp: { label: '日本語', htmlLang: 'ja', ogLocale: 'ja_JP', pathPrefix: '/jp', dateLocale: 'ja-JP' },
};

export const normalizeLocale = (locale?: string): SiteLocale =>
    supportedLocales.includes(locale as SiteLocale) ? (locale as SiteLocale) : defaultLocale;

export const stripLocaleFromPath = (path = '/') => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const stripped = normalized.replace(/^\/(id|cn|jp)(?=\/|$)/, '');
    return stripped === '' ? '/' : stripped;
};

export const localizePath = (path: string, locale: SiteLocale = defaultLocale) => {
    const normalized = stripLocaleFromPath(path);
    if (locale === defaultLocale) return normalized;
    return `${localeMeta[locale].pathPrefix}${normalized === '/' ? '/' : normalized}`;
};

export const siteContent = {
    en: {
        profile: {
            name: authorName,
            role: 'software engineer / lifetime learner',
            status: 'open to opportunities',
            bio: 'SWE | AI Agent Enthusiast | IT Infrastructure Enthusiast. Information Systems graduate from Universitas Andalas, GPA 3.71.',
            avatarAlt: authorName,
        },
        seo: {
            defaultTitle: 'Nabil Rizki Navisa | Software Engineer & Information Systems Graduate',
            defaultDescription:
                'Portfolio of Nabil Rizki Navisa - Software Engineer and Information Systems graduate from Universitas Andalas with GPA 3.71. Focused on AI agents, web, mobile, and IT infrastructure.',
            siteAlternateName: ['nabilrn', 'Nabil Portfolio'],
            keywords:
                'Nabil Rizki Navisa, Nabil Navisa, Nabil Rizki, nabilrn, nabilrizkinavisa, Software Engineer, Information Systems Graduate, GPA 3.71, Universitas Andalas Graduate, AI Agent Enthusiast, IT Infrastructure Enthusiast, Backend Developer, Frontend Developer, Android Developer, Mobile Developer, Kotlin Developer, Flutter Developer, React Developer, Node.js Developer, TypeScript Developer, Python Developer, IT Infrastructure, DevOps, Proxmox, Docker, GCP, Web Developer, Indonesia, Padang, Universitas Andalas, UNAND, Information Systems, Bangkit Academy, Portfolio, Programmer, Tech Enthusiast',
            ogSiteName: authorName,
            themeColor: '#0a0a0a',
        },
        schema: {
            alternateName: ['Nabil Navisa', 'Nabil Rizki', 'nabilrn', 'nabilrizkinavisa'],
            email: 'nabilrizkinavisa@gmail.com',
            jobTitle: 'Software Engineer',
            personDescription:
                'Software Engineer and Information Systems graduate from Universitas Andalas with GPA 3.71. Based in Indonesia and focused on web development, mobile development, AI agent workflows, DevOps, and IT infrastructure.',
            sameAs: [
                'https://github.com/nabilrn',
                'https://www.linkedin.com/in/nabilrizkinavisa2004',
                'https://x.com/NabilrizkiN',
                'https://www.instagram.com/nabilrizkinavisa',
            ],
            alumniName: 'Universitas Andalas',
            alumniAlternateName: 'UNAND',
            degreeName: 'Bachelor of Information Systems',
            credentialCategory: 'Bachelor degree',
            educationalLevel: 'Undergraduate degree',
            graduationDate: 'June 2026',
            gpa: '3.71/4.00',
            worksFor: 'Freelance / Open for Opportunities',
            nationality: 'Indonesia',
            knowsAbout: [
                'Software Engineering',
                'AI Agents',
                'JavaScript',
                'TypeScript',
                'Kotlin',
                'Dart',
                'Flutter',
                'React',
                'Node.js',
                'Express.js',
                'Next.js',
                'Android Development',
                'Mobile Development',
                'DevOps',
                'Docker',
                'Proxmox',
                'PostgreSQL',
                'Redis',
                'Python',
                'IT Infrastructure',
            ],
        },
        nav: {
            ariaMainSections: 'Main page sections',
            ariaPageNavigation: 'Page navigation',
            ariaLanguageNavigation: 'Language selection',
            home: 'Home',
            overview: 'Overview',
            education: 'Education',
            showcase: 'Showcase',
            repositories: 'Repositories',
            experience: 'Experience',
            latestPosts: 'Latest posts',
            skills: 'Skills',
            projects: 'Projects',
            blog: 'Blog',
            brand: authorName,
        },
        social: {
            email: 'Email',
            github: 'GitHub',
            linkedin: 'LinkedIn',
            x: 'X',
            instagram: 'Instagram',
        },
        home: {
            seoTitle: 'Nabil Rizki Navisa | Software Engineer & Information Systems Graduate',
            seoDescription:
                'Portfolio of Nabil Rizki Navisa - Software Engineer and Information Systems graduate from Universitas Andalas with GPA 3.71. Focused on AI agents, web, mobile, and IT infrastructure.',
            about: {
                heading: 'About',
                headline: 'Building software, AI agents, and self-hosted infrastructure.',
                body:
                    'Information Systems graduate from Universitas Andalas, graduated in June 2026 with GPA 3.71/4.00. Focused on software engineering, AI agent workflows, and IT infrastructure management. Proficient in TypeScript, React, Node.js, Kotlin, and Python. Experienced in building and deploying production systems using Docker, CI/CD pipelines, and self-managed Proxmox virtualization environments. Combines strong software engineering fundamentals with practical DevOps skills, AI-assisted development workflows, and a passion for scalable system architecture.',
                strongTerms: ['Information Systems graduate', 'GPA 3.71/4.00', 'TypeScript', 'React', 'Node.js', 'Kotlin', 'Python'],
            },
            education: {
                heading: 'Education',
                subheading: 'Academic background',
                degree: 'Bachelor of Information Systems',
                institution: 'Universitas Andalas',
                period: 'Graduated June 2026',
                gpa: 'GPA 3.71/4.00',
                summary:
                    'Completed an Information Systems degree with emphasis on software engineering, AI-assisted workflows, IT infrastructure, and production system delivery.',
                tags: ['Information Systems', 'Universitas Andalas', 'GPA 3.71', 'Graduated June 2026'],
            },
            repositories: {
                heading: 'Project',
                subheading: 'recent repositories',
                visibility: 'Public',
                viewAll: 'View all projects',
            },
            experiences: {
                heading: 'Experience',
                subheading: 'Work and academic roles',
                items: [
                    {
                        title: 'Laboratory Assistant - TKITI',
                        period: 'Coordinator / 2025',
                        bullets: [
                            'Led discussions on lab module design and curriculum alignment',
                            'Created strategic improvement plans for TKITI Lab development',
                            'Provided training and upgrading materials for new assistants',
                        ],
                        tags: ['Leadership', 'Curriculum Design', 'Lab Management'],
                        current: false,
                    },
                    {
                        title: 'Bank Nagari (Head Office)',
                        period: 'Programmer Intern / 2025',
                        bullets: [
                            'Built admin and intern modules in collaboration with one teammate',
                            'Taught Git fundamentals to in-house programmers',
                            'Learned banking IT practices, internal tech stacks, and system concepts',
                        ],
                        tags: ['Express.js', 'React', 'PostgreSQL', 'Git'],
                        current: false,
                    },
                    {
                        title: 'Laboratory Assistant - Basic Computing',
                        period: 'Coordinator / 2024 - 2025',
                        bullets: [
                            'Learned foundational IT infrastructure concepts, including server setup',
                            'Prepared lab environments, materials, and technical setups',
                        ],
                        tags: ['IT Infrastructure', 'Server Management'],
                        current: false,
                    },
                    {
                        title: 'Bangkit Academy 2024',
                        period: 'Android Learning Path / 2024',
                        bullets: [
                            'Learned modern Android development with Kotlin and XML',
                            'Built capstone project Outfyt - Smart OOTD Recommendation App',
                            'Collaborated with 8-person cross-functional team (ML, Cloud, Mobile)',
                        ],
                        tags: ['Android', 'Kotlin', 'XML'],
                        current: false,
                    },
                ],
            },
            contributions: {
                heading: 'Contributions',
                subheading: 'activity on GitHub',
                chartAlt: 'GitHub contribution chart',
                label: 'nabilrn on GitHub',
                totalLabel: (total: number) => `${total} contributions in the last year`,
                contributionLabel: (count: number, date: string) =>
                    `${count} ${count === 1 ? 'contribution' : 'contributions'} on ${date}`,
                less: 'Less',
                more: 'More',
            },
            blog: {
                heading: 'Latest posts',
                subheading: 'Notes on software engineering',
                viewAll: 'View all posts',
            },
            skills: {
                heading: 'Skills',
                subheading: 'Languages, tools, and infrastructure',
                groups: [
                    { label: 'PROGRAMMING', primary: ['JavaScript', 'TypeScript', 'Kotlin'], items: ['Dart', 'Python'] },
                    { label: 'DEVOPS / INFRA', primary: ['Docker'], items: ['Proxmox', 'Ubuntu', 'GCP', 'Cloudflare'] },
                    { label: 'DATABASES', primary: [], items: ['MySQL', 'PostgreSQL', 'SQLite', 'Redis'] },
                    { label: 'TOOLS', primary: [], items: ['Git', 'VS Code', 'Android Studio', 'Figma', 'JetBrains', 'AI Coding CLI'] },
                ],
            },
            certifications: {
                heading: 'Certifications',
                items: [
                    {
                        label: 'Dev Certification for Android (DCA) - Dev.id',
                        href: 'https://dev.id/certificate/verify/41VQQG6VM8',
                    },
                    {
                        label: 'Android Developer - Dicoding 2024',
                        href: 'https://www.dicoding.com/certificates/1RXY27E8KXVM',
                    },
                ],
            },
        },
        projectShowcase: {
            heading: 'Showcase',
            subheading: 'selected work',
            web: 'Web',
            mobile: 'Mobile',
            visitSite: 'Visit site',
            github: 'GitHub',
            viewAll: 'View all',
            viewAllProjectShowcase: 'View all project showcase',
            screenshotAlt: 'screenshot',
            websitePreviewAlt: 'website preview',
            screenshotDialogClose: 'Close',
            previousScreenshot: 'Previous screenshot',
            nextScreenshot: 'Next screenshot',
        },
        projectsPage: {
            seoTitle: 'Projects | Nabil Rizki Navisa',
            seoDescription:
                'Project showcase and repository index for Nabil Rizki Navisa, covering web applications, mobile apps, infrastructure projects, and AI-assisted software builds.',
            ogImageAlt: 'Nabil Rizki Navisa project showcase and repository index in terminal-inspired dark style.',
            eyebrow: 'Projects',
            heading: 'Project showcase and repository index.',
            intro: 'A fuller catalog of shipped web builds, Android experiments, infrastructure work, and selected repositories.',
            summary: {
                webBuilds: 'Web builds',
                mobileApps: 'Mobile apps',
                repositories: 'Repositories',
                ariaLabel: 'Project summary',
            },
            sectionNavAria: 'Project page sections',
            nav: {
                featuredBuilds: 'Featured builds',
                repositories: 'Repositories',
                stack: 'Stack',
            },
            featuredSubheading: 'web and mobile projects',
            repositoriesSubheading: 'curated code index',
            stackSubheading: 'tools used across projects',
            visibility: 'Public',
            pageStatus: (current: number, total: number) => `page ${current} of ${total}`,
            pageStatusTemplate: 'page {current} of {total}',
            paginationAria: 'Repository pagination',
            previous: 'Previous',
            next: 'Next',
            openGithubRepositories: 'Open GitHub repositories',
            itemListName: 'Selected software projects and repositories',
        },
        blog: {
            legacyBrand: 'nabilrn / blog',
            articles: 'Articles',
            portfolio: 'Portfolio',
            navigationAria: 'Blog navigation',
            seoTitle: 'Blog | Nabil Rizki Navisa',
            seoDescription: 'Notes on software engineering, project lessons, and practical workflows by Nabil Rizki Navisa.',
            ogImageAlt: 'Nabil Rizki Navisa blog article listing in terminal-inspired dark style.',
            eyebrow: 'Blog',
            heading: 'Technical notes, shipped learnings, and practical guides.',
            intro: 'A focused reading space with tutorials and engineering notes from real projects and homelab experiments.',
            languageAria: 'Blog language',
            searchLabel: 'Search articles',
            searchPlaceholder: 'Search articles',
            postsAria: 'Blog posts',
            noMatches: 'No matching articles found.',
            localeLabel: {
                en: 'English',
                id: 'Indonesia',
                cn: 'Chinese',
                jp: 'Japanese',
            },
            minRead: (minutes: number) => `${minutes} min read`,
            minReadByLocale: {
                en: (minutes: number) => `${minutes} min read`,
                id: (minutes: number) => `${minutes} menit baca`,
                cn: (minutes: number) => `${minutes} min read`,
                jp: (minutes: number) => `${minutes} min read`,
            },
            article: {
                by: 'By',
                back: 'Back to all articles',
                languageAria: 'Article language',
                minRead: (minutes: number) => `${minutes} min read`,
                updated: 'Updated',
                engagementAria: 'Engagement actions',
                ogImageAlt: (title: string) => `Social preview card for article: ${title}`,
                byLocale: {
                    en: {
                        back: 'Back to all articles',
                        updated: 'Updated',
                    },
                    id: {
                        back: 'Kembali ke semua artikel',
                        updated: 'Diperbarui',
                    },
                },
            },
        },
        engagement: {
            views: 'Views',
            likes: 'Likes',
            shares: 'Shares',
            localMetricsNote: 'local MVP metrics',
            likePost: 'Like post',
            like: 'Like',
            liked: 'Liked',
            copyLink: 'Copy link',
            copyLinkTitle: 'Copy Link',
            copy: 'Copy',
            linkedin: 'LinkedIn',
            x: 'X',
            whatsapp: 'WhatsApp',
            linkCopied: 'Link copied',
            copied: 'Copied',
            fallbackPostTitle: 'Blog post',
        },
        theme: {
            toggle: 'Toggle theme',
        },
        search: {
            open: 'Search',
            ariaOpen: 'Open site search',
            placeholder: 'Search portfolio, projects, and posts...',
            close: 'Close search',
            noResults: 'No results found.',
            hint: 'Search all portfolio context',
            shortcut: 'Ctrl K',
            results: 'Results',
            resultTypes: {
                page: 'Page',
                project: 'Project',
                post: 'Article',
            },
        },
        errors: {
            notFound: {
                title: '404 | Page Not Found',
                description: 'The page you are looking for cannot be found.',
                ogImageAlt: '404 page not found for portfolio.nabilrn.space.',
                code: '404',
                heading: 'Page not found.',
                body: 'The link may be broken, moved, or removed. Use one of the options below to continue browsing.',
            },
            server: {
                title: '500 | Server Error',
                description: 'The server encountered an unexpected error.',
                ogImageAlt: '500 server error page for portfolio.nabilrn.space.',
                code: '500',
                heading: 'Unexpected server error.',
                body: 'Something went wrong while loading this page. Please try again in a moment, or return to the homepage.',
            },
            actions: {
                portfolio: 'Go to portfolio',
                blog: 'Read the blog',
            },
        },
    },
} as const;

type SiteContent = typeof siteContent.en;
type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends (...args: never[]) => unknown
        ? T[K]
        : T[K] extends readonly unknown[]
            ? T[K]
            : T[K] extends object
                ? DeepPartial<T[K]>
                : T[K];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const mergeContent = <T extends Record<string, unknown>>(base: T, override: DeepPartial<T>): T => {
    const result = { ...base } as Record<string, unknown>;

    for (const [key, value] of Object.entries(override)) {
        const baseValue = result[key];
        result[key] = isRecord(baseValue) && isRecord(value)
            ? mergeContent(baseValue, value as DeepPartial<Record<string, unknown>>)
            : value;
    }

    return result as T;
};

const idContent: DeepPartial<SiteContent> = {
    profile: {
        role: 'software engineer / pembelajar seumur hidup',
        status: 'terbuka untuk peluang',
        bio: 'SWE | Penggemar AI Agent | Penggemar Infrastruktur TI. Lulusan Sistem Informasi Universitas Andalas, IPK 3.71.',
    },
    seo: {
        defaultTitle: 'Nabil Rizki Navisa | Software Engineer & Lulusan Sistem Informasi',
        defaultDescription:
            'Portfolio Nabil Rizki Navisa - Software Engineer dan lulusan Sistem Informasi Universitas Andalas dengan IPK 3.71. Berfokus pada AI agent, web, mobile, dan infrastruktur TI.',
    },
    schema: {
        personDescription:
            'Software Engineer dan lulusan Sistem Informasi Universitas Andalas dengan IPK 3.71. Berbasis di Indonesia dan berfokus pada pengembangan web, mobile, workflow AI agent, DevOps, dan infrastruktur TI.',
        degreeName: 'Sarjana Sistem Informasi',
        credentialCategory: 'Gelar sarjana',
        educationalLevel: 'Sarjana',
        graduationDate: 'Juni 2026',
        gpa: '3.71/4.00',
        worksFor: 'Freelance / Terbuka untuk peluang kerja',
        nationality: 'Indonesia',
    },
    nav: {
        ariaMainSections: 'Bagian utama halaman',
        ariaPageNavigation: 'Navigasi halaman',
        ariaLanguageNavigation: 'Pilihan bahasa',
        home: 'Beranda',
        overview: 'Ringkasan',
        education: 'Pendidikan',
        showcase: 'Showcase',
        repositories: 'Repositori',
        experience: 'Pengalaman',
        latestPosts: 'Posting terbaru',
        skills: 'Keahlian',
        projects: 'Proyek',
        blog: 'Blog',
    },
    home: {
        seoTitle: 'Nabil Rizki Navisa | Software Engineer & Lulusan Sistem Informasi',
        seoDescription:
            'Portfolio Nabil Rizki Navisa - Software Engineer dan lulusan Sistem Informasi Universitas Andalas dengan IPK 3.71. Berfokus pada AI agent, web, mobile, dan infrastruktur TI.',
        about: {
            heading: 'Tentang',
            headline: 'Membangun perangkat lunak, agen AI, dan infrastruktur self-hosted.',
            body:
                'Lulusan Sistem Informasi Universitas Andalas, lulus Juni 2026 dengan IPK 3.71/4.00. Berfokus pada software engineering, workflow AI agent, dan manajemen infrastruktur TI. Berpengalaman dengan TypeScript, React, Node.js, Kotlin, dan Python. Terbiasa membangun dan menerapkan sistem produksi menggunakan Docker, pipeline CI/CD, dan lingkungan virtualisasi Proxmox yang dikelola mandiri. Menggabungkan dasar software engineering yang kuat dengan kemampuan DevOps praktis, workflow pengembangan berbantuan AI, dan minat pada arsitektur sistem yang skalabel.',
            strongTerms: ['Lulusan Sistem Informasi', 'IPK 3.71/4.00', 'TypeScript', 'React', 'Node.js', 'Kotlin', 'Python'],
        },
        education: {
            heading: 'Pendidikan',
            subheading: 'latar akademik',
            degree: 'Sarjana Sistem Informasi',
            institution: 'Universitas Andalas',
            period: 'Lulus Juni 2026',
            gpa: 'IPK 3.71/4.00',
            summary:
                'Menyelesaikan studi Sistem Informasi dengan fokus pada software engineering, workflow berbantuan AI, infrastruktur TI, dan delivery sistem produksi.',
            tags: ['Sistem Informasi', 'Universitas Andalas', 'IPK 3.71', 'Lulus Juni 2026'],
        },
        repositories: {
            heading: 'Proyek',
            subheading: 'repositori terbaru',
            visibility: 'Publik',
            viewAll: 'Lihat semua proyek',
        },
        experiences: {
            heading: 'Pengalaman',
            subheading: 'peran kerja dan akademik',
            items: [
                {
                    title: 'Asisten Laboratorium - TKITI',
                    period: 'Koordinator / 2025',
                    bullets: [
                        'Memimpin diskusi perancangan modul praktikum dan penyelarasan kurikulum',
                        'Menyusun rencana peningkatan strategis untuk pengembangan Lab TKITI',
                        'Menyediakan materi pelatihan dan upgrading untuk asisten baru',
                        ],
                        tags: ['Leadership', 'Curriculum Design', 'Lab Management'],
                        current: false,
                },
                {
                    title: 'Bank Nagari (Kantor Pusat)',
                    period: 'Programmer Intern / 2025',
                    bullets: [
                        'Membangun modul admin dan magang bersama satu rekan tim',
                        'Mengajarkan dasar Git kepada programmer internal',
                        'Mempelajari praktik TI perbankan, tech stack internal, dan konsep sistem',
                        ],
                        tags: ['Express.js', 'React', 'PostgreSQL', 'Git'],
                        current: false,
                },
                {
                    title: 'Asisten Laboratorium - Komputasi Dasar',
                    period: 'Koordinator / 2024 - 2025',
                    bullets: [
                        'Mempelajari konsep dasar infrastruktur TI, termasuk setup server',
                        'Menyiapkan lingkungan praktikum, materi, dan kebutuhan teknis',
                    ],
                    tags: ['IT Infrastructure', 'Server Management'],
                    current: false,
                },
                {
                    title: 'Bangkit Academy 2024',
                    period: 'Android Learning Path / 2024',
                    bullets: [
                        'Mempelajari pengembangan Android modern dengan Kotlin dan XML',
                        'Membangun proyek capstone Outfyt - aplikasi rekomendasi OOTD pintar',
                        'Berkolaborasi dalam tim lintas fungsi beranggotakan 8 orang (ML, Cloud, Mobile)',
                    ],
                    tags: ['Android', 'Kotlin', 'XML'],
                    current: false,
                },
            ],
        },
        contributions: {
            heading: 'Kontribusi',
            subheading: 'aktivitas di GitHub',
            chartAlt: 'Grafik kontribusi GitHub',
            label: 'nabilrn di GitHub',
            totalLabel: (total: number) => `${total} kontribusi dalam setahun terakhir`,
            contributionLabel: (count: number, date: string) => `${count} kontribusi pada ${date}`,
            less: 'Lebih sedikit',
            more: 'Lebih banyak',
        },
        blog: {
            heading: 'Posting terbaru',
            subheading: 'catatan tentang software engineering',
            viewAll: 'Lihat semua posting',
        },
        skills: {
            heading: 'Keahlian',
            subheading: 'bahasa, tools, dan infrastruktur',
            groups: [
                { label: 'PEMROGRAMAN', primary: ['JavaScript', 'TypeScript', 'Kotlin'], items: ['Dart', 'Python'] },
                { label: 'DEVOPS / INFRA', primary: ['Docker'], items: ['Proxmox', 'Ubuntu', 'GCP', 'Cloudflare'] },
                { label: 'DATABASE', primary: [], items: ['MySQL', 'PostgreSQL', 'SQLite', 'Redis'] },
                { label: 'TOOLS', primary: [], items: ['Git', 'VS Code', 'Android Studio', 'Figma', 'JetBrains', 'AI Coding CLI'] },
            ],
        },
        certifications: {
            heading: 'Sertifikasi',
        },
    },
    projectShowcase: {
        heading: 'Showcase',
        subheading: 'karya pilihan',
        web: 'Web',
        mobile: 'Mobile',
        visitSite: 'Kunjungi situs',
        github: 'GitHub',
        viewAll: 'Lihat semua',
        viewAllProjectShowcase: 'Lihat semua showcase proyek',
        screenshotAlt: 'tangkapan layar',
        websitePreviewAlt: 'pratinjau website',
        screenshotDialogClose: 'Tutup',
        previousScreenshot: 'Tangkapan layar sebelumnya',
        nextScreenshot: 'Tangkapan layar berikutnya',
    },
    projectsPage: {
        seoTitle: 'Proyek | Nabil Rizki Navisa',
        seoDescription:
            'Showcase proyek dan indeks repositori Nabil Rizki Navisa, mencakup aplikasi web, aplikasi mobile, proyek infrastruktur, dan software build berbantuan AI.',
        ogImageAlt: 'Showcase proyek dan indeks repositori Nabil Rizki Navisa dalam gaya gelap terinspirasi GitHub.',
        eyebrow: 'Proyek',
        heading: 'Showcase proyek dan indeks repositori.',
        intro: 'Katalog yang lebih lengkap berisi web build, eksperimen Android, pekerjaan infrastruktur, dan repositori pilihan.',
        summary: {
            webBuilds: 'Web build',
            mobileApps: 'Aplikasi mobile',
            repositories: 'Repositori',
            ariaLabel: 'Ringkasan proyek',
        },
        sectionNavAria: 'Bagian halaman proyek',
        nav: {
            featuredBuilds: 'Build pilihan',
            repositories: 'Repositori',
            stack: 'Stack',
        },
        featuredSubheading: 'proyek web dan mobile',
        repositoriesSubheading: 'indeks kode pilihan',
        stackSubheading: 'tools yang digunakan di berbagai proyek',
        visibility: 'Publik',
        pageStatus: (current: number, total: number) => `halaman ${current} dari ${total}`,
        pageStatusTemplate: 'halaman {current} dari {total}',
        paginationAria: 'Paginasi repositori',
        previous: 'Sebelumnya',
        next: 'Berikutnya',
        openGithubRepositories: 'Buka repositori GitHub',
        itemListName: 'Proyek software dan repositori pilihan',
    },
    blog: {
        articles: 'Artikel',
        portfolio: 'Portfolio',
        navigationAria: 'Navigasi blog',
        seoTitle: 'Blog | Nabil Rizki Navisa',
        seoDescription: 'Catatan tentang software engineering, pembelajaran proyek, dan workflow praktis oleh Nabil Rizki Navisa.',
        ogImageAlt: 'Daftar artikel blog Nabil Rizki Navisa dalam gaya gelap terinspirasi GitHub.',
        eyebrow: 'Blog',
        heading: 'Catatan teknis, pelajaran dari proyek, dan panduan praktis.',
        intro: 'Ruang baca ringkas berisi tutorial dan catatan engineering dari proyek nyata dan eksperimen homelab.',
        languageAria: 'Bahasa blog',
        searchLabel: 'Cari artikel',
        searchPlaceholder: 'Cari artikel',
        postsAria: 'Posting blog',
        noMatches: 'Tidak ada artikel yang cocok.',
        localeLabel: {
            en: 'Inggris',
            id: 'Indonesia',
            cn: 'Mandarin',
            jp: 'Jepang',
        },
        minRead: (minutes: number) => `${minutes} menit baca`,
        minReadByLocale: {
            en: (minutes: number) => `${minutes} menit baca`,
            id: (minutes: number) => `${minutes} menit baca`,
            cn: (minutes: number) => `${minutes} menit baca`,
            jp: (minutes: number) => `${minutes} menit baca`,
        },
        article: {
            by: 'Oleh',
            back: 'Kembali ke semua artikel',
            languageAria: 'Bahasa artikel',
            minRead: (minutes: number) => `${minutes} menit baca`,
            updated: 'Diperbarui',
            engagementAria: 'Aksi engagement',
            ogImageAlt: (title: string) => `Kartu pratinjau sosial untuk artikel: ${title}`,
        },
    },
    engagement: {
        views: 'Dilihat',
        likes: 'Suka',
        shares: 'Dibagikan',
        localMetricsNote: 'metrik MVP lokal',
        likePost: 'Sukai posting',
        like: 'Suka',
        liked: 'Disukai',
        copyLink: 'Salin tautan',
        copyLinkTitle: 'Salin Tautan',
        copy: 'Salin',
        linkCopied: 'Tautan disalin',
        copied: 'Disalin',
        fallbackPostTitle: 'Posting blog',
    },
    theme: {
        toggle: 'Ganti tema',
    },
    search: {
        open: 'Cari',
        ariaOpen: 'Buka pencarian situs',
        placeholder: 'Cari portfolio, proyek, dan posting...',
        close: 'Tutup pencarian',
        noResults: 'Tidak ada hasil yang cocok.',
        hint: 'Cari seluruh konteks portfolio',
        shortcut: 'Ctrl K',
        results: 'Hasil',
        resultTypes: {
            page: 'Halaman',
            project: 'Proyek',
            post: 'Artikel',
        },
    },
    errors: {
        notFound: {
            title: '404 | Halaman Tidak Ditemukan',
            description: 'Halaman yang Anda cari tidak dapat ditemukan.',
            heading: 'Halaman tidak ditemukan.',
            body: 'Tautan mungkin rusak, dipindahkan, atau dihapus. Gunakan salah satu opsi di bawah untuk melanjutkan.',
        },
        server: {
            title: '500 | Kesalahan Server',
            description: 'Server mengalami kesalahan yang tidak terduga.',
            heading: 'Kesalahan server tidak terduga.',
            body: 'Terjadi masalah saat memuat halaman ini. Coba lagi beberapa saat lagi, atau kembali ke beranda.',
        },
        actions: {
            portfolio: 'Ke portfolio',
            blog: 'Baca blog',
        },
    },
};

const cnContent: DeepPartial<SiteContent> = {
    profile: {
        role: '软件工程师 / 终身学习者',
        status: '开放新机会',
        bio: '软件工程师 | AI Agent 爱好者 | IT 基础设施爱好者。安达拉斯大学信息系统毕业生，GPA 3.71。',
    },
    seo: {
        defaultTitle: 'Nabil Rizki Navisa | 软件工程师与信息系统毕业生',
        defaultDescription:
            'Nabil Rizki Navisa 的作品集 - 软件工程师，安达拉斯大学信息系统毕业生，GPA 3.71。专注于 AI agent、Web、移动端和 IT 基础设施。',
    },
    schema: {
        personDescription:
            '常驻印度尼西亚的软件工程师，安达拉斯大学信息系统毕业生，GPA 3.71。专注于 Web 开发、移动开发、AI agent 工作流、DevOps 和 IT 基础设施。',
        degreeName: '信息系统学士',
        credentialCategory: '学士学位',
        educationalLevel: '本科',
        graduationDate: '2026 年 6 月',
        gpa: '3.71/4.00',
        worksFor: '自由职业 / 开放机会',
        nationality: '印度尼西亚',
    },
    nav: {
        ariaMainSections: '页面主要部分',
        ariaPageNavigation: '页面导航',
        ariaLanguageNavigation: '语言选择',
        home: '首页',
        overview: '概览',
        education: '教育',
        showcase: '作品',
        repositories: '代码仓库',
        experience: '经历',
        latestPosts: '最新文章',
        skills: '技能',
        projects: '项目',
        blog: '博客',
    },
    home: {
        seoTitle: 'Nabil Rizki Navisa | 软件工程师与信息系统毕业生',
        seoDescription:
            'Nabil Rizki Navisa 的作品集 - 软件工程师，安达拉斯大学信息系统毕业生，GPA 3.71。专注于 AI agent、Web、移动端和 IT 基础设施。',
        about: {
            heading: '关于',
            headline: '构建软件、AI 代理与自托管基础设施。',
            body:
                '安达拉斯大学信息系统毕业生，2026 年 6 月毕业，GPA 3.71/4.00。专注于软件工程、AI agent 工作流和 IT 基础设施管理。熟悉 TypeScript、React、Node.js、Kotlin 和 Python。具备使用 Docker、CI/CD pipeline 和自主管理的 Proxmox 虚拟化环境构建与部署生产系统的经验。结合扎实的软件工程基础、实用 DevOps 能力、AI 辅助开发工作流，以及对可扩展系统架构的兴趣。',
            strongTerms: ['信息系统毕业生', 'GPA 3.71/4.00', 'TypeScript', 'React', 'Node.js', 'Kotlin', 'Python'],
        },
        education: {
            heading: '教育',
            subheading: '学术背景',
            degree: '信息系统学士',
            institution: '安达拉斯大学',
            period: '2026 年 6 月毕业',
            gpa: 'GPA 3.71/4.00',
            summary:
                '完成信息系统学位，重点关注软件工程、AI 辅助工作流、IT 基础设施和生产系统交付。',
            tags: ['信息系统', '安达拉斯大学', 'GPA 3.71', '2026 年 6 月毕业'],
        },
        repositories: {
            heading: '项目',
            subheading: '近期代码仓库',
            visibility: '公开',
            viewAll: '查看所有项目',
        },
        experiences: {
            heading: '经历',
            subheading: '工作与学术角色',
            items: [
                {
                    title: 'TKITI 实验室助理',
                    period: '协调员 / 2025',
                    bullets: [
                        '主导实验模块设计与课程对齐讨论',
                        '制定 TKITI 实验室发展的战略改进计划',
                        '为新助理提供培训与能力提升材料',
                    ],
                    tags: ['Leadership', 'Curriculum Design', 'Lab Management'],
                    current: false,
                },
                {
                    title: 'Bank Nagari（总部）',
                    period: '程序员实习生 / 2025',
                    bullets: [
                        '与一名队友协作构建 admin 与 intern 模块',
                        '向内部程序员讲解 Git 基础',
                        '学习银行 IT 实践、内部技术栈和系统概念',
                    ],
                    tags: ['Express.js', 'React', 'PostgreSQL', 'Git'],
                    current: false,
                },
                {
                    title: '基础计算实验室助理',
                    period: '协调员 / 2024 - 2025',
                    bullets: [
                        '学习 IT 基础设施基础概念，包括服务器搭建',
                        '准备实验环境、材料和技术配置',
                    ],
                    tags: ['IT Infrastructure', 'Server Management'],
                    current: false,
                },
                {
                    title: 'Bangkit Academy 2024',
                    period: 'Android Learning Path / 2024',
                    bullets: [
                        '学习使用 Kotlin 和 XML 进行现代 Android 开发',
                        '构建 capstone 项目 Outfyt - 智能 OOTD 推荐应用',
                        '与 8 人跨职能团队协作（ML、Cloud、Mobile）',
                    ],
                    tags: ['Android', 'Kotlin', 'XML'],
                    current: false,
                },
            ],
        },
        contributions: {
            heading: '贡献',
            subheading: 'GitHub 活动',
            chartAlt: 'GitHub 贡献图',
            label: 'GitHub 上的 nabilrn',
            totalLabel: (total: number) => `过去一年 ${total} 次贡献`,
            contributionLabel: (count: number, date: string) => `${date} 有 ${count} 次贡献`,
            less: '少',
            more: '多',
        },
        blog: {
            heading: '最新文章',
            subheading: '关于软件工程的笔记',
            viewAll: '查看所有文章',
        },
        skills: {
            heading: '技能',
            subheading: '语言、工具和基础设施',
            groups: [
                { label: '编程', primary: ['JavaScript', 'TypeScript', 'Kotlin'], items: ['Dart', 'Python'] },
                { label: 'DEVOPS / 基础设施', primary: ['Docker'], items: ['Proxmox', 'Ubuntu', 'GCP', 'Cloudflare'] },
                { label: '数据库', primary: [], items: ['MySQL', 'PostgreSQL', 'SQLite', 'Redis'] },
                { label: '工具', primary: [], items: ['Git', 'VS Code', 'Android Studio', 'Figma', 'JetBrains', 'AI Coding CLI'] },
            ],
        },
        certifications: {
            heading: '认证',
        },
    },
    projectShowcase: {
        heading: '作品',
        subheading: '精选项目',
        web: 'Web',
        mobile: '移动端',
        visitSite: '访问网站',
        github: 'GitHub',
        viewAll: '查看全部',
        viewAllProjectShowcase: '查看所有项目作品',
        screenshotAlt: '截图',
        websitePreviewAlt: '网站预览',
        screenshotDialogClose: '关闭',
        previousScreenshot: '上一张截图',
        nextScreenshot: '下一张截图',
    },
    projectsPage: {
        seoTitle: '项目 | Nabil Rizki Navisa',
        seoDescription:
            'Nabil Rizki Navisa 的项目展示和代码仓库索引，涵盖 Web 应用、移动应用、基础设施项目和 AI 辅助软件构建。',
        ogImageAlt: 'Nabil Rizki Navisa 的项目展示和代码仓库索引，采用 GitHub 风格深色界面。',
        eyebrow: '项目',
        heading: '项目展示与代码仓库索引。',
        intro: '更完整的目录，包含已发布的 Web 构建、Android 实验、基础设施工作和精选代码仓库。',
        summary: {
            webBuilds: 'Web 构建',
            mobileApps: '移动应用',
            repositories: '代码仓库',
            ariaLabel: '项目摘要',
        },
        sectionNavAria: '项目页面部分',
        nav: {
            featuredBuilds: '精选构建',
            repositories: '代码仓库',
            stack: '技术栈',
        },
        featuredSubheading: '个 Web 与移动项目',
        repositoriesSubheading: '精选代码索引',
        stackSubheading: '项目中使用的工具',
        visibility: '公开',
        pageStatus: (current: number, total: number) => `第 ${current} 页，共 ${total} 页`,
        pageStatusTemplate: '第 {current} 页，共 {total} 页',
        paginationAria: '代码仓库分页',
        previous: '上一页',
        next: '下一页',
        openGithubRepositories: '打开 GitHub 代码仓库',
        itemListName: '精选软件项目和代码仓库',
    },
    blog: {
        articles: '文章',
        portfolio: '作品集',
        navigationAria: '博客导航',
        seoTitle: '博客 | Nabil Rizki Navisa',
        seoDescription: 'Nabil Rizki Navisa 关于软件工程、项目经验和实用工作流的笔记。',
        ogImageAlt: 'Nabil Rizki Navisa 博客文章列表，采用 GitHub 风格深色界面。',
        eyebrow: '博客',
        heading: '技术笔记、项目经验和实用指南。',
        intro: '一个专注的阅读空间，收录来自真实项目和 homelab 实验的教程与工程笔记。',
        languageAria: '博客语言',
        searchLabel: '搜索文章',
        searchPlaceholder: '搜索文章',
        postsAria: '博客文章',
        noMatches: '没有找到匹配的文章。',
        localeLabel: {
            en: '英语',
            id: '印尼语',
            cn: '中文',
            jp: '日语',
        },
        minRead: (minutes: number) => `${minutes} 分钟阅读`,
        minReadByLocale: {
            en: (minutes: number) => `${minutes} 分钟阅读`,
            id: (minutes: number) => `${minutes} 分钟阅读`,
            cn: (minutes: number) => `${minutes} 分钟阅读`,
            jp: (minutes: number) => `${minutes} 分钟阅读`,
        },
        article: {
            by: '作者',
            back: '返回所有文章',
            languageAria: '文章语言',
            minRead: (minutes: number) => `${minutes} 分钟阅读`,
            updated: '已更新',
            engagementAria: '互动操作',
            ogImageAlt: (title: string) => `文章社交预览卡片：${title}`,
        },
    },
    engagement: {
        views: '浏览',
        likes: '喜欢',
        shares: '分享',
        localMetricsNote: '本地 MVP 指标',
        likePost: '喜欢文章',
        like: '喜欢',
        liked: '已喜欢',
        copyLink: '复制链接',
        copyLinkTitle: '复制链接',
        copy: '复制',
        linkCopied: '链接已复制',
        copied: '已复制',
        fallbackPostTitle: '博客文章',
    },
    theme: {
        toggle: '切换主题',
    },
    search: {
        open: '搜索',
        ariaOpen: '打开站内搜索',
        placeholder: '搜索作品集、项目和文章...',
        close: '关闭搜索',
        noResults: '没有找到匹配结果。',
        hint: '搜索作品集全部内容',
        shortcut: 'Ctrl K',
        results: '结果',
        resultTypes: {
            page: '页面',
            project: '项目',
            post: '文章',
        },
    },
    errors: {
        notFound: {
            title: '404 | 页面未找到',
            description: '找不到您要访问的页面。',
            heading: '页面未找到。',
            body: '链接可能已损坏、移动或删除。请选择下面的入口继续浏览。',
        },
        server: {
            title: '500 | 服务器错误',
            description: '服务器遇到意外错误。',
            heading: '意外服务器错误。',
            body: '加载此页面时出现问题。请稍后重试，或返回首页。',
        },
        actions: {
            portfolio: '前往作品集',
            blog: '阅读博客',
        },
    },
};

const jpContent: DeepPartial<SiteContent> = {
    profile: {
        role: 'ソフトウェアエンジニア / 生涯学習者',
        status: '新しい機会を探しています',
        bio: 'SWE | AI Agent Enthusiast | IT Infrastructure Enthusiast。アンダラス大学 情報システム卒業、GPA 3.71。',
    },
    seo: {
        defaultTitle: 'Nabil Rizki Navisa | ソフトウェアエンジニア・情報システム卒業生',
        defaultDescription:
            'Nabil Rizki Navisa のポートフォリオ - アンダラス大学情報システム卒業のソフトウェアエンジニア。GPA 3.71。AI agent、Web、モバイル、IT インフラに注力しています。',
    },
    schema: {
        personDescription:
            'インドネシア在住のソフトウェアエンジニア。アンダラス大学情報システム卒業、GPA 3.71。Web 開発、モバイル開発、AI agent ワークフロー、DevOps、IT インフラに注力しています。',
        degreeName: '情報システム学士',
        credentialCategory: '学士号',
        educationalLevel: '学士',
        graduationDate: '2026年6月',
        gpa: '3.71/4.00',
        worksFor: 'フリーランス / 機会を募集中',
        nationality: 'インドネシア',
    },
    nav: {
        ariaMainSections: 'ページの主要セクション',
        ariaPageNavigation: 'ページナビゲーション',
        ariaLanguageNavigation: '言語選択',
        home: 'ホーム',
        overview: '概要',
        education: '学歴',
        showcase: 'ショーケース',
        repositories: 'リポジトリ',
        experience: '経験',
        latestPosts: '最新記事',
        skills: 'スキル',
        projects: 'プロジェクト',
        blog: 'ブログ',
    },
    home: {
        seoTitle: 'Nabil Rizki Navisa | ソフトウェアエンジニア・情報システム卒業生',
        seoDescription:
            'Nabil Rizki Navisa のポートフォリオ - アンダラス大学情報システム卒業のソフトウェアエンジニア。GPA 3.71。AI agent、Web、モバイル、IT インフラに注力しています。',
        about: {
            heading: '概要',
            headline: 'ソフトウェア、AIエージェント、セルフホストインフラを構築する。',
            body:
                'アンダラス大学情報システム卒業生です。2026年6月に卒業し、GPA は 3.71/4.00 です。ソフトウェアエンジニアリング、AI agent ワークフロー、IT インフラ管理に注力しています。TypeScript、React、Node.js、Kotlin、Python に精通しています。Docker、CI/CD パイプライン、自主管理の Proxmox 仮想化環境を使った本番システムの構築とデプロイ経験があります。堅実なソフトウェアエンジニアリングの基礎、実践的な DevOps スキル、AI 支援開発ワークフロー、そしてスケーラブルなシステム設計への関心を組み合わせています。',
            strongTerms: ['情報システム卒業生', 'GPA は 3.71/4.00', 'TypeScript', 'React', 'Node.js', 'Kotlin', 'Python'],
        },
        education: {
            heading: '学歴',
            subheading: '学業背景',
            degree: '情報システム学士',
            institution: 'アンダラス大学',
            period: '2026年6月卒業',
            gpa: 'GPA 3.71/4.00',
            summary:
                '情報システム学位を修了し、ソフトウェアエンジニアリング、AI 支援ワークフロー、IT インフラ、本番システムのデリバリーに重点を置きました。',
            tags: ['情報システム', 'アンダラス大学', 'GPA 3.71', '2026年6月卒業'],
        },
        repositories: {
            heading: 'プロジェクト',
            subheading: '最近のリポジトリ',
            visibility: '公開',
            viewAll: 'すべてのプロジェクトを見る',
        },
        experiences: {
            heading: '経験',
            subheading: '職務と学業での役割',
            items: [
                {
                    title: 'TKITI ラボアシスタント',
                    period: 'コーディネーター / 2025',
                    bullets: [
                        '実習モジュール設計とカリキュラム整合の議論をリード',
                        'TKITI ラボ発展のための戦略的改善計画を作成',
                        '新しいアシスタント向けの研修とアップグレード資料を提供',
                    ],
                    tags: ['Leadership', 'Curriculum Design', 'Lab Management'],
                    current: false,
                },
                {
                    title: 'Bank Nagari（本社）',
                    period: 'プログラマーインターン / 2025',
                    bullets: [
                        'チームメイトと協力して admin と intern モジュールを構築',
                        '社内プログラマーに Git の基礎を説明',
                        '銀行 IT の実務、社内技術スタック、システム概念を学習',
                    ],
                    tags: ['Express.js', 'React', 'PostgreSQL', 'Git'],
                    current: false,
                },
                {
                    title: '基礎コンピューティング ラボアシスタント',
                    period: 'コーディネーター / 2024 - 2025',
                    bullets: [
                        'サーバー構築を含む IT インフラの基礎概念を学習',
                        '実習環境、教材、技術セットアップを準備',
                    ],
                    tags: ['IT Infrastructure', 'Server Management'],
                    current: false,
                },
                {
                    title: 'Bangkit Academy 2024',
                    period: 'Android Learning Path / 2024',
                    bullets: [
                        'Kotlin と XML によるモダン Android 開発を学習',
                        'capstone プロジェクト Outfyt - スマート OOTD 推薦アプリを構築',
                        '8 人のクロスファンクショナルチーム（ML、Cloud、Mobile）で協業',
                    ],
                    tags: ['Android', 'Kotlin', 'XML'],
                    current: false,
                },
            ],
        },
        contributions: {
            heading: '貢献',
            subheading: 'GitHub の活動',
            chartAlt: 'GitHub コントリビューショングラフ',
            label: 'GitHub の nabilrn',
            totalLabel: (total: number) => `過去1年のコントリビューション ${total} 件`,
            contributionLabel: (count: number, date: string) => `${date} のコントリビューション ${count} 件`,
            less: '少ない',
            more: '多い',
        },
        blog: {
            heading: '最新記事',
            subheading: 'ソフトウェアエンジニアリングのメモ',
            viewAll: 'すべての記事を見る',
        },
        skills: {
            heading: 'スキル',
            subheading: '言語、ツール、インフラ',
            groups: [
                { label: 'プログラミング', primary: ['JavaScript', 'TypeScript', 'Kotlin'], items: ['Dart', 'Python'] },
                { label: 'DEVOPS / インフラ', primary: ['Docker'], items: ['Proxmox', 'Ubuntu', 'GCP', 'Cloudflare'] },
                { label: 'データベース', primary: [], items: ['MySQL', 'PostgreSQL', 'SQLite', 'Redis'] },
                { label: 'ツール', primary: [], items: ['Git', 'VS Code', 'Android Studio', 'Figma', 'JetBrains', 'AI Coding CLI'] },
            ],
        },
        certifications: {
            heading: '認定',
        },
    },
    projectShowcase: {
        heading: 'ショーケース',
        subheading: '厳選した制作物',
        web: 'Web',
        mobile: 'モバイル',
        visitSite: 'サイトを見る',
        github: 'GitHub',
        viewAll: 'すべて見る',
        viewAllProjectShowcase: 'すべてのプロジェクトを見る',
        screenshotAlt: 'スクリーンショット',
        websitePreviewAlt: 'Web サイトプレビュー',
        screenshotDialogClose: '閉じる',
        previousScreenshot: '前のスクリーンショット',
        nextScreenshot: '次のスクリーンショット',
    },
    projectsPage: {
        seoTitle: 'プロジェクト | Nabil Rizki Navisa',
        seoDescription:
            'Nabil Rizki Navisa のプロジェクトショーケースとリポジトリ一覧。Web アプリ、モバイルアプリ、インフラプロジェクト、AI 支援ソフトウェア開発を掲載しています。',
        ogImageAlt: 'GitHub 風のダークスタイルで表示された Nabil Rizki Navisa のプロジェクトショーケースとリポジトリ一覧。',
        eyebrow: 'プロジェクト',
        heading: 'プロジェクトショーケースとリポジトリ一覧。',
        intro: '公開済みの Web 制作、Android 実験、インフラ作業、厳選リポジトリをまとめたカタログです。',
        summary: {
            webBuilds: 'Web 制作',
            mobileApps: 'モバイルアプリ',
            repositories: 'リポジトリ',
            ariaLabel: 'プロジェクト概要',
        },
        sectionNavAria: 'プロジェクトページのセクション',
        nav: {
            featuredBuilds: '注目ビルド',
            repositories: 'リポジトリ',
            stack: 'スタック',
        },
        featuredSubheading: 'Web とモバイルのプロジェクト',
        repositoriesSubheading: '厳選コードインデックス',
        stackSubheading: 'プロジェクトで使用したツール',
        visibility: '公開',
        pageStatus: (current: number, total: number) => `${current} / ${total} ページ`,
        pageStatusTemplate: '{current} / {total} ページ',
        paginationAria: 'リポジトリのページネーション',
        previous: '前へ',
        next: '次へ',
        openGithubRepositories: 'GitHub リポジトリを開く',
        itemListName: '厳選したソフトウェアプロジェクトとリポジトリ',
    },
    blog: {
        articles: '記事',
        portfolio: 'ポートフォリオ',
        navigationAria: 'ブログナビゲーション',
        seoTitle: 'ブログ | Nabil Rizki Navisa',
        seoDescription: 'Nabil Rizki Navisa によるソフトウェアエンジニアリング、プロジェクトの学び、実践的なワークフローのメモ。',
        ogImageAlt: 'GitHub 風のダークスタイルで表示された Nabil Rizki Navisa のブログ記事一覧。',
        eyebrow: 'ブログ',
        heading: '技術メモ、実装からの学び、実践ガイド。',
        intro: '実際のプロジェクトと homelab 実験から得たチュートリアルとエンジニアリングメモをまとめた読書スペースです。',
        languageAria: 'ブログ言語',
        searchLabel: '記事を検索',
        searchPlaceholder: '記事を検索',
        postsAria: 'ブログ記事',
        noMatches: '一致する記事がありません。',
        localeLabel: {
            en: '英語',
            id: 'インドネシア語',
            cn: '中国語',
            jp: '日本語',
        },
        minRead: (minutes: number) => `${minutes} 分で読めます`,
        minReadByLocale: {
            en: (minutes: number) => `${minutes} 分で読めます`,
            id: (minutes: number) => `${minutes} 分で読めます`,
            cn: (minutes: number) => `${minutes} 分で読めます`,
            jp: (minutes: number) => `${minutes} 分で読めます`,
        },
        article: {
            by: '著者',
            back: 'すべての記事に戻る',
            languageAria: '記事の言語',
            minRead: (minutes: number) => `${minutes} 分で読めます`,
            updated: '更新',
            engagementAria: 'エンゲージメント操作',
            ogImageAlt: (title: string) => `記事のソーシャルプレビューカード: ${title}`,
        },
    },
    engagement: {
        views: '表示',
        likes: 'いいね',
        shares: '共有',
        localMetricsNote: 'ローカル MVP メトリクス',
        likePost: '記事にいいね',
        like: 'いいね',
        liked: 'いいね済み',
        copyLink: 'リンクをコピー',
        copyLinkTitle: 'リンクをコピー',
        copy: 'コピー',
        linkCopied: 'リンクをコピーしました',
        copied: 'コピーしました',
        fallbackPostTitle: 'ブログ記事',
    },
    theme: {
        toggle: 'テーマを切り替え',
    },
    search: {
        open: '検索',
        ariaOpen: 'サイト検索を開く',
        placeholder: 'ポートフォリオ、プロジェクト、記事を検索...',
        close: '検索を閉じる',
        noResults: '一致する結果がありません。',
        hint: 'ポートフォリオ全体を検索',
        shortcut: 'Ctrl K',
        results: '結果',
        resultTypes: {
            page: 'ページ',
            project: 'プロジェクト',
            post: '記事',
        },
    },
    errors: {
        notFound: {
            title: '404 | ページが見つかりません',
            description: 'お探しのページは見つかりません。',
            heading: 'ページが見つかりません。',
            body: 'リンクが壊れている、移動された、または削除された可能性があります。下の選択肢から閲覧を続けてください。',
        },
        server: {
            title: '500 | サーバーエラー',
            description: 'サーバーで予期しないエラーが発生しました。',
            heading: '予期しないサーバーエラーです。',
            body: 'このページの読み込み中に問題が発生しました。しばらくしてから再試行するか、ホームページに戻ってください。',
        },
        actions: {
            portfolio: 'ポートフォリオへ',
            blog: 'ブログを読む',
        },
    },
};

export const localizedSiteContent: Record<SiteLocale, SiteContent> = {
    en: siteContent.en,
    id: mergeContent(siteContent.en, idContent),
    cn: mergeContent(siteContent.en, cnContent),
    jp: mergeContent(siteContent.en, jpContent),
};

export const getSiteContent = (locale: SiteLocale = defaultLocale) => localizedSiteContent[normalizeLocale(locale)];
