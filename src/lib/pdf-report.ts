import { jsPDF } from 'jspdf';

const PRIMARY = { r: 240, g: 83, b: 34 };
const BG_DARK = { r: 23, g: 23, b: 23 };
const BG_CARD = { r: 28, g: 28, b: 28 };
const TEXT_WHITE = { r: 255, g: 255, b: 255 };
const TEXT_MUTED = { r: 163, g: 163, b: 163 };
const TEXT_SUBTLE = { r: 212, g: 212, b: 212 };
const BORDER = { r: 64, g: 64, b: 64 };

const MARGIN = 20;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

interface Analysis {
	id: string;
	status: string;
	type: string;
	result: unknown;
}

interface Idea {
	id: string;
	title: string;
	description?: string;
	problem?: string;
	customer?: string;
	founder_specific?: string;
	expand?: { analyses?: Analysis[] };
}

function formatResult(result: unknown): string {
	if (result == null) return 'No result';
	if (typeof result === 'string') return result;
	if (typeof result === 'number' || typeof result === 'boolean') return String(result);
	if (Array.isArray(result)) {
		return result.map((v, i) => `${i + 1}. ${formatResult(v)}`).join('\n');
	}
	if (typeof result === 'object') {
		const lines: string[] = [];
		for (const [k, v] of Object.entries(result)) {
			const formatted = formatResult(v);
			if (formatted.includes('\n')) {
				lines.push(`${k}:`, ...formatted.split('\n').map((l) => `  ${l}`));
			} else {
				lines.push(`${k}: ${formatted}`);
			}
		}
		return lines.join('\n');
	}
	return String(result);
}

function addWrappedText(
	doc: jsPDF,
	text: string,
	x: number,
	y: number,
	maxWidth: number,
	lineHeight: number
): number {
	const lines = doc.splitTextToSize(text, maxWidth);
	for (const line of lines) {
		if (y > PAGE_HEIGHT - MARGIN - 10) {
			doc.addPage();
			doc.setFillColor(BG_DARK.r, BG_DARK.g, BG_DARK.b);
			doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
			y = MARGIN;
		}
		doc.text(line, x, y);
		y += lineHeight;
	}
	return y;
}

function addSectionHeader(doc: jsPDF, title: string, y: number): number {
	if (y > PAGE_HEIGHT - MARGIN - 30) {
		doc.addPage();
		doc.setFillColor(BG_DARK.r, BG_DARK.g, BG_DARK.b);
		doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
		y = MARGIN;
	}
	doc.setFontSize(14);
	doc.setTextColor(PRIMARY.r, PRIMARY.g, PRIMARY.b);
	doc.text(title, MARGIN, y + 6);
	y += 14;
	doc.setFontSize(10);
	doc.setTextColor(TEXT_SUBTLE.r, TEXT_SUBTLE.g, TEXT_SUBTLE.b);
	return y;
}

function addBlock(
	doc: jsPDF,
	label: string,
	content: string,
	startY: number
): number {
	let y = startY;
	if (y > PAGE_HEIGHT - MARGIN - 40) {
		doc.addPage();
		doc.setFillColor(BG_DARK.r, BG_DARK.g, BG_DARK.b);
		doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
		y = MARGIN;
	}
	doc.setFontSize(9);
	doc.setTextColor(TEXT_MUTED.r, TEXT_MUTED.g, TEXT_MUTED.b);
	doc.text(label, MARGIN, y + 4);
	y += 8;
	doc.setFillColor(BG_CARD.r, BG_CARD.g, BG_CARD.b);
	doc.setDrawColor(BORDER.r, BORDER.g, BORDER.b);
	const contentLines = doc.splitTextToSize(content, CONTENT_WIDTH - 16);
	const lineHeight = 5;
	const padding = 12;
	let lineIdx = 0;
	while (lineIdx < contentLines.length) {
		if (y > PAGE_HEIGHT - MARGIN - 30) {
			doc.addPage();
			doc.setFillColor(BG_DARK.r, BG_DARK.g, BG_DARK.b);
			doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
			y = MARGIN;
		}
		const linesPerPage = Math.floor((PAGE_HEIGHT - MARGIN - y - padding) / lineHeight);
		const chunk = contentLines.slice(lineIdx, lineIdx + linesPerPage);
		const blockHeight = chunk.length * lineHeight + padding;
		doc.roundedRect(MARGIN, y, CONTENT_WIDTH, blockHeight, 2, 2, 'FD');
		doc.setTextColor(TEXT_SUBTLE.r, TEXT_SUBTLE.g, TEXT_SUBTLE.b);
		doc.setFont('courier', 'normal');
		for (let i = 0; i < chunk.length; i++) {
			doc.text(chunk[i], MARGIN + 8, y + 10 + i * lineHeight);
		}
		doc.setFont('helvetica', 'normal');
		lineIdx += chunk.length;
		y += blockHeight + 12;
	}
	return y;
}

