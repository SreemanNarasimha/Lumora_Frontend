import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export const MainLayout: React.FC = () => {
  const location = useLocation();
  
  // For specific auth pages, we might not want the global nav.
  // But generally, all public/user routes will use this layout.
  const noNavRoutes = ['/login', '/register', '/forgot-password'];
  const showNav = !noNavRoutes.includes(location.pathname) && !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/dev');

  return (
    <>
      {showNav && <Header />}
      
      {/* We use Outlet to render the nested routes */}
      <Outlet />
      
      {showNav && <BottomNav />}
    </>
  );
};
