import { RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import type { DashboardPeriod } from '../types/dashboard.types';

export interface DashboardHeaderProps {
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  period,
  onPeriodChange,
  onRefresh,
  isRefreshing,
}) => {
  const periods: { label: string; value: DashboardPeriod }[] = [
    { label: '24 Hours', value: '24h' },
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: 'All Time', value: 'all' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '32px',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '4px',
          }}
        >
          Executive Performance Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Real-time analytics synchronized via TanStack Query and Redux state.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {/* Period Selector Tabs */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            borderRadius: '12px',
            padding: '4px',
            gap: '4px',
          }}
        >
          {periods.map((item) => {
            const isActive = period === item.value;
            return (
              <button
                key={item.value}
                onClick={() => onPeriodChange(item.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Refresh Button */}
        <Button
          size="sm"
          variant="outline"
          isLoading={isRefreshing}
          leftIcon={<RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />}
          onClick={onRefresh}
        >
          Sync
        </Button>

        {/* Export Action */}
        <Button
          size="sm"
          variant="secondary"
          leftIcon={<Download size={14} />}
          onClick={() => {
            toast.success('Report exported successfully', {
              description: `Generated snapshot for ${period} timeline.`,
            });
          }}
        >
          Export
        </Button>
      </div>
    </div>
  );
};
