import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const BrokerLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // Direct Supabase login - no context overhead
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) {
                setError(signInError.message);
                setIsLoading(false);
                return;
            }

            if (data?.session) {
                // Navigate to dealer dashboard on success
                navigate('/dealer');
            } else {
                setError('Login failed. Please check your credentials.');
                setIsLoading(false);
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Failed to login');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-xl animate-fade-up">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-brand-black text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-black/20">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-2xl font-display font-bold text-brand-black">Broker Portal</h1>
                    <p className="text-gray-500 text-sm">Authorized Access Only</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-4 font-medium focus:outline-none focus:ring-2 focus:ring-brand-black/5 transition-all text-brand-black placeholder:text-gray-400"
                                placeholder="broker@company.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-4 font-medium focus:outline-none focus:ring-2 focus:ring-brand-black/5 transition-all text-brand-black placeholder:text-gray-400"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-brand-black text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-brand-black/10 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {isLoading ? 'Accessing...' : 'Secure Login'}
                        {!isLoading && <ChevronRight size={18} />}
                    </button>

                    <div className="text-center pt-4">
                        <button type="button" onClick={() => navigate('/')} className="text-sm text-gray-400 hover:text-brand-black transition-colors font-medium bg-transparent border-none cursor-pointer">← Back to Home</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
