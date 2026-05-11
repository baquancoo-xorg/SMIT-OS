import { Component, type ErrorInfo, type ReactNode } from 'react';
import { cn } from '../lib/cn';

interface Props {
  /** Custom fallback. Receives error + reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Side-effect on error (e.g. report to telemetry). */
  onError?: (error: Error, info: ErrorInfo) => void;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * v4 ErrorBoundary — catches render errors in subtree.
 * Default fallback renders an inline error panel; provide custom via `fallback` prop.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error, this.reset);

    return (
      <div
        role="alert"
        className={cn(
          'flex flex-col gap-snug rounded-card border border-error/40 bg-error-soft p-comfy text-fg',
        )}
      >
        <h2 className="text-h6 font-semibold text-error">Something went wrong</h2>
        <p className="text-body-sm text-fg-muted">{error.message}</p>
        <button
          type="button"
          onClick={this.reset}
          className="self-start rounded-pill bg-surface-overlay px-cozy py-tight text-body-sm text-fg hover:bg-outline transition-colors duration-fast"
        >
          Try again
        </button>
      </div>
    );
  }
}
