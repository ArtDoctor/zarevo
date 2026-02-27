import PocketBase, { type RecordModel } from 'pocketbase';
import { env } from '$env/dynamic/public';
import { writable } from 'svelte/store';

const pb = new PocketBase(env.PUBLIC_PB_URL || 'http://127.0.0.1:8090');

export { pb };

export const currentUser = writable(pb.authStore.model);

pb.authStore.onChange(() => {
	currentUser.set(pb.authStore.model);
});

export async function checkAuth(): Promise<void> {
	try {
		if (!pb.authStore.isValid && typeof window !== 'undefined') {
			try {
				const raw = window.localStorage.getItem('pb_auth');
				if (raw) {
					const parsed = JSON.parse(raw) as { token?: string; model?: RecordModel };
					if (parsed?.token && typeof parsed.token === 'string') {
						pb.authStore.save(parsed.token, parsed.model ?? null);
					}
				}
			} catch {
				// ignore parse errors
			}
		}

		const hasLocalAuth = typeof window !== 'undefined' && !!window.localStorage.getItem('pb_auth');
		if (!pb.authStore.isValid && !hasLocalAuth) {
			if (typeof window !== 'undefined') window.location.href = '/home';
			return;
		}

		try {
			await pb.collection('users').authRefresh();
		} catch {
			// no-op
		}
	} catch {
		if (typeof window !== 'undefined') window.location.href = '/home';
	}
}

export function createPocketBaseClient(): PocketBase {
	return pb;
}
