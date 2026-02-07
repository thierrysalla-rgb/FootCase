import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './MainLayout.css';

const MainLayout = ({ children, activeView, setView }) => {
  return (
    <div className="main-layout">
      <Sidebar activeView={activeView} setView={setView} />
      <div className="content-area">
        <Header activeView={activeView} />
        <main className="main-content animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
