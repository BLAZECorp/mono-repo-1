import React from 'react';
import { Link } from '@tanstack/react-router';
import { LayoutDashboard, Home, Bell, Sparkles, Layers } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { incrementNotificationCount } from '@/store/slices/uiSlice';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const notificationCount = useAppSelector(
    (state) => state.ui.activeNotificationCount
  );

  const handleNotificationClick = () => {
    dispatch(incrementNotificationCount());
    toast.info('New system event triggered', {
      description: `Active notifications: ${notificationCount + 1}`,
    });
  };

  return (
    <header
      className="glass-panel"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid var(--border-primary)',
        padding: '14px 28px',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 800,
            fontSize: '18px',
            color: 'var(--text-primary)',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
            }}
          >
            <Layers size={20} />
          </div>
          <span>
            React<span className="gradient-text">Template</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            to="/"
            activeProps={{
              style: {
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent-primary)',
                fontWeight: 600,
              },
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            <Home size={16} />
            <span>Overview</span>
          </Link>

          <Link
            to="/dashboard"
            activeProps={{
              style: {
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent-primary)',
                fontWeight: 600,
              },
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </Link>
        </nav>

        {/* Actions / Notifications */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleNotificationClick}
            aria-label="View notifications"
            style={{
              position: 'relative',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-card)',
              transition: 'all 0.15s ease',
            }}
          >
            <Bell size={18} />
            {notificationCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  borderRadius: '9999px',
                  padding: '1px 6px',
                  minWidth: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)',
                }}
              >
                {notificationCount}
              </span>
            )}
          </button>

          <Button
            size="sm"
            variant="primary"
            leftIcon={<Sparkles size={14} />}
            onClick={() => toast.success('Enterprise Stack Active: React 19 + TanStack + Redux')}
          >
            VGC Standard
          </Button>
        </div>
      </div>
    </header>
  );
};
