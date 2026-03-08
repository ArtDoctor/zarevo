import { pb } from '$lib/pocketbase';

interface Analysis {
	id: string;
	status: string;
	type: string;
	result: unknown;
}

interface IdeaFeature {
	title: string;
	expected_signup_increase_pct: number;
}

interface Idea {
	id: string;
	title: string;
	description: string;
	problem?: string;
	customer?: string;
	founder_specific?: string;
	analyses?: string[];
	features?: IdeaFeature[];
	expand?: { analyses?: Analysis[] };
}

interface SmokeRecord {
	id: string;
	state: string;
	start_date?: string;
	duration?: number;
}

function isRunning(smoke: SmokeRecord): boolean {
	const start = smoke.start_date ? new Date(smoke.start_date) : null;
	const duration = smoke.duration ?? 0;
	if (!start || duration <= 0) return false;
	const end = new Date(start);
	end.setDate(end.getDate() + duration);
	const now = new Date();
	return now >= start && now <= end;
}

export const ssr = false;

export const load = async ({ params }: { params: { id?: string } }) => {
	const id = params.id;
	if (!id) {
		return { idea: null, runningSmoke: null };
	}
	try {
		const [record, smokes] = await Promise.all([
			pb.collection('ideas').getOne<Idea>(id, { expand: 'analyses' }),
			pb.collection('smokes').getFullList<SmokeRecord>({ filter: `idea = "${id}"` }).catch(() => [] as SmokeRecord[])
		]);
		const runningSmoke = smokes.find(isRunning) ?? null;
		return { idea: record, runningSmoke };
	} catch {
		return { idea: null, runningSmoke: null };
	}
};
