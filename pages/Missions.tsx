import React from 'react';
import { useApp } from '../context/AppContext';
import { Target, CheckCircle2, AlertCircle, Trash2, Check, Calendar as CalendarIcon, ZapOff, Clock, ExternalLink } from 'lucide-react';
import { isPast, parseISO, format, addHours } from 'date-fns';

declare const google: any;

export const MissionsPage = () => {
  const { missions, toggleMissionStatus, deleteMission, userProfile, setPage } = useApp();
  
  const now = new Date();
  
  // Filter logic
  const activeMissions = missions.filter(m => 
    m.status === 'PENDING' && 
    (!m.activationDate || isPast(parseISO(m.activationDate)))
  );
  
  const dormantMissions = missions.filter(m => 
    m.status === 'PENDING' && 
    m.activationDate && 
    !isPast(parseISO(m.activationDate))
  ).sort((a, b) => parseISO(a.activationDate!).getTime() - parseISO(b.activationDate!).getTime());

  const completedMissions = missions.filter(m => m.status === 'COMPLETED');

  const addToGoogleCalendar = async (title: string, date?: string, description?: string, deadline?: string) => {
      if (!userProfile.googleClientId) {
          if(confirm("Google Client ID is missing. Go to Settings to configure it?")) {
              setPage('SETTINGS');
          }
          return;
      }

      const client = google.accounts.oauth2.initTokenClient({
        client_id: userProfile.googleClientId,
        scope: 'https://www.googleapis.com/auth/calendar.events',
        callback: async (response: any) => {
            if (response.access_token) {
                const startDateTime = date ? new Date(date) : new Date();
                const endDateTime = deadline ? new Date(deadline) : addHours(startDateTime, 1);
                
                const event = {
                    summary: title,
                    description: description || 'Added via LifeBM',
                    start: {
                        dateTime: startDateTime.toISOString(),
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    },
                    end: {
                        dateTime: endDateTime.toISOString(),
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    },
                };

                try {
                    await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${response.access_token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(event),
                    });
                    alert('Mission added to Google Calendar!');
                } catch (error) {
                    console.error('Error creating event:', error);
                    alert('Failed to add event.');
                }
            }
        },
      });

      client.requestAccessToken();
  };

  return (
    <div className="h-full overflow-y-auto bg-cream pt-12 pb-24 px-6 no-scrollbar">
      <h1 className="text-3xl font-serif font-bold text-charcoal mb-2">Missions</h1>
      <p className="text-gray-400 text-xs uppercase tracking-widest mb-8">Active Tasks & Directives</p>

      {/* Stats Card */}
      <div className="bg-charcoal text-white rounded-2xl p-6 mb-8 flex items-center justify-between shadow-xl">
        <div>
            <p className="text-3xl font-bold font-serif">{activeMissions.length}</p>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Active Monitoring</p>
        </div>
        <div className="w-12 h-12 bg-terra rounded-full flex items-center justify-center">
            <Target size={24} />
        </div>
      </div>

      <div className="space-y-8">
        {/* Active Section */}
        <div>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                <Target size={14} className="mr-2 text-terra" />
                Active Monitoring
            </h2>
            <div className="space-y-3">
                {activeMissions.length > 0 ? activeMissions.map(mission => (
                    <div key={mission.id} className="bg-white p-5 rounded-xl border-l-4 border-terra shadow-sm hover:shadow-md transition-shadow group relative">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-charcoal">{mission.title}</h3>
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                                {mission.category}
                            </span>
                        </div>
                        {mission.description && (
                            <p className="text-sm text-gray-500 mb-3">{mission.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center text-terra text-xs font-medium space-x-2">
                                <AlertCircle size={14} />
                                <span>{mission.deadline ? `Deadline: ${mission.deadline}` : 'Continuous Stream'}</span>
                            </div>
                            
                            <button 
                                onClick={() => addToGoogleCalendar(mission.title, mission.activationDate, mission.description, mission.deadline)}
                                className="flex items-center space-x-1 text-[10px] text-blue-500 font-bold hover:underline"
                            >
                                <CalendarIcon size={10} />
                                <span>Sync Calendar</span>
                            </button>
                        </div>
                        
                        <div className="absolute right-4 bottom-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => toggleMissionStatus(mission.id)}
                                className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                                title="Mark Complete"
                            >
                                <Check size={16} />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-8 bg-white/50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm">No missions currently being monitored.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Dormant / Scheduled Section */}
        {dormantMissions.length > 0 && (
            <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                    <ZapOff size={14} className="mr-2" />
                    Scheduled (Dormant)
                </h2>
                <div className="space-y-3">
                    {dormantMissions.map(mission => (
                        <div key={mission.id} className="bg-white/40 p-4 rounded-xl border border-gray-200 flex flex-col space-y-2 opacity-70 group hover:opacity-100 transition-all">
                            <div className="flex justify-between items-center">
                                <h4 className="text-sm font-bold text-charcoal">{mission.title}</h4>
                                <Clock size={14} className="text-gray-400" />
                            </div>
                            <div className="flex items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                Starts: {format(parseISO(mission.activationDate!), 'MMM d, p')}
                            </div>
                            
                            <div className="flex justify-between items-center pt-1">
                                <button 
                                    onClick={() => addToGoogleCalendar(mission.title, mission.activationDate, mission.description, mission.deadline)}
                                    className="flex items-center space-x-1 text-[10px] text-blue-500 font-bold hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <CalendarIcon size={10} />
                                    <span>Sync</span>
                                </button>
                                
                                <button 
                                    onClick={() => deleteMission(mission.id)}
                                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Completed History Section */}
        {completedMissions.length > 0 && (
            <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 opacity-70">Archive</h2>
                <div className="space-y-3">
                    {completedMissions.map(mission => (
                        <div key={mission.id} className="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100 group">
                            <div className="flex items-center space-x-3 opacity-60">
                                <span className="text-gray-500 line-through text-sm">{mission.title}</span>
                                <CheckCircle2 size={18} className="text-green-500" />
                            </div>
                            <button 
                                onClick={() => deleteMission(mission.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};