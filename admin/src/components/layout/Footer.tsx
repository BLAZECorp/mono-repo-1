import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-primary)',
        padding: '24px 28px',
        backgroundColor: 'var(--bg-surface)',
        fontSize: '13px',
        color: 'var(--text-muted)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div>
          <span>© 2026 Veronque Group of Companies Corp. Standard React 19 Architecture.</span>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>TanStack Router + Query</span>
          <span>Redux Toolkit</span>
          <span>Zod Validated</span>
        </div>
      </div>
    </footer>
  );
};
