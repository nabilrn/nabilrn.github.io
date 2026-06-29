import { getCollection } from 'astro:content';
import { getLocalizedMobileProjects, getLocalizedWebProjects, getRepositoryProjects } from '../data/projects';
import {
	authorName,
	getSiteContent,
	localizePath,
	supportedLocales,
	type SiteLocale,
} from '../data/siteContent';
import { getBlogLocaleInfo } from '../utils/blogLocale';

interface SearchItem {
	id: string;
	type: 'page' | 'project' | 'post';
	locale: SiteLocale;
	title: string;
	description: string;
	content: string;
	url: string;
	tags?: string[];
}

const stripMarkdown = (value: string) =>
	value
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/\[\^[^\]]+]/g, ' ')
		.replace(/[#>*_`~|-]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

const pageItem = (
	locale: SiteLocale,
	id: string,
	title: string,
	description: string,
	content: string,
	path: string,
): SearchItem => ({
	id: `${locale}:page:${id}`,
	type: 'page',
	locale,
	title,
	description,
	content: stripMarkdown(content),
	url: localizePath(path, locale),
});

export async function GET() {
	const posts = await getCollection('blog', ({ data }) => !data.draft);
	const items: SearchItem[] = [];

	for (const locale of supportedLocales) {
		const site = getSiteContent(locale);
		const home = site.home;

		items.push(
			pageItem(locale, 'home', authorName, home.seoDescription, `${home.about.body} ${site.profile.bio}`, '/'),
			pageItem(
				locale,
				'education',
				home.education.heading,
				home.education.summary,
				`${home.education.degree} ${home.education.institution} ${home.education.period} ${home.education.gpa} ${home.education.tags.join(' ')}`,
				'/#education',
			),
			pageItem(
				locale,
				'experience',
				home.experiences.heading,
				home.experiences.subheading,
				home.experiences.items
					.map((item) => `${item.title} ${item.period} ${item.bullets.join(' ')} ${item.tags.join(' ')}`)
					.join(' '),
				'/#experiences',
			),
			pageItem(
				locale,
				'skills',
				home.skills.heading,
				home.skills.subheading,
				home.skills.groups
					.map((group) => `${group.label} ${group.primary.join(' ')} ${group.items.join(' ')}`)
					.join(' '),
				'/#skills',
			),
			pageItem(
				locale,
				'projects',
				site.projectsPage.seoTitle,
				site.projectsPage.seoDescription,
				`${site.projectsPage.intro} ${site.projectShowcase.heading} ${site.projectShowcase.subheading}`,
				'/projects/',
			),
			pageItem(locale, 'blog', site.blog.seoTitle, site.blog.seoDescription, site.blog.intro, '/blog/'),
		);

		for (const project of getLocalizedWebProjects(locale)) {
			items.push({
				id: `${locale}:project:web:${project.name}`,
				type: 'project',
				locale,
				title: project.name,
				description: project.desc,
				content: stripMarkdown(`${project.desc} ${project.stack.join(' ')} ${project.liveUrl} ${project.repoUrl ?? ''}`),
				url: localizePath('/projects/#showcase', locale),
				tags: project.stack,
			});
		}

		for (const project of getLocalizedMobileProjects(locale)) {
			items.push({
				id: `${locale}:project:mobile:${project.name}`,
				type: 'project',
				locale,
				title: project.name,
				description: project.desc,
				content: stripMarkdown(`${project.desc} ${project.platform} ${project.stack.join(' ')} ${project.repoUrl ?? ''}`),
				url: localizePath('/projects/#showcase', locale),
				tags: project.stack,
			});
		}

		const repositories = await getRepositoryProjects({ includeOrg: true, limit: 24 }, locale);
		for (const project of repositories) {
			items.push({
				id: `${locale}:project:repo:${project.name}`,
				type: 'project',
				locale,
				title: project.name,
				description: project.desc,
				content: stripMarkdown(`${project.desc} ${project.lang} ${project.tags.join(' ')} ${project.url}`),
				url: localizePath('/projects/#repositories', locale),
				tags: [project.lang, ...project.tags].filter(Boolean),
			});
		}
	}

	for (const post of posts) {
		const info = getBlogLocaleInfo(post);
		const locale = info.locale;
		items.push({
			id: `${locale}:post:${post.slug}`,
			type: 'post',
			locale,
			title: post.data.title,
			description: post.data.description,
			content: stripMarkdown(`${post.data.title} ${post.data.description} ${post.data.tags.join(' ')} ${post.body}`),
			url: localizePath(`/blog/${post.slug}/`, locale),
			tags: post.data.tags,
		});
	}

	return new Response(JSON.stringify({ items }), {
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	});
}
