import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import api from '../api/axios';
import './Auth.css';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password/send-otp', { email });
      setSuccess('OTP sent to your email.');
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/forgot-password/verify-otp', { email, otp });
      setSuccess('OTP verified. Please set your new password.');
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password/reset', { email, otp, newPassword });
      setSuccess('Password reset successfully. You can now login.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero" aria-hidden="true">
        <img
          src="https://ik.imagekit.io/StringStackVyshu/images/img2.jpg"
          alt=""
          className="auth-hero-img"
        />
        <div className="auth-hero-overlay">
          <div className="auth-hero-quote">
            <p className="text-body-lg" style={{ fontStyle: 'italic', color: 'var(--text-primary)' }}>
              "A fresh start is just a password away."
            </p>
            <span className="text-label" style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-3)', display: 'block' }}>— Lumora Security</span>
          </div>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          <Link to="/" className="auth-logo" aria-label="Go to Lumora homepage">
            LUMORA
          </Link>

          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            {step === 1 && "Enter your email to receive a reset code."}
            {step === 2 && "Enter the 6-digit code sent to your email."}
            {step === 3 && "Create a new strong password."}
          </p>

          {error && (
            <div className="auth-error" role="alert" aria-live="assertive">
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="auth-success" role="alert">
              <span>{success}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="auth-form" noValidate>
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                leftIcon={<Mail size={18} strokeWidth={1.5} />}
                placeholder="you@example.com"
                required
              />
              <Button type="submit" size="lg" loading={loading} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
                {loading ? 'Sending...' : 'Send Reset Code'}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="auth-form" noValidate>
              <Input
                label="Verification Code (OTP)"
                name="otp"
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                leftIcon={<KeyRound size={18} strokeWidth={1.5} />}
                placeholder="000000"
                maxLength={6}
                required
              />
              <Button type="submit" size="lg" loading={loading} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="auth-form" noValidate>
              <Input
                label="New Password"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
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
              />
              <Button type="submit" size="lg" loading={loading} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}

          <div className="auth-meta" style={{ marginTop: 'var(--space-3)', justifyContent: 'center' }}>
            <Link to="/login" className="auth-link">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
