import React from 'react';
import { Toaster as SonnerToaster } from 'sonner';
import { Toaster as HotToaster } from 'react-hot-toast';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* Modern Sonner Toaster (Primary enterprise toast) */}
      <SonnerToaster
        position="top-right"
        richColors
        closeButton
        theme="system"
      />
      {/* React Hot Toast support */}
      <HotToaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />
    </>
  );
}
