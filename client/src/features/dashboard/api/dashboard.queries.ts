import { queryOptions, useQuery } from '@tanstack/react-query';
import { dashboardKeys } from './dashboard.keys';
import { fetchDashboardMetrics } from './dashboard.api';
import type { DashboardPeriod } from '../types/dashboard.types';

/**
 * Query options definition for dashboard metrics.
 * Designed to be consumed BOTH by TanStack Router route loaders (for prefetching)
 * and by React components (via useQuery).
 */
export const dashboardMetricsQueryOptions = (period: DashboardPeriod = '7d') =>
  queryOptions({
    queryKey: dashboardKeys.metricsByPeriod(period),
    queryFn: () => fetchDashboardMetrics(period),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

/**
 * Custom TanStack Query hook for dashboard metrics.
 */
export const useDashboardMetricsQuery = (period: DashboardPeriod = '7d') => {
  return useQuery(dashboardMetricsQueryOptions(period));
};
