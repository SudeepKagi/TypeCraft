import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/layout/Navbar';
import Landing from './pages/Landing';
import Play from './pages/Play';
import Dashboard from './pages/Dashboard';
import Race from './pages/Race';
import Leaderboard from './pages/Leaderboard';
import Trainer from './pages/Trainer';
import Onboarding from './pages/Onboarding';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import useAuthStore from './store/authStore';
import { Navigate } from 'react-router-dom';
import useSettingsStore from './store/settingsStore';
import { ToasterProvider, useToaster } from './components/ui/Toaster';

const ProtectedRoute = ({ children, requireOnboarding = true }) => {
  const { isAuthenticated, onboardingCompleted } = useAuthStore();
  const { addToast } = useToaster();
  const location = useLocation();
  const [hasToasted, setHasToasted] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated && !hasToasted) {
      addToast('Neural Link Required. Please login to enter this sector.', 'error');
      setHasToasted(true);
    }
  }, [isAuthenticated, addToast, hasToasted]);

  if (!isAuthenticated) return <Navigate to="/" state={{ from: location }} />;
  if (requireOnboarding && !onboardingCompleted) return <Navigate to="/onboarding" />;
  
  return children;
};

const MainUI = () => {
  const location = useLocation();
  const initializeAuth = useAuthStore(state => state.initializeAuth);
  const isInitialized = useAuthStore(state => state.isInitialized);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const onboardingCompleted = useAuthStore(state => state.onboardingCompleted);
  const themeColor = useSettingsStore(state => state.themeColor);

  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--primary', themeColor);
  }, [themeColor]);
  
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-teal-glow"></div>
        <p className="text-[10px] font-mono text-primary animate-pulse uppercase tracking-[0.2em]">Initializing_Neural_Link...</p>
      </div>
    );
  }

  const showNavbar = !['/race', '/auth', '/onboarding'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showNavbar && <Navbar />}
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                onboardingCompleted ? <Navigate to="/dashboard" /> : <Navigate to="/onboarding" />
              ) : <Landing />
            } 
          />
          <Route 
            path="/play" 
            element={
              <ProtectedRoute>
                <Play />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/race" 
            element={
              <ProtectedRoute>
                <Race />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/train" 
            element={
              <ProtectedRoute>
                <Trainer />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute>
                <Leaderboard />
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
            path="/auth" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" /> : <Auth />
            } 
          />
          <Route 
            path="/onboarding" 
            element={isAuthenticated ? <Onboarding /> : <Navigate to="/auth" />} 
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

function App() {
  return (
    <ToasterProvider>
      <BrowserRouter>
        <MainUI />
      </BrowserRouter>
    </ToasterProvider>
  );
}

export default App;
