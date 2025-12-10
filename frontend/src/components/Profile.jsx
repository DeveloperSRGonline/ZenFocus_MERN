import React, { useState } from 'react';
import { User, Download, Save, Shield, Volume2, Upload, Trash2, Play } from 'lucide-react';
import { saveCustomSound, deleteCustomSound, getCustomSound } from '../utils/helpers';

const Profile = ({ profile, onUpdateProfile, onExportData }) => {
    const [formData, setFormData] = useState({
        name: profile?.name || '',
        bio: profile?.bio || '',
        dailyGoal: profile?.dailyGoal || 8
    });

    const [isExporting, setIsExporting] = useState(false);
    const [customSound, setCustomSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    React.useEffect(() => {
        getCustomSound().then(file => {
            if (file) setCustomSound(file);
        });
    }, []);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Limit to 2MB
        if (file.size > 2 * 1024 * 1024) {
            alert("File size must be less than 2MB");
            return;
        }

        try {
            await saveCustomSound(file);
            setCustomSound(file);
        } catch (err) {
            console.error(err);
            alert("Failed to save sound");
        }
    };

    const handleRemoveSound = async () => {
        await deleteCustomSound();
        setCustomSound(null);
    };

    const previewSound = () => {
        if (!customSound) return;
        if (isPlaying) return; // Prevent overlapping

        setIsPlaying(true);
        const audio = new Audio(URL.createObjectURL(customSound));
        audio.onended = () => setIsPlaying(false);
        audio.play().catch(() => setIsPlaying(false));
    };

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

                {/* Sound Settings */}
                <div className="bg-[#151621] rounded-2xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Volume2 className="text-rose-400" /> Timer Sound
                    </h3>

                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1">
                            <p className="text-slate-400 text-sm mb-4">
                                Upload a custom sound to play when the timer finishes. <br />
                                <span className="text-xs text-slate-500">(Max 2MB, MP3/WAV supported)</span>
                            </p>

                            {!customSound ? (
                                <div className="mt-2">
                                    <label className="cursor-pointer bg-[#0B0C15] hover:bg-slate-800 border border-slate-700 border-dashed text-slate-400 px-4 py-8 rounded-lg flex flex-col items-center justify-center gap-2 transition-all hover:border-rose-500/50">
                                        <Upload size={24} className="mb-1" />
                                        <span className="text-sm font-bold">Click to upload sound</span>
                                        <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
                                    </label>
                                </div>
                            ) : (
                                <div className="bg-[#0B0C15] p-4 rounded-lg border border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-400">
                                            <Volume2 size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Custom Sound Active</div>
                                            <div className="text-xs text-slate-500">{(customSound.size / 1024).toFixed(1)} KB</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={previewSound} disabled={isPlaying} className="p-2 hover:bg-indigo-500/20 rounded text-indigo-400 transition-colors" title="Preview">
                                            <Play size={18} className={isPlaying ? "animate-pulse" : ""} />
                                        </button>
                                        <button onClick={handleRemoveSound} className="p-2 hover:bg-red-500/20 rounded text-red-400 transition-colors" title="Remove">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
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
