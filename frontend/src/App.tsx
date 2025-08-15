import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import LandingPage from './components/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import PremiumRoute from './components/PremiumRoute';
import ColorPaletteShowcase from './components/ColorPaletteShowcase';

// Lazy load components to reduce initial bundle size
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const TradeBrowser = React.lazy(() => import('./components/TradeBrowser'));
const MembersBrowser = React.lazy(() => import('./components/MembersBrowser'));
const MemberProfile = React.lazy(() => import('./components/MemberProfile'));
const DataQuality = React.lazy(() => import('./components/DataQuality'));
const Analytics = React.lazy(() => import('./components/Analytics'));
const ProfileSettings = React.lazy(() => import('./components/ProfileSettings'));
const PremiumSignup = React.lazy(() => import('./components/PremiumSignup'));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/colors" element={<ColorPaletteShowcase />} />
            <Route path="/login" element={
              <ProtectedRoute requireAuth={false}>
                <LoginPage />
              </ProtectedRoute>
            } />
            <Route path="/register" element={
              <ProtectedRoute requireAuth={false}>
                <RegisterPage />
              </ProtectedRoute>
            } />
            <Route path="/forgot-password" element={
              <ProtectedRoute requireAuth={false}>
                <ForgotPasswordPage />
              </ProtectedRoute>
            } />
            <Route path="/reset-password" element={
              <ProtectedRoute requireAuth={false}>
                <ResetPasswordPage />
              </ProtectedRoute>
            } />
            
            {/* Protected routes with lazy loading */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Dashboard />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/trades" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <TradeBrowser />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/transactions" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <TradeBrowser />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/members" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <MembersBrowser />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/members/:id" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <MemberProfile />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <PremiumRoute requiredTier="pro">
                  <Layout>
                    <Suspense fallback={<LoadingSpinner />}>
                      <Analytics />
                    </Suspense>
                  </Layout>
                </PremiumRoute>
              </ProtectedRoute>
            } />
            <Route path="/data-quality" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <DataQuality />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingSpinner />}>
                    <ProfileSettings />
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/premium" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <PremiumSignup />
                </Suspense>
              </ProtectedRoute>
            } />
            
            {/* Catch all route - redirect to landing page */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
