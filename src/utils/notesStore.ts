import { getTodayISO } from './dateUtils';

type JobId = string;

export class NotesStore {
	private storageKey(jobId: JobId): string {
		return `notesmasher.notes.${jobId}`;
	}

	private loadMap(jobId: JobId): Record<string, string> {
		const raw = localStorage.getItem(this.storageKey(jobId));
		if (!raw) return {};
		try { return JSON.parse(raw) as Record<string, string>; } catch { return {}; }
	}

	private saveMap(jobId: JobId, map: Record<string, string>): void {
		localStorage.setItem(this.storageKey(jobId), JSON.stringify(map));
	}

	getNote(jobId: JobId, isoDate: string): string | undefined {
		const map = this.loadMap(jobId);
		return map[isoDate];
	}

	setNote(jobId: JobId, isoDate: string, text: string): void {
		const map = this.loadMap(jobId);
		if (text.trim() === '') {
			delete map[isoDate];
		} else {
			map[isoDate] = text;
		}
		this.saveMap(jobId, map);
	}

	listDatesWithNotes(jobId: JobId): string[] {
		return Object.keys(this.loadMap(jobId)).sort();
	}

	findPreviousWithContent(jobId: JobId, fromISO: string): string | null {
		const dates = this.listDatesWithNotes(jobId).filter(d => d < fromISO);
		return dates.length ? dates[dates.length - 1] : null;
	}

	// Next navigation with special rule:
	// - If there is a next date with content, go there
	// - Otherwise, if today is after current date, go to today
	// - Otherwise stay (null)
	findNextWithRule(jobId: JobId, fromISO: string): string | null {
		const dates = this.listDatesWithNotes(jobId).filter(d => d > fromISO);
		if (dates.length) return dates[0];
		const today = getTodayISO();
		if (today > fromISO) return today; // even if no content on today
		return null;
	}

	getAllNotes(): Record<string, Record<string, string>> {
		const allNotes: Record<string, Record<string, string>> = {};
		
		// Get all localStorage keys that match our pattern
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith('notesmasher.notes.')) {
				const jobId = key.replace('notesmasher.notes.', '');
				const map = this.loadMap(jobId);
				if (Object.keys(map).length > 0) {
					allNotes[jobId] = map;
				}
			}
		}
		
		return allNotes;
	}

	importNotes(notes: Record<string, Record<string, string>>): void {
		// Clear existing notes
		for (let i = localStorage.length - 1; i >= 0; i--) {
			const key = localStorage.key(i);
			if (key && key.startsWith('notesmasher.notes.')) {
				localStorage.removeItem(key);
			}
		}

		// Import new notes
		Object.entries(notes).forEach(([jobId, jobNotes]) => {
			this.saveMap(jobId, jobNotes);
		});
	}
}

