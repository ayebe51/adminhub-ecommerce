import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppShell: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          marginLeft: '260px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          transition: 'margin-left var(--transition-base)',
        }}
      >
        <Header />
        <main
          style={{
            flex: 1,
            padding: 'var(--space-page)',
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
