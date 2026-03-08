import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	let authProviders: { name: string; displayName: string; authUrl?: string }[] = [];

	try {
		const authMethods = await locals.pb.collection('users').listAuthMethods();
		authProviders = authMethods.oauth2?.providers ?? [];
	} catch {
		console.error('Failed to get auth providers');
	}

	// Export auth cookie for server-side access
	if (locals.pb.authStore.isValid) {
		cookies.set('pb_auth', locals.pb.authStore.exportToCookie(), {
			path: '/',
			httpOnly: false,
			secure: false,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});
	}

	return { 
		authProviders,
		user: locals.pb.authStore.model 
	};
};
