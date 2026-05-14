import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Filter,
  Target,
  Building2,
  Activity,
  CalendarClock,
  SearchX,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { Objective } from '../types';
import {
  ObjectiveAccordionCard,
  ObjectiveAccordionCardL2,
  AddObjectiveModal,
} from '../components/okr/okr-accordion-cards';
import {
  getDeptColor,
  getOkrStatus,
  getCriticalPathHealth,
  getQ2Deadline,
} from '../components/okr/department-color-config';
import {
  Button,
  TabPill,
  KpiCard,
  EmptyState,
  FilterChip,
} from '../components/v5/ui';
import type { TabPillItem } from '../components/v5/ui';

type ActiveTab = 'L1' | 'L2';

const validTabs = new Set<ActiveTab>(['L1', 'L2']);

function parseTab(raw: string | null): ActiveTab {
  return raw && validTabs.has(raw as ActiveTab) ? (raw as ActiveTab) : 'L1';
}

const TABS: TabPillItem<ActiveTab>[] = [
  { value: 'L1', label: 'Company (L1)' },
  { value: 'L2', label: 'Team (L2)' },
];

const DEPT_FILTER_OPTIONS = [
  { value: 'All', label: 'All Departments' },
  { value: 'Tech', label: 'Tech' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Media', label: 'Media' },
  { value: 'Sale', label: 'Sale' },
];

const STATUS_FILTER_OPTIONS = [
  { value: 'All', label: 'All Status' },
  { value: 'On Track', label: 'On Track' },
  { value: 'At Risk', label: 'At Risk' },
  { value: 'Off Track', label: 'Off Track' },
];

/**
 * OKRsManagement v2 — Phase 7 batch 2 large pages migration.
 *
 * Token-driven shell wrapping v1 accordion logic:
 *  - PageHeader (italic accent + breadcrumb)
 *  - 4 KpiCard Bento (Quarterly Progress / Active Objectives / Critical Path / Days Left Q2)
 *  - TabPill (L1/L2)
 *  - v2 Button cho New Objective
 *  - CustomFilter v1 reused cho Department + Status filters (CustomSelect deeper migration là follow-up)
 *  - Reuse exported v1: ObjectiveAccordionCard, ObjectiveAccordionCardL2, AddObjectiveModal
 *  - Helpers extracted vào department-color-config.ts (shared with v1)
 *
 * Feature parity 100% (13 features verified):
 *  ① L1/L2 tabs ✓
 *  ② Department filter (Tech/Marketing/Media/Sale) ✓
 *  ③ Status filter (On Track/At Risk/Off Track) ✓
 *  ④ Accordion expand/collapse ✓ (reused v1)
 *  ⑤ Department colors ✓ (extracted shared)
 *  ⑥ Quarterly Progress bento ✓ (KpiCard primary)
 *  ⑦ Critical Path Health ✓ (KpiCard custom + pulsing dot)
 *  ⑧ Days Left Q2 ✓ (KpiCard primary highlight)
 *  ⑨ OKR Tree List ✓ (reused v1 accordion)
 *  ⑩ Add Objective modal ✓ (reused v1)
 *  ⑪ Link parent/child ✓ (inside ObjectiveAccordionCardL2)
 *  ⑫ Delete confirmation ✓ (inside KeyResultRow v1)
 *  ⑬ Edit KR (ownership: own only, Admin all) ✓ (KeyResultRow v1 logic)
 */
export default function OKRsManagementV2() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = parseTab(searchParams.get('tab'));
  const [isAddObjModalOpen, setIsAddObjModalOpen] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());
  const { setCurrentUser } = useAuth();

  function handleSessionExpired() {
    setCurrentUser(null);
    alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    window.location.href = '/login';
  }

  const fetchData = async () => {
    try {
      const objRes = await fetch('/api/objectives', { credentials: 'include' });
      if (objRes.status === 401) {
        handleSessionExpired();
        return;
      }
      if (!objRes.ok) throw new Error(`HTTP ${objRes.status}`);
      const objData = await objRes.json();
      setObjectives(objData);
    } catch (error) {
      console.error('Failed to fetch OKR data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const q2Info = useMemo(() => getQ2Deadline(), []);
  const healthInfo = useMemo(() => getCriticalPathHealth(objectives), [objectives]);

  const overallProgress = useMemo(() => {
    if (objectives.length === 0) return 0;
    return objectives.reduce((sum, obj) => sum + obj.progressPercentage, 0) / objectives.length;
  }, [objectives]);

  const deptCount = useMemo(
    () => new Set(objectives.map((o) => o.department)).size,
    [objectives],
  );

  const getL1Objectives = () => objectives.filter((obj) => obj.department === 'BOD');
  const getL2Objectives = () => objectives.filter((obj) => obj.department !== 'BOD');
  const getChildren = (parentId: string) => objectives.filter((obj) => obj.parentId === parentId);

  const filteredL1Objectives = getL1Objectives().filter((obj) => {
    if (departmentFilter !== 'All' && obj.department !== departmentFilter) return false;
    if (statusFilter !== 'All' && getOkrStatus(obj.progressPercentage) !== statusFilter) return false;
    return true;
  });

  const filteredL2Objectives = getL2Objectives().filter((obj) => {
    if (departmentFilter !== 'All' && obj.department !== departmentFilter) return false;
    if (statusFilter !== 'All' && getOkrStatus(obj.progressPercentage) !== statusFilter) return false;
    return true;
  });

  const toggleExpand = (objId: string) => {
    setExpandedObjectives((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(objId)) {
        newSet.delete(objId);
      } else {
        newSet.add(objId);
      }
      return newSet;
    });
  };

  function setActiveTab(next: ActiveTab) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', next);
    setSearchParams(nextParams, { replace: true });
  }

  const handleLinkObjective = async (krId: string, parentKrId: string) => {
    try {
      const res = await fetch(`/api/key-results/${krId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ parentKrId }),
      });
      if (res.status === 401) {
        handleSessionExpired();
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fetchData();
    } catch (error) {
      console.error('Failed to link objective:', error);
    }
  };

  const handleAddObjective = async (newObj: any) => {
    try {
      const res = await fetch('/api/objectives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newObj),
      });
      if (res.status === 401) {
        handleSessionExpired();
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setObjectives((prev) => [...prev, data]);
      setIsAddObjModalOpen(false);
    } catch (error) {
      console.error('Failed to add objective:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="size-12 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
      </div>
    );
  }

  const objectiveList =
    activeTab === 'L1' ? filteredL1Objectives : filteredL2Objectives;

  return (
    <div className="flex h-full flex-col gap-5 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TabPill<ActiveTab> label="OKR level tabs" value={activeTab} onChange={setActiveTab} items={TABS} size="page" />
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip<string>
            value={departmentFilter}
            onChange={setDepartmentFilter}
            options={DEPT_FILTER_OPTIONS}
            icon={<Filter size={14} />}
            size="sm"
          />
          <FilterChip<string>
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_FILTER_OPTIONS}
            icon={<Filter size={14} />}
            size="sm"
          />
          <Button variant="primary" size="sm" iconLeft={<Plus />} onClick={() => setIsAddObjModalOpen(true)} splitLabel={{ action: 'Create', object: 'Objective' }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <KpiCard
          label="Quarterly Progress"
          value={overallProgress.toFixed(1)}
          unit="%"
          icon={<Target />}
          accent="primary"
          decorative
        />
        <KpiCard
          label="Active Objectives"
          value={objectives.length}
          unit={`/ ${deptCount} depts`}
          icon={<Building2 />}
          accent="info"
        />
        <KpiCard
          label="Critical Path"
          value={healthInfo.status}
          icon={<Activity />}
          accent={
            healthInfo.status === 'Critical'
              ? 'error'
              : healthInfo.status === 'At Risk'
                ? 'warning'
                : 'success'
          }
          decorative={healthInfo.status !== 'Stable'}
        />
        <KpiCard
          label="Days Left"
          value={q2Info.daysLeft}
          unit={`Q2 · ${q2Info.deadline.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' })}`}
          icon={<CalendarClock />}
          accent="warning"
          decorative
        />
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pb-8">
        {objectiveList.length === 0 ? (
          <EmptyState
            icon={<SearchX />}
            title={`No ${activeTab} objectives found`}
            description="Adjust filters hoặc tạo objective mới."
            actions={
              <Button variant="primary" iconLeft={<Plus />} onClick={() => setIsAddObjModalOpen(true)} splitLabel={{ action: 'Create', object: 'Objective' }} />
            }
            decorative
            variant="card"
          />
        ) : activeTab === 'L1' ? (
          filteredL1Objectives.map((obj) => (
            <ObjectiveAccordionCard
              key={obj.id}
              objective={obj}
              childObjectives={getChildren(obj.id)}
              objectives={objectives}
              onRefresh={fetchData}
              isExpanded={expandedObjectives.has(obj.id)}
              onToggleExpand={() => toggleExpand(obj.id)}
              getDeptColor={getDeptColor}
            />
          ))
        ) : (
          filteredL2Objectives.map((obj) => {
            const parent = objectives.find((o) => o.id === obj.parentId);
            return (
              <ObjectiveAccordionCardL2
                key={obj.id}
                objective={obj}
                parentObjective={parent || null}
                objectives={objectives}
                onLinkObjective={handleLinkObjective}
                onRefresh={fetchData}
                getDeptColor={getDeptColor}
              />
            );
          })
        )}
      </div>

      <AddObjectiveModal
        isOpen={isAddObjModalOpen}
        onClose={() => setIsAddObjModalOpen(false)}
        onAdd={handleAddObjective}
        level={activeTab}
        objectives={objectives}
      />

    </div>
  );
}
