import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/private';
import { getSubdomain } from '$lib/subdomain';
import { getContent, buildSmokeHtml } from '$lib/smoke-html';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.pb = new PocketBase(env.PB_URL || 'http://127.0.0.1:8090');
	event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

	// Validate the auth token if present
	if (event.locals.pb.authStore.isValid) {
		try {
			await event.locals.pb.collection('users').authRefresh();
		} catch {
			event.locals.pb.authStore.clear();
		}
	}

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
			const html = buildSmokeHtml(getContent(record));
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
