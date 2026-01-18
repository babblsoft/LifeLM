import React from 'react';
import { useApp } from '../context/AppContext';
import { X, User, Settings, CheckSquare, Activity, FileText, Home, MessageSquare, Target } from 'lucide-react';
import { Page } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { setPage, basePulseLog, userProfile } = useApp();

  const handleNav = (page: Page) => {
    setPage(page);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div className={`fixed top-0 left-0 w-80 h-full bg-cream z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-2xl font-serif font-bold text-terra">LifeBM</h2>
                <p className="text-xs text-gray-400 tracking-widest">MANAGED BY SPIZIFY</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
              <X size={24} />
            </button>
          </div>

          <button onClick={() => handleNav('SETTINGS')} className="flex items-center space-x-4 mb-8 bg-white p-4 rounded-xl shadow-sm w-full text-left hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-terra to-orange-400 flex items-center justify-center text-white font-bold text-xl">
              {userProfile.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-charcoal">{userProfile.name}</p>
              <p className="text-xs text-gray-500">{userProfile.career}</p>
            </div>
          </button>

          <nav className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
            <SidebarItem icon={<Home size={20} />} label="Base" onClick={() => handleNav('BASE')} />
            <SidebarItem icon={<CheckSquare size={20} />} label="To-Do List" onClick={() => handleNav('TODO')} />
            
            {/* Logs Section */}
            <div className="pt-2">
                <div className="flex items-center space-x-4 w-full p-3 rounded-lg text-charcoal">
                    <span className="text-gray-400"><Activity size={20} /></span>
                    <span className="font-medium">BasePulse Log</span>
                </div>
                <div className="pl-12 text-[10px] text-gray-400 mb-4 font-mono space-y-2">
                    {basePulseLog.length > 0 ? basePulseLog.slice(0, 5).map((log, i) => (
                        <div key={i} className="bg-white/50 p-1.5 rounded truncate border border-gray-100">{log}</div>
                    )) : (
                        <div className="italic opacity-50">System idle...</div>
                    )}
                </div>
            </div>

            <div className="border-t border-gray-200 my-4"></div>
            <SidebarItem icon={<FileText size={20} />} label="Streams" onClick={() => handleNav('STREAMS')} />
            <SidebarItem icon={<MessageSquare size={20} />} label="BasePulse Chat" onClick={() => handleNav('BASEPULSE')} />
            <SidebarItem icon={<Target size={20} />} label="Missions" onClick={() => handleNav('MISSIONS')} />
            <SidebarItem icon={<FileText size={20} />} label="NoteBM" onClick={() => handleNav('NOTEBM')} />
          </nav>

          <div className="border-t border-gray-200 pt-4">
            <SidebarItem icon={<Settings size={20} />} label="Settings" onClick={() => handleNav('SETTINGS')} />
            <p className="text-[10px] text-gray-300 mt-4 text-center">LifeBM v1.0.0 • Auto-Life Enabled</p>
          </div>
        </div>
      </div>
    </>
  );
};

const SidebarItem = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex items-center space-x-4 w-full p-3 rounded-lg hover:bg-softGray text-charcoal transition-colors group"
  >
    <span className="text-gray-400 group-hover:text-terra transition-colors">{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);