import React, { useState } from 'react';
import { User, Download, Save, Shield } from 'lucide-react';

const Profile = ({ profile, onUpdateProfile, onExportData }) => {
    const [formData, setFormData] = useState({
        name: profile?.name || '',
        bio: profile?.bio || '',
        dailyGoal: profile?.dailyGoal || 8
    });
    const [isExporting, setIsExporting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdateProfile(formData);
    };

    const handleExport = async () => {
        setIsExporting(true);
        await onExportData();
        setIsExporting(false);
    };

    return (
        <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-2xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="h-24 w-24 mx-auto bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-4xl text-white font-bold shadow-2xl mb-4 border-4 border-[#0B0C15]">
                        {formData.name.charAt(0) || 'U'}
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">{formData.name || 'User'}</h2>
                    <p className="text-slate-400">{formData.bio || 'No bio yet'}</p>
                </div>

                {/* Settings Form */}
                <div className="bg-[#151621] rounded-2xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <User className="text-indigo-400" /> Profile Settings
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-slate-400 text-sm font-bold mb-2">Display Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-[#0B0C15] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm font-bold mb-2">Bio / Mantra</label>
                            <textarea
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full bg-[#0B0C15] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors h-24 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm font-bold mb-2">Daily Pomodoro Goal</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="1" max="20"
                                    value={formData.dailyGoal}
                                    onChange={e => setFormData({ ...formData, dailyGoal: parseInt(e.target.value) })}
                                    className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                                <span className="text-indigo-400 font-mono font-bold text-xl w-8 text-center">{formData.dailyGoal}</span>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all">
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    </form>
                </div>

                {/* Data Zone */}
                <div className="bg-[#151621] rounded-2xl p-8 border border-slate-800 shadow-xl md:flex items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <Shield className="text-emerald-400" /> Your Data
                        </h3>
                        <p className="text-slate-400 text-sm">
                            Download a complete copy of your activity history, tasks, and notes in JSON format.
                        </p>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="mt-4 md:mt-0 bg-[#0B0C15] hover:bg-slate-800 border border-slate-700 text-slate-200 px-6 py-3 rounded-lg font-bold flex items-center gap-3 transition-all whitespace-nowrap"
                    >
                        {isExporting ? (
                            <span className="animate-pulse">Generating...</span>
                        ) : (
                            <>
                                <Download size={20} /> Export JSON
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
