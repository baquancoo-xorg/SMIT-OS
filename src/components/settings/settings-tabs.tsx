import React from 'react';
import { Users, Calendar, Target, Facebook, UserCircle, FileSpreadsheet } from 'lucide-react';

export type SettingsTabId = 'users' | 'sprints' | 'okrs' | 'fb-config' | 'profile' | 'export';

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
  { id: 'export', label: 'Export', icon: FileSpreadsheet },
];

const MEMBER_TABS: Tab[] = [
  { id: 'profile', label: 'Profile', icon: UserCircle },
];

interface SettingsTabsProps {
  activeTab: SettingsTabId;
  onTabChange: (tab: SettingsTabId) => void;
  isAdmin: boolean;
}

export function SettingsTabs({ activeTab, onTabChange, isAdmin }: SettingsTabsProps) {
  const tabs = isAdmin ? ADMIN_TABS : MEMBER_TABS;

  return (
    <div className="flex h-10 bg-surface-container-high rounded-full shadow-sm p-0">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              isActive
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-500 hover:text-primary'
            }`}
          >
            <Icon size={12} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
