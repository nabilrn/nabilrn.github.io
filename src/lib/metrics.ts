export const DEFAULT_METRICS_API_BASE = 'https://portfolio-metrics-api.nabilrizkinavisa.workers.dev';

export function normalizeApiBase(value?: string): string {
  return value?.trim().replace(/\/+$/, '') ?? '';
}

export function getMetricsApiBase(): string {
  const configured = normalizeApiBase(import.meta.env.PUBLIC_METRICS_API_BASE);
  if (configured) return configured;
  return import.meta.env.PROD ? DEFAULT_METRICS_API_BASE : '';
}
