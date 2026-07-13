import type { ImageMetadata } from "astro";
import tkitiImg from "../assets/tkiti.webp";
import pondokpermaiImg from "../assets/pondokpermai.webp";
import neocentralImg from "../assets/neocentral.webp";
import ezagentImg from "../assets/ez_agent.webp";
import foodexplorer1Img from "../assets/foodexplorer1.webp";
import foodexplorer2Img from "../assets/foodexplorer2.webp";
import foodexplorer3Img from "../assets/foodexplorer3.webp";
import foodexplorer4Img from "../assets/foodexplorer4.webp";
import ghibligallery1Img from "../assets/ghibligallery1.webp";
import ghibligallery2Img from "../assets/ghibligallery2.webp";
import sspImg from "../assets/ssp.webp";
import porschegalleryImg from "../assets/porschegallery.webp";
import networkRookieImg from "../assets/network-rookie.webp";
import ftiImg from "../assets/fti.webp";
import unandLibDashboardImg from "../assets/unandlibdashboard.webp";
import mypaasImg from "../assets/mypaas.webp";
import neocentral1Img from "../assets/neocentral1.webp";
import neocentral2Img from "../assets/neocentral2.webp";
import neocentral3Img from "../assets/neocentral3.webp";
import neocentral4Img from "../assets/neocentral4.webp";
import neocentral5Img from "../assets/neocentral5.webp";
import neocentral6Img from "../assets/neocentral6.webp";
import type { SiteLocale } from "./siteContent";

export interface WebProject {
  name: string;
  desc: string;
  liveUrl: string;
  repoUrl?: string;
  stack: string[];
  screenshot: ImageMetadata;
}

export interface MobileProject {
  name: string;
  desc: string;
  platform: string;
  repoUrl?: string;
  stack: string[];
  screenshots?: ImageMetadata[];
}

export interface RepoProject {
  name: string;
  desc: string;
  lang: string;
  url: string;
  stars?: number;
  tags: string[];
}

interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  html_url: string;
  stargazers_count: number;
  topics?: string[];
  pushed_at?: string;
}

export const langColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Kotlin: "#7F52FF",
  Dart: "#0553b1",
  Python: "#3572A5",
  Go: "#00ADD8",
  React: "#61dafb",
};

