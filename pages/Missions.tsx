import React from 'react';
import { useApp } from '../context/AppContext';
import { Target, CheckCircle2, AlertCircle, Trash2, Check } from 'lucide-react';

export const MissionsPage = () => {
  const { missions, toggleMissionStatus, deleteMission } = useApp();
  
  const pendingMissions = missions.filter(m => m.status === 'PENDING');
  const completedMissions = missions.filter(m => m.status === 'COMPLETED');

  return (
    <div className="h-full overflow-y-auto bg-cream pt-12 pb-24 px-6">
      <h1 className="text-3xl font-serif font-bold text-charcoal mb-2">Missions</h1>
      <p className="text-gray-400 text-xs uppercase tracking-widest mb-8">Active Tasks & Directives</p>

      {/* Stats Card */}
      <div className="bg-charcoal text-white rounded-2xl p-6 mb-8 flex items-center justify-between shadow-xl">
        <div>
            <p className="text-3xl font-bold font-serif">{pendingMissions.length}</p>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Active Missions</p>
        </div>
        <div className="w-12 h-12 bg-terra rounded-full flex items-center justify-center">
            <Target size={24} />
        </div>
      </div>

      <div className="space-y-6">
        <div>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Urgent & Active</h2>
            <div className="space-y-3">
                {pendingMissions.length > 0 ? pendingMissions.map(mission => (
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
                        <div className="flex items-center text-terra text-xs font-medium space-x-2">
                            <AlertCircle size={14} />
                            <span>{mission.deadline ? `Due: ${mission.deadline}` : 'BasePulse Monitoring'}</span>
                        </div>
                        
                        {/* Hover Actions */}
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
                        <p className="text-gray-400 text-sm">No active missions.</p>
                    </div>
                )}
            </div>
        </div>

        {completedMissions.length > 0 && (
            <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 opacity-70">Completed History</h2>
                <div className="space-y-3">
                    {completedMissions.map(mission => (
                        <div key={mission.id} className="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100 group">
                            <div className="flex items-center space-x-3 opacity-60">
                                <span className="text-gray-500 line-through">{mission.title}</span>
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