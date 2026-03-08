export interface Competitor {
	description?: string;
	features?: string;
	name?: string;
	online_presence?: string;
	revenue?: string;
	strengths?: string;
	weaknesses?: string;
}

export interface CompetitorAnalysis {
	competitors?: Competitor[];
	overview?: string;
	score?: number;
	sources?: string[];
}

export function isCompetitorAnalysis(obj: unknown): obj is CompetitorAnalysis {
	if (!obj || typeof obj !== 'object') return false;
	const o = obj as Record<string, unknown>;
	return (
		Array.isArray(o.competitors) ||
		typeof o.overview === 'string' ||
		typeof o.score === 'number'
	);
}
