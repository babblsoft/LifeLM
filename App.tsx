import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BasePage } from './pages/Base';
import { StreamsPage } from './pages/Streams';
import { BasePulseChatPage } from './pages/BasePulseChat';
import { MissionsPage } from './pages/Missions';
import { NoteBMPage } from './pages/NoteBM';
import { ToDoListPage } from './pages/ToDoList';
import { SettingsPage } from './pages/Settings';
import { AuthPage } from './pages/Auth';
import { BottomNav } from './components/BottomNav';

const MainLayout = () => {
  const { currentPage, user, loadingAuth } = useApp();

  if (loadingAuth) {
    return (
      <div className="h-full w-full bg-charcoal flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-terra/30 border-t-terra rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-serif italic text-gray-500">Initializing LifeBM Base...</p>
      </div>
    );
  }

  // If not logged in, ONLY return AuthPage. No MainLayout wrapper.
  if (!user) {
    return <AuthPage />;
  }

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
    <div className="h-full w-full max-w-md mx-auto bg-cream relative shadow-2xl overflow-hidden flex flex-col border-x border-gray-100">
      <main className="flex-1 overflow-hidden relative z-0">
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