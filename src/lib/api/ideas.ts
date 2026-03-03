import { goto } from '$app/navigation';
import { getBackendUrl } from '$lib/config';
import { getAuthHeaders, pb } from '$lib/pocketbase';

export interface CreateIdeaPayload {
	description: string;
	problem: string;
	customer: string;
	founder_specific: string;
}

export interface CreateIdeaResponse {
	idea_id: string;
}

export async function createIdeaAndNavigate(payload: CreateIdeaPayload): Promise<void> {
	const userId = pb.authStore.model?.id;
	if (!userId) {
		throw new Error('User must be authenticated');
	}

	const backendUrl = getBackendUrl();
	if (!backendUrl) {
		throw new Error('Backend URL is not configured. Set PUBLIC_BACKEND_URL in .env');
	}

	const url = `${backendUrl.replace(/\/$/, '')}/api/ideas/new`;
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
		body: JSON.stringify({
			description: payload.description,
			problem: payload.problem,
			customer: payload.customer,
			founder_specific: payload.founder_specific
		})
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Failed to create idea: ${res.status} ${text}`);
	}

	const data = (await res.json()) as CreateIdeaResponse;
	if (data.idea_id) {
		goto(`/idea/${data.idea_id}`);
	} else {
		throw new Error('Invalid response: missing idea_id');
	}
}

export async function createIdeaAdvancedAndNavigate(payload: CreateIdeaPayload): Promise<void> {
	const userId = pb.authStore.model?.id;
	if (!userId) {
		throw new Error('User must be authenticated');
	}

	const backendUrl = getBackendUrl();
	if (!backendUrl) {
		throw new Error('Backend URL is not configured. Set PUBLIC_BACKEND_URL in .env');
	}

	const url = `${backendUrl.replace(/\/$/, '')}/api/ideas/new/advanced`;
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
		body: JSON.stringify({
			description: payload.description,
			problem: payload.problem,
			customer: payload.customer,
			founder_specific: payload.founder_specific
		})
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Failed to create idea: ${res.status} ${text}`);
	}

	const data = (await res.json()) as CreateIdeaResponse;
	if (data.idea_id) {
		goto(`/idea/${data.idea_id}`);
	} else {
		throw new Error('Invalid response: missing idea_id');
	}
}
