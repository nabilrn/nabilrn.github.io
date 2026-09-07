export type ActiveSiteLocale = 'en' | 'id';

// A few components still accept historical locale strings from pathname parsing.
// Runtime normalization below collapses every retired value to English; only EN
// and ID are generated, linked, indexed, or stored as content.
export type SiteLocale = ActiveSiteLocale | 'cn' | 'jp' | 'ar';

export const defaultLocale: ActiveSiteLocale = 'en';
export const supportedLocales = ['en', 'id'] as const satisfies readonly ActiveSiteLocale[];
export const localizedLocales = ['id'] as const satisfies readonly ActiveSiteLocale[];
export const siteUrl = 'https://portfolio.nabilrn.space';
export const authorName = 'Nabil Rizki Navisa';

export const localeMeta: Record<
    ActiveSiteLocale,
    { label: string; htmlLang: string; ogLocale: string; pathPrefix: string; dateLocale: string }
> = {
    en: { label: 'English', htmlLang: 'en', ogLocale: 'en_US', pathPrefix: '', dateLocale: 'en-US' },
    id: { label: 'Indonesia', htmlLang: 'id', ogLocale: 'id_ID', pathPrefix: '/id', dateLocale: 'id-ID' },
};

export const normalizeLocale = (locale?: string): ActiveSiteLocale => (locale === 'id' ? 'id' : defaultLocale);

export const stripLocaleFromPath = (path = '/') => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const stripped = normalized.replace(/^\/(id|cn|jp|ar)(?=\/|$)/, '');
    return stripped === '' ? '/' : stripped;
};

export const localizePath = (path: string, locale: SiteLocale = defaultLocale) => {
    const normalizedPath = stripLocaleFromPath(path);
    const normalizedLocale = normalizeLocale(locale);
    if (normalizedLocale === defaultLocale) return normalizedPath;
    return `${localeMeta[normalizedLocale].pathPrefix}${normalizedPath === '/' ? '/' : normalizedPath}`;
};

const commonSchema = {
    alternateName: ['Nabil Navisa', 'Nabil Rizki', 'nabilrn', 'nabilrizkinavisa'],
    email: 'nabilrizkinavisa@gmail.com',
    jobTitle: 'Software Engineer',
    sameAs: [
        'https://github.com/nabilrn',
        'https://www.linkedin.com/in/nabilrizkinavisa2004',
        'https://x.com/NabilrizkiN',
        'https://www.instagram.com/nabilrizkinavisa',
    ],
    alumniName: 'Universitas Andalas',
    alumniAlternateName: 'UNAND',
    gpa: '3.71/4.00',
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
};

const enContent = {
    profile: {
        name: authorName,
        avatarAlt: authorName,
    },
    seo: {
        defaultTitle: 'Nabil Rizki Navisa | Software Engineer & Information Systems Graduate',
        defaultDescription:
            'Portfolio of Nabil Rizki Navisa - Software Engineer and Information Systems graduate from Universitas Andalas with GPA 3.71. Focused on AI agents, web, mobile, and IT infrastructure.',
        siteAlternateName: ['nabilrn', 'Nabil Portfolio'],
    },
    schema: {
        ...commonSchema,
        personDescription:
            'Software Engineer and Information Systems graduate from Universitas Andalas with GPA 3.71. Based in Indonesia and focused on web development, mobile development, AI agent workflows, DevOps, and IT infrastructure.',
        degreeName: 'Bachelor of Information Systems',
        credentialCategory: 'Bachelor degree',
        educationalLevel: 'Undergraduate degree',
        graduationDate: 'June 2026',
        worksFor: 'Freelance / Open for Opportunities',
        nationality: 'Indonesia',
    },
    nav: {
        ariaPageNavigation: 'Page navigation',
        ariaLanguageNavigation: 'Language selection',
        home: 'Home',
        overview: 'Overview',
        projects: 'Projects',
        blog: 'Blog',
    },
    home: {
        seoTitle: 'Nabil Rizki Navisa | Software Engineer & Information Systems Graduate',
        seoDescription:
            'Portfolio of Nabil Rizki Navisa - Software Engineer and Information Systems graduate from Universitas Andalas with GPA 3.71. Focused on AI agents, web, mobile, and IT infrastructure.',
        education: {
            heading: 'Education',
            degree: 'Bachelor of Information Systems',
            institution: 'Universitas Andalas',
            period: 'Graduated June 2026',
            gpa: 'GPA 3.71/4.00',
        },
        experiences: {
            heading: 'Experience',
        },
        contributions: {
            heading: 'Contributions',
            chartAlt: 'GitHub contribution chart',
            totalLabel: (total: number) => `${total} contributions in the last year`,
            contributionLabel: (count: number, date: string) =>
                `${count} ${count === 1 ? 'contribution' : 'contributions'} on ${date}`,
            less: 'Less',
            more: 'More',
        },
    },
    blog: {
        seoTitle: 'Blog | Nabil Rizki Navisa',
        seoDescription: 'Notes on software engineering, project lessons, and practical workflows by Nabil Rizki Navisa.',
        ogImageAlt: 'Nabil Rizki Navisa blog article listing in terminal-inspired dark style.',
        eyebrow: 'Blog',
        heading: 'Technical notes, shipped learnings, and practical guides.',
        intro: 'A focused reading space with tutorials and engineering notes from real projects and homelab experiments.',
        searchLabel: 'Search articles',
        searchPlaceholder: 'Search articles',
        postsAria: 'Blog posts',
        noMatches: 'No matching articles found.',
        localeLabel: {
            en: 'English',
            id: 'Indonesia',
        },
        minRead: (minutes: number) => `${minutes} min read`,
        minReadByLocale: {
            en: (minutes: number) => `${minutes} min read`,
            id: (minutes: number) => `${minutes} menit baca`,
        },
        article: {
            back: 'Back to all articles',
            updated: 'Updated',
            engagementAria: 'Engagement actions',
            ogImageAlt: (title: string) => `Social preview card for article: ${title}`,
        },
    },
    engagement: {
        likePost: 'Like post',
        like: 'Like',
        copyLink: 'Copy link',
        copy: 'Copy',
        linkCopied: 'Link copied',
        copied: 'Copied',
    },
    theme: {
        toggle: 'Toggle theme',
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
        actions: {
            portfolio: 'Go to portfolio',
            blog: 'Read the blog',
        },
    },
};

