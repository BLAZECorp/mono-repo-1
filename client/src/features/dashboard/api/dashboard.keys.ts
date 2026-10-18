import type { DashboardPeriod } from '../types/dashboard.types';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  metrics: () => [...dashboardKeys.all, 'metrics'] as const,
  metricsByPeriod: (period: DashboardPeriod = '7d') =>
    [...dashboardKeys.metrics(), period] as const,
};
