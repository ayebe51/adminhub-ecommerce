import React, { useState } from 'react';
import {
  User,
  Settings as SettingsIcon,
  Bell,
  Shield,
  Globe,
  Database,
  Save,
  Zap,
  Key,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

type SettingsTab = 'general' | 'profile' | 'notifications' | 'security' | 'integrations';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 3000);
    }, 1200);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <SettingsIcon size={18} /> },
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'integrations', label: 'Integrations', icon: <Database size={18} /> },
  ] as const;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border-primary)',
    background: 'var(--color-surface-tertiary)',
    color: 'var(--color-text-primary)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'var(--font-sans)',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    marginBottom: '8px',
  };

  const sectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '24px',
    animation: 'fade-in 0.3s ease-out',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Settings</h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
            Manage your store configurations and personal preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'var(--color-brand-600)',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            opacity: isSaving ? 0.7 : 1,
            transition: 'all var(--transition-fast)',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          {isSaving ? (
            <div style={{
              width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite'
            }} />
          ) : <Save size={18} />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        gap: '2px',
        background: 'var(--color-border-secondary)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border-primary)',
        overflow: 'hidden',
        minHeight: '600px',
      }}>
        {/* Nav Tabs */}
        <div style={{ background: 'var(--color-surface-secondary)', padding: '16px 8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  color: activeTab === tab.id ? 'var(--color-brand-400)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px',
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  transition: 'all var(--transition-fast)',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ background: 'var(--color-surface-card)', minHeight: '100%' }}>
          {activeTab === 'general' && (
            <div style={sectionStyle}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 16px' }}>Store Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>Store Name</label>
                    <input type="text" defaultValue="AdminHub Global" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Support Email</label>
                    <input type="email" defaultValue="support@adminhub.com" style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>Store Description</label>
                    <textarea 
                      defaultValue="Professional cross-border e-commerce management platform for large scale operations." 
                      rows={3} 
                      style={{ ...inputStyle, resize: 'vertical' }} 
                    />
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border-secondary)', paddingTop: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 16px' }}>Localization</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>Default Currency</label>
                    <select style={{ ...inputStyle, appearance: 'none' as const }}>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="IDR">IDR (Rp)</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Timezone</label>
                    <div style={{ position: 'relative' }}>
                      <select style={{ ...inputStyle, appearance: 'none' as const }}>
                        <option value="UTC">UTC / GMT</option>
                        <option value="WIB">WIB (UTC+07:00)</option>
                        <option value="EST">EST (UTC-05:00)</option>
                      </select>
                      <Globe size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '8px' }}>
                <div style={{ 
                  width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-brand-600)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '32px', fontWeight: 700
                }}>
                  A
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Admin Account</h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', margin: '4px 0 12px' }}>Your personal information as a Global Administrator</p>
                  <button style={{ 
                    padding: '6px 12px', fontSize: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-primary)',
                    background: 'var(--color-surface-tertiary)', color: 'var(--color-text-primary)', cursor: 'pointer'
                  }}>Change Avatar</button>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input type="text" defaultValue="Admin User" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Username</label>
                  <input type="text" defaultValue="admin_global" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Role</label>
                  <input type="text" value="Super Administrator" disabled style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div style={sectionStyle}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Notification Preferences</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { id: 'orders', title: 'New Orders', desc: 'Notify me when a new customer order is placed.', icon: <Smartphone size={18} /> },
                  { id: 'inventory', title: 'Stock Alerts', desc: 'Critical stock level warnings via push and email.', icon: <Database size={18} /> },
                  { id: 'promos', title: 'Campaign Status', desc: 'Updates when promotions start or expire.', icon: <Zap size={18} /> },
                ].map(pref => (
                  <div key={pref.id} style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-tertiary)' 
                  }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ color: 'var(--color-brand-400)' }}>{pref.icon}</div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{pref.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>{pref.desc}</div>
                      </div>
                    </div>
                    <div style={{ 
                      width: '44px', height: '24px', borderRadius: '12px', background: 'var(--color-brand-600)',
                      position: 'relative', cursor: 'pointer', padding: '2px'
                    }}>
                      <div style={{ 
                        width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                        position: 'absolute', right: '2px'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={sectionStyle}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Security Settings</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <Key size={20} style={{ color: 'var(--color-brand-400)' }} />
                    <span style={{ fontWeight: 600, fontSize: '15px' }}>Change Password</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input type="password" placeholder="Current Password" style={inputStyle} />
                    <input type="password" placeholder="New Password" style={inputStyle} />
                  </div>
                </div>

                <div style={{ padding: '20px', borderRadius: 'var(--radius-lg)', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-danger)', marginBottom: '4px' }}>Two-Factor Authentication</div>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '12px' }}>Enable 2FA to add an extra layer of security to your account.</p>
                  <button style={{ 
                    padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-text-danger)', color: 'white', fontSize: '12px', fontWeight: 600
                  }}>Enable 2FA</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Save Toast */}
      {showSavedToast && (
        <div style={{
          position: 'fixed', bottom: '40px', right: '40px',
          background: 'var(--color-surface-card)', border: '1px solid var(--color-border-success)',
          padding: '12px 20px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)',
          display: 'flex', alignItems: 'center', gap: '12px', animation: 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 1000
        }}>
          <CheckCircle2 color="var(--color-text-success)" size={20} />
          <span style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: 500 }}>Settings saved successfully</span>
        </div>
      )}

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
