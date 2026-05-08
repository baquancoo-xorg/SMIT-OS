import { useState, useRef, useEffect, useCallback } from 'react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  addMonths, subMonths, isSameDay, isToday, getDay, startOfWeek, endOfWeek,
  parseISO, isValid,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';

const DOW = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function getCalendarDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

interface DatePickerProps {
  value: string; // yyyy-MM-dd or ''
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  variant?: 'default' | 'dark';
  disabled?: boolean;
}

export default function DatePicker({ value, onChange, placeholder = 'Chọn ngày', className = '', variant = 'default', disabled = false }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(() => {
    const d = value ? parseISO(value) : new Date();
    return isValid(d) ? d : new Date();
  });
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const selected = value && isValid(parseISO(value)) ? parseISO(value) : null;

  const reposition = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const CALENDAR_WIDTH = 288;
    let left = r.left;
    if (left + CALENDAR_WIDTH > window.innerWidth - 16) {
      left = r.right - CALENDAR_WIDTH;
    }
    if (left < 16) left = 16;
    setPos({ top: r.bottom + 8, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    reposition();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open, reposition]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!btnRef.current?.contains(e.target as Node) && !popRef.current?.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const select = (d: Date) => {
    onChange(format(d, 'yyyy-MM-dd'));
    setOpen(false);
  };

  const days = getCalendarDays(month);
  const monthLabel = format(month, 'MMMM yyyy', { locale: vi });

  const label = selected
    ? format(selected, 'dd/MM/yyyy')
    : placeholder;

  const isDark = variant === 'dark';

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) { reposition(); setOpen((v) => !v); } }}
        className={isDark
          ? `flex items-center gap-2 h-9 px-3 rounded-full bg-black/20 border border-white/20
              hover:bg-black/30 hover:border-white/40 transition-all text-[11px] font-bold
              focus:outline-none focus:ring-2 focus:ring-white/20 ${className}`
          : `flex items-center gap-2 h-9 px-3 rounded-full bg-slate-100/50 border border-transparent
              hover:bg-white hover:border-primary/20 transition-all text-[11px] font-bold text-slate-600
              focus:outline-none focus:ring-2 focus:ring-primary/20 ${className}`
        }
      >
        <Calendar size={13} className={isDark ? 'text-white/60' : 'text-slate-400'} />
        <span className={isDark
          ? (selected ? 'text-white font-bold' : 'text-white/60')
          : (selected ? 'text-slate-700' : 'text-slate-400')
        }>{label}</span>
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={popRef}
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              style={{ top: pos.top, left: pos.left }}
              className="fixed z-[300] w-72 bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100 p-4"
            >
              {/* Month nav */}
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => setMonth((m) => subMonths(m, 1))} className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
                  <ChevronLeft size={14} className="text-slate-500" />
                </button>
                <span className="text-xs font-black text-slate-700 uppercase tracking-widest capitalize">
                  {monthLabel}
                </span>
                <button onClick={() => setMonth((m) => addMonths(m, 1))} className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
                  <ChevronRight size={14} className="text-slate-500" />
                </button>
              </div>

              {/* DOW header */}
              <div className="grid grid-cols-7 mb-1">
                {DOW.map((d) => (
                  <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-wider py-1">{d}</div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-y-0.5">
                {days.map((day) => {
                  const isCurrentMonth = day.getMonth() === month.getMonth();
                  const isSel = selected ? isSameDay(day, selected) : false;
                  const isNow = isToday(day);
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => select(day)}
                      className={`
                        aspect-square w-full flex items-center justify-center rounded-xl text-xs font-bold transition-all
                        ${isSel ? 'bg-primary text-white shadow-md shadow-primary/30' : ''}
                        ${isNow && !isSel ? 'ring-2 ring-primary/40 text-primary font-black' : ''}
                        ${!isSel && isCurrentMonth ? 'text-slate-700 hover:bg-primary/10 hover:text-primary' : ''}
                        ${!isCurrentMonth ? 'text-slate-300 hover:bg-slate-50' : ''}
                      `}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex justify-between mt-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => { onChange(''); setOpen(false); }}
                  className="text-[11px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                >
                  Xóa
                </button>
                <button
                  onClick={() => select(new Date())}
                  className="text-[11px] font-black text-primary hover:text-primary/70 uppercase tracking-widest transition-colors"
                >
                  Hôm nay
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
