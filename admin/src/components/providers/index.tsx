import React from 'react';
import { QueryProvider } from './QueryProvider';
import { ReduxProvider } from './ReduxProvider';
import { ToastProvider } from './ToastProvider';

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <QueryProvider>
        <ToastProvider>{children}</ToastProvider>
      </QueryProvider>
    </ReduxProvider>
  );
}

export { QueryProvider } from './QueryProvider';
export { ReduxProvider } from './ReduxProvider';
export { ToastProvider } from './ToastProvider';
