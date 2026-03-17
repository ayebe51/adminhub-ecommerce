import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, Search, Undo2, Redo2, ChevronRight, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useBulkOperations } from '@/store/useBulkOperations';

const breadcrumbMap: Record<string, string> = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/inventory': 'Inventory',
  '/promotions': 'Promotions',
  '/audit': 'Audit Log',
  '/flags': 'Feature Flags',
  '/settings': 'Settings',
};

interface HeaderProps {
  onOpenPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPalette }) => {
  const [theme, setTheme] = React.useState<'dark' | 'light'>(
    (localStorage.getItem('theme') as 'dark' | 'light') || 'dark'
  );

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const { canUndo, canRedo, undo, redo, getUndoDescription, getRedoDescription } = useBulkOperations();

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    { label: 'Dashboard', path: '/' },
    ...pathSegments.map((_, i) => {
      const path = '/' + pathSegments.slice(0, i + 1).join('/');
      return { label: breadcrumbMap[path] || pathSegments[i], path };
    }),
  ];

  return (
    <header
      className="glass"
      style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)' as unknown as number,
        borderBottom: '1px solid var(--color-border-primary)',
      }}
    >
      {/* Left: Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {breadcrumbs.map((crumb, i) => (
          <React.Fragment key={crumb.path}>
            {i > 0 && <ChevronRight size={14} style={{ color: 'var(--color-text-tertiary)' }} />}
            {i === breadcrumbs.length - 1 ? (
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                style={{
                  fontSize: '14px',
                  color: 'var(--color-text-tertiary)',
                  textDecoration: 'none',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Undo/Redo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginRight: '8px' }}>
          <button
            onClick={() => undo()}
            disabled={!canUndo()}
            title={getUndoDescription() ? `Undo: ${getUndoDescription()}` : 'Nothing to undo'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              border: '1px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              color: canUndo() ? 'var(--color-text-secondary)' : 'var(--color-text-tertiary)',
              cursor: canUndo() ? 'pointer' : 'not-allowed',
              opacity: canUndo() ? 1 : 0.4,
              transition: 'all var(--transition-fast)',
            }}
            aria-label="Undo last operation"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={() => redo()}
            disabled={!canRedo()}
            title={getRedoDescription() ? `Redo: ${getRedoDescription()}` : 'Nothing to redo'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              border: '1px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              color: canRedo() ? 'var(--color-text-secondary)' : 'var(--color-text-tertiary)',
              cursor: canRedo() ? 'pointer' : 'not-allowed',
              opacity: canRedo() ? 1 : 0.4,
              transition: 'all var(--transition-fast)',
            }}
            aria-label="Redo last operation"
          >
            <Redo2 size={16} />
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            border: '1px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Search */}
        <button
          onClick={onOpenPalette}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            border: '1px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface-tertiary)',
            color: 'var(--color-text-tertiary)',
            cursor: 'pointer',
            fontSize: '13px',
            minWidth: '200px',
            transition: 'all var(--transition-fast)',
          }}
          aria-label="Search"
        >
          <Search size={15} />
          <span>Search...</span>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'var(--color-surface-elevated)',
              color: 'var(--color-text-tertiary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            ⌘K
          </span>
        </button>

        {/* Notifications */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            border: '1px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            position: 'relative',
            transition: 'all var(--transition-fast)',
          }}
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--color-status-danger)',
              border: '2px solid var(--color-surface-secondary)',
            }}
          />
        </button>

        {/* User */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 12px 6px 6px',
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            marginLeft: '4px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--color-brand-500), #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'SC'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
              {user?.name || 'Admin'}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
              {user?.role?.replace('_', ' ') || 'Super Admin'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
