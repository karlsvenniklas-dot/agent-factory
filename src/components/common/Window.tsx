import { ReactNode } from 'react';
import { useDraggable } from '../../hooks/useDraggable';
import type { WindowPosition } from '../../types';

interface WindowProps {
  title: string;
  children: ReactNode;
  initialPosition?: WindowPosition;
  width?: number;
  height?: number;
  className?: string;
}

export function Window({
  title,
  children,
  initialPosition,
  width = 275,
  height = 116,
  className = '',
}: WindowProps) {
  const { position, isDragging, dragRef, handleMouseDown } = useDraggable({
    initialPosition,
    width,
    height,
  });

  return (
    <div
      ref={dragRef}
      className={`winamp-window ${className} ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width,
        height,
      }}
    >
      <div className="window-title-bar" onMouseDown={handleMouseDown}>
        <span className="window-title">{title}</span>
        <div className="window-controls">
          <button className="window-btn minimize" aria-label="Minimize">_</button>
          <button className="window-btn maximize" aria-label="Maximize">□</button>
          <button className="window-btn close" aria-label="Close">×</button>
        </div>
      </div>
      <div className="window-content">{children}</div>
    </div>
  );
}
