export interface LegalAnalysis {
	EU_AI_compliance?: string;
	GDPR_compliance?: string;
	overview?: string;
	score?: number;
}

export function isLegalAnalysis(obj: unknown): obj is LegalAnalysis {
	if (!obj || typeof obj !== 'object') return false;
	const o = obj as Record<string, unknown>;
	return (
		typeof o.overview === 'string' ||
		typeof o.score === 'number' ||
		typeof o.EU_AI_compliance === 'string' ||
		typeof o.GDPR_compliance === 'string'
	);
}
