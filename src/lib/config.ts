import { env } from '$env/dynamic/public';

export function getBackendUrl(): string {
	return env.PUBLIC_BACKEND_URL || '';
}
