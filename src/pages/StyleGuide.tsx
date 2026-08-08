import React, { useState } from 'react';
import { ShoppingBag, Heart, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { Drawer } from '../components/ui/Drawer';
import { PageWrapper } from '../components/layout/PageWrapper';
import './StyleGuide.css';

export const StyleGuide: React.FC = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  return (
    <PageWrapper>
      <div className="styleguide-page">
        <h1 className="text-display-1 gradient-text">Design System</h1>
        <p className="text-body-lg" style={{ marginBottom: 'var(--space-8)', color: 'var(--text-muted)' }}>
          Tokens, components, and layout blocks for Lumora v4 — Premium Dark Glassmorphism.
        </p>

        {/* Colors */}
        <section className="styleguide-section">
          <h2 className="text-display-2 styleguide-section-title">Color Tokens</h2>
          <div className="styleguide-grid">
            {[
              { name: '--color-bg',        hex: '#0F0F16' },
              { name: '--color-primary',   hex: '#FF7A1F' },
              { name: '--color-secondary', hex: '#FF9A2F' },
              { name: '--color-accent',    hex: '#D8A47F' },
              { name: '--color-error',     hex: '#FF6B6B' },
              { name: '--color-success',   hex: '#4ECDC4' },
            ].map(c => (
              <div key={c.name}>
                <div className="color-swatch" style={{ background: c.hex, border: '1px solid var(--border-general)' }} />
                <p className="text-label" style={{ marginTop: '8px', color: 'var(--text-muted)' }}>{c.name}</p>
                <p className="text-body-sm">{c.hex}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Glass card */}
        <section className="styleguide-section">
          <h2 className="text-display-2 styleguide-section-title">Glass Card Recipe</h2>
          <div className="styleguide-grid">
            <Card style={{ padding: 'var(--space-6)' }}>
              <h3 className="text-h3">Standard Glass Card</h3>
              <p className="text-body-sm" style={{ color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
                Background: rgba(255,255,255,0.08) + blur(24px)
              </p>
            </Card>
            <Card interactive style={{ padding: 'var(--space-6)' }}>
              <h3 className="text-h3">Interactive Glass Card</h3>
              <p className="text-body-sm" style={{ color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
                Hover to see lift + purple border glow.
              </p>
            </Card>
          </div>
        </section>

        {/* Typography */}
        <section className="styleguide-section">
          <h2 className="text-display-2 styleguide-section-title">Typography</h2>
          <div className="styleguide-type-stack">
            <div className="text-display-1">Display 1 — Playfair 72px</div>
            <div className="text-display-2">Display 2 — Playfair 48px</div>
            <div className="text-h1">Heading 1 — Playfair 36px</div>
            <div className="text-h2">Heading 2 — Playfair 28px</div>
            <div className="text-h3">Heading 3 — Inter 18px Medium</div>
            <div className="text-body-lg">Body Large — Inter 18px</div>
            <div className="text-body">Body Default — Inter 16px</div>
            <div className="text-body-sm">Body Small — Inter 14px</div>
            <div className="text-label">Label — Manrope 11px · WIDE SPACING</div>
          </div>
        </section>

        {/* Buttons */}
        <section className="styleguide-section">
          <h2 className="text-display-2 styleguide-section-title">Buttons</h2>
          <p className="text-body-sm" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-5)' }}>All 48–52px tall. Hover, focus, active, disabled, loading states all implemented.</p>
          <div className="styleguide-flex">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="primary" loading>Loading</Button>
            <Button variant="primary" leftIcon={<ShoppingBag size={18} />}>With Left Icon</Button>
            <Button variant="secondary" rightIcon={<Heart size={18} />}>With Right Icon</Button>
          </div>
          <div className="styleguide-flex" style={{ marginTop: 'var(--space-4)' }}>
            <Button size="sm">Small (40px)</Button>
            <Button size="md">Medium (48px)</Button>
            <Button size="lg">Large (56px)</Button>
          </div>
        </section>

        {/* Inputs */}
        <section className="styleguide-section">
          <h2 className="text-display-2 styleguide-section-title">Inputs</h2>
          <p className="text-body-sm" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-5)' }}>All 52–56px tall. Hover, focus (purple ring), error (shake), success, disabled states.</p>
          <div className="styleguide-grid">
            <Input label="Email Address" placeholder="you@example.com" leftIcon={<Search size={18} />} />
            <Input label="Password" type="password" placeholder="••••••••" hint="Min. 8 characters" />
            <Input label="Promo Code" error="Invalid promo code" defaultValue="WINTER20" />
            <Input label="Email Verified" success placeholder="you@example.com" defaultValue="verified@lumora.com" />
          </div>
        </section>

        {/* Badges */}
        <section className="styleguide-section">
          <h2 className="text-display-2 styleguide-section-title">Badges</h2>
          <div className="styleguide-flex">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="accent">Rose Gold</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="warning">Warning</Badge>
          </div>
        </section>

        {/* Skeletons */}
        <section className="styleguide-section">
          <h2 className="text-display-2 styleguide-section-title">Skeleton Loaders</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxWidth: '400px' }}>
            <Skeleton height="200px" radius="lg" />
            <Skeleton height="24px" width="70%" />
            <Skeleton height="16px" width="40%" />
            <Skeleton height="16px" width="55%" />
          </div>
        </section>

        {/* Drawer */}
        <section className="styleguide-section">
          <h2 className="text-display-2 styleguide-section-title">Drawer</h2>
          <Button onClick={() => setDrawerOpen(true)}>Open Drawer</Button>
          <Drawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
            <div style={{ padding: 'var(--space-8)' }}>
              <h2 className="text-h2">Glass Drawer Panel</h2>
              <p className="text-body" style={{ marginTop: 'var(--space-4)', color: 'var(--text-muted)' }}>
                Dark glass background with blur, slides in from right.
              </p>
              <Button style={{ marginTop: 'var(--space-6)' }} onClick={() => setDrawerOpen(false)}>Close</Button>
            </div>
          </Drawer>
        </section>
      </div>
    </PageWrapper>
  );
};
