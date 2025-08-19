export function toISODate(date: Date): string {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	return d.toISOString().slice(0, 10);
}

export function parseISODate(iso: string): Date {
	const [y, m, d] = iso.split('-').map(Number);
	return new Date(y, (m - 1), d);
}

export function getTodayISO(): string {
	return toISODate(new Date());
}

export function getHumanDate(iso: string): string {
	const date = parseISODate(iso);
	return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export function getMonthMatrix(anchor: Date): Date[] {
	const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
	const startDay = (start.getDay() + 6) % 7; // Mon=0
	const first = new Date(start);
	first.setDate(first.getDate() - startDay);
	const cells: Date[] = [];
	for (let i = 0; i < 42; i++) {
		const d = new Date(first);
		d.setDate(first.getDate() + i);
		cells.push(d);
	}
	return cells;
}

