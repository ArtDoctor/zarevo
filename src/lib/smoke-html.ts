export function getContent(record: Record<string, unknown>): string {
	return String(record.html ?? '');
}

export function buildSmokeHtml(html: string): string {
	if (!html.trim()) return '';
	if (/^\s*<!DOCTYPE/i.test(html) || /^\s*<html/i.test(html)) {
		return html;
	}
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
${html}
</body>
</html>`;
}
