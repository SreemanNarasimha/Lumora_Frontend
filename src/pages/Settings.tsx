import React, { useState } from 'react';
import { Moon, Sun, Monitor, Palette, Zap, Layers, Type, Lock, Eye, EyeOff, Download, Trash2 } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { BackButton } from '../components/ui/BackButton';
import api from '../api/axios';
import './Settings.css';

const TABS = ['General', 'Appearance', 'Security', 'Language', 'Privacy', 'About'] as const;
type SettingsTab = typeof TABS[number];

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('Appearance');
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [animations, setAnimations] = useState(true);
  const [blurLevel, setBlurLevel] = useState<'low' | 'medium' | 'high'>('high');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [cornerRadius, setCornerRadius] = useState(22);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityLoading(true);
    setSecurityError('');
    setSecuritySuccess('');
    try {
      await api.post('/users/me/change-password', { currentPassword, newPassword });
      setSecuritySuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setSecurityError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await api.get('/users/me'); // Or a dedicated export endpoint if we had one
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `Lumora_MyData_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to export data.');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you ABSOLUTELY sure you want to delete your account? This action cannot be undone and you will lose access to all your order history.')) {
      try {
        await api.delete('/users/me/account');
        alert('Your account has been deleted.');
        window.location.href = '/login';
      } catch (err) {
        alert('Failed to delete account.');
      }
    }
  };

  return (
    <PageWrapper>
      <div className="settings-page">
        <BackButton label="Back to Profile" />
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '42px', color: 'var(--text-primary)', marginBottom: 'var(--space-8)' }}>Settings</h1>

        <div className="settings-layout">
          {/* Tab nav */}
          <nav className="settings-tab-nav" aria-label="Settings sections">
            {TABS.map(tab => (
              <button
                key={tab}
                className={`settings-tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
                role="tab"
                aria-selected={activeTab === tab}
              >
                {tab}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="settings-content" role="tabpanel">
            {activeTab === 'Appearance' && (
              <div className="settings-panel">
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--text-primary)', marginBottom: 'var(--space-6)' }}>Appearance</h2>

                {/* Theme */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <Palette size={20} strokeWidth={1.5} />
                    <div>
                      <p>Theme</p>
                      <p>Choose your preferred colour scheme</p>
                    </div>
                  </div>
                  <div className="theme-selector" role="radiogroup" aria-label="Theme">
                    {(['dark', 'light', 'system'] as const).map(t => (
                      <button
                        key={t}
                        className={`theme-option ${theme === t ? 'active' : ''}`}
                        onClick={() => setTheme(t)}
                        role="radio"
                        aria-checked={theme === t}
                        aria-label={`${t.charAt(0).toUpperCase() + t.slice(1)} theme`}
                      >
                        {t === 'dark' && <Moon size={16} strokeWidth={1.5} />}
                        {t === 'light' && <Sun size={16} strokeWidth={1.5} />}
                        {t === 'system' && <Monitor size={16} strokeWidth={1.5} />}
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-divider" />

                {/* Animations */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <Zap size={20} strokeWidth={1.5} />
                    <div>
                      <p>Animations</p>
                      <p>Enable micro-animations and transitions</p>
                    </div>
                  </div>
                  <button
                    className={`toggle-switch ${animations ? 'on' : ''}`}
                    onClick={() => setAnimations(v => !v)}
                    role="switch"
                    aria-checked={animations}
                    aria-label="Toggle animations"
                  >
                    <span className="toggle-thumb" />
                  </button>
                </div>

                <div className="settings-divider" />

                {/* Glass Blur */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <Layers size={20} strokeWidth={1.5} />
                    <div>
                      <p>Glass Blur</p>
                      <p>Backdrop blur intensity for glass surfaces</p>
                    </div>
                  </div>
                  <div className="segment-control" role="radiogroup" aria-label="Glass blur level">
                    {(['low', 'medium', 'high'] as const).map(lvl => (
                      <button
                        key={lvl}
                        className={`segment-btn ${blurLevel === lvl ? 'active' : ''}`}
                        onClick={() => setBlurLevel(lvl)}
                        role="radio"
                        aria-checked={blurLevel === lvl}
                      >
                        {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-divider" />

                {/* Rounded corners */}
                <div className="settings-row settings-row-vertical">
                  <div className="settings-row-label">
                    <Layers size={20} strokeWidth={1.5} />
                    <div>
                      <p>Corner Radius <span style={{ color: 'var(--text-secondary)' }}>{cornerRadius}px</span></p>
                      <p>Adjust card corner roundness</p>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={32}
                    value={cornerRadius}
                    onChange={e => setCornerRadius(Number(e.target.value))}
                    className="settings-range"
                    aria-label={`Corner radius: ${cornerRadius}px`}
                  />
                </div>

                <div className="settings-divider" />

                {/* Font size */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <Type size={20} strokeWidth={1.5} />
                    <div>
                      <p>Font Size</p>
                      <p>Adjust text size across the app</p>
                    </div>
                  </div>
                  <div className="segment-control" role="radiogroup" aria-label="Font size">
                    {(['small', 'medium', 'large'] as const).map(s => (
                      <button
                        key={s}
                        className={`segment-btn ${fontSize === s ? 'active' : ''}`}
                        onClick={() => setFontSize(s)}
                        role="radio"
                        aria-checked={fontSize === s}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-divider" />

                {/* Reduce motion */}
                <div className="settings-row">
                  <div className="settings-row-label">
                    <Zap size={20} strokeWidth={1.5} />
                    <div>
                      <p>Reduce Motion</p>
                      <p>Minimise animations for accessibility</p>
                    </div>
                  </div>
                  <button
                    className={`toggle-switch ${reduceMotion ? 'on' : ''}`}
                    onClick={() => setReduceMotion(v => !v)}
                    role="switch"
                    aria-checked={reduceMotion}
                    aria-label="Toggle reduce motion"
                  >
                    <span className="toggle-thumb" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'Security' && (
              <div className="settings-panel">
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--text-primary)', marginBottom: 'var(--space-6)' }}>Security</h2>

                <div className="settings-row" style={{ alignItems: 'flex-start' }}>
                  <div className="settings-row-label">
                    <Lock size={20} strokeWidth={1.5} />
                    <div>
                      <p>Change Password</p>
                      <p>Update your account password</p>
                    </div>
                  </div>
                  <div style={{ flex: 1, maxWidth: '400px' }}>
                    {securityError && (
                      <div className="settings-alert error" style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)', fontSize: '14px' }}>
                        {securityError}
                      </div>
                    )}
                    {securitySuccess && (
                      <div className="settings-alert success" style={{ color: 'var(--color-success)', marginBottom: 'var(--space-4)', fontSize: '14px' }}>
                        {securitySuccess}
                      </div>
                    )}
                    <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                      <Input
                        name="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="Current Password"
                        required
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(v => !v)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                          >
                            {showCurrentPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                          </button>
                        }
                      />
                      <Input
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="New Password (min 8 chars)"
                        required
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(v => !v)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                          >
                            {showNewPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                          </button>
                        }
                      />
                      <Button type="submit" loading={securityLoading} style={{ alignSelf: 'flex-end' }}>
                        Update Password
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Privacy' && (
              <div className="settings-panel">
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--text-primary)', marginBottom: 'var(--space-6)' }}>Privacy & Data</h2>
                
                <div className="settings-row" style={{ alignItems: 'flex-start' }}>
                  <div className="settings-row-label">
                    <Download size={20} strokeWidth={1.5} color="var(--color-primary)" />
                    <div>
                      <p>Export Personal Data</p>
                      <p>Download a copy of your personal data (JSON format).</p>
                    </div>
                  </div>
                  <Button variant="secondary" onClick={handleExportData}>Request Data Export</Button>
                </div>

                <div className="settings-divider" />

                <div className="settings-row" style={{ alignItems: 'flex-start' }}>
                  <div className="settings-row-label">
                    <Trash2 size={20} strokeWidth={1.5} color="var(--color-danger)" />
                    <div>
                      <p style={{ color: 'var(--color-danger)' }}>Delete Account</p>
                      <p>Permanently remove your account and personal info.</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleDeleteAccount} style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
                    Delete My Account
                  </Button>
                </div>
              </div>
            )}

            {activeTab !== 'Appearance' && activeTab !== 'Security' && activeTab !== 'Privacy' && (
              <div className="settings-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
                <p className="text-body" style={{ color: 'var(--text-secondary)' }}>{activeTab} settings — coming soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
