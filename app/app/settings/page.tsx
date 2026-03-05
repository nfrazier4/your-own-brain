'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { T } from '@/lib/design-tokens';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/lib/theme-provider';
import { useDocumentTitle } from '@/lib/use-document-title';

interface Integration {
  id: 'google' | 'slack';
  name: string;
  description: string;
  icon: string;
  features: string[];
  connected: boolean;
}

export default function SettingsPage() {
  useDocumentTitle('Settings');

  const { theme, setTheme } = useTheme();

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'google',
      name: 'Google',
      description: 'Connect Calendar and Gmail for context-aware scheduling and email management',
      icon: '🔗',
      features: ['Calendar Events', 'Email Context', 'Meeting Prep'],
      connected: false,
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Track mentions and important conversations across your workspaces',
      icon: '💬',
      features: ['Mention Tracking', 'Channel Updates', 'DM Context'],
      connected: false,
    },
  ]);

  useEffect(() => {
    // Check connection status on mount
    checkConnectionStatus();
  }, []);

  async function checkConnectionStatus() {
    try {
      const response = await fetch('/api/integrations/status');
      if (response.ok) {
        const data = await response.json();
        setIntegrations(prev => prev.map(int => ({
          ...int,
          connected: data[int.id] || false,
        })));
      }
    } catch (error) {
      console.error('Failed to check connection status:', error);
    }
  }

  async function handleConnect(integrationId: string) {
    // Redirect to OAuth flow
    window.location.href = `/api/auth/${integrationId}/authorize`;
  }

  async function handleDisconnect(integrationId: string) {
    if (!confirm('Are you sure you want to disconnect this integration?')) {
      return;
    }

    try {
      const response = await fetch(`/api/integrations/${integrationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setIntegrations(prev => prev.map(int =>
          int.id === integrationId ? { ...int, connected: false } : int
        ));
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.mainBg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 32px',
          background: T.sidebarBg,
          borderBottom: `1px solid ${T.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Link
          href="/chat"
          style={{
            textDecoration: 'none',
            color: T.text,
            transition: 'transform 0.15s ease',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Icon icon={ArrowLeft} size={24} aria-label="Back to chat" />
        </Link>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              color: T.text,
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            Settings
          </h1>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 14,
              color: T.textMuted,
              fontWeight: 400,
            }}
          >
            Manage your integrations and preferences
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: '32px',
          maxWidth: 900,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Appearance Section */}
        <section style={{ marginBottom: 48 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: T.text,
              marginBottom: 16,
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            Appearance
          </h2>
          <p
            style={{
              fontSize: 14,
              color: T.textMuted,
              marginBottom: 24,
              lineHeight: 1.5,
            }}
          >
            Choose how Chief of Staff looks on your device
          </p>

          <div
            style={{
              background: T.cardBg,
              border: `1px solid ${T.border}`,
              borderRadius: T.radius,
              padding: 20,
              boxShadow: T.shadow,
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 12 }}>
                Theme
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {(['light', 'dark', 'system'] as const).map((themeOption) => (
                  <button
                    key={themeOption}
                    onClick={() => setTheme(themeOption)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: theme === themeOption ? T.yellow : 'transparent',
                      color: theme === themeOption ? T.yellowText : T.text,
                      border: `1px solid ${theme === themeOption ? T.yellow : T.border}`,
                      borderRadius: T.radiusSm,
                      fontSize: 14,
                      fontWeight: theme === themeOption ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      fontFamily: "'Nunito', sans-serif",
                      textTransform: 'capitalize',
                    }}
                    onMouseEnter={(e) => {
                      if (theme !== themeOption) {
                        e.currentTarget.style.background = T.borderLight;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (theme !== themeOption) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {themeOption}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 12, color: T.textMuted, marginTop: 12 }}>
                {theme === 'system' && 'Automatically match your device preference'}
                {theme === 'light' && 'Light mode is easier to read in bright environments'}
                {theme === 'dark' && 'Dark mode reduces eye strain for late-night focus'}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: T.text,
              marginBottom: 16,
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            Integrations
          </h2>
          <p
            style={{
              fontSize: 14,
              color: T.textMuted,
              marginBottom: 24,
              lineHeight: 1.5,
            }}
          >
            Connect your tools to give Chief of Staff full context about your work and life.
          </p>

          <div
            style={{
              display: 'grid',
              gap: 16,
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            }}
          >
            {integrations.map((integration) => (
              <div
                key={integration.id}
                style={{
                  background: T.cardBg,
                  border: `1px solid ${integration.connected ? T.yellow : T.border}`,
                  borderRadius: T.radius,
                  padding: 20,
                  boxShadow: integration.connected ? `0 0 0 3px ${T.yellow}22` : T.shadow,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                {/* Connection Status Badge */}
                {integration.connected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      background: T.yellow,
                      color: T.yellowText,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: T.radiusPill,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Connected
                  </div>
                )}

                {/* Icon and Title */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 32 }}>{integration.icon}</span>
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: T.text,
                      margin: 0,
                      fontFamily: "'Nunito', sans-serif",
                    }}
                  >
                    {integration.name}
                  </h3>
                </div>

                {/* Description */}
                <p
                  style={{
                    fontSize: 14,
                    color: T.textSub,
                    lineHeight: 1.5,
                    marginBottom: 16,
                  }}
                >
                  {integration.description}
                </p>

                {/* Features */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginBottom: 20,
                  }}
                >
                  {integration.features.map((feature) => (
                    <span
                      key={feature}
                      style={{
                        fontSize: 12,
                        color: T.textMuted,
                        background: T.borderLight,
                        padding: '4px 10px',
                        borderRadius: T.radiusPill,
                        fontWeight: 500,
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  onClick={() =>
                    integration.connected
                      ? handleDisconnect(integration.id)
                      : handleConnect(integration.id)
                  }
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    fontSize: 14,
                    fontWeight: 600,
                    background: integration.connected ? 'transparent' : T.yellow,
                    color: integration.connected ? T.textMuted : T.yellowText,
                    border: integration.connected ? `1px solid ${T.border}` : 'none',
                    borderRadius: T.radiusSm,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontFamily: "'Nunito', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    if (integration.connected) {
                      e.currentTarget.style.background = T.borderLight;
                      e.currentTarget.style.color = T.text;
                    } else {
                      e.currentTarget.style.background = T.yellowText;
                      e.currentTarget.style.color = T.yellow;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (integration.connected) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = T.textMuted;
                    } else {
                      e.currentTarget.style.background = T.yellow;
                      e.currentTarget.style.color = T.yellowText;
                    }
                  }}
                >
                  {integration.connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
