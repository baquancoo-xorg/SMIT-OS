import React from 'react';
import { Users, Calendar, Target, Facebook, ShieldCheck, UserCircle } from 'lucide-react';

export type SettingsTabId = 'users' | 'sprints' | 'okrs' | 'fb-config' | 'security' | 'profile';

interface Tab {
  id: SettingsTabId;
  label: string;
  icon: React.ElementType;
}

const ADMIN_TABS: Tab[] = [
  { id: 'profile', label: 'Profile', icon: UserCircle },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'sprints', label: 'Sprints', icon: Calendar },
  { id: 'okrs', label: 'OKRs', icon: Target },
  { id: 'fb-config', label: 'FB Config', icon: Facebook },
  { id: 'security', label: 'Security', icon: ShieldCheck },
];

const MEMBER_TABS: Tab[] = [
  { id: 'profile', label: 'Profile', icon: UserCircle },
  { id: 'security', label: 'Security', icon: ShieldCheck },
];

interface SettingsTabsProps {
  activeTab: SettingsTabId;
  onTabChange: (tab: SettingsTabId) => void;
  isAdmin: boolean;
}

export function SettingsTabs({ activeTab, onTabChange, isAdmin }: SettingsTabsProps) {
  const tabs = isAdmin ? ADMIN_TABS : MEMBER_TABS;

  return (
    <div className="flex gap-1 bg-surface-container-low p-1 rounded-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              isActive
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-slate-500 hover:text-on-surface'
            }`}
          >
            <Icon size={16} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
