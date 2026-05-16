import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Briefcase, ShieldCheck, SlidersHorizontal, User as UserIcon } from 'lucide-react';
import { PageSectionStack, PageToolbar, TabPill } from '../components/ui';
import type { TabPillItem } from '../components/ui';
import { SettingsAppearanceTab, SettingsSecurityTab } from '../components/features/settings';
import { ProfileGeneralTab } from '../components/features/profile/profile-general-tab';

type ProfileTab = 'general' | 'security' | 'appearance';

const TABS: TabPillItem<ProfileTab>[] = [
  { value: 'general', label: 'Thông tin', icon: <UserIcon /> },
  { value: 'security', label: 'Bảo mật', icon: <ShieldCheck /> },
  { value: 'appearance', label: 'Giao diện', icon: <SlidersHorizontal /> },
];

const VALID = new Set<ProfileTab>(['general', 'security', 'appearance']);

export default function Profile() {
  const [params, setParams] = useSearchParams();
  const requested = (params.get('tab') ?? 'general') as ProfileTab;
  const activeTab: ProfileTab = VALID.has(requested) ? requested : 'general';

  function setActiveTab(next: ProfileTab) {
    const nextParams = new URLSearchParams(params);
    nextParams.set('tab', next);
    setParams(nextParams, { replace: true });
  }

  // memo TabPill items (icon JSX stable)
  const items = useMemo(() => TABS, []);

  return (
    <PageSectionStack className="min-h-full gap-6">
      <header className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-text-muted">
        <Briefcase className="size-3.5" aria-hidden="true" />
        <span>Profile</span>
      </header>

      <PageToolbar
        left={
          <div className="overflow-x-auto pb-1">
            <TabPill<ProfileTab>
              label="Profile sections"
              value={activeTab}
              onChange={setActiveTab}
              items={items}
              size="page"
            />
          </div>
        }
      />

      <section className="min-h-0 flex-1" aria-label="Profile content">
        <Suspense fallback={<div className="h-72 animate-pulse rounded-card bg-surface-2" />}>
          {activeTab === 'general' && <ProfileGeneralTab />}
          {activeTab === 'security' && <SettingsSecurityTab />}
          {activeTab === 'appearance' && <SettingsAppearanceTab />}
        </Suspense>
      </section>
    </PageSectionStack>
  );
}
