import { Suspense, useState } from 'react';
import { Users2 } from 'lucide-react';
import { PageHeader } from '../../components/ui/page-header';
import { PageSectionStack } from '../../components/ui/page-section-stack';
import { Skeleton } from '../../components/ui/skeleton';
import { PersonnelDetailDialog } from '../../components/workspace/admin/personnel/personnel-detail-dialog';
import { PersonnelTable } from '../../components/workspace/admin/personnel/personnel-table';
import { usePersonnelList } from '../../hooks/use-personnel';

function PersonnelContent() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: personnel = [], isLoading, error } = usePersonnelList();

  return (
    <>
      <PersonnelTable
        data={personnel}
        error={error instanceof Error ? error : null}
        isLoading={isLoading}
        onSelect={setSelectedId}
      />
      <PersonnelDetailDialog userId={selectedId} onClose={() => setSelectedId(null)} />
    </>
  );
}

export default function PersonnelPage() {
  return (
    <PageSectionStack>
      <PageHeader
        title="Personnel"
        description="Team skill matrix, performance scores, and growth tracking."
        breadcrumb={[{ label: 'People', icon: <Users2 size={14} /> }, { label: 'Personnel' }]}
      />
      <Suspense fallback={<Skeleton variant="rect" className="h-64 w-full rounded-[var(--radius-card)]" />}>
        <PersonnelContent />
      </Suspense>
    </PageSectionStack>
  );
}
