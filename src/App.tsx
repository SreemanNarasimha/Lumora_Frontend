import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy loaded Pages
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Shop = lazy(() => import('./pages/Shop').then(m => ({ default: m.Shop })));
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const Cart = lazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess').then(m => ({ default: m.OrderSuccess })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Orders = lazy(() => import('./pages/Orders').then(m => ({ default: m.Orders })));
const Wishlist = lazy(() => import('./pages/Wishlist').then(m => ({ default: m.Wishlist })));
const Addresses = lazy(() => import('./pages/Addresses').then(m => ({ default: m.Addresses })));
const Reviews = lazy(() => import('./pages/Reviews').then(m => ({ default: m.Reviews })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));
const Discover = lazy(() => import('./pages/Discover').then(m => ({ default: m.Discover })));
const Journal = lazy(() => import('./pages/Journal').then(m => ({ default: m.Journal })));
const Rituals = lazy(() => import('./pages/Rituals').then(m => ({ default: m.Rituals })));
const Notifications = lazy(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const StyleGuide = lazy(() => import('./pages/StyleGuide').then(m => ({ default: m.StyleGuide })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners').then(m => ({ default: m.AdminBanners })));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons').then(m => ({ default: m.AdminCoupons })));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories').then(m => ({ default: m.AdminCategories })));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.AdminLogin })));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));

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

            <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
              <Routes>
                {/* ─── Public ─── */}
                <Route path="/"         element={<Home />} />
                <Route path="/login"    element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/shop"     element={<Shop />} />
                <Route path="/cleaner"  element={<Shop categorySlug="cleanser" />} />
                <Route path="/toner"    element={<Shop categorySlug="toner" />} />
                <Route path="/essence"  element={<Shop categorySlug="essence" />} />
                <Route path="/serum"    element={<Shop categorySlug="serum" />} />
                <Route path="/Ampoules" element={<Shop categorySlug="ampoule" />} />
                <Route path="/moisturizers" element={<Shop categorySlug="moisturiser" />} />
                <Route path="/sunscreens"   element={<Shop categorySlug="sunscreen" />} />
                <Route path="/masks"    element={<Shop categorySlug="mask" />} />
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
                  <Route path="banners" element={<AdminBanners />} />
                  <Route path="coupons" element={<AdminCoupons />} />
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
            </Suspense>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
