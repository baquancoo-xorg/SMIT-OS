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
import { LayoutGrid, List, ChevronDown, Filter, Search, Database } from 'lucide-react';

const COLUMNS = ['To Do', 'In Progress', 'Code Review', 'Done'];
const SPRINTS = [
  { id: 'backlog', name: 'Product Backlog' },
  { id: 's1', name: 'Sprint 1: Kinetic Echo' },
  { id: 's2', name: 'Sprint 2: Solar Flare' },
  { id: 's3', name: 'Sprint 3: Deep Blue' },
];

export default function TechScrumBoard() {
  const [view, setView] = useState<'board' | 'table'>('board');
  const [selectedSprintId, setSelectedSprintId] = useState('s1');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<WorkItem | null>(null);
  const [viewingTask, setViewingTask] = useState<WorkItem | null>(null);
  const [items, setItems] = useState<WorkItem[]>([]);
  const [activeItem, setActiveItem] = useState<WorkItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/work-items');
        if (res.ok) {
          const data = await res.json();
          setItems(data.filter((item: WorkItem) => ['Epic', 'UserStory', 'TechTask'].includes(item.type)));
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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
    const isOverBacklog = overId === 'backlog';

    setItems(prev => {
      const activeIndex = prev.findIndex(i => i.id === activeId);
      const updatedItems = [...prev];
      
      let newStatus = activeItem.status;
      let newSprintId = activeItem.sprintId;

      if (isOverBacklog) {
        newSprintId = undefined;
        // Keep status or reset to To Do? Let's keep it but it's in backlog now
      } else if (isOverAColumn) {
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

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

  const handleUpdateTask = (updatedItem: WorkItem) => {
    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleCreateTask = (newTask: WorkItem) => {
    if (editingTask) {
      handleUpdateTask(newTask);
    } else {
      setItems(prev => [newTask, ...prev]);
    }
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
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

  const backlogItems = items.filter(i => !i.sprintId);
  const sprintItems = items.filter(i => i.sprintId === selectedSprintId);

  return (
    <div className="h-full flex flex-col p-6 lg:p-10 space-y-6 w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 mb-1 text-on-surface-variant font-medium text-xs">
            <span className="hover:text-primary cursor-pointer">Tech&Product</span>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-on-surface">Agile Board</span>
          </nav>
          <h2 className="text-3xl font-black font-headline tracking-tight text-on-surface flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Database size={20} />
            </span>
            Tech&Product Workspace
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-surface-container-high rounded-full border border-outline-variant/10">
            <button 
              onClick={() => setView('board')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${view === 'board' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-primary'}`}
            >
              <LayoutGrid size={12} />
              Board
            </button>
            <button 
              onClick={() => setView('table')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${view === 'table' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-primary'}`}
            >
              <List size={12} />
              Table
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-lg shadow-primary/20 hover:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Task
          </button>
        </div>
      </div>

      {/* Sprint Filter Bar */}
      <div className="flex items-center justify-between bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-outline-variant/10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
            <Filter size={14} />
            <span>Active Sprint:</span>
          </div>
          <div className="relative">
            <select 
              value={selectedSprintId}
              onChange={(e) => setSelectedSprintId(e.target.value)}
              className="appearance-none bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2 pr-10 text-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-surface-container"
            >
              {SPRINTS.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Velocity: 42 Pts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-tertiary"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Done: 68%</span>
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
          <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden min-h-0">
            {/* Product Backlog (25%) */}
            <div className="w-full lg:w-1/4 h-[400px] lg:h-auto flex flex-col bg-surface-container-low/30 rounded-[32px] border border-outline-variant/10 overflow-hidden shrink-0 lg:shrink">
              <div className="p-5 flex items-center justify-between border-b border-outline-variant/5 bg-white/40">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">inventory_2</span>
                  <h3 className="font-black text-on-surface text-xs uppercase tracking-widest">Product Backlog</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black">
                  {backlogItems.length}
                </span>
              </div>
              
              <SortableContext 
                id="backlog"
                items={backlogItems.map(i => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                  {backlogItems.map(item => (
                    <DraggableTaskCard 
                      key={item.id} 
                      item={item} 
                      onUpdate={handleUpdateTask} 
                      onDelete={handleDeleteTask}
                      onEdit={handleEditTask}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                  {backlogItems.length === 0 && (
                    <div className="h-40 border-2 border-dashed border-outline-variant/20 rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-2">
                      <span className="material-symbols-outlined text-4xl opacity-20">inbox</span>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Backlog is empty</span>
                    </div>
                  )}
                </div>
              </SortableContext>
            </div>

            {/* Active Sprint Board (75%) */}
            <div className="w-full lg:w-3/4 flex gap-4 overflow-x-auto pb-4 items-start custom-scrollbar h-[500px] lg:h-auto shrink-0 lg:shrink">
              {COLUMNS.map(col => {
                const columnItems = sprintItems.filter(i => i.status === col);
                
                return (
                  <div key={col} className="min-w-[280px] flex-1 flex flex-col bg-slate-50/50 rounded-[32px] border border-slate-200/50 h-full max-h-full overflow-hidden">
                    <div className="p-4 flex items-center justify-between bg-white/30">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          col === 'To Do' ? 'bg-slate-400' :
                          col === 'In Progress' ? 'bg-primary' :
                          col === 'Code Review' ? 'bg-secondary' :
                          'bg-tertiary'
                        }`}></div>
                        <h3 className="font-black text-on-surface text-[10px] uppercase tracking-widest">{col}</h3>
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
                      <div className="flex-1 p-3 space-y-4 overflow-y-auto custom-scrollbar min-h-[200px]">
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
                      </div>
                    </SortableContext>
                  </div>
                );
              })}
            </div>
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
        defaultType="TechTask"
        defaultStatus="To Do"
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


