import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ChatProvider } from './context/ChatContext';
import { WishlistProvider } from './context/WishlistContext';
import ScrollToTop from './components/common/ScrollToTop';
import Spinner from './components/common/Spinner';
import ChatWidget from './components/chat/ChatWidget';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';

// Route Guards
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';

// ===== EAGER LOADED PAGES =====
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// ===== LAZY LOADED PAGES =====
const Shop = lazy(() => import('./pages/Shop'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const About = lazy(() => import('./pages/AboutUs'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));  // ✅ Fixed
const ReturnPolicy = lazy(() => import('./pages/ReturnPolicy'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));

// Account Pages
const Dashboard = lazy(() => import('./pages/account/Dashboard'));
const Profile = lazy(() => import('./pages/account/Profile'));
const Orders = lazy(() => import('./pages/account/Orders'));
const Wishlist = lazy(() => import('./pages/account/Wishlist'));
const Addresses = lazy(() => import('./pages/account/Addresses'));

// Admin Pages — ✅ Fixed all file names
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminAddProduct = lazy(() => import('./pages/admin/AdminAddProduct'));
const AdminEditProduct = lazy(() => import('./pages/admin/AdminEditProduct'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminChat = lazy(() => import('./pages/admin/AdminChat'));
const AdminNewsletter = lazy(() => import('./pages/admin/AdminNewsletter'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminShippingInfo = lazy(() => import('./pages/admin/AdminShippingInfo'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));

// Admin Pages — Missing routes fixed
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners'));
const AdminMedia = lazy(() => import('./pages/admin/AdminMedia'));
const AdminPages = lazy(() => import('./pages/admin/AdminPages'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));

// Not Found
const NotFound = lazy(() => import('./pages/NotFound'));

// Lazy wrapper
const LazyPage = ({ children }) => (
  <Suspense fallback={<Spinner size="lg" text="Loading..." />}>
    {children}
  </Suspense>
);

// ChatWidget শুধু Public site এ দেখাবে, Admin panel এ না
const ConditionalChatWidget = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  return <ChatWidget />;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ChatProvider>
            <ScrollToTop />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1A1A2E',
                  color: '#fff',
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: '14px',
                  borderRadius: '10px',
                  padding: '12px 20px',
                },
                success: {
                  iconTheme: { primary: '#C4A35A', secondary: '#fff' },
                  style: { border: '1px solid #C4A35A' },
                },
                error: {
                  iconTheme: { primary: '#E74C3C', secondary: '#fff' },
                  style: { border: '1px solid #E74C3C' },
                },
              }}
            />

            <Routes>
              {/* ======= PUBLIC ROUTES (with Header + Footer) ======= */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<LazyPage><Shop /></LazyPage>} />
                <Route path="/category/:slug" element={<LazyPage><CategoryPage /></LazyPage>} />
                <Route path="/product/:slug" element={<LazyPage><ProductDetail /></LazyPage>} />
                <Route path="/cart" element={<LazyPage><Cart /></LazyPage>} />
                <Route path="/search" element={<LazyPage><SearchResults /></LazyPage>} />
                <Route path="/order-confirmation/:id" element={<PrivateRoute><LazyPage><OrderConfirmation /></LazyPage></PrivateRoute>} />
                <Route path="/about" element={<LazyPage><About /></LazyPage>} />
                <Route path="/contact" element={<LazyPage><Contact /></LazyPage>} />
                <Route path="/faq" element={<LazyPage><FAQ /></LazyPage>} />
                <Route path="/privacy-policy" element={<LazyPage><PrivacyPolicy /></LazyPage>} />
                <Route path="/terms" element={<LazyPage><TermsConditions /></LazyPage>} />
                <Route path="/return-policy" element={<LazyPage><ReturnPolicy /></LazyPage>} />
                <Route path="/shipping-policy" element={<LazyPage><ShippingPolicy /></LazyPage>} />

                {/* Protected: Checkout */}
                <Route path="/checkout" element={<PrivateRoute><LazyPage><Checkout /></LazyPage></PrivateRoute>} />

                {/* Protected: Account */}
                <Route path="/account" element={<PrivateRoute><LazyPage><Dashboard /></LazyPage></PrivateRoute>} />
                <Route path="/account/profile" element={<PrivateRoute><LazyPage><Profile /></LazyPage></PrivateRoute>} />
                <Route path="/account/orders" element={<PrivateRoute><LazyPage><Orders /></LazyPage></PrivateRoute>} />
                <Route path="/account/orders/:id" element={<PrivateRoute><LazyPage><Orders /></LazyPage></PrivateRoute>} />
                <Route path="/account/wishlist" element={<PrivateRoute><LazyPage><Wishlist /></LazyPage></PrivateRoute>} />
                <Route path="/account/addresses" element={<PrivateRoute><LazyPage><Addresses /></LazyPage></PrivateRoute>} />
              </Route>

              {/* ======= AUTH ROUTES (no layout) ======= */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/login" element={<LazyPage><AdminLogin /></LazyPage>} />

              {/* ======= ADMIN ROUTES ======= */}
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<LazyPage><AdminDashboard /></LazyPage>} />
                <Route path="products" element={<LazyPage><AdminProducts /></LazyPage>} />
                <Route path="products/add" element={<LazyPage><AdminAddProduct /></LazyPage>} />
                <Route path="products/edit/:id" element={<LazyPage><AdminEditProduct /></LazyPage>} />
                <Route path="categories" element={<LazyPage><AdminCategories /></LazyPage>} />
                <Route path="orders" element={<LazyPage><AdminOrders /></LazyPage>} />
                <Route path="orders/:id" element={<LazyPage><AdminOrderDetail /></LazyPage>} />
                <Route path="customers" element={<LazyPage><AdminCustomers /></LazyPage>} />
                <Route path="coupons" element={<LazyPage><AdminCoupons /></LazyPage>} />
                <Route path="reviews" element={<LazyPage><AdminReviews /></LazyPage>} />
                <Route path="chat" element={<LazyPage><AdminChat /></LazyPage>} />
                <Route path="newsletter" element={<LazyPage><AdminNewsletter /></LazyPage>} />
                <Route path="settings" element={<LazyPage><AdminSettings /></LazyPage>} />
                <Route path="banners" element={<LazyPage><AdminBanners /></LazyPage>} />
                <Route path="media" element={<LazyPage><AdminMedia /></LazyPage>} />
                <Route path="pages" element={<LazyPage><AdminPages /></LazyPage>} />
                <Route path="reports" element={<LazyPage><AdminReports /></LazyPage>} />
                <Route path="shipping-info" element={<LazyPage><AdminShippingInfo /></LazyPage>} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<LazyPage><NotFound /></LazyPage>} />
            </Routes>

            <ConditionalChatWidget />
          </ChatProvider>
            </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;