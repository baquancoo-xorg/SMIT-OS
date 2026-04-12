import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';
import { WorkItem } from '../../types';

interface DraggableTaskCardProps {
  item: WorkItem;
  onUpdate?: (updatedItem: WorkItem) => void;
  key?: string | number;
}

export default function DraggableTaskCard({ item, onUpdate }: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard item={item} onUpdate={onUpdate} />
    </div>
  );
}
