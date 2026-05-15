import { useState } from 'react';
import { Button } from '@/ui/components/primitives/button';
import { LogoMark } from '@/ui/components/layout/logo-mark';
import { KpiCard } from '@/ui/components/data/kpi-card';
import { Plus, ArrowRight, Filter, Trash2, Check } from 'lucide-react';
import type { RouteKey } from '@/ui/components/layout/logo-mark/positions';

const ROUTES: RouteKey[] = [
  'dashboard', 'okrs', 'leads', 'ads',
  'media', 'daily-sync', 'checkin', 'settings'
];

export default function V6Storybook() {
  const [logoRoute, setLogoRoute] = useState<RouteKey>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  return (
    <div
      className={`v6 ${theme}`}
      style={{
        minHeight: '100vh',
        background: 'var(--v6-bg)',
        padding: '32px',
        color: 'var(--v6-text-1)',
      }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em' }}>
            SMIT OS v6 — Storybook
          </h1>
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              background: 'var(--v6-surface-2)',
              color: 'var(--v6-text-1)',
              border: '0.5px solid var(--v6-border)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Toggle {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </header>

        {/* Button section */}
        <section>
          <h2 style={{
            fontSize: 11,
            color: 'var(--v6-text-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 16,
            fontWeight: 500,
          }}>
            Buttons — 7 variants
          </h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button variant="primary-sheen" icon={<ArrowRight size={14} />} iconPosition="right">
              Get started
            </Button>
            <Button variant="primary" icon={<Plus size={14} />}>
              Create
            </Button>
            <Button variant="secondary">
              Cancel
            </Button>
            <Button variant="ghost">
              Skip
            </Button>
            <Button variant="outline" icon={<Filter size={14} />}>
              Filter
            </Button>
            <Button variant="destructive" icon={<Trash2 size={14} />}>
              Delete
            </Button>
            <Button variant="success" icon={<Check size={14} />}>
              Confirm
            </Button>
          </div>

          <div style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 11, color: 'var(--v6-text-3)', marginBottom: 8 }}>Sizes</h3>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="default">Default</Button>
              <Button variant="primary" size="lg">Large</Button>
            </div>
          </div>
        </section>

        {/* Logo section */}
        <section>
          <h2 style={{
            fontSize: 11,
            color: 'var(--v6-text-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 16,
            fontWeight: 500,
          }}>
            Logo Mark · click route to animate
          </h2>
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <div style={{
              padding: 24,
              background: 'var(--v6-surface)',
              borderRadius: 16,
              border: '0.5px solid var(--v6-border)',
            }}>
              <LogoMark route={logoRoute} size={96} />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxWidth: 400 }}>
              {ROUTES.map(r => (
                <button
                  key={r}
                  onClick={() => setLogoRoute(r)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 500,
                    background: logoRoute === r ? 'var(--v6-surface-2)' : 'transparent',
                    color: logoRoute === r ? 'var(--v6-text-1)' : 'var(--v6-text-3)',
                    border: logoRoute === r ? '0.5px solid var(--v6-primary-border)' : '0.5px solid var(--v6-border)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* KPI section */}
        <section>
          <h2 style={{
            fontSize: 11,
            color: 'var(--v6-text-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 16,
            fontWeight: 500,
          }}>
            KPI Cards · 1 featured (glow on hover)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, maxWidth: 520 }}>
            <KpiCard
              featured
              label="Revenue today"
              value="284,500,000"
              delta={{ value: 18.4, direction: 'up', label: 'vs yesterday' }}
            />
            <KpiCard
              label="Ad spend"
              value="52,300,000"
              delta={{ value: 3.2, direction: 'down' }}
            />
            <KpiCard
              label="Signups"
              value="847"
              delta={{ value: 26, direction: 'up' }}
            />
            <KpiCard
              label="ROAS"
              value="5.44x"
              delta={{ value: 12, direction: 'up' }}
            />
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          marginTop: 40,
          paddingTop: 20,
          borderTop: '0.5px solid var(--v6-border)',
          fontSize: 12,
          color: 'var(--v6-text-3)',
        }}>
          SMIT OS v6 Design System · Stage 0 Foundation · ADR-001
        </footer>
      </div>
    </div>
  );
}
