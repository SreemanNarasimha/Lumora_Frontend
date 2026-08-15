import React from 'react';
import './Footer.css';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo gradient-text">Lumora</span>
          <p className="text-body-sm footer-tagline">
            Premium skincare crafted for the modern ritual.
          </p>
          <div className="footer-socials" aria-label="Social media links">
            {['Instagram', 'Twitter', 'YouTube'].map(s => (
              <a key={s} href="#" className="footer-social-link" aria-label={s}>{s[0]}</a>
            ))}
          </div>
        </div>
        {[
          { title: 'Company', links: ['About Us', 'Blog', 'Careers', 'Press'] },
          { title: 'Support', links: ['Help Centre', 'Track Order', 'Returns', 'Contact Us'] },
          { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
        ].map(col => (
          <div key={col.title} className="footer-col">
            <h3 className="footer-col-title text-label">{col.title}</h3>
            <ul className="footer-col-links">
              {col.links.map(link => (
                <li key={link}><a href="#" className="footer-link">{link}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <p className="text-body-sm" style={{ color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Lumora. All rights reserved.
        </p>
        <div className="payment-icons" aria-label="Accepted payment methods">
          {['Visa', 'MC', 'UPI', 'PayTM'].map(p => (
            <span key={p} className="payment-chip">{p}</span>
          ))}
        </div>
      </div>
    </footer>
  );
};
