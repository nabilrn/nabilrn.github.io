/// <reference types="astro/client" />

// Explicit image module declarations to satisfy TS for asset imports
declare module '*.webp' {
	const image: import('astro:assets').ImageMetadata;
	export default image;
}

declare module '*.png' {
	const image: import('astro:assets').ImageMetadata;
	export default image;
}

declare module '*.jpg' {
	const image: import('astro:assets').ImageMetadata;
	export default image;
}

declare module '*.jpeg' {
	const image: import('astro:assets').ImageMetadata;
	export default image;
}

declare module '*.gif' {
	const image: import('astro:assets').ImageMetadata;
	export default image;
}

declare module '*.svg' {
	const image: import('astro:assets').ImageMetadata;
	export default image;
}
