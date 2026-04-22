import { useState, useEffect } from 'react';
import { Objective, KeyResult, WorkItem, WorkItemType, User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Plus, ChevronDown, ChevronRight, Briefcase, Users, Zap, Edit2, X, Link as LinkIcon, Filter, TrendingUp, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CustomSelect from '../components/ui/CustomSelect';
import CustomFilter from '../components/ui/CustomFilter';

export default function OKRsManagement() {
  const [activeTab, setActiveTab] = useState<'L1' | 'L2'>('L1');
  const [isAddObjModalOpen, setIsAddObjModalOpen] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [ownerFilter, setOwnerFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [items, setItems] = useState<WorkItem[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());
  const { users } = useAuth();

  // Department-specific color configuration
  // Tech: #0059B6, Marketing: #F54A00, Media: #E60076, Sale: #009966
  const deptColors: Record<string, { bg: string; text: string; border: string; icon: string; badge: string }> = {
    BOD: { bg: 'bg-primary/5', text: 'text-primary', border: 'border-primary/10', icon: 'bg-primary', badge: 'bg-primary-fixed text-on-primary-fixed border-primary/10' },
    Sale: { bg: 'bg-[#009966]/10', text: 'text-[#009966]', border: 'border-[#009966]/20', icon: 'bg-[#009966]', badge: 'bg-[#009966]/10 text-[#009966] border-[#009966]/20' },
    Tech: { bg: 'bg-[#0059B6]/10', text: 'text-[#0059B6]', border: 'border-[#0059B6]/20', icon: 'bg-[#0059B6]', badge: 'bg-[#0059B6]/10 text-[#0059B6] border-[#0059B6]/20' },
    Marketing: { bg: 'bg-[#F54A00]/10', text: 'text-[#F54A00]', border: 'border-[#F54A00]/20', icon: 'bg-[#F54A00]', badge: 'bg-[#F54A00]/10 text-[#F54A00] border-[#F54A00]/20' },
    Media: { bg: 'bg-[#E60076]/10', text: 'text-[#E60076]', border: 'border-[#E60076]/20', icon: 'bg-[#E60076]', badge: 'bg-[#E60076]/10 text-[#E60076] border-[#E60076]/20' },
  };

  const getDeptColor = (department: string) => {
    return deptColors[department] || deptColors.BOD;
  };

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

  // Calculate Days Remaining until Q2 deadline (June 30)
  const getQ2Deadline = () => {
    const now = new Date();
    const year = now.getMonth() > 5 ? now.getFullYear() + 1 : now.getFullYear(); // If past June, use next year
    const q2End = new Date(year, 5, 30); // June 30
    const diffTime = q2End.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { daysLeft: Math.max(0, diffDays), deadline: q2End };
  };

  // Calculate Critical Path Health based on objectives status
  const getCriticalPathHealth = () => {
    if (objectives.length === 0) return { status: 'No Data', color: 'text-slate-400', bgColor: 'bg-slate-400', message: 'No objectives' };

    const offTrack = objectives.filter(obj => obj.progressPercentage < 30).length;
    const atRisk = objectives.filter(obj => obj.progressPercentage >= 30 && obj.progressPercentage < 70).length;
    const onTrack = objectives.filter(obj => obj.progressPercentage >= 70).length;

    const offTrackPct = (offTrack / objectives.length) * 100;
    const atRiskPct = (atRisk / objectives.length) * 100;

    if (offTrackPct > 30) {
      return { status: 'Critical', color: 'text-error', bgColor: 'bg-error', message: `${offTrack} objectives off track` };
    } else if (offTrackPct > 10 || atRiskPct > 50) {
      return { status: 'At Risk', color: 'text-amber-500', bgColor: 'bg-amber-500', message: `${atRisk} objectives at risk` };
    } else if (onTrack === objectives.length) {
      return { status: 'Excellent', color: 'text-emerald-500', bgColor: 'bg-emerald-500', message: 'All on track' };
    } else {
      return { status: 'Stable', color: 'text-tertiary', bgColor: 'bg-tertiary', message: 'System normal' };
    }
  };

  const q2Info = getQ2Deadline();
  const healthInfo = getCriticalPathHealth();

  // L1 (Company) = objectives with department === 'BOD' (top-level company objectives)
  // L2 (Team) = objectives with department !== 'BOD' (team/department objectives)
  // Also support new parentId-based hierarchy
  const getL1Objectives = () => {
    return objectives.filter(obj => obj.department === 'BOD');
  };

  const getL2Objectives = () => {
    return objectives.filter(obj => obj.department !== 'BOD');
  };

  const getChildren = (parentId: string) => {
    return objectives.filter(obj => obj.parentId === parentId);
  };

  const toggleExpand = (objId: string) => {
    setExpandedObjectives(prev => {
      const newSet = new Set(prev);
      if (newSet.has(objId)) {
        newSet.delete(objId);
      } else {
        newSet.add(objId);
      }
      return newSet;
    });
  };

  const filteredL1Objectives = getL1Objectives().filter(obj => {
    if (departmentFilter !== 'All' && obj.department !== departmentFilter) return false;
    if (statusFilter !== 'All' && getStatus(obj.progressPercentage) !== statusFilter) return false;
    return true;
  });

  const filteredL2Objectives = getL2Objectives().filter(obj => {
    if (departmentFilter !== 'All' && obj.department !== departmentFilter) return false;
    if (statusFilter !== 'All' && getStatus(obj.progressPercentage) !== statusFilter) return false;
    return true;
  });

  const handleLinkWorkItem = async (krId: string, item: WorkItem) => {
    try {
      let workItemId = item.id;

      if (item.id.startsWith('new-')) {
        // Create new work item first
        const res = await fetch('/api/work-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...item,
            id: undefined,
          })
        });
        const newItem = await res.json();
        workItemId = newItem.id;
        setItems(prev => [...prev, newItem]);
      }

      // Link work item to KR via junction table
      await fetch(`/api/work-items/${workItemId}/kr-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyResultId: krId })
      });

      // Refresh items to get updated krLinks
      const res = await fetch('/api/work-items');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to link work item:', error);
    }
  };

  const handleLinkObjective = async (krId: string, parentKrId: string) => {
    try {
      const res = await fetch(`/api/key-results/${krId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentKrId })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to link objective:', error);
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
    <div className="h-full flex flex-col gap-[var(--space-lg)] w-full">
      {/* Dashboard Header - C1: Responsive layout */}
      <div className="flex flex-col gap-[var(--space-md)] md:flex-row md:items-end justify-between shrink-0">
        <div className="min-w-0">
          <nav className="flex items-center gap-2 mb-2 text-on-surface-variant font-medium text-sm">
            <span className="hover:text-primary cursor-pointer">Planning</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">OKRs</span>
          </nav>
          <h2 className="text-2xl md:text-4xl font-extrabold font-headline tracking-tight text-on-surface">
            <span className="hidden sm:inline">Kinetic</span>
            <span className="sm:hidden">KW</span> <span className="text-tertiary italic hidden sm:inline">Workshop</span> OKRs
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex h-10 bg-surface-container-high rounded-full shadow-sm self-start">
            <button
              className={`px-5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'L1' ? 'text-primary bg-white shadow-sm' : 'text-slate-500 hover:text-primary'}`}
              onClick={() => setActiveTab('L1')}
            >
              <span className="hidden sm:inline">Company (</span>L1<span className="hidden sm:inline">)</span>
            </button>
            <button
              className={`px-5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'L2' ? 'text-primary bg-white shadow-sm' : 'text-slate-500 hover:text-primary'}`}
              onClick={() => setActiveTab('L2')}
            >
              <span className="hidden sm:inline">Team (</span>L2<span className="hidden sm:inline">)</span>
            </button>
          </div>
          <button
            onClick={() => setIsAddObjModalOpen(true)}
            className="flex items-center justify-center gap-2 h-10 bg-primary text-white px-5 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-95 transition-all min-w-[130px] whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            New Objective
          </button>
        </div>
      </div>

      <AddObjectiveModal
        isOpen={isAddObjModalOpen}
        onClose={() => setIsAddObjModalOpen(false)}
        onAdd={handleAddObjective}
        level={activeTab}
        objectives={objectives}
      />

      {/* Metric Grid - Bento Style - Tablet optimized */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 shrink-0">
        <div className="bg-white/50 backdrop-blur-md border border-white/20 p-4 xl:p-6 rounded-3xl shadow-sm flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 xl:w-32 xl:h-32 bg-primary/5 rounded-full -mr-10 -mt-10 xl:-mr-16 xl:-mt-16 group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">Quarterly Progress</p>
          <div className="flex items-baseline gap-1 relative z-10">
            <h4 className="text-2xl xl:text-4xl font-black font-headline">
              {objectives.length > 0 ? (objectives.reduce((sum, obj) => sum + obj.progressPercentage, 0) / objectives.length).toFixed(1) : '0.0'}%
            </h4>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-2 relative z-10">
            <div
              className="h-full bg-primary transition-all duration-1000"
              style={{ width: `${objectives.length > 0 ? (objectives.reduce((sum, obj) => sum + obj.progressPercentage, 0) / objectives.length) : 0}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-white/50 backdrop-blur-md border border-white/20 p-4 xl:p-6 rounded-3xl shadow-sm flex flex-col gap-2 group">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Objectives Active</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl xl:text-4xl font-black font-headline">{objectives.length}</h4>
            <span className="text-xs font-bold text-tertiary">+{objectives.length > 0 ? '2' : '0'} New</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-1">Across {new Set(objectives.map(o => o.department)).size} Depts</p>
        </div>
        <div className="bg-white/50 backdrop-blur-md border border-white/20 p-4 xl:p-6 rounded-3xl shadow-sm flex flex-col gap-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Critical Path</p>
          <h4 className={`text-2xl xl:text-4xl font-black font-headline ${healthInfo.color}`}>{healthInfo.status}</h4>
          <div className="flex items-center gap-1 mt-1">
            <div className={`w-2 h-2 rounded-full ${healthInfo.bgColor} animate-pulse`}></div>
            <span className={`text-[10px] font-bold ${healthInfo.color}`}>{healthInfo.message}</span>
          </div>
        </div>
        <div className="bg-primary p-4 xl:p-6 rounded-3xl shadow-xl shadow-primary/20 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-20 h-20 xl:w-32 xl:h-32 bg-white/10 rounded-full -ml-10 -mb-10 xl:-ml-16 xl:-mb-16 group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-[10px] font-black text-white/60 uppercase tracking-widest relative z-10">Days Left</p>
          <h4 className="text-2xl xl:text-4xl font-black font-headline text-white relative z-10">{q2Info.daysLeft}</h4>
          <p className="text-[10px] font-bold text-white/80 mt-1 relative z-10">Q2: {q2Info.deadline.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' })}</p>
        </div>
      </div>

      {/* Filters & List - scrollable content */}
      <div className="flex-1 overflow-y-auto pb-8 space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-on-surface font-headline">OKR Tree List</h3>
          <div className="flex gap-3">
            <CustomFilter
              value={departmentFilter}
              onChange={setDepartmentFilter}
              options={[
                { value: 'All', label: 'All Departments' },
                { value: 'Tech', label: 'Tech' },
                { value: 'Marketing', label: 'Marketing' },
                { value: 'Media', label: 'Media' },
                { value: 'Sale', label: 'Sale' }
              ]}
              icon={<Filter size={14} />}
            />
          </div>
        </div>

        <div className="space-y-6">
          {activeTab === 'L1' ? (
            filteredL1Objectives.length > 0 ? (
              filteredL1Objectives.map(obj => (
                <ObjectiveAccordionCard
                  key={obj.id}
                  objective={obj}
                  children={getChildren(obj.id)}
                  workItems={items}
                  objectives={objectives}
                  onLinkWorkItem={handleLinkWorkItem}
                  onRefresh={fetchData}
                  isExpanded={expandedObjectives.has(obj.id)}
                  onToggleExpand={() => toggleExpand(obj.id)}
                  getDeptColor={getDeptColor}
                />
              ))
            ) : (
              <div className="text-center py-12 md:py-20 bg-slate-50/50 border-2 border-dashed border-outline-variant/10 rounded-3xl md:rounded-3xl">
                <span className="material-symbols-outlined text-3xl md:text-4xl text-slate-300 mb-4">search_off</span>
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] md:text-xs">No L1 objectives found matching your filters.</p>
              </div>
            )
          ) : (
            filteredL2Objectives.length > 0 ? (
              filteredL2Objectives.map(obj => {
                const parent = objectives.find(o => o.id === obj.parentId);
                return (
                  <ObjectiveAccordionCardL2
                    key={obj.id}
                    objective={obj}
                    parentObjective={parent || null}
                    workItems={items}
                    objectives={objectives}
                    onLinkWorkItem={handleLinkWorkItem}
                    onLinkObjective={handleLinkObjective}
                    onRefresh={fetchData}
                    getDeptColor={getDeptColor}
                  />
                );
              })
            ) : (
              <div className="text-center py-12 md:py-20 bg-slate-50/50 border-2 border-dashed border-outline-variant/10 rounded-3xl md:rounded-3xl">
                <span className="material-symbols-outlined text-3xl md:text-4xl text-slate-300 mb-4">search_off</span>
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] md:text-xs">No L2 objectives found matching your filters.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// Accordion-style L1 Objective Card with expandable L2 children
function ObjectiveAccordionCard({
  objective,
  children,
  workItems,
  objectives,
  onLinkWorkItem,
  onRefresh,
  isExpanded,
  onToggleExpand,
  getDeptColor,
  key: _key,
}: {
  objective: Objective;
  children: Objective[];
  workItems: WorkItem[];
  objectives: Objective[];
  onLinkWorkItem: (krId: string, item: WorkItem) => void;
  onRefresh: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  getDeptColor: (dept: string) => { bg: string; text: string; border: string; icon: string; badge: string };
  key?: string | number;
}) {
  const colors = getDeptColor(objective.department);

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-3xl shadow-sm border border-white/20 overflow-hidden group">
      {/* L1 Objective Header - Clickable to expand/collapse */}
      <div
        onClick={onToggleExpand}
        className="p-5 md:p-6 lg:p-8 cursor-pointer hover:bg-slate-50/50 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-4 md:gap-6 flex-1">
          <div className={`w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-3xl md:rounded-3xl ${colors.bg} flex items-center justify-center ${colors.text} border ${colors.border} flex-shrink-0`}>
            <span className="material-symbols-outlined text-2xl md:text-3xl">ads_click</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 md:gap-3 mb-1 flex-wrap">
              <span className={`${colors.badge} text-[8px] md:text-[10px] px-2 md:px-3 py-1 rounded-full font-black uppercase tracking-widest border`}>
                L1 - {objective.department}
              </span>
              <span className={`flex-shrink-0 flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-xl ${colors.icon} text-white text-xs font-black shadow-sm`}>O</span>
            </div>
            <h3 className={`text-base md:text-lg lg:text-xl font-black text-on-surface font-headline hover:${colors.text} transition-colors line-clamp-2 md:line-clamp-1`}>{objective.title}</h3>
            <p className="text-xs md:text-sm text-on-surface-variant font-medium">
              {children.length} child objective{children.length !== 1 ? 's' : ''} · {objective.keyResults.length} key result{objective.keyResults.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6 flex-shrink-0 ml-4">
          <div className="text-right">
            <div className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Progress</div>
            <div className={`text-xl md:text-2xl font-black ${colors.text} font-headline`}>{objective.progressPercentage}%</div>
          </div>
          {isExpanded ? (
            <ChevronDown size={20} className="text-slate-400 flex-shrink-0 md:size-7" />
          ) : (
            <ChevronRight size={20} className="text-slate-400 flex-shrink-0 md:size-7" />
          )}
        </div>
      </div>

      {/* Expandable Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-8 lg:px-10 pb-6 md:pb-8 lg:pb-10 space-y-6 md:space-y-8 border-t border-outline-variant/10">
              {/* L1 Key Results */}
              <div className="pt-4 md:pt-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">Key Results</h4>
                <div className="space-y-3 md:space-y-4">
                  {objective.keyResults.length > 0 ? (
                    objective.keyResults.map((kr, index) => (
                      <KeyResultRow
                        key={kr.id}
                        kr={kr}
                        index={index}
                        isL2={false}
                        department={objective.department}
                        owner={objective.owner}
                        workItems={workItems}
                        objectives={objectives}
                        onLinkWorkItem={onLinkWorkItem}
                        onDelete={async () => {
                          await fetch(`/api/key-results/${kr.id}`, { method: 'DELETE' });
                          onRefresh();
                        }}
                        onRefresh={onRefresh}
                      />
                    ))
                  ) : (
                    <div className="text-center py-4 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-300 italic">No key results established.</div>
                  )}
                </div>
              </div>

              {/* Child L2 Objectives */}
              {children.length > 0 && (
                <div className="pt-4 md:pt-6 border-t border-outline-variant/10">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">
                    Child Objectives (L2)
                  </h4>
                  <div className="space-y-3 md:space-y-4">
                    {children.map(child => (
                      <ChildObjectiveCard
                        key={child.id}
                        objective={child}
                        workItems={workItems}
                        onLinkWorkItem={onLinkWorkItem}
                        onRefresh={onRefresh}
                        getDeptColor={getDeptColor}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-outline-variant/10">
                <AddKRButton objectiveId={objective.id} onRefresh={onRefresh} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Child L2 Objective Card (nested inside L1 accordion)
function ChildObjectiveCard({
  objective,
  workItems,
  onLinkWorkItem,
  onRefresh,
  getDeptColor,
  key: _key,
}: {
  objective: Objective;
  workItems: WorkItem[];
  onLinkWorkItem: (krId: string, item: WorkItem) => void;
  onRefresh: () => void;
  getDeptColor: (dept: string) => { bg: string; text: string; border: string; icon: string; badge: string };
  key?: string | number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = getDeptColor(objective.department);

  return (
    <div className="rounded-3xl md:rounded-3xl border-2 border-outline-variant/10 bg-surface-container-low/30 overflow-hidden">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 md:p-6 cursor-pointer hover:bg-surface-container-low/50 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-3xl ${colors.bg} flex items-center justify-center ${colors.text} border ${colors.border} flex-shrink-0`}>
            <span className="material-symbols-outlined text-xl md:text-2xl">track_changes</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`${colors.badge} text-[10px] px-1.5 md:px-2 py-0.5 rounded-full font-black uppercase tracking-widest border`}>L2</span>
              <span className={`flex-shrink-0 flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-lg ${colors.icon} text-white text-[10px] font-black shadow-sm`}>O</span>
            </div>
            <h4 className="text-sm md:text-base font-bold text-on-surface font-headline line-clamp-2 md:line-clamp-1">{objective.title}</h4>
            <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">
              {objective.keyResults.length} KR{objective.keyResults.length !== 1 ? 's' : ''} · {objective.department}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-4 flex-shrink-0 ml-3">
          <div className="text-right">
            <div className={`text-base md:text-lg font-black ${colors.text} font-headline`}>{objective.progressPercentage}%</div>
          </div>
          {isExpanded ? <ChevronDown size={16} className="text-slate-400 md:size-5" /> : <ChevronRight size={16} className="text-slate-400 md:size-5" />}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 md:px-6 pb-4 md:pb-6 space-y-3 border-t border-outline-variant/10">
              {objective.keyResults.length > 0 ? (
                objective.keyResults.map((kr, index) => (
                  <KeyResultRow
                    key={kr.id}
                    kr={kr}
                    index={index}
                    isL2={true}
                    department={objective.department}
                    owner={objective.owner}
                    workItems={workItems}
                    onLinkWorkItem={onLinkWorkItem}
                    onDelete={async () => {
                      await fetch(`/api/key-results/${kr.id}`, { method: 'DELETE' });
                      onRefresh();
                    }}
                    onRefresh={onRefresh}
                  />
                ))
              ) : (
                <div className="text-center py-3 md:py-4 text-[10px] font-black uppercase tracking-widest text-slate-300 italic">No key results.</div>
              )}
              <AddKRButton objectiveId={objective.id} onRefresh={onRefresh} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddKRButton({ objectiveId, onRefresh }: { objectiveId: string; onRefresh: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = async (data: any) => {
    try {
      const res = await fetch('/api/key-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          targetValue: data.targetValue,
          currentValue: 0, // Always start at 0, only update via Weekly Report
          unit: data.unit,
          progressPercentage: 0,
          objectiveId
        })
      });

      if (res.ok) {
        onRefresh();
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Failed to add KR:', error);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest hover:gap-4 transition-all"
      >
        <span className="material-symbols-outlined text-[18px]">add_circle</span>
        Add Key Result
      </button>
      <EditKRModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleAdd}
        initialData={{ title: '', targetValue: 100, currentValue: 0, unit: '%' }}
        title="Add New Key Result"
      />
    </>
  );
}

// Accordion-style L2 Objective Card
function ObjectiveAccordionCardL2({
  objective: initialObjective,
  parentObjective,
  workItems,
  objectives,
  onLinkWorkItem,
  onLinkObjective,
  onRefresh,
  getDeptColor,
}: {
  objective: Objective;
  parentObjective?: Objective | null;
  workItems: WorkItem[];
  objectives: Objective[];
  onLinkWorkItem: (krId: string, item: WorkItem) => void;
  onLinkObjective?: (krId: string, parentKrId: string) => void;
  onRefresh: () => void;
  getDeptColor: (dept: string) => { bg: string; text: string; border: string; icon: string; badge: string };
  key?: string | number;
}) {
  const [objective, setObjective] = useState(initialObjective);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Default collapsed
  const colors = getDeptColor(objective.department);
  const { users } = useAuth();

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
    <div className="bg-white/50 backdrop-blur-md rounded-3xl shadow-sm border border-white/20 overflow-hidden group">
      {/* Header - Clickable to expand/collapse */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 md:p-6 lg:p-8 cursor-pointer hover:bg-slate-50/50 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
          <div className={`w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-3xl md:rounded-3xl ${colors.bg} flex items-center justify-center ${colors.text} border ${colors.border} flex-shrink-0`}>
            <span className="material-symbols-outlined text-2xl md:text-3xl">track_changes</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 md:gap-3 mb-1 flex-wrap">
              <span className={`${colors.badge} text-[8px] md:text-[10px] px-2 md:px-3 py-1 rounded-full font-black uppercase tracking-widest border`}>
                L2 - {objective.department}
              </span>
              {isEditingTitle ? (
                <input
                  type="text"
                  className="text-base md:text-lg font-black text-on-surface bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 rounded-xl px-3 md:px-4 py-1 outline-none font-headline w-full"
                  value={objective.title}
                  onChange={(e) => setObjective({ ...objective, title: e.target.value })}
                  onBlur={handleUpdateObjectiveTitle}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateObjectiveTitle()}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              ) : (
                <h3
                  className={`text-base md:text-lg font-black text-on-surface font-headline cursor-pointer hover:${colors.text} transition-colors line-clamp-2 md:line-clamp-1`}
                  onClick={(e) => { e.stopPropagation(); setIsEditingTitle(true); }}
                >
                  {objective.title}
                </h3>
              )}
            </div>
            {parentObjective && (
              <p className="text-xs text-on-surface-variant font-medium truncate">
                Aligns to: <span className="text-primary font-bold">{parentObjective.title}</span>
              </p>
            )}
            <p className="text-xs md:text-sm text-on-surface-variant font-medium mt-1">
              {objective.keyResults.length} key result{objective.keyResults.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6 flex-shrink-0 ml-4">
          <div className="text-right">
            <div className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Progress</div>
            <div className={`text-xl md:text-2xl font-black ${colors.text} font-headline`}>{objective.progressPercentage}%</div>
          </div>
          {isExpanded ? (
            <ChevronDown size={20} className="text-slate-400 flex-shrink-0 md:size-7" />
          ) : (
            <ChevronRight size={20} className="text-slate-400 flex-shrink-0 md:size-7" />
          )}
        </div>
      </div>

      {/* Expandable Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-8 lg:px-10 pb-6 md:pb-8 lg:pb-10 space-y-4 border-t border-outline-variant/10">
              {/* Key Results List */}
              {objective.keyResults.length > 0 ? (
                objective.keyResults.map((kr, index) => (
                  <KeyResultRow
                    key={kr.id}
                    kr={kr}
                    index={index}
                    isL2={true}
                    department={objective.department}
                    owner={objective.owner}
                    workItems={workItems}
                    objectives={objectives}
                    onLinkWorkItem={onLinkWorkItem}
                    onLinkObjective={onLinkObjective}
                    onDelete={async () => {
                      await fetch(`/api/key-results/${kr.id}`, { method: 'DELETE' });
                      onRefresh();
                    }}
                    onRefresh={onRefresh}
                  />
                ))
              ) : (
                <div className="text-center py-4 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-300 italic">No key results established.</div>
              )}

              <AddKRButton objectiveId={objective.id} onRefresh={onRefresh} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KeyResultRow({ kr, index, isL2, department, owner, workItems, objectives, onLinkWorkItem, onLinkObjective, onDelete, onRefresh }: { 
  kr: KeyResult; 
  index: number; 
  isL2: boolean; 
  department?: string; 
  owner?: User; 
  workItems: WorkItem[]; 
  objectives?: Objective[];
  onLinkWorkItem: (krId: string, item: WorkItem) => void; 
  onLinkObjective?: (krId: string, parentKrId: string) => void;
  onDelete: () => void; 
  onRefresh: () => void; 
  key?: string | number 
}) {
  const { currentUser } = useAuth();
  const [krData, setKrData] = useState(kr);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isUpdateProgressOpen, setIsUpdateProgressOpen] = useState(false);

  const isAdmin = currentUser?.isAdmin === true;
  const progress = Math.min(100, Math.round((krData.currentValue / krData.targetValue) * 100)) || 0;
  const linkedItems = workItems.filter(item => item.krLinks?.some(link => link.keyResultId === kr.id));
  const parentKR = krData.parentKrId ? objectives?.flatMap(o => o.keyResults).find(kr => kr.id === krData.parentKrId) : null;

  return (
    <div className="flex flex-col gap-3 md:gap-4 p-4 md:p-6 rounded-3xl md:rounded-3xl hover:bg-slate-50/50 transition-all duration-500 group border border-transparent hover:border-outline-variant/10">
      {/* C3: Mobile-first stack, grid on md+ */}
      <div className="flex flex-col gap-4 md:grid md:grid-cols-12 md:items-center md:gap-6">
        {/* Title section - full width on mobile */}
        <div className="md:col-span-6">
          <div className="flex items-start gap-2 md:gap-3">
            <span className="flex-shrink-0 flex items-center justify-center px-2 py-1 min-w-[28px] md:min-w-[32px] h-7 md:h-8 rounded-lg md:rounded-xl bg-secondary/10 text-secondary text-[10px] md:text-xs font-black shadow-sm border border-secondary/20">KR{index + 1}</span>
            <p className="text-xs md:text-sm font-black text-on-surface group-hover:text-primary transition-colors line-clamp-2 md:line-clamp-1">{krData.title}</p>
          </div>
          <div className="flex items-center gap-3 md:gap-4 mt-2 ml-0 md:ml-11 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-500 shadow-sm">
                {owner ? owner.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'N/A'}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{owner?.fullName || 'Unassigned'}</p>
            </div>
            {parentKR && (
              <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-full flex items-center gap-1 border border-primary/10">
                <span className="material-symbols-outlined text-[12px]">link</span>
                Aligned to L1 KR
              </span>
            )}
          </div>
        </div>
        {/* Progress section */}
        <div className="md:col-span-3">
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
        {/* Actions - horizontal on mobile, end-aligned on desktop */}
        <div className="flex items-center gap-2 md:col-span-3 md:justify-end">
          {isL2 && onLinkObjective && (
            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
              title="Link to L1 Key Result"
            >
              <LinkIcon size={18} />
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setIsUpdateProgressOpen(true)}
              className="min-h-[44px] px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 hover:bg-emerald-600"
            >
              Check-in
            </button>
          )}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="min-h-[44px] px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20"
          >
            Edit
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-error/60 hover:text-error hover:bg-error/5 rounded-xl transition-all"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Linked Work Items Summary */}
      {linkedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 ml-0 mt-1">
          {linkedItems.map(item => (
            <div key={item.id} className="flex items-center gap-2 bg-surface-container-lowest shadow-sm px-2 py-1 rounded-lg shadow-sm">
              <span className={`text-[8px] font-black uppercase px-1 rounded ${item.type === 'Epic' ? 'bg-purple-100 text-purple-700' :
                item.type === 'Deal' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                {item.type}
              </span>
              <span className="text-[10px] font-medium text-on-surface truncate max-w-[150px]">{item.title}</span>
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${item.status === 'Done' || item.status === 'Won' ? 'bg-emerald-50 text-emerald-600' :
                item.status === 'Active' || item.status === 'Doing' ? 'bg-blue-50 text-blue-600' :
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
        isOpen={isUpdateProgressOpen}
        onClose={() => setIsUpdateProgressOpen(false)}
        currentValue={krData.currentValue}
        targetValue={krData.targetValue}
        unit={krData.unit}
        onSave={async (newValue, note) => {
          const progressPct = krData.targetValue > 0
            ? Math.min(100, (newValue / krData.targetValue) * 100)
            : 0;
          const res = await fetch(`/api/key-results/${kr.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              currentValue: newValue,
              progressPercentage: progressPct,
              ...(note ? { lastNote: note } : {}),
            }),
          });
          if (res.ok) {
            setKrData(prev => ({ ...prev, currentValue: newValue, progressPercentage: progressPct, ...(note ? { lastNote: note } : {}) }));
            onRefresh();
          }
          setIsUpdateProgressOpen(false);
        }}
      />

      <EditKRModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={{
          title: krData.title,
          targetValue: krData.targetValue ?? 0,
          currentValue: krData.currentValue ?? 0,
          unit: krData.unit ?? '%',
        }}
        title="Edit Key Result"
        onSave={async (newData) => {
          const res = await fetch(`/api/key-results/${kr.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: newData.title,
              targetValue: newData.targetValue,
              unit: newData.unit
            })
          });
          if (res.ok) {
            setKrData(prev => ({ ...prev, ...newData }));
            onRefresh();
          }
          setIsEditModalOpen(false);
        }}
      />

      {isL2 && onLinkObjective && objectives ? (
        <LinkObjectiveModal
          isOpen={isLinkModalOpen}
          onClose={() => setIsLinkModalOpen(false)}
          krId={kr.id}
          onLink={(parentKrId) => onLinkObjective(kr.id, parentKrId)}
          l1Objectives={objectives.filter(o => !o.parentId)}
        />
      ) : (
        <LinkWorkItemModal
          isOpen={isLinkModalOpen}
          onClose={() => setIsLinkModalOpen(false)}
          krId={kr.id}
          onLink={(item) => onLinkWorkItem(kr.id, item)}
          workItems={workItems}
        />
      )}

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
      <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
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

          {/* M13: Stack buttons on mobile */}
          <div className="flex flex-col-reverse sm:flex-row w-full gap-3">
            <button
              className="flex-1 px-6 py-3 text-sm font-bold text-on-surface-variant bg-surface-container-high hover:bg-surface-container-highest rounded-xl transition-all min-h-[48px]"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="flex-1 px-6 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-lg shadow-rose-200 min-h-[48px]"
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
  onSave: (data: { title: string; targetValue: number; currentValue: number; unit: string }) => void;
  initialData: { title: string; targetValue: number; currentValue: number; unit: string };
  title?: string;
}

function EditKRModal({ isOpen, onClose, onSave, initialData, title }: EditKRModalProps) {
  const [formData, setFormData] = useState(initialData);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-lg p-8 relative">
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
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-3xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Increase user retention by 20%"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Target Value</label>
            <input
              type="number"
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-3xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={formData.targetValue}
              onChange={e => setFormData({ ...formData, targetValue: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Unit</label>
            <input
              type="text"
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-3xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={formData.unit}
              onChange={e => setFormData({ ...formData, unit: e.target.value })}
              placeholder="e.g., %, USD, Users"
            />
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

  useEffect(() => {
    if (isOpen) { setVal(currentValue); setNote(''); }
  }, [isOpen, currentValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[70] backdrop-blur-sm">
      <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-sm p-8 relative">
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
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-3xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px] resize-none"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="What changed? Any blockers?"
            />
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm">
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
        assigneeId: 'u1',
        status: 'Todo',
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
      <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
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
              <CustomSelect
                value={selectedItemId}
                onChange={setSelectedItemId}
                options={[
                  { value: '', label: '-- Choose a work item --' },
                  ...workItems.map(item => ({ value: item.id, label: `[${item.type}] ${item.title}` }))
                ]}
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Title</label>
                <input
                  type="text"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-3xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={newItemTitle}
                  onChange={e => setNewItemTitle(e.target.value)}
                  placeholder="Enter task or epic title..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Type</label>
                <CustomSelect
                  value={newItemType}
                  onChange={(val) => setNewItemType(val as WorkItemType)}
                  options={[
                    { value: 'Epic', label: 'Epic' },
                    { value: 'UserStory', label: 'User Story' },
                    { value: 'TechTask', label: 'Tech Task' },
                    { value: 'Campaign', label: 'Campaign' },
                    { value: 'MktTask', label: 'Marketing Task' },
                    { value: 'MediaTask', label: 'Media Task' }
                  ]}
                />
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

function LinkObjectiveModal({ 
  isOpen, 
  onClose, 
  krId, 
  onLink, 
  l1Objectives 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  krId: string; 
  onLink: (parentKrId: string) => void; 
  l1Objectives: Objective[] 
}) {
  const [selectedL1KrId, setSelectedL1KrId] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (selectedL1KrId) {
      onLink(selectedL1KrId);
    }
    onClose();
  };

  // Flatten all L1 KRs
  const allL1KRs = l1Objectives.flatMap(obj => 
    obj.keyResults.map(kr => ({ ...kr, objectiveTitle: obj.title, department: obj.department }))
  );

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <h3 className="text-xl font-bold text-on-surface mb-2">Link to L1 Key Result</h3>
        <p className="text-sm text-on-surface-variant mb-6">
          Align this L2 Key Result with a parent L1 Key Result for better tracking.
        </p>

        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
            Select L1 Key Result
          </label>
          <CustomSelect
            value={selectedL1KrId}
            onChange={setSelectedL1KrId}
            options={[
              { value: '', label: '-- Choose an L1 Key Result --' },
              ...allL1KRs.map(kr => ({
                value: kr.id,
                label: `[${kr.department}] ${kr.objectiveTitle.substring(0, 50)}${kr.objectiveTitle.length > 50 ? '...' : ''} → ${kr.title}`
              }))
            ]}
          />
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
            disabled={!selectedL1KrId}
          >
            Link to L1 KR
          </button>
        </div>
      </div>
    </div>
  );
}

function AddObjectiveModal({
  isOpen,
  onClose,
  onAdd,
  level,
  objectives
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (obj: any) => void;
  level: 'L1' | 'L2';
  objectives: Objective[];
}) {
  const [formData, setFormData] = useState({
    title: '',
    department: 'Tech',
    description: '',
    ownerId: '',
    parentId: level === 'L2' ? (objectives.filter(o => !o.parentId)[0]?.id || '') : '',
  });

  if (!isOpen) return null;

  const l1Objectives = objectives.filter(o => !o.parentId);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
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

        {/* M15: Responsive padding */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Objective Title</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Achieve record revenue growth in Q3"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Department</label>
            <CustomSelect
              value={formData.department}
              onChange={(val) => setFormData({ ...formData, department: val })}
              options={[
                { value: 'Tech', label: 'Tech' },
                { value: 'Marketing', label: 'Marketing' },
                { value: 'Media', label: 'Media' },
                { value: 'Sale', label: 'Sale' }
              ]}
            />
          </div>

          {level === 'L2' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Parent Objective (L1)</label>
              <CustomSelect
                value={formData.parentId}
                onChange={(val) => setFormData({ ...formData, parentId: val })}
                options={[
                  { value: '', label: '-- Select parent objective --' },
                  ...l1Objectives.map(obj => ({ value: obj.id, label: `[${obj.department}] ${obj.title}` }))
                ]}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Description</label>
            <textarea
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all h-32 resize-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
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
              onAdd({
                ...formData,
                level,
                progressPercentage: 0,
                keyResults: [],
              });
            }}
          >
            Create Objective
          </button>
        </div>
      </motion.div>
    </div>
  );
}
