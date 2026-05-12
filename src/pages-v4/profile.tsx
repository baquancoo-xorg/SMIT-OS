import { User as UserIcon } from 'lucide-react';
import {
  Badge,
  Button,
  PageHeader,
  SurfaceCard,
} from '../design/v4/index.js';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileV4() {
  const { currentUser } = useAuth();

  return (
    <div className="flex flex-col gap-comfy">
      <PageHeader
        actions={<Button variant="primary">Edit profile</Button>}
      />
      <SurfaceCard padding="md" className="flex items-start gap-comfy">
        <div className="size-16 rounded-pill bg-surface-overlay border border-outline-subtle flex items-center justify-center shrink-0">
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt="avatar" className="size-16 rounded-pill object-cover" />
          ) : (
            <UserIcon size={28} className="text-fg-subtle" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-h5 font-semibold text-fg tracking-tight">
            {currentUser?.fullName ?? currentUser?.username ?? 'Unknown user'}
          </h2>
          <p className="text-body-sm text-fg-muted mt-tight">@{currentUser?.username ?? '—'}</p>
          <div className="flex flex-wrap gap-snug mt-snug">
            {currentUser?.isAdmin && <Badge intent="success">Admin</Badge>}
            {(currentUser?.departments ?? []).map((d) => (
              <Badge key={d} intent="info">{d}</Badge>
            ))}
            {currentUser?.scope && <Badge intent="neutral">{currentUser.scope}</Badge>}
          </div>
        </div>
      </SurfaceCard>
      <SurfaceCard padding="md">
        <h3 className="text-h6 font-semibold text-fg mb-snug">Activity</h3>
        <p className="text-body-sm text-fg-muted">Activity timeline coming in a follow-up sprint.</p>
      </SurfaceCard>
    </div>
  );
}
