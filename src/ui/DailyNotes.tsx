import React, { useEffect, useMemo, useState } from 'react';
import { getHumanDate } from '../utils/dateUtils';
import { NotesStore } from '../utils/notesStore';

interface Props {
	store: NotesStore;
	jobId: string;
	dateISO: string;
	onChangeDate: (iso: string) => void;
}

export const DailyNotes: React.FC<Props> = ({ store, jobId, dateISO, onChangeDate }) => {
	const [text, setText] = useState('');
	const human = useMemo(() => getHumanDate(dateISO), [dateISO]);

	useEffect(() => {
		setText(store.getNote(jobId, dateISO) ?? '');
	}, [store, jobId, dateISO]);

	// Autosave
	useEffect(() => {
		const id = setTimeout(() => {
			store.setNote(jobId, dateISO, text);
		}, 300);
		return () => clearTimeout(id);
	}, [text, store, jobId, dateISO]);

	return (
		<div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
			<div className="toolbar" style={{ marginBottom: 8 }}>
				<span className="date-display">{human}</span>
				<span className="spacer" />
				<button className="button ghost" onClick={() => {
					const prev = store.findPreviousWithContent(jobId, dateISO);
					if (prev) onChangeDate(prev);
				}}>
					◀
				</button>
				<button className="button ghost" onClick={() => {
					const next = store.findNextWithRule(jobId, dateISO);
					if (next) onChangeDate(next);
				}}>
					▶
				</button>
			</div>
			<textarea
				className="note-editor"
				placeholder={jobId ? `Write notes for ${jobId}...` : 'Write notes...'}
				value={text}
				onChange={(e) => setText(e.target.value)}
			/>
			<div className="muted" style={{ marginTop: 6, fontSize: 12 }}>
				Autosaved. {text.length} chars
			</div>
		</div>
	);
};

