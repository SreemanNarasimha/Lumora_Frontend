import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const formEmail = formData.get('email') as string || email;
    const formPassword = formData.get('password') as string || password;

    try {
      if (adminLogin) {
        await adminLogin(formEmail, formPassword);
        navigate('/admin', { replace: true });
      } else {
        throw new Error('Admin login not configured properly.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-bg)',
      color: 'var(--text-main)',
      fontFamily: 'var(--font-primary)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: 'var(--space-8)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-6)',
        borderTop: '4px solid var(--color-primary)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-primary)'
        }}>
          <Shield size={32} />
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <h1 className="text-h2" style={{ marginBottom: 'var(--space-2)' }}>Admin Portal</h1>
          <p className="text-muted">Sign in to manage Lumora</p>
        </div>

        {error && (
          <div style={{
            width: '100%',
            padding: 'var(--space-3)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--color-danger)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input 
            label="Admin Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input 
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          
          <Button type="submit" loading={loading} style={{ marginTop: 'var(--space-2)' }}>
            Authenticate
          </Button>
        </form>
      </div>
    </div>
  );
};
