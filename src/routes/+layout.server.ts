import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { serializeNonPOJOs } from '$lib/utils';

export const load: LayoutServerLoad = async ({ url, locals }) => {
	if (url.pathname === '/') {
		throw redirect(303, '/home');
	}

	const user = locals.pb.authStore.record ? serializeNonPOJOs(locals.pb.authStore.record) : null;
	let authProviders: { name: string; displayName: string; authUrl: string }[] = [];

	try {
		const authMethods = await locals.pb.collection('users').listAuthMethods();
		authProviders = authMethods.oauth2?.providers ?? [];
	} catch {
		// PocketBase may not be running or configured
		console.error('Failed to get auth providers');
	}

	return { user, authProviders };
};
