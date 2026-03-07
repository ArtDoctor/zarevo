import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/private';
import { getSubdomain } from '$lib/subdomain';
import type { Handle } from '@sveltejs/kit';

interface SmokeContent {
	html?: string;
	css?: string;
	js?: string;
}

function getContent(record: Record<string, unknown>): SmokeContent {
	const pick = (o: Record<string, unknown>) => ({
		html: String(o.html ?? o.HTML ?? o.content_html ?? ''),
		css: String(o.css ?? o.CSS ?? o.content_css ?? ''),
		js: String(o.js ?? o.JS ?? o.content_js ?? '')
	});
	if (
		'html' in record ||
		'css' in record ||
		'js' in record ||
		'HTML' in record ||
		'CSS' in record ||
		'JS' in record
	) {
		return pick(record);
	}
	const raw = record.content;
	if (typeof raw === 'string') {
		try {
			const parsed = JSON.parse(raw) as Record<string, unknown>;
			return pick(parsed);
		} catch {
			return { html: raw, css: '', js: '' };
		}
	}
	if (typeof raw === 'object' && raw !== null) {
		return pick(raw as Record<string, unknown>);
	}
	return {};
}

function buildSmokeHtml(content: SmokeContent): string {
	let html = content.html ?? '';
	const css = content.css ?? '';
	const js = content.js ?? '';

	// Remove external stylesheet links and replace with inline CSS
	html = html.replace(/<link[^>]*rel=["']stylesheet["'][^>]*\/?>/gi, () =>
		css ? `<style>${css}</style>` : ''
	);
	// Remove external script tags and replace with inline JS
	html = html.replace(/<script[^>]*src=["'][^"']*["'][^>]*>[\s\S]*?<\/script>/gi, () =>
		js ? `<script>${js.replace(/<\/script>/gi, '<\\/script>')}</script>` : ''
	);

	// If html is not a full document, wrap it
	if (!/^\s*<!DOCTYPE/i.test(html) && !/^\s*<html/i.test(html)) {
		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<style>${css}</style>
</head>
<body>
${html}
	<script>${js.replace(/<\/script>/gi, '<\\/script>')}</script>
</body>
</html>`;
	}

	return html;
}

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.pb = new PocketBase(env.PB_URL || 'http://127.0.0.1:8090');
	event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	const subdomain = getSubdomain(event.url.hostname);
	if (subdomain) {
		try {
			const escaped = subdomain.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
			const record = await event.locals.pb
				.collection('smokes')
				.getFirstListItem<Record<string, unknown> & { id: string; visits?: number }>(`domain = "${escaped}"`);
			const visits = (record.visits ?? 0) + 1;
			try {
				await event.locals.pb.collection('smokes').update(record.id, { visits });
			} catch {
				// still serve the page if update fails
			}
			const content = getContent(record);
			const html = buildSmokeHtml(content);
			return new Response(html, {
				headers: { 'Content-Type': 'text/html; charset=utf-8' }
			});
		} catch {
			return new Response(
				'<!DOCTYPE html><html><body><h1>404</h1><p>Not found</p></body></html>',
				{ status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
			);
		}
	}

	return resolve(event);
};
