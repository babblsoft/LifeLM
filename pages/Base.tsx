import React, { useState } from 'react';
import { Menu, Activity, Plus, Bell, PlusCircle, X, Check, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Sidebar } from '../components/Sidebar';
import { format, isPast, parseISO } from 'date-fns';

export const BasePage = () => {
  const { userProfile, missions, diaryEntries, notifications, markNotificationRead, clearAllNotifications, addMission, setPage } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMissionModal, setShowMissionModal] = useState(false);

  // Stats
  const activeMissions = missions.filter(m => m.status === 'PENDING' && (!m.activationDate || isPast(parseISO(m.activationDate)))).length;
  const todaysEntries = diaryEntries.filter(d => d.date === format(new Date(), 'yyyy-MM-dd')).length;
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const currentTime = format(new Date(), 'h:mm a');

  // Mission Form State
  const [missionTitle, setMissionTitle] = useState('');
  const [missionCategory, setMissionCategory] = useState<'EVERYDAY' | 'FINITE'>('FINITE');
  const [missionActivation, setMissionActivation] = useState('');
  const [missionDeadline, setMissionDeadline] = useState('');

  const handleAddMission = () => {
      if(!missionTitle.trim()) return;
      addMission({
          title: missionTitle,
          category: missionCategory,
          activationDate: missionActivation || undefined,
          deadline: missionDeadline || undefined,
          description: 'Manually added via Base.'
      });
      setMissionTitle('');
      setMissionCategory('FINITE');
      setMissionActivation('');
      setMissionDeadline('');
      setShowMissionModal(false);
  };

  return (
    <div className="h-full overflow-y-auto pb-24 bg-cream relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Header */}
        <header className="px-6 pt-12 pb-6 flex justify-between items-center sticky top-0 bg-cream/90 backdrop-blur-sm z-20">
            <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Menu size={28} className="text-charcoal" />
            </button>
            
            <div className="flex items-center space-x-3">
                <button 
                    onClick={() => setShowMissionModal(true)}
                    className="flex items-center space-x-1 bg-terra/10 text-terra px-3 py-1.5 rounded-full hover:bg-terra hover:text-white transition-all"
                >
                    <PlusCircle size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Add Mission</span>
                </button>

                <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 relative hover:bg-gray-100 rounded-full transition-colors"
                >
                    <Bell size={24} className="text-charcoal" />
                    {unreadNotifications > 0 && (
                        <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-cream animate-bounce"></span>
                    )}
                </button>

                <button onClick={() => setPage('SETTINGS')} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-300 to-teal-200 overflow-hidden border-2 border-white shadow-md">
                    <img src={`https://picsum.photos/seed/${userProfile.name}/200`} alt="Profile" className="w-full h-full object-cover" />
                </button>
            </div>
        </header>

        {showNotifications && (
            <div className="mx-6 mb-6 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 absolute z-30 w-[calc(100%-3rem)]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-charcoal text-sm">Notifications</h3>
                    <button onClick={clearAllNotifications} className="text-[10px] text-terra font-bold uppercase hover:underline">Clear All</button>
                </div>
                <div className="max-h-60 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(notif => (
                        <div 
                            key={notif.id} 
                            onClick={() => markNotificationRead(notif.id)}
                            className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer animate-slide-in ${!notif.read ? 'bg-blue-50/30' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-xs font-bold uppercase tracking-wider ${notif.type === 'TODO' ? 'text-terra' : 'text-blue-500'}`}>
                                    {notif.type}
                                </span>
                                <span className="text-[10px] text-gray-400">{format(new Date(notif.timestamp), 'h:mm a')}</span>
                            </div>
                            <p className="text-sm font-semibold text-charcoal">{notif.title}</p>
                            <p className="text-xs text-gray-500">{notif.message}</p>
                        </div>
                    )) : (
                        <div className="p-8 text-center text-gray-400 text-xs">No new notifications</div>
                    )}
                </div>
            </div>
        )}

        {showMissionModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-serif font-bold text-2xl text-charcoal">New Mission</h3>
                        <button onClick={() => setShowMissionModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                            <X size={24} className="text-gray-400" />
                        </button>
                    </div>
                    
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar pr-1">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Title</label>
                            <input 
                                type="text" 
                                value={missionTitle}
                                onChange={(e) => setMissionTitle(e.target.value)}
                                placeholder="E.g. Renew Passport"
                                className="w-full bg-softGray rounded-xl p-3 text-charcoal focus:outline-none focus:ring-2 focus:ring-terra/20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
                            <div className="flex space-x-2">
                                <button 
                                    onClick={() => setMissionCategory('FINITE')}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${missionCategory === 'FINITE' ? 'bg-charcoal text-white' : 'bg-softGray text-gray-400'}`}
                                >
                                    One-Time
                                </button>
                                <button 
                                    onClick={() => setMissionCategory('EVERYDAY')}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${missionCategory === 'EVERYDAY' ? 'bg-charcoal text-white' : 'bg-softGray text-gray-400'}`}
                                >
                                    Routine
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Activation Date (Start Monitoring)</label>
                            <input 
                                type="datetime-local" 
                                value={missionActivation}
                                onChange={(e) => setMissionActivation(e.target.value)}
                                className="w-full bg-softGray rounded-xl p-3 text-charcoal focus:outline-none focus:ring-2 focus:ring-terra/20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Deadline (Optional)</label>
                            <input 
                                type="date" 
                                value={missionDeadline}
                                onChange={(e) => setMissionDeadline(e.target.value)}
                                className="w-full bg-softGray rounded-xl p-3 text-charcoal focus:outline-none focus:ring-2 focus:ring-terra/20"
                            />
                        </div>
                        <button 
                            onClick={handleAddMission}
                            className="w-full bg-terra text-white py-4 rounded-xl font-bold shadow-lg hover:bg-opacity-90 transition-all flex justify-center items-center space-x-2 mt-4"
                        >
                            <PlusCircle size={20} />
                            <span>Initialize Mission</span>
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="px-6 space-y-8">
            <div>
                <h1 className="text-4xl font-serif font-bold text-charcoal">
                    Life<span className="text-terra">BM</span> / <br /> {userProfile.name}
                </h1>
                <p className="text-xs tracking-widest text-gray-400 mt-2 uppercase">Managed by Spizify</p>
                
                <div className="absolute top-12 right-16 bg-charcoal text-white text-[10px] px-3 py-2 rounded-full shadow-xl flex items-center space-x-2 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    <span>BasePulse: ACTIVE | {currentTime}</span>
                </div>
            </div>

            <button 
                onClick={() => setPage('BASEPULSE')}
                className="w-full text-left bg-[#FAF5F5] rounded-3xl p-6 relative overflow-hidden border border-terra/10 shadow-sm group hover:shadow-lg transition-all active:scale-[0.98]"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-terra/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-terra flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <Activity size={18} />
                    </div>
                    <span className="text-terra font-bold text-sm uppercase tracking-wide">Active Command Stream</span>
                </div>
                <p className="text-terra/80 font-serif italic text-lg leading-relaxed mb-6">
                    BasePulse is monitoring your identity model. Awaiting input...
                </p>
                <div className="text-[10px] font-bold text-terra/60 flex items-center group-hover:text-terra transition-colors uppercase tracking-widest">
                    Tap to open BasePulse →
                </div>
            </button>

            <div className="bg-charcoal text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-3">
                        <Activity className="text-terra" size={24} />
                        <h2 className="font-serif text-2xl">Identity Pulse</h2>
                    </div>
                </div>

                <div className="space-y-6">
                    <button onClick={() => setPage('STREAMS')} className="flex space-x-4 w-full text-left group">
                        <div className="w-1 bg-terra rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1 group-hover:text-white transition-colors">Life Stream</p>
                            <p className="text-gray-300 text-sm leading-snug">
                                {todaysEntries > 0 
                                    ? `${todaysEntries} entries logged today. Syncing with cloud...` 
                                    : "No entries logged. Start your stream today."}
                            </p>
                        </div>
                    </button>

                    <button onClick={() => setPage('MISSIONS')} className="flex space-x-4 w-full text-left group">
                        <div className="w-1 bg-yellow-500 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"></div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1 group-hover:text-white transition-colors">Missions Active</p>
                            <p className="text-gray-300 text-sm leading-snug">
                                {activeMissions} mission(s) currently being monitored by BasePulse.
                            </p>
                        </div>
                    </button>
                </div>
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-terra/20 rounded-full blur-3xl animate-pulse-slow"></div>
            </div>
        </div>
    </div>
  );
};