import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Package,
  Warehouse,
  Zap,
  ClipboardList,
  Flag,
  Settings,
  ArrowRight,
  Command,
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  category: 'Navigation' | 'Products' | 'Actions';
  icon: React.ReactNode;
  path?: string;
  action?: () => void;
}

export const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const commands: CommandItem[] = [
    { id: 'dash', label: 'Go to Dashboard', category: 'Navigation', icon: <LayoutDashboard size={16} />, path: '/' },
    { id: 'prod', label: 'Browse Products', category: 'Navigation', icon: <Package size={16} />, path: '/products' },
    { id: 'inv', label: 'Check Inventory', category: 'Navigation', icon: <Warehouse size={16} />, path: '/inventory' },
    { id: 'promo', label: 'Manage Promotions', category: 'Navigation', icon: <Zap size={16} />, path: '/promotions' },
    { id: 'audit', label: 'View Audit Logs', category: 'Navigation', icon: <ClipboardList size={16} />, path: '/audit' },
    { id: 'flags', label: 'Feature Flags', category: 'Navigation', icon: <Flag size={16} />, path: '/flags' },
    { id: 'settings', label: 'Open Settings', category: 'Navigation', icon: <Settings size={16} />, path: '/settings' },
    { id: 'new-promo', label: 'Create New Promotion', category: 'Actions', icon: <Zap size={16} />, action: () => navigate('/promotions') },
    { id: 'export', label: 'Export Inventory CSV', category: 'Actions', icon: <ArrowRight size={16} />, action: () => navigate('/inventory') },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          if (selected.path) navigate(selected.path);
          if (selected.action) selected.action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
      }}
      onClick={onClose}
    >
      <div
        className="animate-scale-in"
        style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: 'var(--color-surface-secondary)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border-primary)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Search size={20} color="var(--color-text-tertiary)" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              color: 'var(--color-text-primary)',
              fontSize: '16px',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <kbd style={{ padding: '2px 6px', background: 'var(--color-surface-tertiary)', borderRadius: '4px', fontSize: '10px', color: 'var(--color-text-tertiary)' }}>ESC</kbd>
          </div>
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px' }}>
          {filteredCommands.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
              No commands found for "{search}"
            </div>
          ) : (
            <div>
              {Array.from(new Set(filteredCommands.map(c => c.category))).map(category => (
                <div key={category}>
                  <div style={{ padding: '12px 12px 4px', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {category}
                  </div>
                  {filteredCommands.filter(c => c.category === category).map((cmd) => {
                    const globalIdx = filteredCommands.indexOf(cmd);
                    const isSelected = globalIdx === selectedIndex;
                    return (
                      <div
                        key={cmd.id}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        onClick={() => {
                          if (cmd.path) navigate(cmd.path);
                          if (cmd.action) cmd.action();
                          onClose();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'var(--color-brand-600)' : 'transparent',
                          color: isSelected ? 'white' : 'var(--color-text-secondary)',
                          transition: 'all 0.1s ease',
                        }}
                      >
                        <div style={{ opacity: isSelected ? 1 : 0.7 }}>{cmd.icon}</div>
                        <span style={{ flex: 1, fontSize: '14px', fontWeight: isSelected ? 500 : 400 }}>{cmd.label}</span>
                        {isSelected && <ArrowRight size={14} />}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '12px 16px', background: 'var(--color-surface-tertiary)', borderTop: '1px solid var(--color-border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
              <kbd style={{ padding: '2px 4px', background: 'var(--color-surface-elevated)', borderRadius: '3px', border: '1px solid var(--color-border-primary)' }}>↵</kbd>
              <span>to select</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
              <kbd style={{ padding: '2px 4px', background: 'var(--color-surface-elevated)', borderRadius: '3px', border: '1px solid var(--color-border-primary)' }}>↑↓</kbd>
              <span>to navigate</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
            <Command size={10} />
            <span>Command Palette</span>
          </div>
        </div>
      </div>
    </div>
  );
};
