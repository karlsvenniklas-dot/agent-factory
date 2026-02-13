import { useRef, useState, useEffect, useId } from 'react';
import type { WindowPosition } from '../types';
import { useWindowManager } from './useWindowManager';

interface UseDraggableOptions {
  initialPosition?: WindowPosition;
  width?: number;
  height?: number;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function useDraggable(options: UseDraggableOptions = {}) {
  const {
    initialPosition = { x: 100, y: 100 },
    width = 275,
    height = 116,
    onDragStart,
    onDragEnd,
  } = options;

  const windowId = useId();
  const [position, setPosition] = useState<WindowPosition>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef<WindowPosition>({ x: 0, y: 0 });

  const { register, unregister, update, snapPosition } = useWindowManager();

  // Register window on mount
  useEffect(() => {
    register(windowId, { id: windowId, x: position.x, y: position.y, width, height });
    return () => unregister(windowId);
  }, [windowId, width, height, register, unregister]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rawX = e.clientX - offsetRef.current.x;
      const rawY = e.clientY - offsetRef.current.y;

      const snapped = snapPosition(windowId, rawX, rawY, width, height);
      setPosition(snapped);
      update(windowId, snapped);
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
  }, [isDragging, onDragEnd, windowId, width, height, snapPosition, update]);

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