export const webProjects: WebProject[] = [
  {
    name: "myPaaS",
    desc: "Self-hosted platform as a service for single virtual machine.",
    liveUrl: "#",
    stack: ["Go", "Svelte", "Caddy", "PostgreSQL"],
    screenshot: mypaasImg,
  },
  {
    name: "FTI Universitas Andalas",
    desc: "Rebranding and rebuild of the Faculty of Information Technology Universitas Andalas profile website with a cleaner institutional information architecture.",
    liveUrl: "https://fti.unand.online",
    stack: ["Astro", "TypeScript"],
    screenshot: ftiImg,
  },
  {
    name: "UNAND Library Public Dashboard",
    desc: "Fullscreen information dashboard for Universitas Andalas Library, built as a frontend-only app for landscape displays. It presents library services, visitor counts, facilities, agendas, visit statistics, borrowing activity, leaderboards, and collection summaries from local data without an API or backend.",
    liveUrl: "https://lib-unand-dashboard.nabilrn.space",
    repoUrl: "https://github.com/nabilrn/lib-unand-dashboard/",
    stack: ["React", "Vite", "Localization", "TypeScript"],
    screenshot: unandLibDashboardImg,
  },
  {
    name: "Network Rookie",
    desc: "An AI-powered interactive visualization of the global internet infrastructure.",
    liveUrl: "https://network-rookie.nabilrn.space",
    repoUrl: "https://github.com/nabilrn/network-rookie.git",
    stack: ["React", "Vite", "Globe.GL", "Three.js"],
    screenshot: networkRookieImg,
  },
  {
    name: "Ez-Agent Landing Page",
    desc: "Landing page for EZ Agents, a multi-agent AI orchestration system for building software with coordinated intelligent agents.",
    liveUrl: "https://ez-agent.nabilrn.space",
    repoUrl: "https://github.com/nabilrn/ez-agent-landingpage.git",
    stack: ["Astro", "Three.js"],
    screenshot: ezagentImg,
  },
  {
    name: "Neocentral",
    desc: "Full-stack platform with a self-hosted deployment pipeline, containerized backend services, and a React frontend.",
    liveUrl: "https://neocentral.dev",
    stack: ["React", "Vite", "Express", "MySQL", "Redis", "Docker"],
    screenshot: neocentralImg,
  },
  {
    name: "Lab TKITI",
    desc: "Landing page and content system for Lab TKITI, with a bilingual article system.",
    liveUrl: "https://tkiti.tech",
    repoUrl:
      "https://github.com/kk-infrastruktur-dan-tata-kelola-dsi/tkiti.github.io",
    stack: ["React", "Vite", "Hono", "SQLite"],
    screenshot: tkitiImg,
  },
  {
    name: "Bank Sampah Pondok Permai",
    desc: "Landing page for a community waste bank NGO in Padang, with a grounded nature-driven aesthetic.",
    liveUrl: "https://permai-eco-landing.nabilrn.space",
    repoUrl: "https://github.com/nabilrn/permai-eco-landing",
    stack: ["React", "Vite"],
    screenshot: pondokpermaiImg,
  },
  {
    name: "Porsche Gallery",
    desc: "Elegant, interactive single-page showcase of the Porsche 911 legacy and models.",
    liveUrl: "https://porsche-gallery.nabilrn.space",
    repoUrl: "https://github.com/nabilrn/porsche-gallery.git",
    stack: ["HTML", "CSS", "JavaScript"],
    screenshot: porschegalleryImg,
  },
  {
    name: "Sumbar Smart Portal",
    desc: "AI-powered government portal prototype built in 24 hours during the 2025 Firetech Event by Neotelemetri.",
    liveUrl: "https://sumbar-smart-portal.vercel.app/",
    repoUrl:
      "https://github.com/kk-infrastruktur-dan-tata-kelola-dsi/sumbar-smart-portal.git",
    stack: ["Next.js", "Google AI Studio", "Vercel"],
    screenshot: sspImg,
  },
];

export const mobileProjects: MobileProject[] = [
  {
    name: "Neocentral Mobile",
    desc: "Cross-platform thesis guidance app for students and lecturers at DSI Unand.",
    platform: "iOS / Android · Flutter",
    stack: ["Flutter", "Shared UI", "FCM", "Microsoft Auth"],
    screenshots: [
      neocentral1Img,
      neocentral2Img,
      neocentral3Img,
      neocentral4Img,
      neocentral5Img,
      neocentral6Img,
    ],
  },
  {
    name: "Food Explorer",
    desc: "Browse and discover meals by category using TheMealDB public API.",
    platform: "Android · Jetpack Compose",
    repoUrl: "https://github.com/nabilrn/food-explorer",
    stack: ["Kotlin", "Jetpack Compose", "TheMealDB API"],
    screenshots: [
      foodexplorer1Img,
      foodexplorer2Img,
      foodexplorer3Img,
      foodexplorer4Img,
    ],
  },
  {
    name: "Ghibli Gallery",
    desc: "Gallery app showcasing Studio Ghibli films built from static object data.",
    platform: "Android · Jetpack Compose",
    repoUrl: "https://github.com/nabilrn/ghibli-gallery",
    stack: ["Kotlin", "Jetpack Compose"],
    screenshots: [ghibligallery1Img, ghibligallery2Img],
  },
];

type LocalizedDescriptions = Record<
  string,
  Partial<Record<SiteLocale, string>>
>;

