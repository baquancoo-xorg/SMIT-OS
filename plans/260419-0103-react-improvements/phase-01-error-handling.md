# Phase 1: Error Handling

**Effort:** 1.5h | **Priority:** P0 | **Status:** completed

## Tasks

### 1.1 Create ErrorBoundary Component

**Create src/components/ui/ErrorBoundary.tsx:**
```tsx
import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-4 text-sm">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### 1.2 Wrap Major Sections in AppLayout

**Update src/components/layout/AppLayout.tsx:**
```tsx
import { ErrorBoundary } from '../ui/ErrorBoundary';

// Wrap main content area
<ErrorBoundary>
  <main className="...">
    <Outlet />
  </main>
</ErrorBoundary>
```

### 1.3 Add Error State to Data Fetching Components

**Pattern for Header.tsx, PMDashboard.tsx, TaskModal.tsx:**
```tsx
const [error, setError] = useState<string | null>(null);

const fetchData = async () => {
  try {
    setError(null);
    const data = await api.get('/endpoint');
    setData(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load data');
    console.error(err);
  }
};

// In render:
{error && (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-red-600 text-sm">{error}</p>
    <button onClick={fetchData} className="text-red-600 underline text-sm mt-2">
      Retry
    </button>
  </div>
)}
```

### 1.4 Export from index.ts

**Update src/components/ui/index.ts:**
```tsx
export { ErrorBoundary } from './ErrorBoundary';
```

## Checklist

- [ ] ErrorBoundary component created
- [ ] Exported from ui/index.ts
- [ ] Wrapped main content in AppLayout
- [ ] Header.tsx has error state + retry
- [ ] PMDashboard.tsx has error state + retry
- [ ] TaskModal.tsx has error state + retry
- [ ] Test: Throw error in component, see error UI
