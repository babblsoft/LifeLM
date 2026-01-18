import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BasePage } from './pages/Base';
import { StreamsPage } from './pages/Streams';
import { BasePulseChatPage } from './pages/BasePulseChat';
import { MissionsPage } from './pages/Missions';
import { NoteBMPage } from './pages/NoteBM';
import { ToDoListPage } from './pages/ToDoList';
import { SettingsPage } from './pages/Settings';
import { BottomNav } from './components/BottomNav';

const MainLayout = () => {
  const { currentPage } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'BASE': return <BasePage />;
      case 'STREAMS': return <StreamsPage />;
      case 'BASEPULSE': return <BasePulseChatPage />;
      case 'MISSIONS': return <MissionsPage />;
      case 'NOTEBM': return <NoteBMPage />;
      case 'TODO': return <ToDoListPage />;
      case 'SETTINGS': return <SettingsPage />;
      default: return <BasePage />;
    }
  };

  return (
    <div className="h-full w-full max-w-md mx-auto bg-cream relative shadow-2xl overflow-hidden flex flex-col">
      <main className="flex-1 overflow-hidden relative">
        {renderPage()}
      </main>
      <BottomNav />
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;