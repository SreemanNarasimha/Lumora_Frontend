import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Pages
import { Home }         from './pages/Home';
import { Login }        from './pages/Login';
import { Register }     from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard }    from './pages/Dashboard';
import { Checkout }     from './pages/Checkout';
import { Cart }         from './pages/Cart';
import { OrderSuccess } from './pages/OrderSuccess';
import { Profile }      from './pages/Profile';
import { Orders }       from './pages/Orders';
import { Wishlist }     from './pages/Wishlist';
import { Addresses }    from './pages/Addresses';
import { Reviews }      from './pages/Reviews';
import { About }        from './pages/About';
import { Contact }      from './pages/Contact';
import { Discover }     from './pages/Discover';
import { Journal }      from './pages/Journal';
import { Rituals }      from './pages/Rituals';
import { Notifications }from './pages/Notifications';
import { Settings }     from './pages/Settings';
import { NotFound }     from './pages/NotFound';
import { StyleGuide }   from './pages/StyleGuide';
import { ProductDetail }  from './pages/ProductDetail';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts }  from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminLogin }     from './pages/admin/AdminLogin';
import { AdminOrders }    from './pages/admin/AdminOrders';
import { AdminUsers }     from './pages/admin/AdminUsers';
import { AdminSettings }  from './pages/admin/AdminSettings';

// Context
import { AuthProvider }     from './context/AuthContext';
import { CartProvider }     from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider }    from './context/ThemeContext';
import { CartDrawer }       from './components/cart/CartDrawer';
import { ProtectedRoute }   from './components/ProtectedRoute';
import { AdminRoute }       from './components/AdminRoute';
import { AdminLayout }      from './components/layout/AdminLayout';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
            {/* Cart drawer is portal-mounted, lives outside page wrapper */}
            <CartDrawer />

            <Routes>
              {/* ─── Public ─── */}
              <Route path="/"         element={<Home />} />
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/shop"     element={<Dashboard />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/about"    element={<About />} />
              <Route path="/contact"  element={<Contact />} />
              <Route path="/discover" element={<Discover />} />

              {/* ─── Protected ─── */}
              <Route path="/journal" element={
                <ProtectedRoute><Journal /></ProtectedRoute>
              } />
              <Route path="/rituals" element={
                <ProtectedRoute><Rituals /></ProtectedRoute>
              } />
              <Route path="/cart" element={
                <ProtectedRoute><Cart /></ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute><Checkout /></ProtectedRoute>
              } />
              <Route path="/order/success" element={
                <ProtectedRoute><OrderSuccess /></ProtectedRoute>
              } />

              {/* Profile nested routes */}
              <Route path="/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />
              <Route path="/profile/orders" element={
                <ProtectedRoute><Orders /></ProtectedRoute>
              } />
              <Route path="/profile/wishlist" element={
                <ProtectedRoute><Wishlist /></ProtectedRoute>
              } />
              <Route path="/profile/addresses" element={
                <ProtectedRoute><Addresses /></ProtectedRoute>
              } />
              <Route path="/profile/reviews" element={
                <ProtectedRoute><Reviews /></ProtectedRoute>
              } />
              <Route path="/profile/settings" element={
                <ProtectedRoute><Settings /></ProtectedRoute>
              } />

              {/* Notifications */}
              <Route path="/notifications" element={
                <ProtectedRoute><Notifications /></ProtectedRoute>
              } />

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Dashboard */}
              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />

              {/* Dev */}
              <Route path="/dev/styleguide" element={<StyleGuide />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
