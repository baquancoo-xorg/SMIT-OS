import { Users, Calendar, Target, Facebook } from 'lucide-react';

export type SettingsTabId = 'users' | 'sprints' | 'okrs' | 'fb-config';

interface Tab {
  id: SettingsTabId;
  label: string;
  icon: React.ElementType;
}

export const SETTINGS_TABS: Tab[] = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'sprints', label: 'Sprints', icon: Calendar },
  { id: 'okrs', label: 'OKRs', icon: Target },
  { id: 'fb-config', label: 'FB Config', icon: Facebook },
];

interface SettingsTabsProps {
  activeTab: SettingsTabId;
  onTabChange: (tab: SettingsTabId) => void;
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  return (
    <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
      {SETTINGS_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              isActive
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
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