export function generateIdeaPdf(idea: Idea): void {
	const doc = new jsPDF();
	doc.setFillColor(BG_DARK.r, BG_DARK.g, BG_DARK.b);
	doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');

	const analyses = idea.expand?.analyses ?? [];
	const navOrder = [
		'market', 'problem', 'customer', 'competitor', 'technical',
		'legal', 'financial', 'swot', 'brainstorm', 'chat_with_idea', 'summary'
	] as const;
	const byType = new Map(analyses.map((a) => [(a.type ?? '').toLowerCase().replace(/\s+/g, '_'), a]));
	const seen = new Set<string>();
	const orderedAnalyses: Analysis[] = [];
	for (const t of navOrder) {
		const a = byType.get(t) ?? byType.get(t.replace(/_/g, ' '));
		if (a && !seen.has(a.id)) {
			seen.add(a.id);
			orderedAnalyses.push(a);
		}
	}
	for (const a of analyses) {
		if (!seen.has(a.id)) orderedAnalyses.push(a);
	}

	let y = MARGIN;

	doc.setFontSize(22);
	doc.setTextColor(TEXT_WHITE.r, TEXT_WHITE.g, TEXT_WHITE.b);
	doc.text(idea.title || 'Untitled Idea', MARGIN, y + 10);
	y += 20;

	doc.setFontSize(10);
	doc.setTextColor(TEXT_MUTED.r, TEXT_MUTED.g, TEXT_MUTED.b);
	doc.text('Idea Report — Zarevo', MARGIN, y + 6);
	y += 16;

	if (idea.description) {
		y = addSectionHeader(doc, 'Description', y);
		y = addWrappedText(doc, idea.description, MARGIN, y, CONTENT_WIDTH, 6) + 12;
	}

	const userInputs: { label: string; value: string }[] = [
		{ label: 'Problem', value: idea.problem ?? '' },
		{ label: 'Customer', value: idea.customer ?? '' },
		{ label: 'Founder specific', value: idea.founder_specific ?? '' }
	].filter((u) => u.value.length > 0);

	if (userInputs.length > 0) {
		y = addSectionHeader(doc, 'User inputs', y);
		for (const { label, value } of userInputs) {
			y = addBlock(doc, label, value, y);
		}
		y += 8;
	}

	y = addSectionHeader(doc, 'Analyses', y);
	y += 4;

	for (const analysis of orderedAnalyses) {
		const typeLabel = (analysis.type ?? 'unknown').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
		const statusLabel = (analysis.status ?? 'pending').replace('_', ' ');
		const content = analysis.result != null
			? formatResult(analysis.result)
			: `Status: ${statusLabel}`;

		y = addBlock(doc, `${typeLabel} (${statusLabel})`, content, y);
	}

	doc.save(`${(idea.title || 'idea').replace(/[^a-zA-Z0-9-_]/g, '_')}_report.pdf`);
}
