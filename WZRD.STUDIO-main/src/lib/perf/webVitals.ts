import type { Metric } from 'web-vitals';
import { onCLS, onFID, onLCP, onINP } from 'web-vitals';

type MetricHandler = (metric: Metric) => void;

declare global {
  interface Window {
    __WZRD_METRICS__?: Metric[];
  }
}

const defaultHandler: MetricHandler = (metric) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info(`[web-vitals] ${metric.name}`, metric.value, metric);
  }
  if (typeof window !== 'undefined') {
    window.__WZRD_METRICS__ = window.__WZRD_METRICS__ ?? [];
    window.__WZRD_METRICS__.push(metric);
  }
};

export const reportWebVitals = (handler: MetricHandler = defaultHandler) => {
  onCLS(handler);
  onFID(handler);
  onLCP(handler);
  onINP(handler);
};
