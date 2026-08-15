import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { BackButton } from '../components/ui/BackButton';
import { Button } from '../components/ui/Button';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageWrapper>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 4rem', width: '100%' }}>
        <BackButton label="Back to Home" />

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="text-body-sm" style={{ color: 'var(--accent-sage, #8A9A86)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>
            We'd Love to Hear From You
          </span>
          <h1 className="text-display-1" style={{ margin: '0.5rem 0' }}>
            Get in Touch
          </h1>
          <p className="text-body-lg" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Have questions about your skincare routine or an order? Our skin specialists are here to assist you.
          </p>
        </div>

        <div className="page-section-split" style={{ gap: '2.5rem' }}>
          {/* Contact Form */}
          <div className="glass-card" style={{ padding: '2.5rem', borderRadius: '24px' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(138, 154, 134, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <CheckCircle2 size={36} color="var(--accent-sage, #8A9A86)" />
                </div>
                <h2 className="text-h2" style={{ marginBottom: '0.5rem' }}>Message Sent!</h2>
                <p className="text-body" style={{ marginBottom: '1.5rem' }}>
                  Thank you for contacting Lumora. Our support team will get back to you within 24 hours.
                </p>
                <Button variant="primary" onClick={() => { setSubmitted(false); setName(''); setEmail(''); setSubject(''); setMessage(''); }}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 className="text-h2" style={{ marginBottom: '0.5rem' }}>Send Us a Message</h2>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label className="text-body-sm" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-general)', background: 'var(--color-surface)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="text-body-sm" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-general)', background: 'var(--color-surface)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-body-sm" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="Product Inquiry / Order Status"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-general)', background: 'var(--color-surface)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label className="text-body-sm" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Message *</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="How can we help you today?"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-general)', background: 'var(--color-surface)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>

                <Button type="submit" variant="primary" style={{ marginTop: '0.5rem' }}>
                  <Send size={16} style={{ marginRight: '6px' }} />
                  Send Message
                </Button>
              </form>
            )}
          </div>

          {/* Contact Details & Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '2rem', borderRadius: '20px' }}>
              <h3 className="text-h3" style={{ marginBottom: '1.5rem' }}>Contact Information</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(138, 154, 134, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={20} color="var(--accent-sage, #8A9A86)" />
                  </div>
                  <div>
                    <span className="text-body-sm" style={{ color: 'var(--text-muted)', display: 'block' }}>Email Support</span>
                    <a href="mailto:support@lumora.com" className="text-body" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>
                      support@lumora.com
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(138, 154, 134, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={20} color="var(--accent-sage, #8A9A86)" />
                  </div>
                  <div>
                    <span className="text-body-sm" style={{ color: 'var(--text-muted)', display: 'block' }}>Phone Helpline</span>
                    <a href="tel:+9118001234567" className="text-body" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}>
                      +91 1800-123-4567
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(138, 154, 134, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={20} color="var(--accent-sage, #8A9A86)" />
                  </div>
                  <div>
                    <span className="text-body-sm" style={{ color: 'var(--text-muted)', display: 'block' }}>Flagship Boutique</span>
                    <p className="text-body" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      Lumora Beauty Labs, Jubilee Hills, Hyderabad, India
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(138, 154, 134, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={20} color="var(--accent-sage, #8A9A86)" />
                  </div>
                  <div>
                    <span className="text-body-sm" style={{ color: 'var(--text-muted)', display: 'block' }}>Operating Hours</span>
                    <p className="text-body" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      Mon - Sat: 9:00 AM - 8:00 PM IST
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};
