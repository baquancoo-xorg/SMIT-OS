import { Suspense } from 'react';
import { format } from 'date-fns';
import { FileText, CheckCircle, Clock } from 'lucide-react';
import { Modal } from '../ui/modal';
import { Skeleton } from '../ui/skeleton';
import { CommentThread } from './comment-thread';

export interface DailyReportData {
  id: string;
  userId: string;
  user: { fullName: string };
  reportDate: string;
  status: string;
  completedYesterday: string;
  doingYesterday: string;
  blockers: string;
  planToday: string;
  approvedBy?: string | null;
  approver?: { fullName: string } | null;
  approvedAt?: string | null;
  approvalComment?: string;
}

interface DailyReportDetailModalProps {
  open: boolean;
  onClose: () => void;
  report: DailyReportData | null;
  currentUserId: string;
  isAdmin: boolean;
}

export function DailyReportDetailModal({ open, onClose, report, currentUserId, isAdmin }: DailyReportDetailModalProps) {
  if (!report) return null;

  const isApproved = report.status === 'Approved';
  const dateFormatted = format(new Date(report.reportDate), 'dd/MM/yyyy');

  return (
    <Modal open={open} onClose={onClose} title={`Báo cáo ngày ${dateFormatted}`} icon={<FileText />} size="lg">
      <div className="space-y-5">
        <div className="flex items-center gap-2 text-[length:var(--text-body-sm)]">
          <span className="font-semibold text-on-surface">{report.user.fullName}</span>
          <StatusBadge approved={isApproved} />
        </div>

        <Section label="Hôm qua đã làm gì?" content={report.completedYesterday} />
        <Section label="Đang làm dở gì?" content={report.doingYesterday} />
        <Section label="Có gì cản trở?" content={report.blockers} />
        <Section label="Hôm nay định làm gì?" content={report.planToday} />

        {isApproved && report.approver && (
          <div className="rounded-card border border-success/20 bg-success-container/10 p-3 space-y-1">
            <div className="flex items-center gap-2 text-[length:var(--text-body-sm)] text-success">
              <CheckCircle className="size-4" />
              <span>Đã duyệt bởi {report.approver.fullName}</span>
              {report.approvedAt && <span className="text-on-surface-variant">lúc {format(new Date(report.approvedAt), 'HH:mm dd/MM')}</span>}
            </div>
            {report.approvalComment && <p className="text-[length:var(--text-body-sm)] text-on-surface-variant">{report.approvalComment}</p>}
          </div>
        )}

        <div className="pt-2 border-t border-outline-variant/40">
          <h4 className="text-[length:var(--text-label)] font-semibold text-on-surface mb-3">Trao đổi</h4>
          <Suspense fallback={<Skeleton className="h-24" />}>
            <CommentThread reportId={report.id} currentUserId={currentUserId} isAdmin={isAdmin} />
          </Suspense>
        </div>
      </div>
    </Modal>
  );
}

function Section({ label, content }: { label: string; content: string }) {
  return (
    <div className="space-y-1">
      <h4 className="text-[length:var(--text-label)] font-medium text-on-surface-variant">{label}</h4>
      <p className="whitespace-pre-wrap text-[length:var(--text-body-sm)] text-on-surface">{content || '—'}</p>
    </div>
  );
}

function StatusBadge({ approved }: { approved: boolean }) {
  return approved ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-success-container px-2 py-0.5 text-[length:var(--text-caption)] text-on-success-container">
      <CheckCircle className="size-3" /> Đã duyệt
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-warning-container px-2 py-0.5 text-[length:var(--text-caption)] text-on-warning-container">
      <Clock className="size-3" /> Chờ duyệt
    </span>
  );
}

DailyReportDetailModal.displayName = 'DailyReportDetailModal';
