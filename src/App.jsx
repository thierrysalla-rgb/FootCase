import React, { useState, useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './views/Dashboard';
import Players from './views/Players';
import Matches from './views/Matches';
import Staff from './views/Staff';
import Standings from './views/Standings';
import Stats from './views/Stats';
import Settings from './views/Settings';
import Login from './views/Login';
import { useData } from './store/DataContext';


function App() {
  const { user, login, logout, isAdmin } = useData();
  const [activeView, setActiveView] = useState('dashboard');

  // Rediriger vers le dashboard une fois connecté
  useEffect(() => {
    if (user && activeView === 'login') {
      setActiveView('dashboard');
    }
  }, [user, activeView]);


  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'matches':
        return <Matches />;
      case 'players':
        return <Players />;
      case 'staff':
        return <Staff />;
      case 'standings':
        return <Standings />;
      case 'stats':
        return <Stats />;
      case 'settings':
        return <Settings />;
      case 'login':
        return <Login />;
      default:
        return <Dashboard />;

    }
  };

  return (
    <MainLayout activeView={activeView} setView={setActiveView}>
      {renderView()}
    </MainLayout>
  );
}

export default App;
