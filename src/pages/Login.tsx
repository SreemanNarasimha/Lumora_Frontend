import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const formEmail = formData.get('email') as string || email;
    const formPassword = formData.get('password') as string || password;

    try {
      const user = await login({ email: formEmail, password: formPassword });
      const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'PRODUCT_MANAGER', 'ORDER_MANAGER', 'SUPPORT_STAFF'];
      
      if (ADMIN_ROLES.includes(user.role)) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '10vw' }}>
      {/* Auth card */}
      <div className="auth-panel">
        <div className="auth-card">
          <Link to="/" className="auth-logo" aria-label="Go to Lumora homepage">
            LUMORA
          </Link>

          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue your skincare journey.</p>

          {error && (
            <div className="auth-error" role="alert" aria-live="assertive">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <Input
              label="Email or Username"
              name="email"
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              leftIcon={<Mail size={18} strokeWidth={1.5} />}
              placeholder="you@example.com"
              required
              autoComplete="username"
            />

            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              leftIcon={<Lock size={18} strokeWidth={1.5} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                </button>
              }
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            <div className="auth-meta">
              <label className="auth-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="auth-checkbox"
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="auth-forgot">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" size="lg" loading={loading} style={{ width: '100%' }}>
              {loading ? 'Signing In…' : 'Sign In'}
            </Button>
          </form>

          <div className="auth-divider" aria-hidden="true">
            <span />
            <span className="text-label">or</span>
            <span />
          </div>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
