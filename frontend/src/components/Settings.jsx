import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Zap, Bell, Volume2, User, Database, Info, Save, Mail } from 'lucide-react';
import emailjs from '@emailjs/browser';

const Settings = ({
    userProfile,
    onUpdateProfile,
    onExportData,
    timerDurations,
    onUpdateTimerDurations,
    notificationsEnabled,
    onToggleNotifications,
    soundEnabled,
    onToggleSound,
    autoStartBreaks,
    onToggleAutoStartBreaks,
    hydrationTarget,
    onUpdateHydrationTarget,
    pomodoroStats
}) => {
    // Focus Settings
    const [focusDuration, setFocusDuration] = useState(timerDurations?.work || 25);
    const [breakDuration, setBreakDuration] = useState(timerDurations?.shortBreak || 5);
    const [longBreakDuration, setLongBreakDuration] = useState(timerDurations?.longBreak || 15);

    // Notification Settings
    const [notifEnabled, setNotifEnabled] = useState(notificationsEnabled || false);
    const [autoBreaks, setAutoBreaks] = useState(autoStartBreaks || false);

    // Audio & Appearance
    const [soundEffects, setSoundEffects] = useState(soundEnabled || false);

    // Profile Settings
    const [name, setName] = useState(userProfile?.name || '');
    const [bio, setBio] = useState(userProfile?.bio || '');
    const [dailyGoal, setDailyGoal] = useState(userProfile?.dailyGoal || 8);
    const [hydrationGoal, setHydrationGoal] = useState(hydrationTarget || 8);

    // Dashboard Settings
    const [mainQuote, setMainQuote] = useState(userProfile?.mainQuote || "Main apne past ka gulaam nahi hoon.");
    const [subQuote, setSubQuote] = useState(userProfile?.subQuote || "Stop thinking. Start stacking actions. Action kills fear.");

    // Email Settings (Experimental)
    const [emailServiceId, setEmailServiceId] = useState(localStorage.getItem('email_service_id') || '');
    const [emailTemplateId, setEmailTemplateId] = useState(localStorage.getItem('email_template_id') || '');
    const [emailPublicKey, setEmailPublicKey] = useState(localStorage.getItem('email_public_key') || '');
    const [sendingEmail, setSendingEmail] = useState(false);

    // Sync with props
    useEffect(() => {
        if (timerDurations) {
            setFocusDuration(timerDurations.work || 25);
            setBreakDuration(timerDurations.shortBreak || 5);
            setLongBreakDuration(timerDurations.longBreak || 15);
        }
    }, [timerDurations]);

    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name || '');
            setBio(userProfile.bio || '');
            setDailyGoal(userProfile.dailyGoal || 8);
            if (userProfile.mainQuote) setMainQuote(userProfile.mainQuote);
            if (userProfile.subQuote) setSubQuote(userProfile.subQuote);
        }
    }, [userProfile]);

    const handleSaveAllSettings = async () => {
        // Save Email Keys to LocalStorage
        localStorage.setItem('email_service_id', emailServiceId);
        localStorage.setItem('email_template_id', emailTemplateId);
        localStorage.setItem('email_public_key', emailPublicKey);

        if (onUpdateTimerDurations) {
            onUpdateTimerDurations({
                work: focusDuration,
                shortBreak: breakDuration,
                longBreak: longBreakDuration
            });
        }

        if (onUpdateProfile) {
            await onUpdateProfile({
                name,
                bio,
                dailyGoal,
                mainQuote,
                subQuote
            });
        }

        if (onUpdateHydrationTarget && hydrationGoal !== hydrationTarget) {
            onUpdateHydrationTarget(hydrationGoal);
        }

        if (onToggleNotifications && notifEnabled !== notificationsEnabled) {
            onToggleNotifications(notifEnabled);
        }

        if (onToggleAutoStartBreaks && autoBreaks !== autoStartBreaks) {
            onToggleAutoStartBreaks(autoBreaks);
        }

        if (onToggleSound && soundEffects !== soundEnabled) {
            onToggleSound(soundEffects);
        }
    };

    const handleSendReport = async () => {
        if (!emailServiceId || !emailTemplateId || !emailPublicKey) {
            alert("Please configure EmailJS keys first.");
            return;
        }

        setSendingEmail(true);
        const reportData = {
            to_name: name || 'User',
            date: new Date().toLocaleDateString(),
            daily_focus: pomodoroStats?.todayCount || 0,
            daily_goal: dailyGoal,
            weekly_stats: JSON.stringify(pomodoroStats?.weeklyData?.map(d => `${d.label}: ${d.count}`) || []),
            hydration_goal: hydrationGoal
        };

        try {
            await emailjs.send(emailServiceId, emailTemplateId, reportData, emailPublicKey);
            alert("Monthly Report Sent Successfully!");
        } catch (e) {
            console.error(e);
            alert("Failed to send report. Check console for details.");
        } finally {
            setSendingEmail(false);
        }
    };

    const handleEnableNotifications = async (enabled) => {
        if (enabled && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            setNotifEnabled(permission === 'granted');
        } else if (enabled && Notification.permission === 'denied') {
            alert('Notifications are blocked. Please enable them in your browser settings.');
            setNotifEnabled(false);
        } else {
            setNotifEnabled(enabled);
        }
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar pb-24 md:pb-8">
            <div className="max-w-2xl mx-auto space-y-6 px-4 md:px-0">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 mt-4 md:mt-0">
                    <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
                        <SettingsIcon className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Settings</h2>
                        <p className="text-sm text-gray-400">Manage your preferences</p>
                    </div>
                </div>

                {/* Email Reports (Experimental) - Moved to Top */}
                <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#333333] shadow-lg space-y-5 border-l-4 border-l-indigo-600">
                    <div className="flex items-center gap-2 mb-2">
                        <Mail className="text-indigo-400" size={20} />
                        <h3 className="text-lg font-bold text-white">Monthly Reports</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <input
                                type="text"
                                value={emailServiceId}
                                onChange={(e) => setEmailServiceId(e.target.value)}
                                placeholder="EmailJS Service ID"
                                className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-4 py-3 text-white focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm"
                            />
                            <input
                                type="text"
                                value={emailTemplateId}
                                onChange={(e) => setEmailTemplateId(e.target.value)}
                                placeholder="EmailJS Template ID"
                                className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-4 py-3 text-white focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm"
                            />
                            <input
                                type="password"
                                value={emailPublicKey}
                                onChange={(e) => setEmailPublicKey(e.target.value)}
                                placeholder="EmailJS Public Key"
                                className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-4 py-3 text-white focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm"
                            />
                        </div>

                        <button
                            onClick={handleSendReport}
                            disabled={sendingEmail}
                            className={`w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-[0.98] ${sendingEmail ? 'cursor-not-allowed' : ''}`}
                        >
                            <Mail size={18} />
                            {sendingEmail ? 'Sending...' : 'Send Report'}
                        </button>
                        <p className="text-[10px] text-gray-500 text-center">
                            Requires a free EmailJS account. Keys are saved locally.
                        </p>
                    </div>
                </div>

                {/* Dashboard Appearance */}
                <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#333333] shadow-lg space-y-5">
                    <div className="flex items-center gap-2 mb-2">
                        <SettingsIcon className="text-white" size={20} />
                        <h3 className="text-lg font-bold text-white">Dashboard Appearance</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-300 font-medium mb-1">Main Quote</label>
                            <input
                                type="text"
                                value={mainQuote}
                                onChange={(e) => setMainQuote(e.target.value)}
                                className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-4 py-3 text-white focus:border-white/50 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                                placeholder="Enter main quote..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 font-medium mb-1">Sub Quote</label>
                            <textarea
                                value={subQuote}
                                onChange={(e) => setSubQuote(e.target.value)}
                                className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-4 py-3 text-white focus:border-white/50 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all resize-none h-20"
                                placeholder="Enter sub quote..."
                            />
                            <p className="text-xs text-gray-500 mt-1">Use HTML span with className 'text-white' to highlight text.</p>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#333333] shadow-lg space-y-5">
                    <div className="flex items-center gap-2 mb-2">
                        <Bell className="text-white" size={20} />
                        <h3 className="text-lg font-bold text-white">Notifications</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm text-gray-300 font-medium block">Enable Notifications</label>
                                <p className="text-xs text-gray-500 mt-1">Get notified when timer completes</p>
                            </div>
                            <button
                                onClick={() => handleEnableNotifications(!notifEnabled)}
                                className={`relative w-14 h-7 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1A1A1A] focus:ring-indigo-500/20 ${notifEnabled ? 'bg-indigo-600' : 'bg-[#333333]'
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-transform shadow-sm ${notifEnabled ? 'translate-x-7 bg-black' : 'translate-x-0 bg-gray-400'
                                        }`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm text-gray-300 font-medium block">Auto-start Breaks</label>
                                <p className="text-xs text-gray-500 mt-1">Automatically start break timer</p>
                            </div>
                            <button
                                onClick={() => setAutoBreaks(!autoBreaks)}
                                className={`relative w-14 h-7 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1A1A1A] focus:ring-indigo-500/20 ${autoBreaks ? 'bg-indigo-600' : 'bg-[#333333]'
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-transform shadow-sm ${autoBreaks ? 'translate-x-7 bg-black' : 'translate-x-0 bg-gray-400'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Audio & Appearance */}
                <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#333333] shadow-lg space-y-5">
                    <div className="flex items-center gap-2 mb-2">
                        <Volume2 className="text-white" size={20} />
                        <h3 className="text-lg font-bold text-white">Audio & Sound</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm text-gray-300 font-medium block">Sound Effects</label>
                                <p className="text-xs text-gray-500 mt-1">White noise during focus sessions</p>
                            </div>
                            <button
                                onClick={() => setSoundEffects(!soundEffects)}
                                className={`relative w-14 h-7 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1A1A1A] focus:ring-indigo-500/20 ${soundEffects ? 'bg-indigo-600' : 'bg-[#333333]'
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-transform shadow-sm ${soundEffects ? 'translate-x-7 bg-black' : 'translate-x-0 bg-gray-400'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>





                {/* Save Button */}
                <div className="pt-2 sticky bottom-4 md:static z-20">
                    <button
                        onClick={handleSaveAllSettings}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-xl flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        <Save size={20} />
                        Save Changes
                    </button>
                </div>

                {/* About Section */}
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Info size={14} />
                        <span className="text-xs font-medium uppercase tracking-widest">ZenFocus v1.0.0</span>
                    </div>
                    <p className="text-[10px] text-gray-700">Designed for deep work & clarity.</p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
