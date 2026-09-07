export const siteUrl = 'https://portfolio.nabilrn.space';
export const authorName = 'Nabil Rizki Navisa';

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

const commonSeo = {
    siteAlternateName: ['nabilrn', 'Nabil Portfolio'],
    keywords:
        'Nabil Rizki Navisa, Nabil Navisa, Nabil Rizki, nabilrn, nabilrizkinavisa, Software Engineer, Information Systems Graduate, Universitas Andalas, AI Agent, Web Developer, Mobile Developer, Backend Developer, DevOps, IT Infrastructure, Proxmox, Docker, Indonesia',
    ogSiteName: authorName,
    themeColor: '#0a0a0a',
};

const enContent = {
    profile: {
        name: authorName,
        avatarAlt: authorName,
    },
    seo: {
        ...commonSeo,
        defaultTitle: 'Nabil Rizki Navisa | Software Engineer & Information Systems Graduate',
        defaultDescription:
            'Portfolio of Nabil Rizki Navisa - Software Engineer and Information Systems graduate from Universitas Andalas with GPA 3.71. Focused on AI agents, web, mobile, and IT infrastructure.',
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
        minRead: (minutes: number) => `${minutes} min read`,
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

export type SiteContent = typeof enContent;

export const getSiteContent = (): SiteContent => enContent;