import React, { useMemo } from 'react';
import { getMonthMatrix, toISODate } from '../utils/dateUtils';
import { NotesStore } from '../utils/notesStore';

interface Props {
	store: NotesStore;
	jobId: string;
	selectedDateISO: string;
	onSelectDate: (iso: string) => void;
}

export const MonthCalendar: React.FC<Props> = ({ store, jobId, selectedDateISO, onSelectDate }) => {
	const matrix = useMemo(() => getMonthMatrix(new Date(selectedDateISO)), [selectedDateISO]);
	const todayISO = toISODate(new Date());

	return (
		<div>
			<div className="toolbar" style={{ marginBottom: 8 }}>
				<strong>Month</strong>
				<span className="spacer" />
				<button className="button ghost" onClick={() => onSelectDate(toISODate(new Date(new Date(selectedDateISO).setMonth(new Date(selectedDateISO).getMonth() - 1))))}>◀</button>
				<button className="button ghost" onClick={() => onSelectDate(toISODate(new Date(new Date(selectedDateISO).setMonth(new Date(selectedDateISO).getMonth() + 1))))}>▶</button>
			</div>
			<div className="calendar-grid">
				{matrix.map((date, idx) => {
					const iso = toISODate(date);
					const has = !!store.getNote(jobId, iso);
					const isToday = iso === todayISO;
					return (
						<div key={idx} className={`calendar-cell ${has ? 'has-notes' : ''} ${isToday ? 'today' : ''}`} onClick={() => onSelectDate(iso)}>
							<div className="day">{date.getDate()}</div>
							{has && <div className="dot" />}
						</div>
					);
				})}
			</div>
		</div>
	);
};

