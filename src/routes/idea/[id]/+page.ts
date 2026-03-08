import { redirect } from '@sveltejs/kit';

export const load = async ({
	params,
	parent,
	url
}: {
	params: { id?: string };
	parent: () => Promise<{ idea: { expand?: { analyses?: { id: string; type?: string }[] } } | null }>;
	url: URL;
}) => {
	const id = params.id;
	const { idea } = await parent();
	if (!id || !idea) return {};
	const analysisParam = url.searchParams.get('analysis');
	if (analysisParam) return {};
	const analyses = idea?.expand?.analyses ?? [];
	const marketAnalysis = analyses.find((a) => (a.type ?? '').toLowerCase() === 'market');
	const target = marketAnalysis ?? analyses[0];
	if (target) {
		throw redirect(302, `/idea/${id}?analysis=${target.id}`);
	}
	throw redirect(302, `/idea/${id}/smoke-test`);
};
