export interface IdealCustomer {
	age?: number;
	description?: string;
	gender?: string;
	name?: string;
	ready_to_pay_usd?: number;
}

export interface ViableSegment {
	description?: string;
	preferred_payment_type?: string;
	segment_name?: string;
	willingness_and_ability_to_pay?: string;
}

export interface CustomerAnalysis {
	customer_habits?: string;
	ideal_customers?: IdealCustomer[];
	key_pain_points?: string[];
	messages_that_resonate?: string[];
	overview?: string;
	score?: number;
	strengths?: string[];
	viable_segments?: ViableSegment[];
	weaknesses?: string[];
}

export function isCustomerAnalysis(obj: unknown): obj is CustomerAnalysis {
	if (!obj || typeof obj !== 'object') return false;
	const o = obj as Record<string, unknown>;
	return (
		typeof o.overview === 'string' ||
		typeof o.score === 'number' ||
		Array.isArray(o.ideal_customers) ||
		Array.isArray(o.viable_segments)
	);
}