const webProjectDescriptions: LocalizedDescriptions = {
  myPaaS: {
    id: "Platform as a service (PaaS) self-hosted untuk single virtual machine.",
    cn: "面向单虚拟机的自托管平台即服务 (PaaS)。",
    jp: "シングル仮想マシン向けのセルフホスト型 Platform as a Service (PaaS)。",
  },
  "FTI Universitas Andalas": {
    id: "Rebranding dan pembangunan ulang website profil Fakultas Teknologi Informasi Universitas Andalas dengan arsitektur informasi institusional yang lebih bersih.",
    cn: "Universitas Andalas 信息技术学院官网的品牌重塑与重建，采用更清晰的机构信息架构。",
    jp: "Universitas Andalas 情報技術学部プロフィールサイトのリブランディングと再構築。より整理された機関向け情報設計を採用しています。",
  },
  "UNAND Library Public Dashboard": {
    id: "Dashboard informasi fullscreen untuk Perpustakaan Universitas Andalas, dibuat sebagai aplikasi frontend-only untuk layar landscape. Dashboard menampilkan layanan perpustakaan, jumlah pengunjung, fasilitas, agenda, statistik kunjungan, peminjaman, leaderboard, dan ikhtisar koleksi memakai data lokal tanpa API/backend.",
    cn: "Universitas Andalas 图书馆的全屏信息仪表板，作为面向横向屏幕的纯前端应用构建。使用本地数据展示图书馆服务、访客数量、设施、日程、访问统计、借阅情况、排行榜和馆藏概览，无需 API 或后端。",
    jp: "Universitas Andalas 図書館向けのフルスクリーン情報ダッシュボード。横向きディスプレイ用のフロントエンドのみのアプリとして構築し、API やバックエンドなしでローカルデータから図書館サービス、来館者数、施設、予定、来館統計、貸出状況、ランキング、蔵書概要を表示します。",
  },
  "Network Rookie": {
    id: "Visualisasi interaktif berbasis AI untuk memahami infrastruktur internet global secara lebih intuitif.",
    cn: "由 AI 驱动的全球互联网基础设施交互式可视化项目。",
    jp: "AI を活用した、世界のインターネットインフラを直感的に理解するためのインタラクティブ可視化。",
  },
  "Ez-Agent Landing Page": {
    id: "Landing page untuk EZ Agents, sistem orkestrasi multi-agent AI untuk membangun software bersama agen cerdas yang terkoordinasi.",
    cn: "EZ Agents 的落地页，一个用于通过协同智能代理构建软件的多代理 AI 编排系统。",
    jp: "EZ Agents のランディングページ。協調する知的エージェントでソフトウェアを構築するマルチエージェント AI オーケストレーションシステムです。",
  },
  Neocentral: {
    id: "Platform full-stack dengan pipeline deployment mandiri, layanan backend berbasis container, dan frontend React.",
    cn: "全栈平台，包含自托管部署流水线、容器化后端服务和 React 前端。",
    jp: "セルフホスト型のデプロイパイプライン、コンテナ化されたバックエンドサービス、React フロントエンドを備えたフルスタックプラットフォーム。",
  },
  "Lab TKITI": {
    id: "Landing page dan sistem konten untuk Lab TKITI, termasuk sistem artikel bilingual.",
    cn: "Lab TKITI 的落地页与内容系统，包含双语文章功能。",
    jp: "Lab TKITI 向けのランディングページとコンテンツシステム。バイリンガル記事機能を備えています。",
  },
  "Bank Sampah Pondok Permai": {
    id: "Landing page untuk NGO bank sampah komunitas di Padang dengan estetika alami yang membumi.",
    cn: "为 Padang 社区垃圾银行 NGO 制作的落地页，采用自然且贴近本地的视觉风格。",
    jp: "Padang のコミュニティ廃棄物銀行 NGO 向けランディングページ。自然で地域に根ざしたビジュアルです。",
  },
  "Porsche Gallery": {
    id: "Showcase single-page yang elegan dan interaktif untuk sejarah serta model Porsche 911.",
    cn: "优雅的交互式单页展示，呈现 Porsche 911 的传承与车型。",
    jp: "Porsche 911 の歴史とモデルを紹介する、エレガントでインタラクティブなシングルページショーケース。",
  },
  "Sumbar Smart Portal": {
    id: "Prototipe portal pemerintahan berbasis AI yang dibangun dalam 24 jam pada Firetech Event 2025 oleh Neotelemetri.",
    cn: "在 Neotelemetri 2025 Firetech Event 中 24 小时内构建的 AI 政府门户原型。",
    jp: "Neotelemetri の 2025 Firetech Event で 24 時間以内に構築した AI 搭載の行政ポータルプロトタイプ。",
  },
};

