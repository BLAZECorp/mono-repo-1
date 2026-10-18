import { createFileRoute } from '@tanstack/react-router';
import {
  DashboardView,
  dashboardSearchSchema,
  dashboardMetricsQueryOptions,
} from '@/features/dashboard';

export const Route = createFileRoute('/dashboard')({
  validateSearch: (search: Record<string, unknown>) =>
    dashboardSearchSchema.parse(search),
  loaderDeps: ({ search: { period } }) => ({
    period,
  }),
  loader: ({ context: { queryClient }, deps }) => {
    return queryClient.ensureQueryData(
      dashboardMetricsQueryOptions(deps.period)
    );
  },
  component: DashboardRouteComponent,
});

function DashboardRouteComponent() {
  const search = Route.useSearch();
  return <DashboardView initialPeriod={search.period} />;
}
