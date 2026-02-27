import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/public';

export function createPocketBaseClient(): PocketBase {
	return new PocketBase(env.PUBLIC_PB_URL || 'http://127.0.0.1:8090');
}
