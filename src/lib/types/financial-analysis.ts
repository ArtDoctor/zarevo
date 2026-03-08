export interface FinancialAnalysis {
	costs_overview?: string;
	investor_concerns?: string;
	investor_requirements?: string;
	overview?: string;
	score?: number;
	start_capital_needed?: string;
}

export function isFinancialAnalysis(obj: unknown): obj is FinancialAnalysis {
	if (!obj || typeof obj !== 'object') return false;
	const o = obj as Record<string, unknown>;
	return (
		typeof o.overview === 'string' ||
		typeof o.score === 'number' ||
		typeof o.start_capital_needed === 'string' ||
		typeof o.costs_overview === 'string'
	);
}
