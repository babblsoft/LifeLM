import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Smartphone, Mic, Trash2, Save } from 'lucide-react';

export const SettingsPage = () => {
  const { userProfile, updateUserProfile, resetAppData } = useApp();
  
  const [name, setName] = useState(userProfile.name);
  const [career, setCareer] = useState(userProfile.career);
  const [phone, setPhone] = useState(userProfile.phoneNumber || '');
  const [voice, setVoice] = useState(userProfile.aiVoice || 'Kore');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
      updateUserProfile({
          name,
          career,
          phoneNumber: phone,
          aiVoice: voice
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="h-full overflow-y-auto bg-cream pt-12 pb-24 px-6">
      <h1 className="text-3xl font-serif font-bold text-charcoal mb-2">Settings</h1>
      <p className="text-gray-400 text-xs uppercase tracking-widest mb-8">Personalize BasePulse</p>

      <div className="space-y-6">
        {/* Profile Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-charcoal mb-4 flex items-center">
                <User size={16} className="mr-2 text-terra" />
                Profile
            </h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Name</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-softGray rounded-lg p-3 text-sm text-charcoal focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Career/Role</label>
                    <input 
                        type="text" 
                        value={career} 
                        onChange={(e) => setCareer(e.target.value)}
                        className="w-full bg-softGray rounded-lg p-3 text-sm text-charcoal focus:outline-none"
                    />
                </div>
            </div>
        </section>

        {/* Communication Section */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-charcoal mb-4 flex items-center">
                <Smartphone size={16} className="mr-2 text-terra" />
                Communication
            </h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">SMS Number (For Reminders)</label>
                    <input 
                        type="tel" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 234 567 8900"
                        className="w-full bg-softGray rounded-lg p-3 text-sm text-charcoal focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center">
                        <Mic size={12} className="mr-1" /> AI Voice
                    </label>
                    <select 
                        value={voice} 
                        onChange={(e) => setVoice(e.target.value)}
                        className="w-full bg-softGray rounded-lg p-3 text-sm text-charcoal focus:outline-none"
                    >
                        <option value="Kore">Kore (Balanced)</option>
                        <option value="Puck">Puck (Energetic)</option>
                        <option value="Charon">Charon (Deep)</option>
                        <option value="Fenrir">Fenrir (Authoritative)</option>
                    </select>
                </div>
            </div>
        </section>

        {/* Save Button */}
        <button 
            onClick={handleSave}
            className={`w-full py-4 rounded-xl font-bold shadow-lg flex items-center justify-center space-x-2 transition-all ${
                isSaved ? 'bg-green-500 text-white' : 'bg-charcoal text-white hover:bg-opacity-90'
            }`}
        >
            <Save size={20} />
            <span>{isSaved ? 'Changes Saved' : 'Save Configuration'}</span>
        </button>

        {/* Danger Zone */}
        <section className="pt-8 border-t border-gray-200">
            <button 
                onClick={resetAppData}
                className="w-full py-3 rounded-xl border border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 transition-colors flex items-center justify-center"
            >
                <Trash2 size={16} className="mr-2" />
                Reset App Data
            </button>
        </section>
      </div>
    </div>
  );
};