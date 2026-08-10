import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './AnnouncementBar.css';

export const AnnouncementBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('lumora_announcement_dismissed');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('lumora_announcement_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="announcement-bar">
      <div className="announcement-content">
        Complimentary shipping on all orders over ₹2,500. Discover the new collection.
      </div>
      <button className="announcement-close" onClick={handleDismiss} aria-label="Close announcement">
        <X size={14} />
      </button>
    </div>
  );
};
