import React, { useRef, useEffect } from 'react';

interface Props {
	onResize: (deltaX: number) => void;
}

export const ResizeHandle: React.FC<Props> = ({ onResize }) => {
	const handleRef = useRef<HTMLDivElement>(null);
	const isDragging = useRef(false);
	const startX = useRef(0);

	useEffect(() => {
		const handle = handleRef.current;
		if (!handle) return;

		const handleMouseDown = (e: MouseEvent) => {
			isDragging.current = true;
			startX.current = e.clientX;
			handle.classList.add('dragging');
			document.body.style.cursor = 'col-resize';
			document.body.style.userSelect = 'none';
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (!isDragging.current) return;
			const deltaX = e.clientX - startX.current;
			onResize(deltaX);
			startX.current = e.clientX;
		};

		const handleMouseUp = () => {
			if (isDragging.current) {
				isDragging.current = false;
				handle.classList.remove('dragging');
				document.body.style.cursor = '';
				document.body.style.userSelect = '';
			}
		};

		handle.addEventListener('mousedown', handleMouseDown);
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		return () => {
			handle.removeEventListener('mousedown', handleMouseDown);
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [onResize]);

	return <div ref={handleRef} className="resize-handle" />;
};
