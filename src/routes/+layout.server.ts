import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	let authProviders: { name: string; displayName: string; authUrl: string }[] = [];

	try {
		const authMethods = await locals.pb.collection('users').listAuthMethods();
		authProviders = authMethods.oauth2?.providers ?? [];
	} catch {
		console.error('Failed to get auth providers');
	}

	return { authProviders };
};
