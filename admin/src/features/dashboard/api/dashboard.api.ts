import { dashboardMetricsSchema } from '../schemas/dashboard.schema';
import type { DashboardMetrics, DashboardPeriod } from '../types/dashboard.types';
import { sleep } from '@/lib/utils';

/**
 * Fetch dashboard metrics with runtime Zod contract validation.
 * In a real application, this connects to an API endpoint via fetch or axios.
 */
export async function fetchDashboardMetrics(
  period: DashboardPeriod = '7d'
): Promise<DashboardMetrics> {
  // Simulate network latency (250ms)
  await sleep(250);

  const multiplier =
    period === '24h' ? 0.3 : period === '7d' ? 1 : period === '30d' ? 3.8 : 10;

  const rawData = {
    totalRevenue: {
      id: 'revenue',
      label: 'Gross Platform Revenue',
      value: Math.round(148250 * multiplier),
      changePercentage: 14.8,
      trend: 'up',
      isCurrency: true,
    },
    activeUsers: {
      id: 'users',
      label: 'Active Enterprise Users',
      value: Math.round(3420 * multiplier),
      changePercentage: 8.2,
      trend: 'up',
      isCurrency: false,
    },
    conversionRate: {
      id: 'conversion',
      label: 'Checkout Conversion',
      value: 4.85,
      changePercentage: -1.2,
      trend: 'down',
      isCurrency: false,
    },
    systemLatency: {
      id: 'latency',
      label: 'Median API Response',
      value: 38,
      changePercentage: -5.4,
      trend: 'up',
      isCurrency: false,
    },
    lastUpdated: new Date().toISOString(),
  };

  // Runtime boundary verification using Zod schema
  return dashboardMetricsSchema.parse(rawData);
}
