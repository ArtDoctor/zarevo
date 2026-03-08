export interface TechnicalAnalysis {
	ideal_team?: string;
	no_code_viability?: string;
	overview?: string;
	scaling_considertions?: string;
	score?: number;
	strengths?: string[];
	suggested_tech_stack?: string;
	toughness?: number;
	weaknesses?: string[];
}

export function isTechnicalAnalysis(obj: unknown): obj is TechnicalAnalysis {
	if (!obj || typeof obj !== 'object') return false;
	const o = obj as Record<string, unknown>;
	return (
		typeof o.overview === 'string' ||
		typeof o.score === 'number' ||
		typeof o.suggested_tech_stack === 'string'
	);
}
