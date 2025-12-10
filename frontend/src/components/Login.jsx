import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, AlertCircle, Loader } from 'lucide-react';

const Login = ({ onSwitchToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, handleGoogleSuccess } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        const res = await login(email, password);
        if (!res.success) {
            setError(res.error);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0C15] text-slate-200 p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-[#151621] border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-slate-500">Sign in to continue your focus journey</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1 ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#0B0C15] border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#0B0C15] border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader className="animate-spin" size={20} /> : 'Sign In'}
                    </button>
                </form>

                <div className="my-6 flex items-center gap-4">
                    <div className="h-px bg-slate-800 flex-1"></div>
                    <span className="text-slate-600 text-xs font-bold uppercase">Or continue with</span>
                    <div className="h-px bg-slate-800 flex-1"></div>
                </div>

                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError("Google Login Failed")}
                        theme="filled_black"
                        shape="pill"
                    />
                </div>

                <div className="mt-8 text-center text-sm text-slate-500">
                    Don't have an account?{' '}
                    <button onClick={onSwitchToRegister} className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
                        Create account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
