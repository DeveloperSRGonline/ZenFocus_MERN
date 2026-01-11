import React, { useState } from 'react';

import { User, Download, Save, Shield, Volume2, Upload, Trash2, Play, Camera, Pen, X } from 'lucide-react';
import { saveCustomSound, deleteCustomSound, getCustomSound, saveProfilePicture, getProfilePicture } from '../utils/helpers';

const Profile = ({ profile, onUpdateProfile, onExportData }) => {
    const [formData, setFormData] = useState({
        name: profile?.name || '',
        bio: profile?.bio || '',
        dailyGoal: profile?.dailyGoal || 8
    });

    const [isExporting, setIsExporting] = useState(false);
    const [customSound, setCustomSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [profilePic, setProfilePic] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    React.useEffect(() => {
        getCustomSound().then(file => {
            if (file) setCustomSound(file);
        });
        getProfilePicture().then(file => {
            if (file) setProfilePic(file);
        });
    }, []);

    const handleProfilePicUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert("Image too large (max 2MB)");
            return;
        }
        try {
            await saveProfilePicture(file);
            setProfilePic(file);
        } catch (e) { console.error(e); }
    };

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
        <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar pb-24 md:pb-8">
            <div className="max-w-2xl mx-auto space-y-6">

                <div className="grid grid-cols-[100px_1fr] gap-6 items-center bg-[#1A1A1A] p-6 rounded-2xl border border-[#333333] shadow-lg relative">

                    <div className="h-24 w-24 rounded-full border-2 border-white/20 relative group overflow-hidden bg-[#0A0A0A] flex items-center justify-center shadow-inner">
                        {profilePic ? (
                            <img src={URL.createObjectURL(profilePic)} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl text-white font-bold">{formData.name.charAt(0) || 'U'}</span>
                        )}

                        <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="text-white" size={24} />
                            <input type="file" accept="image/*" onChange={handleProfilePicUpload} className="hidden" />
                        </label>
                    </div>
                    <div>
                        <div className="flex items-center gap-4 mb-1">
                            <h2 className="text-2xl md:text-3xl font-bold text-white">{formData.name || 'User'}</h2>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="text-gray-500 hover:text-white p-2 rounded-lg hover:bg-[#333333] transition-all"
                                title="Edit Profile"
                            >
                                <Pen size={16} />
                            </button>
                        </div>
                        <p className="text-gray-400 text-sm md:text-base">{formData.bio || 'Add a bio to stay motivated'}</p>
                    </div>
                </div>

                {/* Edit Profile Form */}
                {/* Edit Profile Form */}
                {isEditing && (
                    <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#333333] shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-2 mb-6">
                            <User className="text-white" size={20} />
                            <h3 className="text-lg font-bold text-white">Edit Details</h3>
                        </div>

                        <form onSubmit={(e) => { handleSubmit(e); setIsEditing(false); }} className="space-y-6">
                            <div>
                                <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Display Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/20 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Bio / Mantra</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/20 transition-colors h-24 resize-none"
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3.5 rounded-xl font-bold text-gray-400 hover:text-white border border-transparent hover:border-[#333333] transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 bg-white hover:bg-gray-100 text-black px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]">
                                    <Save size={18} /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Sound Settings */}
                <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#333333] shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <Volume2 className="text-white" size={20} />
                        <h3 className="text-lg font-bold text-white">Timer Sound</h3>
                    </div>

                    <div className="flex flex-col gap-4">
                        <p className="text-gray-400 text-sm">
                            Custom sound for timer completion <span className="text-gray-600">(Max 2MB)</span>
                        </p>

                        {!customSound ? (
                            <label className="cursor-pointer bg-[#0A0A0A] hover:bg-[#151515] border border-[#333333] border-dashed text-gray-400 px-4 py-8 rounded-xl flex flex-col items-center justify-center gap-2 transition-all">
                                <Upload size={24} className="mb-1 text-gray-500" />
                                <span className="text-sm font-bold text-gray-300">Upload Custom Sound</span>
                                <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
                            </label>
                        ) : (
                            <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#333333] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-[#333333] rounded-full flex items-center justify-center text-white">
                                        <Volume2 size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Custom Sound Active</div>
                                        <div className="text-xs text-gray-500">{(customSound.size / 1024).toFixed(1)} KB</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={previewSound} disabled={isPlaying} className="p-2.5 hover:bg-white/10 rounded-lg text-white transition-colors border border-transparent hover:border-white/20" title="Preview">
                                        <Play size={18} className={isPlaying ? "animate-pulse" : ""} />
                                    </button>
                                    <button onClick={handleRemoveSound} className="p-2.5 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-colors border border-transparent hover:border-red-500/20" title="Remove">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Data Zone */}
                <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#333333] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                            <Shield className="text-emerald-500" size={18} /> Your Data
                        </h3>
                        <p className="text-gray-400 text-sm">
                            Download a full copy of your activity history.
                        </p>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="w-full md:w-auto bg-[#0A0A0A] hover:bg-[#151515] border border-[#333333] text-gray-200 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-3 transition-all hover:border-white/30 whitespace-nowrap active:scale-[0.98]"
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
        </div >
    );
};

export default Profile;
