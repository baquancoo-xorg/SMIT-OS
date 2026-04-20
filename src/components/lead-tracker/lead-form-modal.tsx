import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { Lead } from '../../types';

const LEAD_STATUSES = ['Mới', 'Đang liên hệ', 'Đang nuôi dưỡng', 'Qualified', 'Unqualified'] as const;
const LEAD_TYPES = ['Việt Nam', 'Quốc Tế'] as const;

interface Props {
  lead?: Lead | null;
  onSave: () => void;
  onClose: () => void;
}

export default function LeadFormModal({ lead, onSave, onClose }: Props) {
  const [aeList, setAeList] = useState<{ id: string; fullName: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    customerName: '',
    ae: '',
    receivedDate: new Date().toISOString().slice(0, 10),
    resolvedDate: '',
    status: 'Đang liên hệ' as string,
    leadType: '' as string,
    unqualifiedType: '',
    notes: '',
  });

  useEffect(() => {
    api.getLeadAeList().then(setAeList).catch(() => {});
  }, []);

  useEffect(() => {
    if (lead) {
      setForm({
        customerName: lead.customerName,
        ae: lead.ae,
        receivedDate: lead.receivedDate.slice(0, 10),
        resolvedDate: lead.resolvedDate ? lead.resolvedDate.slice(0, 10) : '',
        status: lead.status,
        leadType: lead.leadType ?? '',
        unqualifiedType: lead.unqualifiedType ?? '',
        notes: lead.notes ?? '',
      });
    }
  }, [lead]);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        customerName: form.customerName,
        ae: form.ae,
        receivedDate: form.receivedDate,
        resolvedDate: form.resolvedDate || null,
        status: form.status,
        leadType: form.leadType || null,
        unqualifiedType: form.status === 'Unqualified' ? (form.unqualifiedType || null) : null,
        notes: form.notes || null,
      };
      if (lead) {
        await api.updateLead(lead.id, payload);
      } else {
        await api.createLead(payload);
      }
      onSave();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800">{lead ? 'Sửa Lead' : 'Thêm Lead'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Tên khách hàng *</label>
            <input
              required
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              value={form.customerName}
              onChange={(e) => set('customerName', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">AE *</label>
              <select
                required
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={form.ae}
                onChange={(e) => set('ae', e.target.value)}
              >
                <option value="">Chọn AE</option>
                {aeList.map((u) => (
                  <option key={u.id} value={u.fullName}>{u.fullName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Loại Lead</label>
              <select
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={form.leadType}
                onChange={(e) => set('leadType', e.target.value)}
              >
                <option value="">-- Chọn --</option>
                {LEAD_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Ngày nhận *</label>
              <input
                required
                type="date"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={form.receivedDate}
                onChange={(e) => set('receivedDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Ngày xử lý</label>
              <input
                type="date"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={form.resolvedDate}
                onChange={(e) => set('resolvedDate', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Trạng thái *</label>
            <select
              required
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {form.status === 'Unqualified' && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Lý do Unqualified</label>
              <input
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={form.unqualifiedType}
                onChange={(e) => set('unqualifiedType', e.target.value)}
                placeholder="Ví dụ: Budget, Timeline..."
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Ghi chú</label>
            <textarea
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-xl border border-slate-200 hover:bg-slate-50">
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
