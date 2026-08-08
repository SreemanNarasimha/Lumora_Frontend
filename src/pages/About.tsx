import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { BackButton } from '../components/ui/BackButton';
import { Microscope, Leaf, Shield, Award } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <PageWrapper>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 4rem', width: '100%' }}>
        <BackButton label="Back to Home" />

        {/* Hero Section */}
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '24px', marginBottom: '3rem', position: 'relative', overflow: 'hidden' }}>
          <span className="text-body-sm" style={{ color: 'var(--accent-sage, #8A9A86)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>
            Our Science &amp; Story
          </span>
          <h1 className="text-display-1" style={{ color: 'var(--text-primary)', margin: '1rem 0', fontSize: '3rem' }}>
            About Lumora
          </h1>
          <p className="text-body-lg" style={{ color: 'var(--text-secondary)', maxWidth: '720px', margin: '0 auto' }}>
            Transformative cellular skincare backed by dermatological innovation, biocompatible active botanicals, and zero compromises.
          </p>
        </div>

        {/* Brand Values */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
          <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(138, 154, 134, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Microscope size={24} color="var(--accent-sage, #8A9A86)" />
            </div>
            <h3 className="text-h3" style={{ marginBottom: '0.5rem' }}>Dermatologist Engineered</h3>
            <p className="text-body">
              Formulated in precision clinical laboratories to optimize biomimetic delivery and cellular rejuvenation.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(138, 154, 134, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Leaf size={24} color="var(--accent-sage, #8A9A86)" />
            </div>
            <h3 className="text-h3" style={{ marginBottom: '0.5rem' }}>100% Cruelty Free</h3>
            <p className="text-body">
              Ethically sourced ingredients with zero animal testing and sustainable eco-glass packaging.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(138, 154, 134, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Shield size={24} color="var(--accent-sage, #8A9A86)" />
            </div>
            <h3 className="text-h3" style={{ marginBottom: '0.5rem' }}>Clean &amp; Biocompatible</h3>
            <p className="text-body">
              Free from parabens, phthalates, synthetic fragrance, and harsh sulfates. Designed for all skin types.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(138, 154, 134, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Award size={24} color="var(--accent-sage, #8A9A86)" />
            </div>
            <h3 className="text-h3" style={{ marginBottom: '0.5rem' }}>Award-Winning Formulas</h3>
            <p className="text-body">
              Recognized worldwide for extraordinary barrier-repair efficacy and weightless hydration.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="glass-card" style={{ padding: '3rem', borderRadius: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <span className="text-body-sm" style={{ color: 'var(--accent-sage, #8A9A86)', fontWeight: 600 }}>THE PHILOSOPHY</span>
            <h2 className="text-display-2" style={{ margin: '0.5rem 0 1rem' }}>Skin Intelligence Reimagined</h2>
            <p className="text-body" style={{ lineHeight: '1.7', marginBottom: '1rem' }}>
              At Lumora, we believe true skin health is created at the intersection of high-performance dermatology and pure plant chemistry. Our formulas target skin resilience at the cellular barrier level.
            </p>
            <p className="text-body" style={{ lineHeight: '1.7' }}>
              Every product is tested extensively across diverse complexions to deliver radiant, lasting luminosity with zero irritation.
            </p>
          </div>
          <div style={{ borderRadius: '16px', overflow: 'hidden', height: '320px', background: 'var(--color-surface-hover)' }}>
            <img
              src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800"
              alt="Lumora Philosophy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
