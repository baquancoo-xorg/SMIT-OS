import { useState, useEffect } from 'react';
import DraggableTaskCard from '../components/board/DraggableTaskCard';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  arrayMove
} from '@dnd-kit/sortable';
import { DroppableColumn } from '../components/board/droppable-column';
import TaskCard from '../components/board/TaskCard';
import TaskTableView from '../components/board/TaskTableView';
import TaskModal from '../components/board/TaskModal';
import TaskDetailsModal from '../components/board/TaskDetailsModal';
import { WorkItem, Sprint } from '../types';
import { Filter } from 'lucide-react';
import ViewToggle from '../components/ui/ViewToggle';
import PrimaryActionButton from '../components/ui/PrimaryActionButton';
import { useAuth } from '../contexts/AuthContext';
import CustomFilter from '../components/ui/CustomFilter';

const COLUMNS = ['Todo', 'In Progress', 'Review', 'Done'];

export default function MarketingBoard() {
  const [view, setView] = useState<'board' | 'table'>('board');
  const [selectedSprintId, setSelectedSprintId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<WorkItem | null>(null);
  const [viewingTask, setViewingTask] = useState<WorkItem | null>(null);
  const [items, setItems] = useState<WorkItem[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activeItem, setActiveItem] = useState<WorkItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const fetchData = async () => {
    try {
      setError(null);
      const [itemRes, sprintRes] = await Promise.all([
        fetch('/api/work-items'),
        fetch('/api/sprints')
      ]);

      if (!itemRes.ok || !sprintRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await itemRes.json();
      const sprintData = await sprintRes.json();

      if (Array.isArray(data)) {
        const mktItems = data.filter((item: WorkItem) =>
          item.assignee?.departments?.includes('Marketing')
        );
        setItems(mktItems);
      }

      if (Array.isArray(sprintData)) {
        setSprints(sprintData);
        if (sprintData.length > 0 && !selectedSprintId) {
          // Auto-select current sprint based on today's date
          const today = new Date();
          const currentSprint = sprintData.find((s: Sprint) => {
            const start = new Date(s.startDate);
            const end = new Date(s.endDate);
            return today >= start && today <= end;
          });
          setSelectedSprintId(currentSprint?.id || sprintData[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch Marketing board data:', error);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const item = items.find(i => i.id === active.id);
    if (item) setActiveItem(item);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeItem = items.find(i => i.id === activeId);
    if (!activeItem) return;

    const overItem = items.find(i => i.id === overId);
    const isOverAColumn = COLUMNS.includes(overId as string);

    setItems(prev => {
      const activeIndex = prev.findIndex(i => i.id === activeId);
      const updatedItems = [...prev];

      let newStatus = activeItem.status;
      let newSprintId = activeItem.sprintId;

      if (isOverAColumn) {
        newStatus = overId as string;
        newSprintId = selectedSprintId;
      } else if (overItem) {
        newStatus = overItem.status;
        newSprintId = overItem.sprintId;
      }

      if (activeItem.status !== newStatus || activeItem.sprintId !== newSprintId) {
        updatedItems[activeIndex] = { ...activeItem, status: newStatus, sprintId: newSprintId };

        if (overItem) {
          const overIndex = prev.findIndex(i => i.id === overId);
          return arrayMove(updatedItems, activeIndex, overIndex);
        }
      }

      return updatedItems;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeItem = items.find(i => i.id === activeId);
    if (!activeItem) return;

    // Determine new status and sprint
    let newStatus = activeItem.status;
    let newSprintId = activeItem.sprintId;

    if (COLUMNS.includes(overId as string)) {
      newStatus = overId as string;
      newSprintId = selectedSprintId;
    }

    if (activeItem.status !== newStatus || activeItem.sprintId !== newSprintId) {
      try {
        const res = await fetch(`/api/work-items/${activeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus, sprintId: newSprintId })
        });
        const updated = await res.json();
        setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
      } catch (error) {
        console.error('Failed to update task status/sprint:', error);
      }
    }

    if (activeId !== overId) {
      setItems(prev => {
        const activeIndex = prev.findIndex(i => i.id === activeId);
        const overIndex = prev.findIndex(i => i.id === overId);

        if (overIndex !== -1) {
          return arrayMove(prev, activeIndex, overIndex);
        }
        return prev;
      });
    }
  };

  const handleUpdateTask = async (updatedItem: WorkItem) => {
    try {
      const res = await fetch(`/api/work-items/${updatedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      });
      const data = await res.json();
      setItems(prev => prev.map(item => item.id === data.id ? data : item));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleCreateTask = async (newTask: WorkItem) => {
    try {
      if (editingTask) {
        await handleUpdateTask(newTask);
      } else {
        const res = await fetch('/api/work-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newTask,
            id: undefined,
            sprintId: selectedSprintId || null
          })
        });
        const data = await res.json();
        setItems(prev => [data, ...prev]);
      }
      setEditingTask(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await fetch(`/api/work-items/${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleBulkDelete = (ids: string[]) => {
    setItems(prev => prev.filter(item => !ids.includes(item.id)));
  };

  const handleEditTask = (item: WorkItem) => {
    setEditingTask(item);
    setIsModalOpen(true);
  };

  const handleViewDetails = (item: WorkItem) => {
    setViewingTask(item);
    setIsDetailsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-error font-bold mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const sprintItems = selectedSprintId
    ? items.filter(i => i.sprintId === selectedSprintId)
    : items.filter(i => i.sprintId);
  // Stats items: All sprints = all items with sprintId, specific sprint = items in that sprint
  const statsItems = selectedSprintId
    ? items.filter(i => i.sprintId === selectedSprintId)
    : items.filter(i => i.sprintId);

  return (
    <div className="h-full flex flex-col gap-[var(--space-lg)] w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-[var(--space-md)] shrink-0">
        <div>
          <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
            <span className="hover:text-primary cursor-pointer">Workspaces</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">Marketing</span>
          </nav>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
            <span className="text-[#F54A00] italic">Marketing</span> Workspace
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <ViewToggle value={view} onChange={(v) => setView(v as 'board' | 'table')} />
          <PrimaryActionButton onClick={() => setIsModalOpen(true)}>
            New Task
          </PrimaryActionButton>
        </div>
      </div>

      {/* Sprint Filter Bar */}
      <div className="flex items-center justify-between bg-white/50 backdrop-blur-md p-[var(--space-md)] rounded-3xl shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
            <Filter size={14} />
            <span>Active Sprint:</span>
          </div>
          <CustomFilter
            value={selectedSprintId}
            onChange={setSelectedSprintId}
            options={[
              { value: '', label: 'All Sprints' },
              ...sprints.map(s => ({ value: s.id, label: s.name }))
            ]}
          />
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
              Total: {statsItems.length}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50">
            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Todo: {statsItems.filter(i => i.status === 'Todo').length}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              In Progress: {statsItems.filter(i => i.status === 'In Progress').length}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/5">
            <div className="w-2 h-2 rounded-full bg-secondary"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Review: {statsItems.filter(i => i.status === 'Review').length}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-tertiary/5">
            <div className="w-2 h-2 rounded-full bg-tertiary"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Done: {statsItems.filter(i => i.status === 'Done').length}
            </span>
          </div>
        </div>
      </div>

      {view === 'table' ? (
        <div className="flex-1 overflow-y-auto pb-8">
          <TaskTableView
            items={items}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
            onBulkDelete={handleBulkDelete}
            onEdit={handleEditTask}
            onViewDetails={handleViewDetails}
          />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 flex gap-[var(--space-sm)] overflow-x-auto min-h-[300px] lg:min-h-0">
              {COLUMNS.map(col => {
                const columnItems = sprintItems.filter(i => i.status === col);

                return (
                  <div key={col} className="min-w-[var(--card-min)] flex-1 flex flex-col bg-slate-50/50 rounded-3xl shadow-sm max-h-full">
                    <div className="p-[var(--space-sm)] flex items-center justify-between bg-white/30 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${col === 'Todo' ? 'bg-slate-400' :
                          col === 'In Progress' ? 'bg-primary' :
                            col === 'Review' ? 'bg-secondary' :
                              'bg-tertiary'
                          }`}></div>
                        <h3 className="font-black text-on-surface text-[10px] uppercase tracking-widest">{col}</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-white text-slate-500 text-[10px] font-black border border-slate-200 shadow-sm">
                        {columnItems.length}
                      </span>
                    </div>

                    <DroppableColumn
                      id={col}
                      items={columnItems.map(i => i.id)}
                      className="internal-scroll p-[var(--space-sm)] space-y-[var(--space-sm)]"
                    >
                      {columnItems.map(item => (
                        <DraggableTaskCard
                          key={item.id}
                          item={item}
                          onUpdate={handleUpdateTask}
                          onDelete={handleDeleteTask}
                          onEdit={handleEditTask}
                          onViewDetails={handleViewDetails}
                        />
                      ))}
                      {columnItems.length === 0 && (
                        <div className="h-32 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-2">
                          <span className="material-symbols-outlined text-3xl opacity-20">inventory_2</span>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Empty Column</span>
                        </div>
                      )}
                    </DroppableColumn>
                  </div>
                );
              })}
            </div>

          <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.5',
                },
              },
            }),
          }}>
            {activeItem ? <TaskCard item={activeItem} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        onSave={handleCreateTask}
        defaultType="MktTask"
        defaultStatus="Todo"
        initialData={editingTask}
        allowedTypes={['Campaign', 'MktTask']}
      />

      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => { setIsDetailsModalOpen(false); setViewingTask(null); }}
        task={viewingTask}
      />
    </div>
  );
}

