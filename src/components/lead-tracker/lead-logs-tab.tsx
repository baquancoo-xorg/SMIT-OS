import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Lead } from '../../types';
import LeadFormModal from './lead-form-modal';

const STATUS_STYLES: Record<string, string> = {
  'Qualified': 'bg-emerald-50 text-emerald-600',
  'Unqualified': 'bg-red-50 text-red-600',
  'Đang liên hệ': 'bg-blue-50 text-blue-600',
  'Đang nuôi dưỡng': 'bg-amber-50 text-amber-600',
};

export default function LeadLogsTab() {
  const { currentUser } = useAuth();
  const isSaleAE = currentUser?.departments?.includes('Sale');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalLead, setModalLead] = useState<Lead | null | undefined>(undefined);
  const [filters, setFilters] = useState({ ae: '', status: '', dateFrom: '', dateTo: '' });

  const setFilter = (k: string, v: string) => setFilters((f) => ({ ...f, [k]: v }));

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filters.ae) params.ae = filters.ae;
      if (filters.status) params.status = filters.status;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      const data = await api.getLeads(Object.keys(params).length ? params : undefined);
      setLeads(data);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleDelete = async (id: string) => {
    if (!confirm('Xác nhận xóa lead này?')) return;
    await api.deleteLead(id);
    fetchLeads();
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <input
          type="text"
          placeholder="Lọc theo AE..."
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm w-40"
          value={filters.ae}
          onChange={(e) => setFilter('ae', e.target.value)}
        />
        <select
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm"
          value={filters.status}
          onChange={(e) => setFilter('status', e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Đang liên hệ">Đang liên hệ</option>
          <option value="Đang nuôi dưỡng">Đang nuôi dưỡng</option>
          <option value="Qualified">Qualified</option>
          <option value="Unqualified">Unqualified</option>
        </select>
        <input
          type="date"
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm"
          value={filters.dateFrom}
          onChange={(e) => setFilter('dateFrom', e.target.value)}
        />
        <span className="text-slate-400 text-sm">→</span>
        <input
          type="date"
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm"
          value={filters.dateTo}
          onChange={(e) => setFilter('dateTo', e.target.value)}
        />
        {isSaleAE && (
          <button
            onClick={() => setModalLead(null)}
            className="ml-auto px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90"
          >
            + Thêm Lead
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                <th className="pb-3 pr-4 font-medium">Khách hàng</th>
                <th className="pb-3 pr-4 font-medium">AE</th>
                <th className="pb-3 pr-4 font-medium">Loại</th>
                <th className="pb-3 pr-4 font-medium">Ngày nhận</th>
                <th className="pb-3 pr-4 font-medium">Ngày xử lý</th>
                <th className="pb-3 pr-4 font-medium">Trạng thái</th>
                <th className="pb-3 pr-4 font-medium">Ghi chú</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">Không có dữ liệu</td>
                </tr>
              )}
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 pr-4 font-medium text-slate-800">{lead.customerName}</td>
                  <td className="py-3 pr-4 text-slate-600">{lead.ae}</td>
                  <td className="py-3 pr-4 text-slate-500">{lead.leadType ?? '-'}</td>
                  <td className="py-3 pr-4 text-slate-500">{lead.receivedDate.slice(0, 10)}</td>
                  <td className="py-3 pr-4 text-slate-500">{lead.resolvedDate ? lead.resolvedDate.slice(0, 10) : '-'}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[lead.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-400 max-w-[160px] truncate">{lead.notes ?? '-'}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setModalLead(lead)} className="text-xs text-primary hover:underline">Sửa</button>
                      <button onClick={() => handleDelete(lead.id)} className="text-xs text-red-400 hover:underline">Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalLead !== undefined && (
        <LeadFormModal
          lead={modalLead}
          onSave={() => { setModalLead(undefined); fetchLeads(); }}
          onClose={() => setModalLead(undefined)}
        />
      )}
    </div>
  );
}
