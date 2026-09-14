import { Skeleton } from "../../components/ui-primitives";

export default function AppLoading() {
  return (
    <main className="app-loading-layout" aria-label="Loading workspace" aria-live="polite">
      <div className="loading-heading"><Skeleton className="skeleton-eyebrow" /><Skeleton className="skeleton-title" /><Skeleton className="skeleton-copy" /></div>
      <div className="loading-metrics">{Array.from({ length: 4 }, (_, index) => <Skeleton className="skeleton-metric" key={index} />)}</div>
      <div className="loading-panels"><Skeleton className="skeleton-panel" /><Skeleton className="skeleton-panel is-narrow" /></div>
      <span className="sr-only">Loading HARIKOS workspace.</span>
    </main>
  );
}
