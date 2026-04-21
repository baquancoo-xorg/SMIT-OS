import { useState, useMemo } from 'react';
import { WorkItem, Sprint, User } from '../types';

interface FilterOption {
  value: string;
  label: string;
}

interface UseGroupBoardFiltersParams {
  dept: string;
  items: WorkItem[];
  sprints: Sprint[];
  users: User[];
}

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'All', label: 'All' },
  { value: 'Todo', label: 'Todo' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Review', label: 'Review' },
  { value: 'Done', label: 'Done' },
];

export function useGroupBoardFilters({ dept, items, sprints, users }: UseGroupBoardFiltersParams) {
  const [selectedSprintId, setSelectedSprintId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('All');

  const sprintOptions = useMemo<FilterOption[]>(() => [
    { value: '', label: 'All Sprints' },
    ...sprints.map(s => ({ value: s.id, label: s.name }))
  ], [sprints]);

  const assigneeOptions = useMemo<FilterOption[]>(() => [
    { value: 'All', label: 'All' },
    ...users
      .filter(u => u.departments.includes(dept))
      .map(u => ({ value: u.id, label: u.fullName }))
  ], [users, dept]);

  const filteredItems = useMemo(() => {
    return items
      .filter(i => !selectedSprintId ? !!i.sprintId : i.sprintId === selectedSprintId)
      .filter(i => statusFilter === 'All' || i.status === statusFilter)
      .filter(i => assigneeFilter === 'All' || i.assigneeId === assigneeFilter);
  }, [items, selectedSprintId, statusFilter, assigneeFilter]);

  return {
    selectedSprintId, setSelectedSprintId,
    statusFilter, setStatusFilter,
    assigneeFilter, setAssigneeFilter,
    sprintOptions,
    statusOptions: STATUS_OPTIONS,
    assigneeOptions,
    filteredItems,
  };
}
