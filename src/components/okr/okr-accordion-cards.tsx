// OKR accordion cards library — extracted from former src/pages/OKRsManagement.tsx
// after Phase 8 v1 page hard-delete (2026-05-11). v2/OKRsManagement.tsx consumes
// ObjectiveAccordionCard / ObjectiveAccordionCardL2 / AddObjectiveModal.
import { useState, useEffect } from 'react';
import { Objective, KeyResult, User } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronRight, X, Link as LinkIcon, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import CustomSelect from '../ui/custom-select';


// Accordion-style L1 Objective Card with expandable L2 children
export function ObjectiveAccordionCard({
  objective,
  childObjectives,
  objectives,
  onRefresh,
  isExpanded,
  onToggleExpand,
  getDeptColor,
}: {
  objective: Objective;
  childObjectives: Objective[];
  objectives: Objective[];
  onRefresh: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  getDeptColor: (dept: string) => { bg: string; text: string; border: string; icon: string; badge: string };
}) {
  const colors = getDeptColor(objective.department);

  return (
    <div className="bg-white/50 backdrop-blur-md rounded-card shadow-sm border border-white/20 overflow-hidden group">
      {/* L1 Objective Header - Clickable to expand/collapse */}
      <div
        onClick={onToggleExpand}
        className="p-3 md:p-4 cursor-pointer hover:bg-surface-variant/30 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-9 h-9 rounded-card ${colors.bg} flex items-center justify-center ${colors.text} border ${colors.border} flex-shrink-0`}>
            <span className="material-symbols-outlined text-xl">ads_click</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`${colors.badge} text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border`}>
                L1 - {objective.department}
              </span>
              <span className={`flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-lg ${colors.icon} text-white text-[10px] font-black shadow-sm`}>O</span>
              <h3 className={`text-base md:text-lg font-bold text-on-surface font-headline hover:${colors.text} transition-colors line-clamp-1 min-w-0`}>{objective.title}</h3>
            </div>
            <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
              {childObjectives.length} child objective{childObjectives.length !== 1 ? 's' : ''} · {objective.keyResults.length} key result{objective.keyResults.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <div className="text-right">
            <div className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Progress</div>
            <div className={`text-lg md:text-xl font-black ${colors.text} font-headline leading-tight`}>{objective.progressPercentage}%</div>
          </div>
          {isExpanded ? (
            <ChevronDown size={18} className="text-on-surface-variant flex-shrink-0" />
          ) : (
            <ChevronRight size={18} className="text-on-surface-variant flex-shrink-0" />
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
                <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3 md:mb-4">Key Results</h4>
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
                        objectives={objectives}
                        onDelete={async () => {
                          await fetch(`/api/key-results/${kr.id}`, { method: 'DELETE' });
                          onRefresh();
                        }}
                        onRefresh={onRefresh}
                      />
                    ))
                  ) : (
                    <div className="text-center py-4 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-widest text-on-surface-variant/60 italic">No key results established.</div>
                  )}
                </div>
              </div>

              {/* Child L2 Objectives */}
              {childObjectives.length > 0 && (
                <div className="pt-4 md:pt-6 border-t border-outline-variant/10">
                  <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3 md:mb-4">
                    Child Objectives (L2)
                  </h4>
                  <div className="space-y-3 md:space-y-4">
                    {childObjectives.map(child => (
                      <ChildObjectiveCard
                        key={child.id}
                        objective={child}
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
  onRefresh,
  getDeptColor,
  key: _key,
}: {
  objective: Objective;
  onRefresh: () => void;
  getDeptColor: (dept: string) => { bg: string; text: string; border: string; icon: string; badge: string };
  key?: string | number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = getDeptColor(objective.department);

  return (
    <div className="rounded-card md:rounded-card border-2 border-outline-variant/10 bg-surface-container-low/30 overflow-hidden">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 md:p-6 cursor-pointer hover:bg-surface-container-low/50 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-card ${colors.bg} flex items-center justify-center ${colors.text} border ${colors.border} flex-shrink-0`}>
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
          {isExpanded ? <ChevronDown size={16} className="text-on-surface-variant md:size-5" /> : <ChevronRight size={16} className="text-on-surface-variant md:size-5" />}
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
                    onDelete={async () => {
                      await fetch(`/api/key-results/${kr.id}`, { method: 'DELETE' });
                      onRefresh();
                    }}
                    onRefresh={onRefresh}
                  />
                ))
              ) : (
                <div className="text-center py-3 md:py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 italic">No key results.</div>
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
export function ObjectiveAccordionCardL2({
  objective: initialObjective,
  parentObjective,
  objectives,
  onLinkObjective,
  onRefresh,
  getDeptColor,
}: {
  objective: Objective;
  parentObjective?: Objective | null;
  objectives: Objective[];
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
    <div className="bg-white/50 backdrop-blur-md rounded-card shadow-sm border border-white/20 overflow-hidden group">
      {/* Header - Clickable to expand/collapse */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-2.5 md:p-3 cursor-pointer hover:bg-surface-variant/30 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-7 h-7 rounded-card ${colors.bg} flex items-center justify-center ${colors.text} border ${colors.border} flex-shrink-0`}>
            <span className="material-symbols-outlined text-base">track_changes</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`${colors.badge} text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border`}>
                L2 - {objective.department}
              </span>
              {isEditingTitle ? (
                <input
                  type="text"
                  className="text-sm md:text-base font-bold text-on-surface bg-surface-variant/30 border-none focus:ring-2 focus:ring-primary/35 rounded-xl px-2 py-0.5 outline-none font-headline w-full"
                  value={objective.title}
                  onChange={(e) => setObjective({ ...objective, title: e.target.value })}
                  onBlur={handleUpdateObjectiveTitle}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateObjectiveTitle()}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              ) : (
                <h3
                  className={`text-sm md:text-base font-bold text-on-surface font-headline cursor-pointer hover:${colors.text} transition-colors line-clamp-1 min-w-0`}
                  onClick={(e) => { e.stopPropagation(); setIsEditingTitle(true); }}
                >
                  {objective.title}
                </h3>
              )}
            </div>
            {parentObjective && (
              <p className="text-[11px] text-on-surface-variant font-medium truncate mt-0.5">
                Aligns to: <span className="text-primary font-bold">{parentObjective.title}</span>
              </p>
            )}
            <p className="text-[11px] text-on-surface-variant font-medium">
              {objective.keyResults.length} key result{objective.keyResults.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <div className="text-right">
            <div className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Progress</div>
            <div className={`text-base md:text-lg font-black ${colors.text} font-headline leading-tight`}>{objective.progressPercentage}%</div>
          </div>
          {isExpanded ? (
            <ChevronDown size={16} className="text-on-surface-variant flex-shrink-0" />
          ) : (
            <ChevronRight size={16} className="text-on-surface-variant flex-shrink-0" />
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
                    objectives={objectives}
                    onLinkObjective={onLinkObjective}
                    onDelete={async () => {
                      await fetch(`/api/key-results/${kr.id}`, { method: 'DELETE' });
                      onRefresh();
                    }}
                    onRefresh={onRefresh}
                  />
                ))
              ) : (
                <div className="text-center py-4 md:py-6 text-[10px] md:text-xs font-black uppercase tracking-widest text-on-surface-variant/60 italic">No key results established.</div>
              )}

              <AddKRButton objectiveId={objective.id} onRefresh={onRefresh} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KeyResultRow({ kr, index, isL2, owner, objectives, onLinkObjective, onDelete, onRefresh }: {
  kr: KeyResult;
  index: number;
  isL2: boolean;
  department?: string;
  owner?: User;
  objectives?: Objective[];
  onLinkObjective?: (krId: string, parentKrId: string) => void;
  onDelete: () => void;
  onRefresh: () => void;
  key?: string | number;
}) {
  const { currentUser } = useAuth();
  const [krData, setKrData] = useState(kr);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isUpdateProgressOpen, setIsUpdateProgressOpen] = useState(false);

  const isAdmin = currentUser?.isAdmin === true;
  const targetValue = krData.targetValue ?? 100;
  const currentValue = krData.currentValue ?? 0;
  const progress = Math.min(100, Math.round((currentValue / targetValue) * 100)) || 0;
  const parentKR = krData.parentKrId ? objectives?.flatMap(o => o.keyResults).find(item => item.id === krData.parentKrId) : null;

  return (
    <div className="flex flex-col gap-3 md:gap-4 p-4 md:p-6 rounded-card md:rounded-card hover:bg-surface-variant/30 transition-all duration-500 group border border-transparent hover:border-outline-variant/10">
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
              <div className="w-5 h-5 rounded-full bg-surface-variant/60 flex items-center justify-center text-[8px] font-black text-on-surface-variant shadow-sm">
                {owner ? owner.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'N/A'}
              </div>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{owner?.fullName || 'Unassigned'}</p>
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
          <div className="flex justify-between items-end mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">
            <span>Progress</span>
            <span className="text-on-surface">{krData.currentValue} / {krData.targetValue} {krData.unit}</span>
          </div>
          <div className="h-2 bg-surface-variant/60 rounded-full overflow-hidden relative">
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
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
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

      {/* Last Check-in Note */}
      {krData.lastNote && (
        <div className="mt-1 flex items-start gap-2 bg-warning-container/30 p-2 rounded-lg border border-warning-container/40">
          <span className="material-symbols-outlined text-warning text-xs mt-0.5">chat_bubble</span>
          <p className="text-[10px] text-on-surface-variant italic leading-relaxed">
            <span className="font-bold text-warning not-italic mr-1">Latest Note:</span>
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

      {isL2 && onLinkObjective && objectives && (
        <LinkObjectiveModal
          isOpen={isLinkModalOpen}
          onClose={() => setIsLinkModalOpen(false)}
          krId={kr.id}
          onLink={(parentKrId) => onLinkObjective(kr.id, parentKrId)}
          l1Objectives={objectives.filter(o => !o.parentId)}
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
    <div className="fixed inset-0 bg-on-surface/50 flex items-center justify-center z-[60] backdrop-blur-sm">
      <div className="bg-surface rounded-card shadow-2xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-error-container/30 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-error text-3xl">warning</span>
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
              className="flex-1 px-6 py-3 text-sm font-bold text-white bg-error hover:bg-error rounded-xl transition-all shadow-lg shadow-error/20 min-h-[48px]"
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
    <div className="fixed inset-0 bg-on-surface/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-surface rounded-card shadow-2xl w-full max-w-lg p-8 relative">
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
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-all"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Increase user retention by 20%"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Target Value</label>
            <input
              type="number"
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-all"
              value={formData.targetValue}
              onChange={e => setFormData({ ...formData, targetValue: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Unit</label>
            <input
              type="text"
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-all"
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
    <div className="fixed inset-0 bg-on-surface/50 flex items-center justify-center z-[70] backdrop-blur-sm">
      <div className="bg-surface rounded-card shadow-2xl w-full max-w-sm p-8 relative">
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
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-2xl font-black text-primary focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-all text-center"
              value={val}
              onChange={e => setVal(Number(e.target.value))}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Progress Note (Optional)</label>
            <textarea
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-all min-h-[100px] resize-none"
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
    <div className="fixed inset-0 bg-on-surface/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-surface rounded-card shadow-2xl w-full max-w-md p-8 relative">
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

export function AddObjectiveModal({
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
    <div className="fixed inset-0 bg-on-surface/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-card shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="px-8 py-6 border-b border-outline-variant/40 flex items-center justify-between bg-surface-variant/30">
          <h2 className="text-2xl font-black font-headline text-on-surface">
            Add New {level} Objective
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface-variant hover:bg-surface-variant/50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* M15: Responsive padding */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Objective Title</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-surface-variant/30 border border-outline-variant/40 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-all"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Achieve record revenue growth in Q3"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Department</label>
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
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Parent Objective (L1)</label>
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
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Description</label>
            <textarea
              className="w-full px-4 py-3 bg-surface-variant/30 border border-outline-variant/40 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-all h-32 resize-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the desired outcome and impact..."
            />
          </div>
        </div>

        <div className="px-8 py-6 border-t border-outline-variant/40 flex justify-end gap-3 bg-surface-variant/30">
          <button
            className="px-6 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-variant/50 rounded-xl transition-all"
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
