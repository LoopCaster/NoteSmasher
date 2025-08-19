import React, { useEffect, useMemo, useState } from 'react';
import { DailyNotes } from './DailyNotes';
import { MonthCalendar } from './MonthCalendar';
import { TaskList } from './TaskList';
import { TaskDetail } from './TaskDetail';
import { getTodayISO, toISODate } from '../utils/dateUtils';
import { NotesStore } from '../utils/notesStore';
import { TaskStore } from '../utils/taskStore';
import { Task } from '../utils/taskStore';

export type JobId = string;

const DEFAULT_JOBS: JobId[] = ['Job A', 'Job B', 'Job C'];

export const App: React.FC = () => {
	const [jobs, setJobs] = useState<JobId[]>(() => {
		const raw = localStorage.getItem('notesmasher.jobs');
		if (raw) {
			try { return JSON.parse(raw) as JobId[]; } catch {}
		}
		return DEFAULT_JOBS;
	});
	const [selectedJob, setSelectedJob] = useState<JobId>(jobs[0] ?? 'Job');
	const [selectedDateISO, setSelectedDateISO] = useState<string>(getTodayISO());
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);

	useEffect(() => {
		localStorage.setItem('notesmasher.jobs', JSON.stringify(jobs));
		if (!jobs.includes(selectedJob) && jobs.length > 0) {
			setSelectedJob(jobs[0]);
		}
	}, [jobs]);

	useEffect(() => {
		if (!jobs.includes(selectedJob) && jobs.length > 0) {
			setSelectedJob(jobs[0]);
		}
	}, [selectedJob, jobs]);

	const store = useMemo(() => new NotesStore(), []);
	const taskStore = useMemo(() => new TaskStore(), []);

	function addJob() {
		const name = prompt('New job name');
		if (!name) return;
		if (jobs.includes(name)) return alert('Job already exists');
		setJobs([...jobs, name]);
		setSelectedJob(name);
	}

	function removeJob(job: JobId) {
		if (!confirm(`Remove job "${job}"?`)) return;
		setJobs(jobs.filter(j => j !== job));
	}

	function gotoPrevWithContent() {
		const prev = store.findPreviousWithContent(selectedJob, selectedDateISO);
		if (prev) setSelectedDateISO(prev);
	}

	function gotoNextWithRule() {
		const next = store.findNextWithRule(selectedJob, selectedDateISO);
		if (next) setSelectedDateISO(next);
	}

	function handleTaskSelect(task: Task) {
		setSelectedTask(task);
	}

	function handleTaskSave(taskId: string, title: string, description: string) {
		taskStore.updateTask(selectedJob, taskId, title, description);
		setSelectedTask(null);
	}

	function handleTaskToggle(taskId: string) {
		taskStore.toggleTask(selectedJob, taskId);
	}

	function handleTaskDelete(taskId: string) {
		taskStore.deleteTask(selectedJob, taskId);
		setSelectedTask(null);
	}

	return (
		<div className="container">
			<aside className="sidebar">
				<h3 className="title">Jobs</h3>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
					{jobs.map(job => (
						<div
							key={job}
							className={`job-item ${selectedJob === job ? 'active' : ''}`}
							onClick={() => setSelectedJob(job)}
						>
							<span>{job}</span>
							<button className="button ghost" onClick={(e) => { e.stopPropagation(); removeJob(job); }}>
								Remove
							</button>
						</div>
					))}
					<button className="button" onClick={addJob}>Add Job</button>
				</div>
			</aside>

			<header className="header">
				<div className="toolbar">
					<button className="button" onClick={() => setSelectedDateISO(toISODate(new Date()))}>Today</button>
					<button className="button" onClick={gotoPrevWithContent}>◀ Previous</button>
					<button className="button" onClick={gotoNextWithRule}>Next ▶</button>
				</div>
				<div className="toolbar">
					<span className="muted">Selected job:</span>
					<strong>{selectedJob}</strong>
				</div>
			</header>

			<main className="main">
				<section style={{ display: 'flex', flexDirection: 'column' }}>
					<div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
						<DailyNotes
							store={store}
							jobId={selectedJob}
							dateISO={selectedDateISO}
							onChangeDate={setSelectedDateISO}
						/>
					</div>
					{selectedTask && (
						<TaskDetail
							task={selectedTask}
							onClose={() => setSelectedTask(null)}
							onSave={handleTaskSave}
							onToggle={handleTaskToggle}
							onDelete={handleTaskDelete}
						/>
					)}
				</section>
				<aside className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
					<MonthCalendar
						store={store}
						jobId={selectedJob}
						selectedDateISO={selectedDateISO}
						onSelectDate={setSelectedDateISO}
					/>
					<TaskList
						taskStore={taskStore}
						jobId={selectedJob}
						onTaskSelect={handleTaskSelect}
					/>
				</aside>
			</main>
		</div>
	);
};

