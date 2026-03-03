import { env } from '$env/dynamic/public';

export function getSubdomain(hostname: string): string | null {
	if (hostname === 'localhost' || hostname === '127.0.0.1') {
		return null;
	}
	if (hostname.endsWith('.localhost')) {
		const parts = hostname.split('.');
		return parts[0] || null;
	}
	const rootDomain = env.PUBLIC_ROOT_DOMAIN as string | undefined;
	if (rootDomain) {
		if (hostname === rootDomain || hostname === `www.${rootDomain}`) {
			return null;
		}
		if (hostname.endsWith(`.${rootDomain}`)) {
			const sub = hostname.slice(0, -(rootDomain.length + 1));
			return sub || null;
		}
	}
	return null;
}
