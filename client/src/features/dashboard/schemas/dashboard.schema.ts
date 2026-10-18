import { z } from 'zod';

export const dashboardPeriodSchema = z.enum(['24h', '7d', '30d', 'all']).default('7d');

export const dashboardSearchSchema = z.object({
  period: dashboardPeriodSchema.optional(),
  category: z.string().optional(),
});

export const metricItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number(),
  changePercentage: z.number(),
  trend: z.enum(['up', 'down', 'neutral']),
  isCurrency: z.boolean().default(false),
});

export const dashboardMetricsSchema = z.object({
  totalRevenue: metricItemSchema,
  activeUsers: metricItemSchema,
  conversionRate: metricItemSchema,
  systemLatency: metricItemSchema,
  lastUpdated: z.string(),
});
