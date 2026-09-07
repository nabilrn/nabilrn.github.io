import type { ImageMetadata } from "astro";
import tkitiImg from "../assets/tkiti.webp";
import pondokpermaiImg from "../assets/pondokpermai.webp";
import neocentralImg from "../assets/neocentral.webp";
import ezagentImg from "../assets/ez_agent.webp";
import sspImg from "../assets/ssp.webp";
import porschegalleryImg from "../assets/porschegallery.webp";
import networkRookieImg from "../assets/network-rookie.webp";
import ftiImg from "../assets/fti.webp";
import unandLibDashboardImg from "../assets/unandlibdashboard.webp";
import mypaasImg from "../assets/mypaas.webp";

export interface WebProject {
  name: string;
  desc: string;
  liveUrl: string;
  repoUrl?: string;
  stack: string[];
  screenshot: ImageMetadata;
}

export const webProjects: WebProject[] = [
  {
    name: "myPaaS",
    desc: "Self-hosted platform as a service for single virtual machine.",
    liveUrl: "https://mypaas.my.id",
    repoUrl: "https://github.com/nabilrn/MyPaas",
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
    repoUrl: "https://github.com/kk-infrastruktur-dan-tata-kelola-dsi/tkiti.github.io",
    stack: ["React", "Vite", "Hono", "SQLite"],
    screenshot: tkitiImg,
  },
  {
    name: "Bank Sampah Pondok Permai",
    desc: "Landing page for a community waste bank NGO in Padang, with a grounded nature-driven aesthetic.",
    liveUrl: "https://pondokpermai.vercel.app/",
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
    liveUrl: "https://sumbar-smart-portal.nabilrn.space",
    repoUrl: "https://github.com/kk-infrastruktur-dan-tata-kelola-dsi/sumbar-smart-portal.git",
    stack: ["Next.js", "Google AI Studio", "Vercel"],
    screenshot: sspImg,
  },
];
