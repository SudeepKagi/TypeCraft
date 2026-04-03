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
import Settings from './pages/Settings';
import useAuthStore from './store/authStore';
import useSettingsStore from './store/settingsStore';

const MainUI = () => {
  const location = useLocation();
  const syncUser = useAuthStore(state => state.syncUser);
  const themeColor = useSettingsStore(state => state.themeColor);

  React.useEffect(() => {
    syncUser();
  }, [syncUser]);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--primary', themeColor);
  }, [themeColor]);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {location.pathname !== '/race' && <Navbar />}
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/play" element={<Play />} />
          <Route path="/race" element={<Race />} />
          <Route path="/train" element={<Trainer />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <MainUI />
    </BrowserRouter>
  );
}

export default App;
