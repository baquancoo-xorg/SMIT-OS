import { useQuery } from '@tanstack/react-query';

export interface User {
  id: string;
  fullName: string;
  username: string;
  departments: string[];
  role: string;
  scope: string | null;
  avatar: string;
  isAdmin: boolean;
}

async function fetchUsers(): Promise<User[]> {
  const res = await fetch('/api/users', { credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
}
