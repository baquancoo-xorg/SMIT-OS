import type { LucideIcon } from 'lucide-react';
import {
  CalendarCheck,
  ClipboardCheck,
  FileText,
  Gauge,
  Link,
  Megaphone,
  Newspaper,
  Settings,
  Target,
  User,
  Users2,
  UsersRound,
} from 'lucide-react';

export type Workspace = 'command' | 'growth' | 'execution' | 'people' | 'admin';

export interface WorkspaceNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  workspace: Workspace;
  legacyHrefs?: string[];
}

export interface WorkspaceNavGroup {
  workspace: Workspace;
  label: string;
  eyebrow: string;
  items: WorkspaceNavItem[];
}

export const workspaceNavGroups: WorkspaceNavGroup[] = [
  {
    workspace: 'command',
    label: 'Command Center',
    eyebrow: 'Executive',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: Gauge, workspace: 'command' },
      { label: 'Reports', href: '/reports', icon: FileText, workspace: 'command' },
    ],
  },
  {
    workspace: 'growth',
    label: 'Growth Workspace',
    eyebrow: 'Acquisition',
    items: [
      { label: 'Leads', href: '/leads', icon: UsersRound, workspace: 'growth', legacyHrefs: ['/lead-tracker'] },
      { label: 'Ads', href: '/ads', icon: Megaphone, workspace: 'growth', legacyHrefs: ['/ads-tracker'] },
      { label: 'Media', href: '/media', icon: Newspaper, workspace: 'growth', legacyHrefs: ['/media-tracker'] },
    ],
  },
  {
    workspace: 'execution',
    label: 'Execution Workspace',
    eyebrow: 'Rhythm',
    items: [
      { label: 'OKRs', href: '/okrs', icon: Target, workspace: 'execution' },
      { label: 'Daily Sync', href: '/daily-sync', icon: ClipboardCheck, workspace: 'execution' },
      { label: 'Weekly Check-in', href: '/checkin', icon: CalendarCheck, workspace: 'execution' },
    ],
  },
  {
    workspace: 'people',
    label: 'People Workspace',
    eyebrow: 'People',
    items: [
      { label: 'Personnel', href: '/personnel', icon: Users2, workspace: 'people' },
    ],
  },
  {
    workspace: 'admin',
    label: 'Admin',
    eyebrow: 'System',
    items: [
      { label: 'Settings', href: '/settings', icon: Settings, workspace: 'admin' },
      { label: 'Profile', href: '/profile', icon: User, workspace: 'admin' },
      { label: 'Integrations', href: '/integrations', icon: Link, workspace: 'admin' },
    ],
  },
];

export const workspaceNavItems = workspaceNavGroups.flatMap(group => group.items);

export function findNavItem(pathname: string) {
  return workspaceNavItems.find(item => item.href === pathname || item.legacyHrefs?.includes(pathname));
}

export function findNavGroup(workspace: Workspace) {
  return workspaceNavGroups.find(group => group.workspace === workspace);
}
