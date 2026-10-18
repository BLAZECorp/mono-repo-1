import { useState, useCallback } from 'react';
import type { DashboardPeriod } from '../types/dashboard.types';

export interface UseDashboardFilterReturn {
  period: DashboardPeriod;
  setPeriod: (period: DashboardPeriod) => void;
  isCustomizing: boolean;
  toggleCustomizing: () => void;
}

/**
 * Pure UI & composite logic hook for dashboard filtering.
 * Kept strictly in hooks/ separate from api/ network query logic.
 */
export function useDashboardFilter(
  initialPeriod: DashboardPeriod = '7d'
): UseDashboardFilterReturn {
  const [period, setPeriod] = useState<DashboardPeriod>(initialPeriod);
  const [isCustomizing, setIsCustomizing] = useState(false);

  const toggleCustomizing = useCallback(() => {
    setIsCustomizing((prev) => !prev);
  }, []);

  return {
    period,
    setPeriod,
    isCustomizing,
    toggleCustomizing,
  };
}
