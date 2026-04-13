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
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import TaskCard from '../components/board/TaskCard';
import TaskTableView from '../components/board/TaskTableView';
import TaskModal from '../components/board/TaskModal';
import TaskDetailsModal from '../components/board/TaskDetailsModal';
import { WorkItem } from '../types';
import { LayoutGrid, List } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const COLUMNS = ['Idea', 'Doing', 'Review', 'Done'];

export default function MarketingKanban() {
  const [view, setView] = useState<'board' | 'table'>('board');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<WorkItem | null>(null);
  const [viewingTask, setViewingTask] = useState<WorkItem | null>(null);
  const [items, setItems] = useState<WorkItem[]>([]);
  const [activeItem, setActiveItem] = useState<WorkItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const fetchData = async () => {
    try {
      setError(null);
      const res = await fetch('/api/work-items');

      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        const mktItems = data.filter((item: WorkItem) =>
          ['Campaign', 'MktTask', 'Task'].includes(item.type)
        );
        setItems(mktItems);
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
    const overItem = items.find(i => i.id === overId);

    const isOverAColumn = COLUMNS.includes(overId as string);

    if (activeItem) {
      if (overItem && activeItem.status !== overItem.status) {
        setItems(prev => {
          const activeIndex = prev.findIndex(i => i.id === activeId);
          const overIndex = prev.findIndex(i => i.id === overId);

          const updatedItems = [...prev];
          updatedItems[activeIndex] = { ...activeItem, status: overItem.status };
          return arrayMove(updatedItems, activeIndex, overIndex);
        });
      } else if (isOverAColumn && activeItem.status !== overId) {
        setItems(prev => {
          const activeIndex = prev.findIndex(i => i.id === activeId);
          const updatedItems = [...prev];
          updatedItems[activeIndex] = { ...activeItem, status: overId as string };
          return updatedItems;
        });
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeItem = items.find(i => i.id === activeId);
    if (!activeItem) return;

    let newStatus = activeItem.status;
    if (COLUMNS.includes(overId as string)) {
      newStatus = overId as string;
    }

    if (activeItem.status !== newStatus) {
      try {
        const res = await fetch(`/api/work-items/${activeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        const updated = await res.json();
        setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
      } catch (error) {
        console.error('Failed to update task status:', error);
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
            assigneeId: currentUser?.id
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

  return (
    <div className="h-full flex flex-col p-6 md:p-10 space-y-8 w-full">
      {/* Marketing Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
            <span className="hover:text-primary cursor-pointer">Marketing</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">Campaigns</span>
          </nav>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Marketing <span className="text-secondary">Kanban</span></h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-surface-container-high rounded-full border border-outline-variant/10">
            <button
              onClick={() => setView('board')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${view === 'board' ? 'bg-white text-primary shadow-md' : 'text-slate-500 hover:text-primary'}`}
            >
              <LayoutGrid size={14} />
              Board
            </button>
            <button
              onClick={() => setView('table')}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${view === 'table' ? 'bg-white text-primary shadow-md' : 'text-slate-500 hover:text-primary'}`}
            >
              <List size={14} />
              Table
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            New Task
          </button>
        </div>
      </div>

      {/* Active Sprint Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
            <span className="material-symbols-outlined">campaign</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Campaigns</p>
            <h4 className="text-xl font-black font-headline">{items.filter(i => i.type === 'Campaign').length}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined">group_add</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Leads</p>
            <h4 className="text-xl font-black font-headline">{items.reduce((sum, i) => sum + (i.leadsCount || 0), 0).toLocaleString()}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined">trending_up</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conversion</p>
            <h4 className="text-xl font-black font-headline">{items.length > 0 ? '4.8%' : '0%'}</h4>
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
          <div className="flex-1 flex gap-6 overflow-x-auto pb-4 items-start">
            {COLUMNS.map(col => {
              const columnItems = items.filter(i => i.status === col);

              return (
                <div key={col} className="min-w-[320px] w-[320px] flex flex-col bg-slate-50/50 rounded-3xl border border-slate-200/50">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${col === 'Idea' ? 'bg-slate-400' :
                        col === 'Doing' ? 'bg-primary' :
                          col === 'Review' ? 'bg-secondary' :
                            'bg-tertiary'
                        }`}></div>
                      <h3 className="font-black text-on-surface text-xs uppercase tracking-widest">{col}</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white text-slate-500 text-[10px] font-black border border-slate-200 shadow-sm">
                      {columnItems.length}
                    </span>
                  </div>

                  <SortableContext
                    id={col}
                    items={columnItems.map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex-1 p-3 space-y-4 min-h-[200px]">
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
                        <div className="h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2">
                          <span className="material-symbols-outlined text-3xl opacity-20">inventory_2</span>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Empty Column</span>
                        </div>
                      )}
                    </div>
                  </SortableContext>
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
        defaultStatus="Idea"
        initialData={editingTask}
      />

      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => { setIsDetailsModalOpen(false); setViewingTask(null); }}
        task={viewingTask}
      />
    </div>
  );
}

