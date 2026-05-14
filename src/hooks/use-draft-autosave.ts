import { useEffect, useRef, useState, useCallback } from 'react';
import { saveDraft, clearDraft, isStorageAvailable, type DraftPayload } from '../lib/draft-storage';

type FormState = Omit<DraftPayload, 'savedAt'>;

interface UseDraftAutosaveOptions {
  form: FormState;
  userId: string | undefined;
  date: string;
  enabled?: boolean;
  delayMs?: number;
}

interface UseDraftAutosaveResult {
  savedAt: string | null;
  saving: boolean;
  available: boolean;
  flush: () => void;
  clear: () => void;
}

export function useDraftAutosave(opts: UseDraftAutosaveOptions): UseDraftAutosaveResult {
  const { form, userId, date, enabled = true, delayMs = 500 } = opts;
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const available = isStorageAvailable();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef(form);
  formRef.current = form;

  const doSave = useCallback(() => {
    if (!userId || !available) return;
    setSaving(true);
    const result = saveDraft(userId, date, formRef.current);
    setSavedAt(result?.savedAt ?? null);
    setSaving(false);
  }, [userId, date, available]);

  const flush = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    doSave();
  }, [doSave]);

  const clear = useCallback(() => {
    if (!userId) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    clearDraft(userId, date);
    setSavedAt(null);
  }, [userId, date]);

  useEffect(() => {
    if (!enabled || !userId || !available) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(doSave, delayMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [form, enabled, userId, available, delayMs, doSave]);

  return { savedAt, saving, available, flush, clear };
}
