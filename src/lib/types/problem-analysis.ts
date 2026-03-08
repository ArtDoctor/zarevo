export interface ProblemAnalysis {
	alternative_solutions?: string;
	overview?: string;
	problem_frequency?: number;
	problem_size?: number;
	problem_statement?: string;
	related_problems?: string;
	score?: number;
	strengths?: string[];
	vitamin_or_painkiller?: number;
	weaknesses?: string[];
}

export function isProblemAnalysis(obj: unknown): obj is ProblemAnalysis {
	if (!obj || typeof obj !== 'object') return false;
	const o = obj as Record<string, unknown>;
	return (
		typeof o.problem_statement === 'string' ||
		typeof o.overview === 'string' ||
		typeof o.score === 'number'
	);
}
