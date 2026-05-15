import { useEffect, useState, Suspense } from 'react';
import { format } from 'date-fns';
import { FileText, CheckCircle, Clock, Send } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CommentThread } from './comment-thread';
import { useApproveDailyReportMutation } from '@/hooks/use-daily-reports';

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
  onApproved?: () => void;
}

export function DailyReportDetailModal({ open, onClose, report, currentUserId, isAdmin, onApproved }: DailyReportDetailModalProps) {
  const [approveComment, setApproveComment] = useState('');
  const approveMutation = useApproveDailyReportMutation();

  useEffect(() => {
    setApproveComment('');
  }, [report?.id]);

  if (!report) return null;

  const isApproved = report.status === 'Approved';
  const canApprove = isAdmin && !isApproved;
  const dateFormatted = format(new Date(report.reportDate), 'dd/MM/yyyy');

  async function handleApprove() {
    const comment = approveComment.trim();
    if (!comment) return;

    await approveMutation.mutateAsync({ id: report.id, comment });
    onApproved?.();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Báo cáo ngày ${dateFormatted}`}
      icon={<FileText />}
      size="xl"
      footer={canApprove ? (
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[length:var(--text-body-sm)] text-on-surface-variant">
            Nhập nhận xét trước khi phê duyệt báo cáo.
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Đóng</Button>
            <Button
              variant="primary"
              iconLeft={<Send />}
              disabled={!approveComment.trim() || approveMutation.isPending}
              isLoading={approveMutation.isPending}
              onClick={handleApprove}
            >Approve Report</Button>
          </div>
        </div>
      ) : (
        <Button variant="ghost" onClick={onClose}>Đóng</Button>
      )}
    >
      <div className="flex flex-col gap-5">
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

        {canApprove && (
          <div className="rounded-card border border-outline-variant/40 bg-surface-container-low p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface">
                Phê duyệt báo cáo
              </h4>
              <span className="text-[length:var(--text-caption)] text-on-surface-variant">
                Cần nhận xét trước khi duyệt
              </span>
            </div>
            <textarea
              value={approveComment}
              onChange={(e) => setApproveComment(e.target.value)}
              placeholder="Nhập nhận xét phê duyệt..."
              className="min-h-28 w-full rounded-input border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-[length:var(--text-body)] text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none"
            />
          </div>
        )}

        <div className="pt-2 border-t border-outline-variant/40">
          <h4 className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface mb-3">Trao đổi</h4>
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
      <h4 className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-wide)] text-on-surface">
        {label}
      </h4>
      <p className="whitespace-pre-wrap text-[length:var(--text-body)] leading-[1.65] text-on-surface">{content || '—'}</p>
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
