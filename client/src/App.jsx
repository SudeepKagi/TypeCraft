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

const MainUI = () => {
  const location = useLocation();
  // Landing handles its own navbar opacity if needed
  
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
