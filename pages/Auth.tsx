import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, LogIn } from 'lucide-react';

export const AuthPage = () => {
    const { login } = useApp();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate network delay for effect
        setTimeout(async () => {
            await login(email);
            setLoading(false);
        }, 800);
    };

    return (
        <div className="h-full w-full bg-charcoal flex flex-col items-center justify-center p-8 text-white relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-terra rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-terra rounded-full blur-3xl"></div>
            </div>

            <div className="z-10 w-full max-w-sm">
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-serif font-bold mb-2">Life<span className="text-terra">BM</span></h1>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Identity Management System</p>
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] shadow-2xl">
                    <h2 className="text-xl font-serif mb-6 text-center">
                        Initialize Session
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 text-gray-500" size={18} />
                            <input 
                                type="email" 
                                placeholder="Enter Identity Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-terra transition-colors"
                                required
                            />
                        </div>

                        <button 
                            disabled={loading}
                            type="submit"
                            className="w-full bg-terra hover:bg-opacity-90 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    <span>Access Base</span>
                                </>
                            )}
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center text-[10px] text-gray-500">
                        <p>Local Storage Mode Active</p>
                        <p className="opacity-50">Data persists on this device only.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};