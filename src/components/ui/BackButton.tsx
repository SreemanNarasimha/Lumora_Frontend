import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './BackButton.css';

interface BackButtonProps {
  label?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ label = 'Back', className = '' }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`back-button glass-btn ${className}`}
      aria-label="Go to previous page"
    >
      <ArrowLeft size={18} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
};
