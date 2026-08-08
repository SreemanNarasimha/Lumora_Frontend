import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import './PageWrapper.css';

interface PageWrapperProps {
  children: React.ReactNode;
  /** Set to false for auth pages that have their own minimal nav */
  showHeader?: boolean;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children, showHeader = true }) => {
  return (
    <div className="page-wrapper">
      {/* Ambient background blobs */}
      <div aria-hidden="true">
        <div className="ambient-blob ambient-blob-1" />
        <div className="ambient-blob ambient-blob-2" />
        <div className="ambient-blob ambient-blob-3" />
      </div>

      {showHeader && <Header />}

      <main className={`page-main ${showHeader ? 'with-header' : ''} page-enter`}>
        {children}
      </main>

      {showHeader && <BottomNav />}
    </div>
  );
};