const mobileProjectDescriptions: LocalizedDescriptions = {
  "Neocentral Mobile": {
    id: "Aplikasi bimbingan tugas akhir untuk mahasiswa dan dosen di DSI Unand.",
    cn: "面向 DSI Unand 学生与教师的跨平台毕业论文指导应用。",
    jp: "DSI Unand の学生と教員向けクロスプラットフォーム卒業研究指導アプリ。",
  },
  "Food Explorer": {
    id: "Menjelajahi dan menemukan menu makanan berdasarkan kategori menggunakan TheMealDB public API.",
    cn: "使用 TheMealDB 公共 API 按分类浏览和发现餐食。",
    jp: "TheMealDB 公開 API を使って、カテゴリ別に料理を閲覧・発見できるアプリ。",
  },
  "Ghibli Gallery": {
    id: "Aplikasi galeri film Studio Ghibli yang dibangun dari data objek statis.",
    cn: "基于静态对象数据构建的 Studio Ghibli 电影图库应用。",
    jp: "静的オブジェクトデータから構築した Studio Ghibli 映画ギャラリーアプリ。",
  },
};

const repositoryDescriptions: LocalizedDescriptions = {
  Momentum: {
    id: "Aplikasi pelacak kebiasaan lintas platform dengan sinkronisasi real-time dan notifikasi.",
    cn: "跨平台习惯追踪应用，支持实时同步和通知。",
    jp: "リアルタイム同期と通知に対応したクロスプラットフォーム習慣トラッキングアプリ。",
  },
  "express-api-starter": {
    id: "Boilerplate untuk membangun REST API dengan Express.js dan TypeScript.",
    cn: "用于使用 Express.js 和 TypeScript 构建 REST API 的样板项目。",
    jp: "Express.js と TypeScript で REST API を構築するためのボイラープレート。",
  },
  "moviecatalog-kmp": {
    id: "Aplikasi katalog film lintas platform yang dibangun dengan Kotlin Multiplatform.",
    cn: "使用 Kotlin Multiplatform 构建的跨平台电影目录应用。",
    jp: "Kotlin Multiplatform で構築したクロスプラットフォーム映画カタログアプリ。",
  },
  "Airbnb-BI": {
    id: "Dashboard BI untuk insight harga menggunakan dataset Kaggle dan rekomendasi ML.",
    cn: "使用 Kaggle 数据集和机器学习推荐生成价格洞察的 BI 仪表板。",
    jp: "Kaggle データセットと ML レコメンドを使った価格分析用 BI ダッシュボード。",
  },
  "android-firebase-starter": {
    id: "Template awal Android dengan integrasi Firebase.",
    cn: "集成 Firebase 的 Android starter 模板。",
    jp: "Firebase 連携を備えた Android スターターテンプレート。",
  },
  Outfyt: {
    id: "Bangkit Capstone - aplikasi rekomendasi OOTD pintar berbasis analisis warna kulit.",
    cn: "Bangkit Capstone 项目，基于肤色分析的智能 OOTD 推荐应用。",
    jp: "Bangkit Capstone。肌色分析に基づくスマート OOTD レコメンドアプリ。",
  },
  "tkiti.github.io": {
    id: "Website Lab TKITI dengan landing page, dokumentasi, dan sistem artikel bilingual.",
    cn: "Lab TKITI 网站，包含落地页、文档和双语文章系统。",
    jp: "ランディングページ、ドキュメント、バイリンガル記事システムを備えた Lab TKITI の Web サイト。",
  },
  "lib-unand-dashboard": {
    id: "Dashboard informasi fullscreen untuk Perpustakaan Universitas Andalas dengan data lokal tanpa API/backend.",
    cn: "Universitas Andalas 图书馆的全屏信息仪表板，使用本地数据且无需 API 或后端。",
    jp: "Universitas Andalas 図書館向けのフルスクリーン情報ダッシュボード。API やバックエンドなしでローカルデータを使用します。",
  },
  "Neo-Central-Mobile": {
    id: "Aplikasi mobile Neo Central untuk pengalaman pengguna lintas fitur pada ekosistem Neocentral.",
    cn: "Neo Central 移动应用，用于 Neocentral 生态系统中的多功能用户体验。",
    jp: "Neocentral エコシステム向けに複数機能の利用体験を提供する Neo Central モバイルアプリ。",
  },
  website: {
    id: "Frontend website Neo Central untuk menghadirkan pengalaman produk dan alur pengguna utama.",
    cn: "Neo Central 网站前端，用于呈现产品体验和核心用户流程。",
    jp: "プロダクト体験と主要ユーザーフローを提供する Neo Central の Web フロントエンド。",
  },
  services: {
    id: "Layanan backend Neo Central untuk API, proses bisnis, dan integrasi sistem.",
    cn: "Neo Central 后端服务，负责 API、业务流程和系统集成。",
    jp: "API、業務ロジック、システム連携を担う Neo Central のバックエンドサービス。",
  },
};

