import { Trash2, Edit2, X, Check } from 'lucide-react';
import { motion } from 'motion/react';

const LEAD_TYPES = ['Việt Nam', 'Quốc Tế'];
const UNQUALIFIED_TYPES = ['Unreachable', 'Rejected', 'Bad Fit', 'Timing'];

export type BulkEditFields = { notes: string; leadType: string; unqualifiedType: string };

interface BulkActionBarProps {
  count: number;
  editMode: boolean;
  bulkEdit: BulkEditFields;
  saving: boolean;
  onToggleEdit: () => void;
  onFieldChange: (k: keyof BulkEditFields, v: string) => void;
  onApply: () => void;
  onDelete?: () => void;
  onClear: () => void;
}

const selCls = 'bg-surface-3 text-on-surface border border-outline-variant/40 rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-all';

export default function BulkActionBar({
  count, editMode, bulkEdit, saving,
  onToggleEdit, onFieldChange, onApply, onDelete, onClear,
}: BulkActionBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.95 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 p-5 bg-surface-container-highest text-on-surface rounded-[2rem] shadow-2xl shadow-on-surface/20 min-w-[360px] max-w-[90vw]"
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="size-9 bg-accent rounded-full flex items-center justify-center font-black text-sm text-on-accent shadow-md">
            {count}
          </div>
          <p className="text-sm font-black tracking-tight">hàng được chọn</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleEdit}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              editMode ? 'bg-surface-container border border-accent text-on-surface' : 'bg-surface-container-high hover:bg-surface-container text-on-surface-variant'
            }`}
          >
            <Edit2 size={13} />
            Bulk Edit
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-error/20 hover:bg-error/30 text-error/70 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
            >
              <Trash2 size={13} />
              Xóa ({count})
            </button>
          )}
          <button onClick={onClear} className="p-2 text-on-surface-variant/60 hover:text-on-surface transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {editMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-white/10 flex items-end gap-3 flex-wrap"
        >
          <div className="w-full text-[10px] font-black uppercase tracking-widest text-white/40">
            Bulk operations limited to SMIT-only fields (notes, lead type, UQ reason)
          </div>
          <div className="flex flex-col gap-1 min-w-52">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Notes</span>
            <input
              value={bulkEdit.notes}
              onChange={(e) => onFieldChange('notes', e.target.value)}
              placeholder="— không đổi —"
              className={selCls + ' w-full'}
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Lead Type</span>
            <select value={bulkEdit.leadType} onChange={(e) => onFieldChange('leadType', e.target.value)} className={selCls}>
              <option value="">— không đổi —</option>
              {LEAD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">UQ Reason</span>
            <select value={bulkEdit.unqualifiedType} onChange={(e) => onFieldChange('unqualifiedType', e.target.value)} className={selCls}>
              <option value="">— không đổi —</option>
              {UNQUALIFIED_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button
            onClick={onApply}
            disabled={saving || (!bulkEdit.notes.trim() && !bulkEdit.leadType && !bulkEdit.unqualifiedType)}
            className="flex items-center gap-2 px-6 py-[7px] bg-success text-on-success rounded-xl text-xs font-black uppercase tracking-widest hover:bg-success/85 transition-all disabled:opacity-40"
          >
            {saving ? 'Đang áp dụng...' : <><Check size={13} /> Áp dụng</>}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
