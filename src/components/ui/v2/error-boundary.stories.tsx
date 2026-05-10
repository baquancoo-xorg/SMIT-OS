import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ErrorBoundary } from './error-boundary';
import { Button } from './button';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'v2/Misc/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'React error boundary with token-driven fallback. Pass `fallback` for custom recovery UI. `resetKey` auto-resets on change (e.g., route navigation).',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

/** Self-contained throw trigger — state lives inside, so boundary reset (which remounts children) clears it. */
function BombButton() {
  const [throwIt, setThrowIt] = useState(false);
  if (throwIt) {
    throw new Error('💥 Demo error: something went wrong inside <BombButton>.');
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-on-surface">No error yet. Click below to throw.</p>
      <Button variant="destructive" onClick={() => setThrowIt(true)}>Throw error</Button>
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <ErrorBoundary>
      <BombButton />
    </ErrorBoundary>
  ),
};

export const CustomFallback: Story = {
  render: () => (
    <ErrorBoundary
      fallback={(err, reset) => (
        <div className="rounded-card border border-error/40 bg-error-container/20 p-4">
          <p className="font-semibold text-on-surface">Custom fallback fired</p>
          <p className="mt-1 text-sm text-on-surface-variant">{err.message}</p>
          <Button size="sm" className="mt-3" onClick={reset}>Reset</Button>
        </div>
      )}
    >
      <BombButton />
    </ErrorBoundary>
  ),
};

export const ResetKey: Story = {
  render: () => {
    const [route, setRoute] = useState<'a' | 'b'>('a');

    return (
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Button
            variant={route === 'a' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setRoute('a')}
          >
            Route A
          </Button>
          <Button
            variant={route === 'b' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setRoute('b')}
          >
            Route B (auto-resets boundary)
          </Button>
        </div>

        <ErrorBoundary resetKey={route}>
          <div className="flex flex-col gap-3 rounded-card border border-outline-variant p-4">
            <p className="text-sm text-on-surface">Current route: <strong>{route}</strong></p>
            <BombButton />
          </div>
        </ErrorBoundary>

        <p className="text-xs text-on-surface-variant">
          After throwing, switch routes — the boundary auto-resets because <code>resetKey</code> changed.
        </p>
      </div>
    );
  },
};
