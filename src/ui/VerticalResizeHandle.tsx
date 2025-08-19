import React, { useRef, useEffect } from 'react';

interface Props {
	onResize: (deltaY: number) => void;
}

export const VerticalResizeHandle: React.FC<Props> = ({ onResize }) => {
	const handleRef = useRef<HTMLDivElement>(null);
	const isDragging = useRef(false);
	const startY = useRef(0);

	useEffect(() => {
		const handle = handleRef.current;
		if (!handle) return;

		const handleMouseDown = (e: MouseEvent) => {
			isDragging.current = true;
			startY.current = e.clientY;
			handle.classList.add('dragging');
			document.body.style.cursor = 'row-resize';
			document.body.style.userSelect = 'none';
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (!isDragging.current) return;
			const deltaY = e.clientY - startY.current;
			onResize(deltaY);
			startY.current = e.clientY;
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

	return <div ref={handleRef} className="vertical-resize-handle" />;
};
