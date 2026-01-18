import React from 'react';
import { Home, ListFilter, Zap, Target, FolderOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Page } from '../types';

export const BottomNav = () => {
  const { currentPage, setPage } = useApp();

  const navItems: { page: Page; icon: React.ReactNode; label: string }[] = [
    { page: 'BASE', icon: <Home size={22} />, label: 'Base' },
    { page: 'STREAMS', icon: <ListFilter size={22} />, label: 'Streams' },
    { page: 'BASEPULSE', icon: <Zap size={24} className={currentPage === 'BASEPULSE' ? 'fill-current' : ''} />, label: 'BasePulse' },
    { page: 'MISSIONS', icon: <Target size={22} />, label: 'Missions' },
    { page: 'NOTEBM', icon: <FolderOpen size={22} />, label: 'NoteBM' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 pb-safe pt-2 px-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-30">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
            const isActive = currentPage === item.page;
            // BasePulse Special Styling
            if (item.page === 'BASEPULSE') {
                return (
                    <button
                        key={item.page}
                        onClick={() => setPage(item.page)}
                        className={`flex flex-col items-center justify-center -mt-6 p-3 rounded-full shadow-lg transition-transform ${
                            isActive ? 'bg-terra text-white scale-110' : 'bg-charcoal text-white hover:scale-105'
                        }`}
                    >
                        {item.icon}
                        <span className="text-[10px] font-medium mt-1">Chat</span>
                    </button>
                )
            }
            return (
                <button
                    key={item.page}
                    onClick={() => setPage(item.page)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl w-16 transition-all ${
                    isActive ? 'text-terra' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    {item.icon}
                    <span className="text-[10px] font-medium mt-1">{item.label}</span>
                </button>
            );
        })}
      </div>
    </div>
  );
};
