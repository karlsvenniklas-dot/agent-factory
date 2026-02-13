import { useRef, useState, useEffect } from 'react';
import type { WindowPosition } from '../types';

interface UseDraggableOptions {
  initialPosition?: WindowPosition;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function useDraggable(options: UseDraggableOptions = {}) {
  const { initialPosition = { x: 100, y: 100 }, onDragStart, onDragEnd } = options;

  const [position, setPosition] = useState<WindowPosition>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef<WindowPosition>({ x: 0, y: 0 });

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - offsetRef.current.x,
        y: e.clientY - offsetRef.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onDragEnd?.();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onDragEnd]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;

    const rect = dragRef.current.getBoundingClientRect();
    offsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setIsDragging(true);
    onDragStart?.();
  };

  return {
    position,
    isDragging,
    dragRef,
    handleMouseDown,
  };
}
