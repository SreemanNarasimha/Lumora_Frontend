import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { PageWrapper } from '../components/layout/PageWrapper';
import { BackButton } from '../components/ui/BackButton';
import { Star, MessageSquare } from 'lucide-react';

interface Review {
  id: number;
  product: {
    productId: number;
    name: string;
    images?: string[];
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export const Reviews: React.FC = () => {
  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ['userReviews'],
    queryFn: async () => {
      const res = await api.get('/reviews');
      return res.data;
    }
  });

  return (
    <PageWrapper>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 var(--space-outer) 4rem', width: '100%' }}>
        <BackButton label="Back to Profile" />

        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '42px', color: 'var(--text-primary)' }}>My Reviews</h1>
          <p className="text-body" style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
            Your feedback on Lumora products
          </p>
        </div>

        {isLoading ? (
          <div style={{ padding: 'var(--space-10)', textAlign: 'center', border: '1px solid var(--border-general)' }}>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ padding: 'var(--space-10) var(--space-8)', textAlign: 'center', border: '1px dashed var(--border-general)' }}>
            <MessageSquare size={48} strokeWidth={1} color="var(--text-secondary)" style={{ marginBottom: 'var(--space-4)' }} />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>No reviews submitted</h2>
            <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
              You can write reviews on the product pages.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {reviews.map(rev => (
              <div key={rev.id} style={{ padding: 'var(--space-6)', border: '1px solid var(--border-general)', background: 'var(--color-surface-hover)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: 'var(--text-primary)' }}>{rev.product?.name || 'Product'}</h3>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={16}
                        strokeWidth={1}
                        fill={star <= rev.rating ? 'var(--text-primary)' : 'none'}
                        color={star <= rev.rating ? 'var(--text-primary)' : 'var(--border-general)'}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>{rev.comment}</p>
                <span className="text-body-sm" style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Reviewed on {new Date(rev.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};
