import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ErrorBoundary from './components/ErrorBoundary';
import GlobalRealtime from './components/GlobalRealtime';
import { setupPresence } from './lib/presence';
import { Loader2 } from 'lucide-react';

// Lazy loaded components
const Layout = React.lazy(() => import('./components/Layout'));
const IncomingCall = React.lazy(() => import('./components/IncomingCall'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Home = React.lazy(() => import('./pages/Home'));
const Explore = React.lazy(() => import('./pages/Explore'));
const Bookmarks = React.lazy(() => import('./pages/Bookmarks'));
const Profile = React.lazy(() => import('./pages/Profile'));
const OmniClips = React.lazy(() => import('./pages/OmniClips'));
const Communities = React.lazy(() => import('./pages/Communities'));
const Search = React.lazy(() => import('./pages/Search'));
const AIStudio = React.lazy(() => import('./pages/AIStudio'));
const Notifications = React.lazy(() => import('./pages/Notifications'));
const Messages = React.lazy(() => import('./pages/Messages'));
const Chat = React.lazy(() => import('./pages/Chat'));
const Call = React.lazy(() => import('./pages/Call'));
const CreatorHub = React.lazy(() => import('./pages/CreatorHub'));
const Wallet = React.lazy(() => import('./pages/Wallet'));
const CoinShop = React.lazy(() => import('./pages/CoinShop'));
const GiftSystem = React.lazy(() => import('./pages/GiftSystem'));
const RewardCenter = React.lazy(() => import('./pages/RewardCenter'));
const Live = React.lazy(() => import('./pages/Live'));
const LiveStream = React.lazy(() => import('./pages/LiveStream'));
const Admin = React.lazy(() => import('./pages/Admin'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Premium = React.lazy(() => import('./pages/Premium'));
const BusinessDashboard = React.lazy(() => import('./pages/BusinessDashboard'));
const PrivacyPolicy = React.lazy(() => import('./pages/StaticPages').then(module => ({ default: module.PrivacyPolicy })));
const Terms = React.lazy(() => import('./pages/StaticPages').then(module => ({ default: module.Terms })));
const About = React.lazy(() => import('./pages/StaticPages').then(module => ({ default: module.About })));
const HelpCenter = React.lazy(() => import('./pages/StaticPages').then(module => ({ default: module.HelpCenter })));
const Support = React.lazy(() => import('./pages/StaticPages').then(module => ({ default: module.Support })));
const ReportBug = React.lazy(() => import('./pages/StaticPages').then(module => ({ default: module.ReportBug })));


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading, user } = useAuthStore();

  useEffect(() => {
    if (user) {
      const channel = setupPresence(user.id);
      return () => {
        channel.unsubscribe();
      };
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ErrorBoundary><Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
      </div>
    }>
      <IncomingCall />
      <GlobalRealtime />
      {children}
    </Suspense></ErrorBoundary>
  );
}

function RoleRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const { profile, isLoading } = useAuthStore();
  
  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  return <RoleRoute allowedRoles={['admin', 'super_admin']}>{children}</RoleRoute>;
}

function ModeratorRoute({ children }: { children: React.ReactNode }) {
  return <RoleRoute allowedRoles={['moderator', 'admin', 'super_admin']}>{children}</RoleRoute>;
}

const LoadingFallback = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <Loader2 className="animate-spin h-8 w-8 text-purple-500" />
  </div>
);

export default function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ErrorBoundary><Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/explore" 
                element={
                  <ProtectedRoute>
                    <Explore />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/bookmarks" 
                element={
                  <ProtectedRoute>
                    <Bookmarks />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/@:username" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/omniclips" 
                element={
                  <ProtectedRoute>
                    <OmniClips />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/communities" 
                element={
                  <ProtectedRoute>
                    <Communities />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/search" 
                element={
                  <ProtectedRoute>
                    <Search />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/messages" 
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat/:id" 
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/creator" 
                element={
                  <ProtectedRoute>
                    <CreatorHub />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/wallet" 
                element={
                  <ProtectedRoute>
                    <Wallet />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/coin-shop" 
                element={
                  <ProtectedRoute>
                    <CoinShop />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/gifts" 
                element={
                  <ProtectedRoute>
                    <GiftSystem />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/rewards" 
                element={
                  <ProtectedRoute>
                    <RewardCenter />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/live" 
                element={
                  <ProtectedRoute>
                    <Live />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <Admin />
                    </AdminRoute>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/premium" 
                element={
                  <ProtectedRoute>
                    <Premium />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/business" 
                element={
                  <ProtectedRoute>
                    <BusinessDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ai" 
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ai-studio" 
                element={
                  <ProtectedRoute>
                    <AIStudio />
                  </ProtectedRoute>
                } 
              />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/about" element={<About />} />
              <Route path="/help-center" element={<HelpCenter />} />
              <Route path="/support" element={<Support />} />
              <Route path="/report-bug" element={<ReportBug />} />
            </Route>
            <Route 
              path="/call/:id" 
              element={
                <ProtectedRoute>
                  <Call />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/live/:id" 
              element={
                <ProtectedRoute>
                  <LiveStream />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Suspense></ErrorBoundary>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

// cache bust Sat Jul 11 06:14:31 PM UTC 2026