type SiteContent = typeof enContent;

const idContent: SiteContent = {
    ...enContent,
    profile: {
        ...enContent.profile,
    },
    seo: {
        defaultTitle: 'Nabil Rizki Navisa | Software Engineer & Lulusan Sistem Informasi',
        defaultDescription:
            'Portfolio Nabil Rizki Navisa - Software Engineer dan lulusan Sistem Informasi Universitas Andalas dengan IPK 3.71. Berfokus pada AI agent, web, mobile, dan infrastruktur TI.',
        siteAlternateName: enContent.seo.siteAlternateName,
    },
    schema: {
        ...enContent.schema,
        personDescription:
            'Software Engineer dan lulusan Sistem Informasi Universitas Andalas dengan IPK 3.71. Berbasis di Indonesia dan berfokus pada pengembangan web, mobile, workflow AI agent, DevOps, dan infrastruktur TI.',
        degreeName: 'Sarjana Sistem Informasi',
        credentialCategory: 'Gelar sarjana',
        educationalLevel: 'Sarjana',
        graduationDate: 'Juni 2026',
        worksFor: 'Freelance / Terbuka untuk peluang kerja',
        nationality: 'Indonesia',
    },
    nav: {
        ariaPageNavigation: 'Navigasi halaman',
        ariaLanguageNavigation: 'Pilihan bahasa',
        home: 'Beranda',
        overview: 'Ringkasan',
        projects: 'Proyek',
        blog: 'Blog',
    },
    home: {
        seoTitle: 'Nabil Rizki Navisa | Software Engineer & Lulusan Sistem Informasi',
        seoDescription:
            'Portfolio Nabil Rizki Navisa - Software Engineer dan lulusan Sistem Informasi Universitas Andalas dengan IPK 3.71. Berfokus pada AI agent, web, mobile, dan infrastruktur TI.',
        education: {
            heading: 'Pendidikan',
            degree: 'Sarjana Sistem Informasi',
            institution: 'Universitas Andalas',
            period: 'Lulus Juni 2026',
            gpa: 'IPK 3.71/4.00',
        },
        experiences: {
            heading: 'Pengalaman',
        },
        contributions: {
            heading: 'Kontribusi',
            chartAlt: 'Grafik kontribusi GitHub',
            totalLabel: (total: number) => `${total} kontribusi dalam setahun terakhir`,
            contributionLabel: (count: number, date: string) => `${count} kontribusi pada ${date}`,
            less: 'Lebih sedikit',
            more: 'Lebih banyak',
        },
    },
    blog: {
        seoTitle: 'Blog | Nabil Rizki Navisa',
        seoDescription: 'Catatan tentang software engineering, pembelajaran proyek, dan workflow praktis oleh Nabil Rizki Navisa.',
        ogImageAlt: 'Daftar artikel blog Nabil Rizki Navisa dalam gaya gelap terminal.',
        eyebrow: 'Blog',
        heading: 'Catatan teknis, pelajaran dari proyek, dan panduan praktis.',
        intro: 'Ruang baca ringkas berisi tutorial dan catatan engineering dari proyek nyata dan eksperimen homelab.',
        searchLabel: 'Cari artikel',
        searchPlaceholder: 'Cari artikel',
        postsAria: 'Posting blog',
        noMatches: 'Tidak ada artikel yang cocok.',
        localeLabel: {
            en: 'Inggris',
            id: 'Indonesia',
        },
        minRead: (minutes: number) => `${minutes} menit baca`,
        minReadByLocale: {
            en: (minutes: number) => `${minutes} min read`,
            id: (minutes: number) => `${minutes} menit baca`,
        },
        article: {
            back: 'Kembali ke semua artikel',
            updated: 'Diperbarui',
            engagementAria: 'Aksi engagement',
            ogImageAlt: (title: string) => `Kartu pratinjau sosial untuk artikel: ${title}`,
        },
    },
    engagement: {
        likePost: 'Sukai posting',
        like: 'Suka',
        copyLink: 'Salin tautan',
        copy: 'Salin',
        linkCopied: 'Tautan disalin',
        copied: 'Disalin',
    },
    theme: {
        toggle: 'Ganti tema',
    },
    errors: {
        notFound: {
            title: '404 | Halaman Tidak Ditemukan',
            description: 'Halaman yang Anda cari tidak dapat ditemukan.',
            ogImageAlt: 'Halaman 404 untuk portfolio.nabilrn.space.',
            code: '404',
            heading: 'Halaman tidak ditemukan.',
            body: 'Tautan mungkin rusak, dipindahkan, atau dihapus. Gunakan salah satu opsi di bawah untuk melanjutkan.',
        },
        actions: {
            portfolio: 'Ke portfolio',
            blog: 'Baca blog',
        },
    },
};

const localizedSiteContent: Record<ActiveSiteLocale, SiteContent> = {
    en: enContent,
    id: idContent,
};

export const getSiteContent = (locale: SiteLocale = defaultLocale): SiteContent =>
    localizedSiteContent[normalizeLocale(locale)];
