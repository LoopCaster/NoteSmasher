export interface Task {
	id: string;
	title: string;
	description: string;
	completed: boolean;
	createdAt: string;
	completedAt?: string;
	deadline?: string;
}

type JobId = string;

export class TaskStore {
	private storageKey(jobId: JobId): string {
		return `notesmasher.tasks.${jobId}`;
	}

	private loadTasks(jobId: JobId): Task[] {
		const raw = localStorage.getItem(this.storageKey(jobId));
		if (!raw) return [];
		try { return JSON.parse(raw) as Task[]; } catch { return []; }
	}

	private saveTasks(jobId: JobId, tasks: Task[]): void {
		localStorage.setItem(this.storageKey(jobId), JSON.stringify(tasks));
	}

	getTasks(jobId: JobId): Task[] {
		return this.loadTasks(jobId);
	}

	addTask(jobId: JobId, title: string, description: string = '', deadline?: string): Task {
		const tasks = this.loadTasks(jobId);
		const newTask: Task = {
			id: Date.now().toString(),
			title: title.trim(),
			description: description.trim(),
			completed: false,
			createdAt: new Date().toISOString(),
			deadline: deadline
		};
		tasks.push(newTask);
		this.saveTasks(jobId, tasks);
		return newTask;
	}

	toggleTask(jobId: JobId, taskId: string): void {
		const tasks = this.loadTasks(jobId);
		const task = tasks.find(t => t.id === taskId);
		if (task) {
			task.completed = !task.completed;
			task.completedAt = task.completed ? new Date().toISOString() : undefined;
			this.saveTasks(jobId, tasks);
		}
	}

	updateTask(jobId: JobId, taskId: string, title: string, description: string, deadline?: string): void {
		const tasks = this.loadTasks(jobId);
		const task = tasks.find(t => t.id === taskId);
		if (task) {
			task.title = title.trim();
			task.description = description.trim();
			task.deadline = deadline;
			this.saveTasks(jobId, tasks);
		}
	}

	getTask(jobId: JobId, taskId: string): Task | undefined {
		const tasks = this.loadTasks(jobId);
		return tasks.find(t => t.id === taskId);
	}

	deleteTask(jobId: JobId, taskId: string): void {
		const tasks = this.loadTasks(jobId);
		const filtered = tasks.filter(t => t.id !== taskId);
		this.saveTasks(jobId, filtered);
	}

	getCompletedTasks(jobId: JobId): Task[] {
		return this.loadTasks(jobId).filter(t => t.completed);
	}

	getPendingTasks(jobId: JobId): Task[] {
		return this.loadTasks(jobId).filter(t => !t.completed);
	}

	getAllTasks(): Record<string, Task[]> {
		const allTasks: Record<string, Task[]> = {};
		
		// Get all localStorage keys that match our pattern
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith('notesmasher.tasks.')) {
				const jobId = key.replace('notesmasher.tasks.', '');
				const tasks = this.loadTasks(jobId);
				if (tasks.length > 0) {
					allTasks[jobId] = tasks;
				}
			}
		}
		
		return allTasks;
	}

	importTasks(tasks: Record<string, Task[]>): void {
		// Clear existing tasks
		for (let i = localStorage.length - 1; i >= 0; i--) {
			const key = localStorage.key(i);
			if (key && key.startsWith('notesmasher.tasks.')) {
				localStorage.removeItem(key);
			}
		}

		// Import new tasks
		Object.entries(tasks).forEach(([jobId, jobTasks]) => {
			this.saveTasks(jobId, jobTasks);
		});
	}
}
