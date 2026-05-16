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
          ? `flex items-center gap-2 h-9 px-3 rounded-chip bg-on-surface/20 border border-on-primary/20
              hover:bg-on-surface/30 hover:border-on-primary/40 transition-colors text-[length:var(--text-caption)] font-semibold
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-primary/20 ${className}`
          : `flex items-center gap-2 h-9 px-3 rounded-chip bg-surface-variant/50 border border-transparent
              hover:bg-surface hover:border-primary/20 transition-colors text-[length:var(--text-caption)] font-semibold text-on-surface-variant
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${className}`
        }
      >
        <Calendar size={13} className={isDark ? 'text-on-primary/60' : 'text-on-surface-variant'} />
        <span className={isDark
          ? (selected ? 'text-on-primary font-semibold' : 'text-on-primary/60')
          : (selected ? 'text-on-surface' : 'text-on-surface-variant/70')
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
              className="fixed z-[300] w-72 rounded-card border border-outline-variant/40 bg-surface p-4 shadow-elevated"
            >
              {/* Month nav */}
              <div className="mb-3 flex items-center justify-between">
                <button onClick={() => setMonth((m) => subMonths(m, 1))} className="rounded-chip p-1.5 transition-colors hover:bg-surface-variant/40">
                  <ChevronLeft size={14} className="text-on-surface-variant" />
                </button>
                <span className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface capitalize">
                  {monthLabel}
                </span>
                <button onClick={() => setMonth((m) => addMonths(m, 1))} className="rounded-chip p-1.5 transition-colors hover:bg-surface-variant/40">
                  <ChevronRight size={14} className="text-on-surface-variant" />
                </button>
              </div>

              {/* DOW header */}
              <div className="mb-1 grid grid-cols-7">
                {DOW.map((d) => (
                  <div key={d} className="py-1 text-center text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant">{d}</div>
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
                        flex aspect-square w-full items-center justify-center rounded-chip text-[length:var(--text-body-sm)] font-semibold transition-colors
                        ${isSel ? 'bg-primary text-on-primary shadow-md shadow-primary/30' : ''}
                        ${isNow && !isSel ? 'ring-2 ring-primary/40 text-primary' : ''}
                        ${!isSel && isCurrentMonth ? 'text-on-surface hover:bg-primary/10 hover:text-primary' : ''}
                        ${!isCurrentMonth ? 'text-on-surface-variant/40 hover:bg-surface-variant/40' : ''}
                      `}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="mt-3 flex justify-between border-t border-outline-variant/40 pt-3">
                <button
                  onClick={() => { onChange(''); setOpen(false); }}
                  className="text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface-variant transition-colors hover:text-on-surface"
                >
                  Xóa
                </button>
                <button
                  onClick={() => select(new Date())}
                  className="text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-wide)] text-primary transition-colors hover:text-primary/70"
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