const localizeDescription = (
  descriptions: LocalizedDescriptions,
  name: string,
  desc: string,
  locale: SiteLocale,
) => descriptions[name]?.[locale] ?? desc;

export const getLocalizedWebProjects = (
  locale: SiteLocale = "en",
): WebProject[] =>
  webProjects.map((project) => ({
    ...project,
    desc: localizeDescription(
      webProjectDescriptions,
      project.name,
      project.desc,
      locale,
    ),
  }));

export const getLocalizedMobileProjects = (
  locale: SiteLocale = "en",
): MobileProject[] =>
  mobileProjects.map((project) => ({
    ...project,
    desc: localizeDescription(
      mobileProjectDescriptions,
      project.name,
      project.desc,
      locale,
    ),
  }));

const localizeRepositoryProject = (
  project: RepoProject,
  locale: SiteLocale,
): RepoProject => ({
  ...project,
  desc: localizeDescription(
    repositoryDescriptions,
    project.name,
    project.desc,
    locale,
  ),
});

const GITHUB_USERNAME = "nabilrn";

const ORG_REPOS = [
  { owner: "kk-infrastruktur-dan-tata-kelola-dsi", name: "tkiti.github.io" },
  { owner: "NeoCentralSI", name: "Neo-Central-Mobile" },
  { owner: "NeoCentralSI", name: "website" },
  { owner: "NeoCentralSI", name: "services" },
];

const FALLBACK_PROJECTS: RepoProject[] = [
  {
    name: "Momentum",
    desc: "Cross-platform habit-tracking app with real-time sync and notifications.",
    lang: "Dart",
    url: "https://github.com/nabilrn/Momentum",
    tags: ["Flutter", "Supabase"],
  },
  {
    name: "express-api-starter",
    desc: "Boilerplate for building REST APIs with Express.js and TypeScript.",
    lang: "TypeScript",
    url: "https://github.com/nabilrn/express-api-starter",
    stars: 4,
    tags: ["Express"],
  },
  {
    name: "moviecatalog-kmp",
    desc: "Cross-platform movie catalog app built with Kotlin Multiplatform.",
    lang: "Kotlin",
    url: "https://github.com/nabilrn/moviecatalog-kmp",
    tags: ["KMP"],
  },
  {
    name: "Airbnb-BI",
    desc: "BI dashboard for pricing insights using Kaggle datasets and ML recommendations.",
    lang: "TypeScript",
    url: "https://github.com/nabilrn/Airbnb-BI",
    tags: ["Next.js"],
  },
  {
    name: "android-firebase-starter",
    desc: "Android starter template with Firebase integration.",
    lang: "Kotlin",
    url: "https://github.com/nabilrn/android-firebase-starter",
    stars: 2,
    tags: ["Firebase"],
  },
  {
    name: "Outfyt",
    desc: "Bangkit Capstone - Smart OOTD Recommendation App based on skin tone analysis.",
    lang: "Kotlin",
    url: "https://github.com/nabilrn/Outfyt",
    tags: ["TensorFlow"],
  },
];

