import { z } from 'zod';
import {
  dashboardPeriodSchema,
  dashboardSearchSchema,
  metricItemSchema,
  dashboardMetricsSchema,
} from '../schemas/dashboard.schema';

export type DashboardPeriod = z.infer<typeof dashboardPeriodSchema>;
export type DashboardSearchParams = z.infer<typeof dashboardSearchSchema>;
export type MetricItem = z.infer<typeof metricItemSchema>;
export type DashboardMetrics = z.infer<typeof dashboardMetricsSchema>;
