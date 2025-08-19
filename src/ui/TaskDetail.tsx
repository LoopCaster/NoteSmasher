import React, { useState } from 'react';
import { Task } from '../utils/taskStore';
import { getHumanDate } from '../utils/dateUtils';

interface Props {
	task: Task | null;
	onClose: () => void;
	onSave: (taskId: string, title: string, description: string) => void;
	onToggle: (taskId: string) => void;
	onDelete: (taskId: string) => void;
}

export const TaskDetail: React.FC<Props> = ({ task, onClose, onSave, onToggle, onDelete }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editTitle, setEditTitle] = useState('');
	const [editDescription, setEditDescription] = useState('');

	if (!task) return null;

	const handleEdit = () => {
		setEditTitle(task.title);
		setEditDescription(task.description);
		setIsEditing(true);
	};

	const handleSave = () => {
		if (editTitle.trim()) {
			onSave(task.id, editTitle, editDescription);
			setIsEditing(false);
		}
	};

	const handleCancel = () => {
		setIsEditing(false);
	};

	const handleDelete = () => {
		if (confirm('Delete this task?')) {
			onDelete(task.id);
			onClose();
		}
	};

	return (
		<div className="card" style={{ marginTop: 12 }}>
			<div className="toolbar" style={{ marginBottom: 12 }}>
				<strong>Task Details</strong>
				<span className="spacer" />
				<button className="button ghost" onClick={onClose}>✕</button>
			</div>

			{/* Task header with checkbox and creation date */}
			<div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
				<input
					type="checkbox"
					checked={task.completed}
					onChange={() => onToggle(task.id)}
					style={{ margin: 0, transform: 'scale(1.2)' }}
				/>
				<div style={{ flex: 1 }}>
					{isEditing ? (
						<input
							type="text"
							value={editTitle}
							onChange={(e) => setEditTitle(e.target.value)}
							className="jobs-input"
							style={{ fontSize: 16, fontWeight: 'bold' }}
						/>
					) : (
						<div style={{ 
							fontSize: 16, 
							fontWeight: 'bold',
							textDecoration: task.completed ? 'line-through' : 'none',
							color: task.completed ? 'var(--muted)' : 'var(--text)'
						}}>
							{task.title}
						</div>
					)}
					<div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
						Created: {getHumanDate(task.createdAt.split('T')[0])}
						{task.completedAt && (
							<span> • Completed: {getHumanDate(task.completedAt.split('T')[0])}</span>
						)}
					</div>
				</div>
			</div>

			{/* Task description */}
			<div style={{ marginBottom: 16 }}>
				<div style={{ marginBottom: 8, color: 'var(--muted)', fontSize: 14 }}>Description:</div>
				{isEditing ? (
					<textarea
						value={editDescription}
						onChange={(e) => setEditDescription(e.target.value)}
						className="note-editor"
						style={{ height: 120, fontSize: 14 }}
						placeholder="Add task description..."
					/>
				) : (
					<div style={{ 
						fontSize: 14, 
						lineHeight: 1.5,
						color: task.completed ? 'var(--muted)' : 'var(--text)',
						textDecoration: task.completed ? 'line-through' : 'none',
						minHeight: 60,
						padding: '8px 0'
					}}>
						{task.description || 'No description'}
					</div>
				)}
			</div>

			{/* Action buttons */}
			<div className="toolbar">
				{isEditing ? (
					<>
						<button className="button" onClick={handleSave}>Save</button>
						<button className="button ghost" onClick={handleCancel}>Cancel</button>
					</>
				) : (
					<>
						<button className="button ghost" onClick={handleEdit}>Edit</button>
						<button className="button ghost" onClick={handleDelete}>Delete</button>
					</>
				)}
			</div>
		</div>
	);
};
