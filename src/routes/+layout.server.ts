import type { LayoutServerLoad } from './$types';
import { getSubdomain } from '$lib/subdomain';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const hostname = url.hostname;
	const subdomain = getSubdomain(hostname);

	if (subdomain) {
		try {
			const escaped = subdomain.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
			const record = await locals.pb
				.collection('smokes')
				.getFirstListItem<{ domain: string; content: string }>(`domain = "${escaped}"`);
			const content = (() => {
				try {
					return JSON.parse(record.content) as unknown;
				} catch {
					return record.content;
				}
			})();
			return { subdomain, smokeContent: content, authProviders: [] };
		} catch {
			return { subdomain, smokeContent: null, notFound: true, authProviders: [] };
		}
	}

	let authProviders: { name: string; displayName: string; authUrl?: string }[] = [];

	try {
		const authMethods = await locals.pb.collection('users').listAuthMethods();
		authProviders = authMethods.oauth2?.providers ?? [];
	} catch {
		console.error('Failed to get auth providers');
	}

	return { authProviders };
};
