export interface MarketData {
	name: string;
	sector?: string;
	growth_rate?: string;
	sizes_2023_2026_in_millions: number[];
}

export interface MarketAnalysis {
	average_growth_rate?: string;
	gaps_and_opportunities?: string[];
	markets?: MarketData[];
	new_market_potential?: string;
	overview?: string;
	score?: number;
	sectors?: string[];
	sources?: string[];
	strengths?: string[];
	theoretical_market_share_pct?: string;
	threats?: string[];
	trends_analysis?: string;
	weaknesses?: string[];
	why_now?: string;
}

export function isMarketAnalysis(obj: unknown): obj is MarketAnalysis {
	if (!obj || typeof obj !== 'object') return false;
	const o = obj as Record<string, unknown>;
	return Array.isArray(o.markets) || typeof o.score === 'number' || typeof o.overview === 'string';
}
