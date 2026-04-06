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
import { Logo } from './components/ui/Logo';
import useRaceStore from './store/raceStore';
import socket from './lib/socket';

const ProtectedRoute = ({ children, requireOnboarding = true }) => {
  const { isAuthenticated, onboardingCompleted } = useAuthStore();
  const { addToast } = useToaster();
  const location = useLocation();
  const [hasToasted, setHasToasted] = React.useState(false);

  React.useEffect(() => {
    // Only show toast if we are NOT on the landing page and not already toasted
    if (!isAuthenticated && !hasToasted && location.pathname !== '/') {
      addToast('Authentication Required. Please sign in to access this page.', 'error');
      setHasToasted(true);
    }
  }, [isAuthenticated, addToast, hasToasted, location.pathname]);

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
  const { user } = useAuthStore();

  React.useEffect(() => {
    socket.connect();
    
    // Global competitive listeners to prevent event loss during navigation
    socket.on('race:created', (data) => {
      useRaceStore.getState().setRoom(data.roomCode);
      useRaceStore.getState().setPlayers(data.players);
      if (data.type) {
         useRaceStore.setState({ roomType: data.type });
      }
    });

    socket.on('race:update', (data) => {
      useRaceStore.getState().handleRaceUpdate(data);
    });

    socket.on('race:countdown', (count) => {
      useRaceStore.getState().setCountdown(count);
    });
    
    socket.on('race:started', ({ passage: serverPassage }) => {
      useRaceStore.getState().setStatus('racing');
      useRaceStore.getState().setCountdown(null);
      if (serverPassage) {
        useRaceStore.getState().setPassage(serverPassage);
      }
    });

    socket.on('race:tournament:found', ({ roomCode }) => {
      // Use current user from store to join tournament room
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        socket.emit('race:join', { roomCode, user: currentUser });
      }
    });

    return () => {
      socket.off('race:created');
      socket.off('race:update');
      socket.off('race:countdown');
      socket.off('race:started');
      socket.off('race:tournament:found');
      socket.disconnect();
    };
  }, []); // Run only once on boot! 

  React.useEffect(() => {
    initializeAuth();
  }, []); 

  React.useEffect(() => {
    document.documentElement.style.setProperty('--primary', themeColor);
  }, [themeColor]);
  
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center space-y-6">
        <div className="relative group animate-pulse">
           <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
           <Logo size={80} className="relative z-10" />
        </div>
        <div className="flex flex-col items-center gap-2">
           <p className="text-[10px] font-mono text-primary animate-pulse uppercase tracking-[0.4em] ml-[0.4em]">Initializing_Room</p>
           <div className="w-32 h-[1px] bg-white/5 relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-primary w-1/2 animate-shimmer" />
           </div>
        </div>
      </div>
    );
  }

  const showNavbar = !['/', '/auth', '/onboarding'].includes(location.pathname);

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
