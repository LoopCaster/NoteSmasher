import React, { useState, useEffect } from 'react';
import { TaskStore, Task } from '../utils/taskStore';

interface Props {
	taskStore: TaskStore;
	jobId: string;
}

export const TaskList: React.FC<Props> = ({ taskStore, jobId }) => {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [newTaskTitle, setNewTaskTitle] = useState('');
	const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
	const [editingTitle, setEditingTitle] = useState('');

	useEffect(() => {
		setTasks(taskStore.getTasks(jobId));
	}, [taskStore, jobId]);

	const addTask = () => {
		if (newTaskTitle.trim()) {
			taskStore.addTask(jobId, newTaskTitle);
			setTasks(taskStore.getTasks(jobId));
			setNewTaskTitle('');
		}
	};

	const toggleTask = (taskId: string) => {
		taskStore.toggleTask(jobId, taskId);
		setTasks(taskStore.getTasks(jobId));
	};

	const startEditing = (task: Task) => {
		setEditingTaskId(task.id);
		setEditingTitle(task.title);
	};

	const saveEdit = () => {
		if (editingTaskId && editingTitle.trim()) {
			taskStore.updateTask(jobId, editingTaskId, editingTitle);
			setTasks(taskStore.getTasks(jobId));
			setEditingTaskId(null);
			setEditingTitle('');
		}
	};

	const cancelEdit = () => {
		setEditingTaskId(null);
		setEditingTitle('');
	};

	const deleteTask = (taskId: string) => {
		if (confirm('Delete this task?')) {
			taskStore.deleteTask(jobId, taskId);
			setTasks(taskStore.getTasks(jobId));
		}
	};

	const pendingTasks = tasks.filter(t => !t.completed);
	const completedTasks = tasks.filter(t => t.completed);

	return (
		<div style={{ display: 'flex', flexDirection: 'column' }}>
			<div className="toolbar" style={{ marginBottom: 8 }}>
				<strong>Tasks for {jobId}</strong>
			</div>

			{/* Add new task */}
			<div style={{ marginBottom: 16 }}>
				<div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
					<input
						type="text"
						value={newTaskTitle}
						onChange={(e) => setNewTaskTitle(e.target.value)}
						onKeyPress={(e) => e.key === 'Enter' && addTask()}
						placeholder="Add new task..."
						className="jobs-input"
						style={{ flex: 1 }}
					/>
					<button className="button" onClick={addTask}>Add</button>
				</div>
			</div>

			{/* Pending tasks */}
			<div style={{ marginBottom: 16 }}>
				<h4 style={{ margin: '0 0 8px 0', color: 'var(--accent)' }}>Pending ({pendingTasks.length})</h4>
				{pendingTasks.length === 0 ? (
					<div className="muted" style={{ fontSize: 14 }}>No pending tasks</div>
				) : (
					<div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
						{pendingTasks.map(task => (
							<div key={task.id} className="task-item" style={{ 
								display: 'flex', 
								alignItems: 'center', 
								gap: 8,
								padding: '8px 10px',
								borderRadius: 8,
								background: 'rgba(124,156,255,0.08)',
								border: '1px solid var(--border)'
							}}>
								<input
									type="checkbox"
									checked={task.completed}
									onChange={() => toggleTask(task.id)}
									style={{ margin: 0 }}
								/>
								{editingTaskId === task.id ? (
									<>
										<input
											type="text"
											value={editingTitle}
											onChange={(e) => setEditingTitle(e.target.value)}
											onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
											className="jobs-input"
											style={{ flex: 1, fontSize: 14 }}
										/>
										<button className="button ghost" onClick={saveEdit}>Save</button>
										<button className="button ghost" onClick={cancelEdit}>Cancel</button>
									</>
								) : (
									<>
										<span style={{ flex: 1, fontSize: 14 }}>{task.title}</span>
										<button className="button ghost" onClick={() => startEditing(task)}>Edit</button>
										<button className="button ghost" onClick={() => deleteTask(task.id)}>Delete</button>
									</>
								)}
							</div>
						))}
					</div>
				)}
			</div>

			{/* Completed tasks */}
			{completedTasks.length > 0 && (
				<div>
					<h4 style={{ margin: '0 0 8px 0', color: 'var(--accent-2)' }}>Completed ({completedTasks.length})</h4>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
						{completedTasks.map(task => (
							<div key={task.id} className="task-item" style={{ 
								display: 'flex', 
								alignItems: 'center', 
								gap: 8,
								padding: '8px 10px',
								borderRadius: 8,
								background: 'rgba(66,211,146,0.08)',
								border: '1px solid var(--border)',
								opacity: 0.7
							}}>
								<input
									type="checkbox"
									checked={task.completed}
									onChange={() => toggleTask(task.id)}
									style={{ margin: 0 }}
								/>
								<span style={{ 
									flex: 1, 
									fontSize: 14, 
									textDecoration: 'line-through',
									color: 'var(--muted)'
								}}>{task.title}</span>
								<button className="button ghost" onClick={() => deleteTask(task.id)}>Delete</button>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};
