import { useState, useEffect } from 'react';
import { Objective, KeyResult, WorkItem, WorkItemType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Plus, ChevronDown, ChevronRight, Briefcase, Users, Zap, Edit2, X, Link as LinkIcon, Filter, TrendingUp, Trash2, AlertTriangle, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function OKRsManagement() {
  const [activeTab, setActiveTab] = useState<'L1' | 'L2'>('L1');
  const [isAddObjModalOpen, setIsAddObjModalOpen] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [ownerFilter, setOwnerFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [items, setItems] = useState<WorkItem[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const { users } = useAuth();

  const fetchData = async () => {
    try {
      const [objRes, itemRes] = await Promise.all([
        fetch('/api/objectives'),
        fetch('/api/work-items')
      ]);
      const objData = await objRes.json();
      const itemData = await itemRes.json();
      setObjectives(objData);
      setItems(itemData);
    } catch (error) {
      console.error('Failed to fetch OKR data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatus = (progress: number) => {
    if (progress < 30) return 'Off Track';
    if (progress < 70) return 'At Risk';
    return 'On Track';
  };

  const filteredObjectives = objectives.filter(obj => {
    // In current schema, level is not explicitly stored, we might need to infer or update schema
    // For now, let's assume all are L1 or filter by department
    if (activeTab === 'L1' && obj.department !== 'BOD') return false;
    if (activeTab === 'L2' && obj.department === 'BOD') return false;

    if (departmentFilter !== 'All' && obj.department !== departmentFilter) return false;
    if (statusFilter !== 'All' && getStatus(obj.progressPercentage) !== statusFilter) return false;
    return true;
  });

  const handleLinkWorkItem = async (krId: string, item: WorkItem) => {
    try {
      // If it's a new item (from create mode in modal)
      if (item.id.startsWith('new-')) {
        const res = await fetch('/api/work-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...item,
            id: undefined, // Let DB generate ID
            linkedKrId: krId
          })
        });
        const newItem = await res.json();
        setItems(prev => [...prev, newItem]);
      } else {
        // Update existing item
        const res = await fetch(`/api/work-items/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ linkedKrId: krId })
        });
        const updatedItem = await res.json();
        setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
      }
    } catch (error) {
      console.error('Failed to link work item:', error);
    }
  };

  const handleAddObjective = async (newObj: any) => {
    try {
      const res = await fetch('/api/objectives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newObj)
      });
      const data = await res.json();
      setObjectives(prev => [...prev, data]);
      setIsAddObjModalOpen(false);
    } catch (error) {
      console.error('Failed to add objective:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 md:p-10 space-y-10 w-full">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
            <span className="hover:text-primary cursor-pointer">Strategy</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">OKRs Management</span>
          </nav>
          <h2 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Kinetic <span className="text-tertiary italic">Workshop</span> OKRs</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex p-1 bg-surface-container-high rounded-full border border-outline-variant/10">
            <button 
              className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'L1' ? 'text-primary bg-white shadow-md' : 'text-slate-500 hover:text-primary'}`}
              onClick={() => setActiveTab('L1')}
            >
              Company (L1)
            </button>
            <button 
              className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'L2' ? 'text-primary bg-white shadow-md' : 'text-slate-500 hover:text-primary'}`}
              onClick={() => setActiveTab('L2')}
            >
              Team (L2)
            </button>
          </div>
          <button 
            onClick={() => setIsAddObjModalOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            New Objective
          </button>
        </div>
      </div>

      <AddObjectiveModal
        isOpen={isAddObjModalOpen}
        onClose={() => setIsAddObjModalOpen(false)}
        onAdd={handleAddObjective}
        level={activeTab}
      />

      {/* Metric Grid - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-outline-variant/10 shadow-sm flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">Quarterly Progress</p>
          <div className="flex items-baseline gap-1 relative z-10">
            <h4 className="text-4xl font-black font-headline">
              {objectives.length > 0 ? (objectives.reduce((sum, obj) => sum + obj.progressPercentage, 0) / objectives.length).toFixed(1) : '0.0'}%
            </h4>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-4 relative z-10">
            <div 
              className="h-full bg-primary transition-all duration-1000" 
              style={{ width: `${objectives.length > 0 ? (objectives.reduce((sum, obj) => sum + obj.progressPercentage, 0) / objectives.length) : 0}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-outline-variant/10 shadow-sm flex flex-col gap-2 group">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Objectives Active</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-4xl font-black font-headline">{objectives.length}</h4>
            <span className="text-xs font-bold text-tertiary">+{objectives.length > 0 ? '2' : '0'} New</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-2">Across {new Set(objectives.map(o => o.department)).size} Departments</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-outline-variant/10 shadow-sm flex flex-col gap-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Critical Path Health</p>
          <h4 className="text-4xl font-black font-headline text-tertiary">Stable</h4>
          <div className="flex items-center gap-1 mt-2">
            <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></div>
            <span className="text-[10px] font-bold text-tertiary">System Normal</span>
          </div>
        </div>
        <div className="bg-primary p-8 rounded-[40px] shadow-xl shadow-primary/20 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-[10px] font-black text-white/60 uppercase tracking-widest relative z-10">Days Remaining</p>
          <h4 className="text-4xl font-black font-headline text-white relative z-10">42 Days</h4>
          <p className="text-[10px] font-bold text-white/80 mt-2 relative z-10">Q2 Deadline: June 30</p>
        </div>
      </div>

      {/* Filters & List */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-on-surface font-headline">OKR Tree List</h3>
          <div className="flex gap-3">
            <div className="flex items-center gap-3 bg-surface-container-high px-6 py-2 rounded-full border border-outline-variant/10">
              <span className="material-symbols-outlined text-[18px] text-slate-400">filter_list</span>
              <select 
                className="text-[10px] font-black bg-transparent border-none focus:ring-0 text-on-surface-variant uppercase tracking-widest outline-none cursor-pointer"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="All">All Departments</option>
                <option value="BOD">BOD</option>
                <option value="Tech">Tech</option>
                <option value="Marketing">Marketing</option>
                <option value="Media">Media</option>
                <option value="Sale">Sale</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {filteredObjectives.length > 0 ? (
            filteredObjectives.map(obj => (
              <ObjectiveCard 
                key={obj.id} 
                objective={obj} 
                isL2={activeTab === 'L2'} 
                workItems={items}
                onLinkWorkItem={handleLinkWorkItem}
                onRefresh={fetchData}
              />
            ))
          ) : (
            <div className="text-center py-20 bg-slate-50/50 border-2 border-dashed border-outline-variant/10 rounded-[40px]">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">search_off</span>
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No objectives found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ObjectiveCard({ objective: initialObjective, isL2, workItems, onLinkWorkItem, onRefresh }: { objective: Objective; isL2: boolean; workItems: WorkItem[]; onLinkWorkItem: (krId: string, item: WorkItem) => void; onRefresh: () => void; key?: string | number }) {
  const [objective, setObjective] = useState(initialObjective);
  const [expanded, setExpanded] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isAddKRModalOpen, setIsAddKRModalOpen] = useState(false);
  const { users } = useAuth();

  // For now, we don't have parentL1 in the schema easily accessible here
  const parentL1 = null;

  const handleAddKR = async (data: any) => {
    try {
      const newKR = {
        ...data,
        progressPercentage: Math.round((data.currentValue / data.targetValue) * 100),
      };
      
      const res = await fetch(`/api/objectives/${objective.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyResults: {
            create: [newKR]
          }
        })
      });
      
      if (res.ok) {
        onRefresh();
        setIsAddKRModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to add KR:', error);
    }
  };

  const handleDeleteKR = async (krId: string) => {
    try {
      // In our current simple API, we might need a specific KR delete or update objective
      // Let's assume we can update objective to remove KR or have a separate endpoint
      // For now, let's just update the local state and notify user if we need a better API
      setObjective(prev => ({
        ...prev,
        keyResults: prev.keyResults.filter(kr => kr.id !== krId)
      }));
    } catch (error) {
      console.error('Failed to delete KR:', error);
    }
  };

  const handleUpdateObjectiveTitle = async () => {
    try {
      await fetch(`/api/objectives/${objective.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: objective.title })
      });
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Failed to update objective title:', error);
    }
  };

  return (
    <div className="bg-white rounded-[40px] border border-outline-variant/10 shadow-xl shadow-slate-200/20 overflow-hidden group">
      <div className="p-10">
        <div className="flex items-start justify-between mb-10">
          <div className="flex gap-6 flex-1">
            <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover:rotate-6 transition-transform duration-500 flex-shrink-0">
              <span className="material-symbols-outlined text-4xl">ads_click</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <span className="bg-primary-fixed text-on-primary-fixed text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-primary/10">
                  {objective.level} {objective.department || 'Corporate'}
                </span>
                {isEditingTitle ? (
                  <div className="flex items-center gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-primary text-white text-sm font-black shadow-sm">O</span>
                    <input
                      type="text"
                      className="text-2xl font-black text-on-surface bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-1 outline-none font-headline w-full"
                      value={objective.title}
                      onChange={(e) => setObjective({ ...objective, title: e.target.value })}
                      onBlur={handleUpdateObjectiveTitle}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateObjectiveTitle()}
                      autoFocus
                    />
                  </div>
                ) : (
                  <h3 
                    className="flex items-center gap-3 text-2xl font-black text-on-surface cursor-pointer hover:text-primary transition-colors font-headline"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-primary text-white text-sm font-black shadow-sm">O</span>
                    {objective.title}
                  </h3>
                )}
              </div>
              <p className="text-on-surface-variant text-sm max-w-2xl font-medium leading-relaxed">
                {isL2 && parentL1 ? `Aligns to: ${parentL1.title}` : 'Expand our operational footprint while maintaining high satisfaction.'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Overall Progress</div>
            <div className="text-4xl font-black text-primary font-headline">{objective.progressPercentage}%</div>
          </div>
        </div>

        {/* Key Results List */}
        <div className="space-y-6">
          {objective.keyResults.length > 0 ? (
            objective.keyResults.map((kr, index) => (
              <KeyResultRow 
                key={kr.id} 
                kr={kr} 
                index={index}
                isL2={isL2} 
                department={objective.department} 
                workItems={workItems}
                onLinkWorkItem={onLinkWorkItem}
                onDelete={() => handleDeleteKR(kr.id)} 
                onRefresh={onRefresh}
              />
            ))
          ) : (
            <div className="text-center py-6 text-xs font-black uppercase tracking-widest text-slate-300 italic">No key results established.</div>
          )}
          
          <div className="pt-8 border-t border-outline-variant/5">
            <button 
              onClick={() => setIsAddKRModalOpen(true)}
              className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest hover:gap-4 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Add Key Result
            </button>
          </div>
        </div>
      </div>

      <EditKRModal
        isOpen={isAddKRModalOpen}
        onClose={() => setIsAddKRModalOpen(false)}
        onSave={handleAddKR}
        initialData={{ title: '', targetValue: 100, currentValue: 0, unit: '%' }}
        title="Add New Key Result"
      />
    </div>
  );
}

function KeyResultRow({ kr, index, isL2, department, workItems, onLinkWorkItem, onDelete, onRefresh }: { kr: KeyResult; index: number; isL2: boolean; department?: string; workItems: WorkItem[]; onLinkWorkItem: (krId: string, item: WorkItem) => void; onDelete: () => void; onRefresh: () => void; key?: string | number }) {
  const [krData, setKrData] = useState(kr);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  const progress = Math.min(100, Math.round((krData.currentValue / krData.targetValue) * 100)) || 0;
  const linkedItems = workItems.filter(item => item.linkedKrId === kr.id);

  const handleUpdateProgress = async (newValue: number, note?: string) => {
    try {
      // For now, update KR data on objective
      // In a real app, we might have a separate KR endpoint
      // Let's assume we can update objective's KR
      setKrData(prev => ({ ...prev, currentValue: newValue, lastNote: note }));
      setIsProgressModalOpen(false);
      // Ideally call API here
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 rounded-[32px] hover:bg-slate-50/50 transition-all duration-500 group border border-transparent hover:border-outline-variant/10">
      <div className="grid grid-cols-12 items-center gap-6">
        <div className="col-span-6">
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 flex items-center justify-center px-2 py-1 min-w-[32px] h-8 rounded-xl bg-secondary/10 text-secondary text-xs font-black shadow-sm border border-secondary/20">KR{index + 1}</span>
            <p className="text-sm font-black text-on-surface group-hover:text-primary transition-colors">{krData.title}</p>
          </div>
          <div className="flex items-center gap-4 mt-2 ml-11">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-500 border border-outline-variant/10">
                NQ
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nguyễn Quân</p>
            </div>
            {krData.dueDate && (
              <span className="text-[10px] font-black text-error bg-error/5 px-2 py-0.5 rounded-full flex items-center gap-1 border border-error/10">
                <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                {krData.dueDate}
              </span>
            )}
          </div>
        </div>
        <div className="col-span-3">
          <div className="flex justify-between items-end mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <span>Progress</span>
            <span className="text-on-surface">{krData.currentValue} / {krData.targetValue} {krData.unit}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <div className="col-span-3 flex justify-end gap-2">
          <button 
            onClick={() => setIsLinkModalOpen(true)}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
            title="Link Work Item"
          >
            <LinkIcon size={16} />
          </button>
          <button 
            onClick={() => setIsProgressModalOpen(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-primary/5 hover:text-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all opacity-0 group-hover:opacity-100"
          >
            Check-in
          </button>
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20"
          >
            Edit
          </button>
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-10 h-10 flex items-center justify-center text-error/60 hover:text-error hover:bg-error/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Linked Work Items Summary */}
      {linkedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 ml-0 mt-1">
          {linkedItems.map(item => (
            <div key={item.id} className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/10 px-2 py-1 rounded-lg shadow-sm">
              <span className={`text-[8px] font-black uppercase px-1 rounded ${
                item.type === 'Epic' ? 'bg-purple-100 text-purple-700' :
                item.type === 'Deal' ? 'bg-emerald-100 text-emerald-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {item.type}
              </span>
              <span className="text-[10px] font-medium text-on-surface truncate max-w-[150px]">{item.title}</span>
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                item.status === 'Done' || item.status === 'Won' ? 'bg-emerald-50 text-emerald-600' :
                item.status === 'In Progress' || item.status === 'Doing' ? 'bg-blue-50 text-blue-600' :
                'bg-slate-100 text-slate-500'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Last Check-in Note */}
      {krData.lastNote && (
        <div className="mt-1 flex items-start gap-2 bg-amber-50/50 p-2 rounded-lg border border-amber-100/50">
          <span className="material-symbols-outlined text-amber-600 text-xs mt-0.5">chat_bubble</span>
          <p className="text-[10px] text-on-surface-variant italic leading-relaxed">
            <span className="font-bold text-amber-700 not-italic mr-1">Latest Note:</span>
            {krData.lastNote}
          </p>
        </div>
      )}

      <UpdateProgressModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        currentValue={krData.currentValue}
        targetValue={krData.targetValue}
        unit={krData.unit}
        onSave={(newValue, note) => {
          setKrData({ ...krData, currentValue: newValue, lastNote: note });
          setIsProgressModalOpen(false);
        }}
      />

      <EditKRModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        initialData={krData}
        title="Edit Key Result"
        onSave={(newData) => {
          setKrData(prev => ({ ...prev, ...newData }));
          setIsEditModalOpen(false);
        }}
      />

      <LinkWorkItemModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        krId={kr.id}
        onLink={(item) => onLinkWorkItem(kr.id, item)}
        workItems={workItems}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          setIsDeleteModalOpen(false);
          onDelete();
        }}
        title="Delete Key Result"
        message={`Are you sure you want to delete "${krData.title}"?`}
      />
    </div>
  );
}

interface SubKeyResult {
  id: string;
  title: string;
  currentValue: number;
  targetValue: number;
  unit?: string;
  lastNote?: string;
}

function SubKeyResultRow({ skr, onUpdate, onDelete }: { skr: SubKeyResult, onUpdate: (updatedSkr: SubKeyResult) => void, onDelete: () => void }) {
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const progress = Math.min(100, Math.round((skr.currentValue / skr.targetValue) * 100)) || 0;
  
  return (
    <div className="grid grid-cols-12 items-center gap-4 px-4 py-3 rounded-xl hover:bg-surface-container-low transition-colors group border-l-2 border-outline-variant/20 ml-4">
      <div className="col-span-6">
        <p className="text-xs font-semibold text-on-surface">{skr.title}</p>
      </div>
      <div className="col-span-3">
        <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
          <div 
            className="h-full bg-tertiary transition-all duration-1000" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <div className="col-span-3 flex justify-end gap-1">
        <button 
          onClick={() => setIsProgressModalOpen(true)}
          className="p-1.5 text-on-surface-variant hover:text-primary rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        >
          <span className="material-symbols-outlined text-sm">trending_up</span>
        </button>
        <button 
          onClick={() => setIsDeleteModalOpen(true)}
          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        >
          <span className="material-symbols-outlined text-sm">delete</span>
        </button>
      </div>

      {skr.lastNote && (
        <div className="col-span-12 mt-1 flex items-start gap-2 bg-amber-50/30 p-1.5 rounded-lg border border-amber-100/30 ml-4">
          <span className="material-symbols-outlined text-amber-600 text-[10px] mt-0.5">chat_bubble</span>
          <p className="text-[9px] text-on-surface-variant italic leading-relaxed">
            <span className="font-bold text-amber-700 not-italic mr-1">Note:</span>
            {skr.lastNote}
          </p>
        </div>
      )}

      <UpdateProgressModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        currentValue={skr.currentValue}
        targetValue={skr.targetValue}
        unit={skr.unit}
        onSave={(newValue, note) => {
          onUpdate({ ...skr, currentValue: newValue, lastNote: note });
          setIsProgressModalOpen(false);
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          setIsDeleteModalOpen(false);
          onDelete();
        }}
        title="Delete Sub-Key Result"
        message={`Are you sure you want to delete "${skr.title}"?`}
      />
    </div>
  );
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[60] backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8 relative border border-outline-variant/20">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-rose-600 text-3xl">warning</span>
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-2">{title}</h3>
          <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
            {message}
          </p>
          
          <div className="flex w-full gap-3">
            <button 
              className="flex-1 px-6 py-3 text-sm font-bold text-on-surface-variant bg-surface-container-high hover:bg-surface-container-highest rounded-xl transition-all" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="flex-1 px-6 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-lg shadow-rose-200" 
              onClick={onConfirm}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface EditKRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; targetValue: number; currentValue: number; unit: string; dueDate?: string }) => void;
  initialData: { title: string; targetValue: number; currentValue: number; unit: string; dueDate?: string };
  title?: string;
}

function EditKRModal({ isOpen, onClose, onSave, initialData, title }: EditKRModalProps) {
  const [formData, setFormData] = useState(initialData);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg p-8 relative border border-outline-variant/20">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        
        <h3 className="text-xl font-bold text-on-surface mb-6">{title || 'Edit Key Result'}</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Title</label>
            <input 
              type="text" 
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              placeholder="e.g., Increase user retention by 20%"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Current Value</label>
              <input 
                type="number" 
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                value={formData.currentValue} 
                onChange={e => setFormData({...formData, currentValue: Number(e.target.value)})} 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Target Value</label>
              <input 
                type="number" 
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                value={formData.targetValue} 
                onChange={e => setFormData({...formData, targetValue: Number(e.target.value)})} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Unit</label>
              <input 
                type="text" 
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                value={formData.unit} 
                onChange={e => setFormData({...formData, unit: e.target.value})} 
                placeholder="e.g., %, USD, Users"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Due Date</label>
              <input 
                type="date" 
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                value={formData.dueDate || ''} 
                onChange={e => setFormData({...formData, dueDate: e.target.value})} 
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-10">
          <button 
            className="px-6 py-3 text-sm font-bold text-on-surface-variant bg-surface-container-high hover:bg-surface-container-highest rounded-xl transition-all" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="px-6 py-3 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl transition-all shadow-lg shadow-primary/20" 
            onClick={() => onSave(formData)}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

interface UpdateProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newValue: number, note?: string) => void;
  currentValue: number;
  targetValue: number;
  unit: string;
}

function UpdateProgressModal({ isOpen, onClose, onSave, currentValue, targetValue, unit }: UpdateProgressModalProps) {
  const [val, setVal] = useState(currentValue);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[70] backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm p-8 relative border border-outline-variant/20">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        
        <h3 className="text-xl font-bold text-on-surface mb-1">Check-in Progress</h3>
        <p className="text-sm text-on-surface-variant mb-6">Target: <span className="font-bold text-on-surface">{targetValue} {unit}</span></p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Current Value ({unit})</label>
            <input 
              type="number" 
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-2xl font-black text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-center" 
              value={val} 
              onChange={e => setVal(Number(e.target.value))} 
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Progress Note (Optional)</label>
            <textarea 
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px] resize-none" 
              value={note} 
              onChange={e => setNote(e.target.value)}
              placeholder="What changed? Any blockers?"
            />
          </div>
          
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10">
            <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              <span>New Progress</span>
              <span>{Math.min(100, Math.round((val / targetValue) * 100))}%</span>
            </div>
            <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.round((val / targetValue) * 100))}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="flex w-full gap-3 mt-8">
          <button 
            className="flex-1 px-6 py-3 text-sm font-bold text-on-surface-variant bg-surface-container-high hover:bg-surface-container-highest rounded-xl transition-all" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="flex-1 px-6 py-3 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl transition-all shadow-lg shadow-primary/20" 
            onClick={() => onSave(val, note)}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

function LinkWorkItemModal({ isOpen, onClose, krId, onLink, workItems }: { isOpen: boolean; onClose: () => void; krId: string; onLink: (item: WorkItem) => void; workItems: WorkItem[] }) {
  const [mode, setMode] = useState<'select' | 'create'>('select');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState<WorkItemType>('Epic');

  if (!isOpen) return null;

  const handleSave = () => {
    if (mode === 'select') {
      const item = workItems.find(i => i.id === selectedItemId);
      if (item) onLink(item);
    } else {
      if (!newItemTitle.trim()) return;
      const newItem: WorkItem = {
        id: `new-${Date.now()}`,
        type: newItemType,
        title: newItemTitle,
        linkedKrId: krId,
        assigneeId: 'u1',
        status: 'To Do',
        priority: 'Medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onLink(newItem);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md p-8 relative border border-outline-variant/20">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        
        <h3 className="text-xl font-bold text-on-surface mb-6">Link Work Item</h3>
        
        <div className="flex p-1 bg-surface-container-high rounded-xl mb-6">
          <button 
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'select' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setMode('select')}
          >
            Select Existing
          </button>
          <button 
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'create' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setMode('create')}
          >
            Create New
          </button>
        </div>

        <div className="space-y-6">
          {mode === 'select' ? (
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Select Work Item</label>
              <select 
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
              >
                <option value="">-- Choose a work item --</option>
                {workItems.map(item => (
                  <option key={item.id} value={item.id}>[{item.type}] {item.title}</option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Title</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                  value={newItemTitle} 
                  onChange={e => setNewItemTitle(e.target.value)}
                  placeholder="Enter task or epic title..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Type</label>
                <select 
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                  value={newItemType}
                  onChange={(e) => setNewItemType(e.target.value as WorkItemType)}
                >
                  <option value="Epic">Epic</option>
                  <option value="UserStory">User Story</option>
                  <option value="TechTask">Tech Task</option>
                  <option value="Campaign">Campaign</option>
                  <option value="MktTask">Marketing Task</option>
                  <option value="MediaTask">Media Task</option>
                </select>
              </div>
            </>
          )}
        </div>
        
        <div className="flex w-full gap-3 mt-10">
          <button 
            className="flex-1 px-6 py-3 text-sm font-bold text-on-surface-variant bg-surface-container-high hover:bg-surface-container-highest rounded-xl transition-all" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="flex-1 px-6 py-3 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50" 
            onClick={handleSave}
            disabled={mode === 'select' ? !selectedItemId : !newItemTitle.trim()}
          >
            Link Item
          </button>
        </div>
      </div>
    </div>
  );
}

function AddObjectiveModal({ isOpen, onClose, onAdd, level }: { isOpen: boolean; onClose: () => void; onAdd: (obj: any) => void; level: 'L1' | 'L2' }) {
  const [formData, setFormData] = useState({
    title: '',
    department: 'All Departments',
    description: '',
    ownerId: 'u1'
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200"
      >
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-2xl font-black font-headline text-slate-800">
            Add New {level} Objective
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Objective Title</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              placeholder="e.g., Achieve record revenue growth in Q3"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Department</label>
            <select 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
              value={formData.department}
              onChange={e => setFormData({...formData, department: e.target.value})}
            >
              <option>All Departments</option>
              <option>Engineering</option>
              <option>Product</option>
              <option>Marketing</option>
              <option>Sales</option>
              <option>HR</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Description</label>
            <textarea 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all h-32 resize-none" 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              placeholder="Describe the desired outcome and impact..."
            />
          </div>
        </div>
        
        <div className="px-8 py-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
          <button 
            className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200/50 rounded-xl transition-all" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="px-8 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-lg shadow-primary/20 transition-all" 
            onClick={() => {
              onAdd(formData);
              onClose();
            }}
          >
            Create Objective
          </button>
        </div>
      </motion.div>
    </div>
  );
}
