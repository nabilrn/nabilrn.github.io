const PRODUCTION_METRICS_API_BASE = 'https://portfolio-metrics-api.nabilrizkinavisa.workers.dev';

export const metricsApiBase =
  import.meta.env.PUBLIC_METRICS_API_BASE?.trim()
  || (import.meta.env.PROD ? PRODUCTION_METRICS_API_BASE : '');