interface RepositoryOptions {
  includeOrg?: boolean;
  limit?: number;
  preferFeatured?: boolean;
  recentOnly?: boolean;
}

const isFulfilled = <T>(
  result: PromiseSettledResult<T>,
): result is PromiseFulfilledResult<T> => result.status === "fulfilled";

const mapRepoProject = (repo: GitHubRepo): RepoProject => ({
  name: repo.name,
  desc: repo.description || "",
  lang: repo.language || "Unknown",
  url: repo.html_url,
  stars: repo.stargazers_count,
  tags: repo.topics?.slice(0, 2) || [],
});

async function fetchPersonalRepos(
  options: RepositoryOptions,
): Promise<RepoProject[]> {
  const token = import.meta.env.GITHUB_TOKEN as string | undefined;
  const featuredRepos = (
    (import.meta.env.FEATURED_REPOS as string | undefined) || ""
  )
    .split(",")
    .map((repoName) => repoName.trim())
    .filter(Boolean);

  if (options.preferFeatured !== false && featuredRepos.length > 0) {
    try {
      const results = await Promise.allSettled(
        featuredRepos.map(async (repoName) => {
          const res = await fetch(
            `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}`,
            {
              headers: token ? { Authorization: `token ${token}` } : {},
            },
          );
          if (!res.ok) throw new Error(`Failed to fetch ${repoName}`);
          return mapRepoProject((await res.json()) as GitHubRepo);
        }),
      );
      const successful = results
        .filter(isFulfilled)
        .map((result) => result.value);
      if (successful.length > 0) return successful;
    } catch {
      // Fall through to token-backed or fallback data.
    }
  }

  if (token) {
    try {
      const res = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=100&direction=desc&type=owner`,
        { headers: { Authorization: `token ${token}` } },
      );
      if (res.ok) {
        const repos = (await res.json()) as GitHubRepo[];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const filteredRepos = options.recentOnly
          ? repos.filter(
              (repo) =>
                repo.pushed_at && new Date(repo.pushed_at) >= sevenDaysAgo,
            )
          : repos;

        const mappedRepos = filteredRepos.map(mapRepoProject);
        if (mappedRepos.length > 0) return mappedRepos;
      }
    } catch {
      // Fall through to hardcoded curated list.
    }
  }

  return FALLBACK_PROJECTS;
}

async function fetchOrgRepos(): Promise<RepoProject[]> {
  try {
    const results = await Promise.allSettled(
      ORG_REPOS.map(async ({ owner, name }) => {
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${name}`,
        );
        if (!res.ok) throw new Error(`Failed to fetch ${name}`);
        return mapRepoProject((await res.json()) as GitHubRepo);
      }),
    );
    return results.filter(isFulfilled).map((result) => result.value);
  } catch {
    return [];
  }
}

export async function getRepositoryProjects(
  options: RepositoryOptions = {},
  locale: SiteLocale = "en",
): Promise<RepoProject[]> {
  const personalRepos = await fetchPersonalRepos(options);
  const orgReposList =
    options.includeOrg === false ? [] : await fetchOrgRepos();
  const projects = [...personalRepos, ...orgReposList].map((project) =>
    localizeRepositoryProject(project, locale),
  );

  return typeof options.limit === "number"
    ? projects.slice(0, options.limit)
    : projects;
}

export const getProjectSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
