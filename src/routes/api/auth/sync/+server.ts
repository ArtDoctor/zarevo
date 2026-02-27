import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { token, record } = body as { token?: string; record?: object };

	if (!token || !record) {
		return json({ error: 'Missing token or record' }, { status: 400 });
	}

	const pb = new PocketBase(env.PB_URL);
	pb.authStore.save(token, record);

	const response = json({ success: true });
	response.headers.append('set-cookie', pb.authStore.exportToCookie({ sameSite: 'Lax' }));

	return response;
};
