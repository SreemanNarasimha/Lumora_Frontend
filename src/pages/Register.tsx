import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, User, Phone, Lock, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import loginBg from '../assets/login.png';
import './Auth.css';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Email verification state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/send-otp', { email });
      setOtpSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!otp) {
      setError('Please enter the verification code.');
      return;
    }
    setVerifying(true);
    setError('');
    try {
      await api.post('/auth/verify-email', { email, otp });
      setEmailVerified(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailVerified) {
      setError('Please verify your email address before registering.');
      return;
    }
    if (!termsAccepted) {
      setError('Please accept the Terms of Service to continue.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', {
        email,
        fullName: formData.fullName,
        username: formData.username,
        phone: formData.phone,
        password: formData.password,
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundImage: `url(${loginBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {/* Auth card */}
      <div className="auth-panel" style={{
        background: 'var(--color-bg)',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        <div className="auth-card">
          <Link to="/" className="auth-logo">LUMORA</Link>

          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Start your skincare journey with Lumora.</p>

          {error && (
            <div className="auth-error" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="auth-form" noValidate>
            <Input
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              leftIcon={<User size={18} />}
              placeholder="Your full name"
              required
              autoComplete="name"
            />
            <Input
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              leftIcon={<User size={18} />}
              placeholder="Choose a username"
              required
              autoComplete="username"
            />
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              leftIcon={<Phone size={18} />}
              placeholder="+91 00000 00000"
              required
              autoComplete="tel"
            />

            {/* Email Field with Verify Button */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  leftIcon={<Mail size={18} />}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  disabled={emailVerified}
                  success={emailVerified}
                />
              </div>
              <Button
                type="button"
                variant={emailVerified ? 'secondary' : 'primary'}
                onClick={handleSendOtp}
                disabled={emailVerified || loading || !email}
                style={{ marginTop: '28px', whiteSpace: 'nowrap' }}
              >
                {emailVerified ? (
                  <>
                    <CheckCircle2 size={18} style={{ marginRight: '4px' }} /> Verified
                  </>
                ) : loading && !otpSent ? (
                  'Sending...'
                ) : otpSent ? (
                  'Resend'
                ) : (
                  'Verify Mail'
                )}
              </Button>
            </div>

            {/* OTP Input - only visible after sending OTP and before verification */}
            {otpSent && !emailVerified && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <Input
                    label="Verification Code"
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    leftIcon={<KeyRound size={18} />}
                    placeholder="000000"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleVerifyEmail}
                  disabled={verifying || !otp}
                  style={{ marginTop: '28px', whiteSpace: 'nowrap' }}
                >
                  {verifying ? 'Verifying...' : 'Submit Code'}
                </Button>
              </div>
            )}

            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              leftIcon={<Lock size={18} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', padding: 0 }}
                >
                  {showPassword ? <Eye size={18} strokeWidth={1.5} /> : <EyeOff size={18} strokeWidth={1.5} />}
                </button>
              }
              placeholder="Min. 8 characters"
              required
              autoComplete="new-password"
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              leftIcon={<Lock size={18} />}
              placeholder="Repeat your password"
              required
              autoComplete="new-password"
            />

            <label className="auth-terms">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                className="auth-checkbox"
              />
              <span className="auth-terms-label">
                I agree to the{' '}
                <Link to="/terms" className="auth-link">Terms of Service</Link>{' '}
                and{' '}
                <Link to="/privacy" className="auth-link">Privacy Policy</Link>
              </span>
            </label>

            <Button type="submit" size="lg" loading={loading} disabled={!emailVerified} style={{ width: '100%' }}>
              {loading && emailVerified ? 'Creating Account…' : 'Create Account'}
            </Button>

            <p className="text-body auth-switch">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

