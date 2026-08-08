import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PageWrapper } from '../components/layout/PageWrapper';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: 'var(--space-9) var(--space-outer)' }}>
        <div
          className="glass-card"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-5)', padding: 'var(--space-10) var(--space-8)', maxWidth: '560px', textAlign: 'center' }}
        >
          <div aria-hidden="true" style={{ font: '600 120px/1 var(--font-display)', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            404
          </div>
          <h1 className="text-h1">Page Not Found</h1>
          <p className="text-body-lg" style={{ color: 'var(--text-muted)' }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button size="lg" onClick={() => navigate(-1)} variant="secondary" leftIcon={<ArrowLeft size={18} />}>
              Go Back
            </Button>
            <Button size="lg" onClick={() => navigate('/')} leftIcon={<Home size={18} />}>
              Home
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
