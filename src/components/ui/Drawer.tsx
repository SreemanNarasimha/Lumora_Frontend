import React from 'react';
import { createPortal } from 'react-dom';
import './Drawer.css';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, children }) => {
  if (typeof window === 'undefined') return null;
  
  return createPortal(
    <>
      <div className={`drawer-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`drawer-panel ${isOpen ? 'open' : ''}`}>
        {children}
      </div>
    </>,
    document.body
  );
};
