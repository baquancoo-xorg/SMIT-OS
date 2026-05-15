/**
 * PersonnelDetailDialog
 * Tabs: General Skills · Position Skills · Special Skills · Profile
 */
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { TabPill } from '@/components/ui/tab-pill';
import type { TabPillItem } from '@/components/ui/tab-pill';
import { RadarChart } from '@/components/ui/charts/radar-chart';
import type { RadarAxis } from '@/components/ui/charts/radar-chart';
import { usePersonnelDetail } from '@/hooks/use-personnel';
import type { SkillAssessment, SkillCategory } from '@/hooks/use-personnel';
import { User, Brain, Star, FileText } from 'lucide-react';
import { format } from 'date-fns';

type DetailTab = 'general' | 'position' | 'special' | 'profile';

const tabs: TabPillItem<DetailTab>[] = [
  { value: 'general',  label: 'General Skills',  icon: <User /> },
  { value: 'position', label: 'Position Skills',  icon: <Brain /> },
  { value: 'special',  label: 'Special Skills',   icon: <Star /> },
  { value: 'profile',  label: 'Profile',          icon: <FileText /> },
];

const LEVEL_LABEL: Record<string, string> = {
  INTERN: 'Intern', JUNIOR: 'Junior', MIDDLE: 'Middle',
  SENIOR: 'Senior', LEAD: 'Lead', MANAGER: 'Manager',
};

const TIER_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  EXCEPTIONAL: 'success',
  STRONG: 'success',
  DEVELOPING: 'warning',
  UNDERPERFORM: 'error',
};

function latestByCategory(assessments: SkillAssessment[], category: SkillCategory) {
  return assessments.filter(a => a.category === category)[0] ?? null;
}

function assessmentToAxes(assessment: SkillAssessment | null): RadarAxis[] {
  if (!assessment) return [];
  return (assessment.scoresJson ?? []).map(s => ({
    key: s.axis,
    label: s.axis,
    score: s.score,
    maxScore: s.maxScore ?? 5,
  }));
}

interface Props {
  userId: string | null;
  onClose: () => void;
}

export function PersonnelDetailDialog({ userId, onClose }: Props) {
  const [tab, setTab] = useState<DetailTab>('general');
  const { data, isLoading } = usePersonnelDetail(userId);

  const profile = data?.staffProfile ?? null;
  const generalAxes  = assessmentToAxes(latestByCategory(profile?.skillAssessments ?? [], 'GENERAL'));
  const positionAxes = assessmentToAxes(latestByCategory(profile?.skillAssessments ?? [], 'POSITION'));
  const specialItems = latestByCategory(profile?.skillAssessments ?? [], 'SPECIAL')?.scoresJson ?? [];
  const latestSnap   = profile?.performanceSnapshots?.[0] ?? null;

  return (
    <Modal
      open={!!userId}
      onClose={onClose}
      title={isLoading ? 'Loading…' : (data?.fullName ?? 'Personnel Detail')}
      size="lg"
    >
      {isLoading ? (
        <div className="space-y-3 p-1">
          <Skeleton variant="text" className="h-4 w-48" />
          <Skeleton variant="text" className="h-4 w-32" />
          <Skeleton variant="rect" className="h-64 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Sub-header: role + level + tier */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
            <span className="font-semibold text-text-1">{data?.scope ?? '—'}</span>
            {profile?.level && (
              <Badge variant="neutral" size="sm">{LEVEL_LABEL[profile.level]}</Badge>
            )}
            {latestSnap && (
              <Badge variant={TIER_VARIANT[latestSnap.tier] ?? 'neutral'} size="sm">
                {latestSnap.tier} · {latestSnap.adjustedScore.toFixed(2)}
              </Badge>
            )}
            {latestSnap && (
              <span className="text-xs text-text-muted">{latestSnap.periodLabel}</span>
            )}
          </div>

          <TabPill<DetailTab>
            label="Personnel detail tabs"
            value={tab}
            onChange={setTab}
            items={tabs}
            size="sm"
          />

          {/* General Skills */}
          {tab === 'general' && (
            <div className="flex flex-col items-center py-4">
              {generalAxes.length >= 3 ? (
                <RadarChart axes={generalAxes} size={280} />
              ) : (
                <p className="text-sm text-text-muted">No general skill assessment recorded yet.</p>
              )}
            </div>
          )}

          {/* Position Skills */}
          {tab === 'position' && (
            <div className="flex flex-col items-center py-4">
              {positionAxes.length >= 3 ? (
                <RadarChart axes={positionAxes} size={280} />
              ) : (
                <p className="text-sm text-text-muted">No position skill assessment recorded yet.</p>
              )}
            </div>
          )}

          {/* Special Skills */}
          {tab === 'special' && (
            <div className="py-4">
              {specialItems.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {specialItems.map(s => (
                    <div key={s.axis} className="flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-semibold text-text-1">
                      <Star size={11} className="text-[var(--brand-500)]" />
                      {s.axis}
                      <span className="font-normal text-text-muted">{s.score}/{s.maxScore ?? 5}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">No special skills recorded yet.</p>
              )}
            </div>
          )}

          {/* Profile */}
          {tab === 'profile' && (
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 py-2 text-sm">
              <ProfileRow label="Birth Date" value={data?.birthDate ? format(new Date(data.birthDate), 'dd/MM/yyyy') : '—'} />
              <ProfileRow label="Life Path №" value={profile?.lifePathNumber?.toString() ?? '—'} />
              <ProfileRow label="Personality №" value={profile?.personalityNumber?.toString() ?? '—'} />
              <ProfileRow label="DISC Profile" value={profile?.discProfile ?? '—'} />
              <ProfileRow label="IQ Score" value={profile?.iqScore?.toString() ?? '—'} />
              <ProfileRow label="EQ Score" value={profile?.eqScore?.toString() ?? '—'} />
              {profile?.numerologyNotes && (
                <div className="col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">Numerology Notes</span>
                  <p className="mt-1 text-text-1">{profile.numerologyNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-0.5 font-medium text-text-1">{value}</p>
    </div>
  );
}
