import { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface DroppableColumnProps {
  id: string;
  items: string[];
  children: ReactNode;
  className?: string;
}

export function DroppableColumn({ id, items, children, className = '' }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'ring-2 ring-primary/50 bg-primary/5' : ''} transition-all duration-200`}
    >
      <SortableContext
        id={id}
        items={items}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </div>
  );
}
