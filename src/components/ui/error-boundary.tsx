import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './button';
import { GlassCard } from './glass-card';

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback. Receives error + reset function. Default: built-in card. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Optional error reporter (Sentry, etc.). Called on `componentDidCatch`. */
  onError?: (error: Error, info: ErrorInfo) => void;
  /** Reset key — when changed, the boundary auto-resets. Use to recover on route change. */
  resetKey?: unknown;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * ErrorBoundary v2 — token-driven error fallback.
 *
 * Class component (React only supports error boundaries via class API).
 * Default fallback shows a centered card with reset button.
 * Pass custom `fallback` for page-level recovery patterns (e.g., redirect to /login).
 *
 * @example
 * <ErrorBoundary onError={reportToSentry}>
 *   <DashboardPage />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  componentDidUpdate(prev: ErrorBoundaryProps) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (error) {
      if (this.props.fallback) {
        return this.props.fallback(error, this.reset);
      }
      return <DefaultErrorFallback error={error} onReset={this.reset} />;
    }
    return this.props.children;
  }
}

function DefaultErrorFallback({ error, onReset }: { error: Error; onReset: () => void }) {
  return (
    <div className="flex min-h-[24rem] items-center justify-center p-6">
      <GlassCard variant="raised" padding="lg" className="w-full max-w-md text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-card bg-error-container text-on-error-container [&>svg]:size-6">
          <AlertTriangle aria-hidden="true" />
        </div>
        <h2 className="mt-4 font-headline text-[length:var(--text-h5)] font-bold text-on-surface">
          Something went wrong
        </h2>
        <p className="mt-2 text-[length:var(--text-body-sm)] text-on-surface-variant leading-snug">
          The application hit an unexpected error. Try again — if it keeps happening, refresh the page or contact support.
        </p>
        {import.meta.env?.DEV && (
          <pre className="mt-4 max-h-40 overflow-auto rounded-card bg-surface-container-low p-2 text-left text-[length:var(--text-caption)] text-on-surface-variant">
            <code>{error.message}</code>
          </pre>
        )}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Button variant="primary" iconLeft={<RotateCcw />} onClick={onReset}>
            Try again
          </Button>
          <Button variant="ghost" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
