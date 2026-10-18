import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { DollarSign, Users, Percent, Gauge, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useDashboardMetricsQuery } from '../api/dashboard.queries';
import { useDashboardFilter } from '../hooks/useDashboardFilter';
import { MetricCard } from '../components/MetricCard';
import { DashboardHeader } from '../components/DashboardHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppSelector } from '@/store/hooks';
import type { DashboardPeriod } from '../types/dashboard.types';

export interface DashboardViewProps {
  initialPeriod?: DashboardPeriod;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  initialPeriod = '7d',
}) => {
  const navigate = useNavigate();
  const { period, setPeriod } = useDashboardFilter(initialPeriod);
  const { data: metrics, isLoading, isFetching, refetch, isError } =
    useDashboardMetricsQuery(period);

  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);

  const handlePeriodChange = (newPeriod: DashboardPeriod) => {
    setPeriod(newPeriod);
    navigate({
      to: '/dashboard',
      search: (prev) => ({ ...prev, period: newPeriod }),
    });
    toast.info(`Updated view to ${newPeriod}`);
  };

  const handleRefresh = async () => {
    await refetch();
    toast.success('Metrics refreshed from server cache');
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
      <DashboardHeader
        period={period}
        onPeriodChange={handlePeriodChange}
        onRefresh={handleRefresh}
        isRefreshing={isFetching}
      />

      {isError && (
        <Card style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.3)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ef4444' }}>
            <AlertCircle size={20} />
            <span style={{ fontWeight: 600 }}>Failed to load metrics. Please check network connection.</span>
          </div>
        </Card>
      )}

      {/* Metrics KPI Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        {metrics && (
          <>
            <MetricCard
              metric={metrics.totalRevenue}
              icon={<DollarSign size={20} color="#6366f1" />}
            />
            <MetricCard
              metric={metrics.activeUsers}
              icon={<Users size={20} color="#10b981" />}
            />
            <MetricCard
              metric={metrics.conversionRate}
              icon={<Percent size={20} color="#f59e0b" />}
            />
            <MetricCard
              metric={metrics.systemLatency}
              icon={<Gauge size={20} color="#ec4899" />}
            />
          </>
        )}
      </div>

      {/* Architectural Telemetry Panel */}
      <Card>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            borderBottom: '1px solid var(--border-primary)',
            paddingBottom: '16px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Architecture Telemetry & Runtime State
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Verifying active TanStack Router, TanStack Query, and Redux bindings.
            </p>
          </div>
          <Badge variant="success">
            <CheckCircle2 size={13} style={{ marginRight: '4px' }} />
            All Systems Nominal
          </Badge>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            fontSize: '13px',
          }}
        >
          <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Query Status
            </span>
            <span style={{ fontWeight: 700, color: isLoading ? '#f59e0b' : '#10b981' }}>
              {isLoading ? 'Fetching...' : isFetching ? 'Background Syncing' : 'Fresh (Cached)'}
            </span>
          </div>

          <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Redux Client State
            </span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              Sidebar: {sidebarOpen ? 'Visible' : 'Collapsed'}
            </span>
          </div>

          <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Active Search Param
            </span>
            <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
              period = "{period}"
            </span>
          </div>

          <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Last Cache Hydration
            </span>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {metrics ? new Date(metrics.lastUpdated).toLocaleTimeString() : 'N/A'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
