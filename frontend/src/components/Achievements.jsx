import React, { useState } from 'react';
import { Trophy, Clock, Flame, Droplet, CheckCircle, Timer, TrendingUp, FileText, Target, Star, Plus, X, Calendar } from 'lucide-react';

// Icon mapping
const iconMap = {
    clock: Clock,
    flame: Flame,
    droplet: Droplet,
    'check-circle': CheckCircle,
    timer: Timer,
    'trending-up': TrendingUp,
    'file-text': FileText,
    target: Target,
    star: Star,
    trophy: Trophy
};

const Achievements = ({ achievements, onCreateAchievement, onDeleteAchievement }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [newAchievement, setNewAchievement] = useState({
        title: '',
        description: '',
        icon: 'star',
        targetValue: 1,
        timeRange: 'alltime',
        customEndDate: ''
    });

    // Calculate progress
    const unlockedCount = achievements.filter(a => a.isUnlocked).length;
    const totalCount = achievements.length;
    const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
    const remaining = totalCount - unlockedCount;

    // Separate unlocked and locked
    const unlockedAchievements = achievements.filter(a => a.isUnlocked).sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt));
    const lockedAchievements = achievements.filter(a => !a.isUnlocked);

    const handleCreateAchievement = async (e) => {
        e.preventDefault();

        if (!newAchievement.title || !newAchievement.description || newAchievement.targetValue < 1) {
            alert('Please fill in all fields');
            return;
        }

        await onCreateAchievement(newAchievement);
        setNewAchievement({
            title: '',
            description: '',
            icon: 'star',
            targetValue: 1,
            timeRange: 'alltime',
            customEndDate: ''
        });
        setShowCreateModal(false);
    };

    const AchievementCard = ({ achievement, showDelete = false }) => {
        const Icon = iconMap[achievement.icon] || Trophy;
        const progress = achievement.targetValue > 0 ? Math.min(100, Math.round((achievement.currentValue / achievement.targetValue) * 100)) : 0;
        const isLocked = !achievement.isUnlocked;

        return (
            <div
                className={`relative bg-[#1A1A1A] rounded-xl p-5 border transition-all ${isLocked
                    ? 'border-[#333333]'
                    : 'border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                    }`}
            >
                {/* Unlocked Badge */}
                {!isLocked && (
                    <div className="absolute top-3 right-3 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-1 rounded border border-emerald-500/20">
                        UNLOCKED
                    </div>
                )}

                {/* Delete button for custom achievements */}
                {showDelete && achievement.isCustom && (
                    <button
                        onClick={() => onDeleteAchievement(achievement._id)}
                        className="absolute top-3 right-3 p-1 text-gray-500 hover:text-red-500 transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}

                {/* Icon */}
                <div className={`flex items-center gap-3 mb-3`}>
                    <div className={`p-3 rounded-lg ${isLocked ? 'bg-[#333333]/30 text-gray-500' : 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20'}`}>
                        <Icon size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className={`font-bold text-base ${isLocked ? 'text-gray-400' : 'text-white'}`}>
                            {achievement.title}
                        </h3>
                        <p className={`text-xs mt-1 ${isLocked ? 'text-gray-500' : 'text-gray-400'}`}>{achievement.description}</p>
                    </div>
                </div>

                {/* Progress or Date */}
                {isLocked ? (
                    <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400 font-medium">{progress}%</span>
                            <span className="text-gray-500">{achievement.currentValue} / {achievement.targetValue}</span>
                        </div>
                        <div className="w-full bg-[#333333] rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-white h-full transition-all duration-500 opacity-80"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="text-xs text-emerald-500 mt-2 font-medium flex items-center gap-1">
                        <CheckCircle size={12} />
                        Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar pb-24 md:pb-8">
            <div className="max-w-6xl mx-auto space-y-6 px-4 md:px-0">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 mt-4 md:mt-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                            <Trophy className="text-amber-500" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Achievements</h2>
                            <p className="text-sm text-gray-400">Track your milestones</p>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button
                            onClick={() => setShowCollectionModal(true)}
                            className="flex-1 md:flex-none px-4 py-2.5 bg-[#1A1A1A] border border-[#333333] hover:border-white/30 text-gray-300 hover:text-white rounded-xl transition-all text-sm font-medium active:scale-[0.98]"
                        >
                            Collection
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex-1 md:flex-none px-4 py-2.5 bg-white hover:bg-gray-100 text-black rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-bold shadow-md active:scale-[0.98]"
                        >
                            <Plus size={18} />
                            <span>Add Custom</span>
                        </button>
                    </div>
                </div>

                {/* Progress Card */}
                <div className="bg-[#1A1A1A] rounded-2xl p-6 border border-[#333333] shadow-lg relative overflow-hidden">
                    {/* Subtle amber accent bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600/50 via-amber-500/50 to-amber-400/50 opacity-50" />

                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <h3 className="text-amber-500 font-bold text-xs uppercase tracking-widest mb-2">Total Progress</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl md:text-5xl font-bold text-white">{unlockedCount}</span>
                                <span className="text-xl md:text-3xl text-gray-500">/ {totalCount}</span>
                            </div>
                            <p className="text-gray-400 text-sm mt-3 font-medium">
                                {remaining} achievement{remaining !== 1 ? 's' : ''} remaining. Keep pushing!
                            </p>
                        </div>

                        {/* Circular Progress */}
                        <div className="relative h-24 w-24 md:h-28 md:w-28 rounded-full flex items-center justify-center shadow-lg shadow-black/50 flex-shrink-0"
                            style={{ background: `conic-gradient(#f59e0b ${progressPercent}%, #333333 ${progressPercent}% 100%)` }}>
                            <div className="absolute inset-2 bg-[#1A1A1A] rounded-full flex flex-col items-center justify-center">
                                <span className="text-xl md:text-2xl font-bold text-amber-500">{progressPercent}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Achievements Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                    {achievements.map(achievement => (
                        <AchievementCard key={achievement._id} achievement={achievement} />
                    ))}
                </div>

                {achievements.length === 0 && (
                    <div className="text-center py-20 bg-[#1A1A1A] rounded-2xl border border-[#333333]">
                        <Trophy className="mx-auto text-gray-600 mb-4" size={48} />
                        <p className="text-gray-400 text-lg">No achievements yet. Create your first custom achievement!</p>
                    </div>
                )}
            </div>

            {/* Create Achievement Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-[#1A1A1A] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#333333]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Plus className="text-white" size={24} />
                                New Achievement
                            </h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAchievement} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-300 font-medium mb-2">Title</label>
                                <input
                                    type="text"
                                    value={newAchievement.title}
                                    onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                                    placeholder="e.g., Meditation Master"
                                    className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-white/50 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 font-medium mb-2">Description</label>
                                <textarea
                                    value={newAchievement.description}
                                    onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                                    placeholder="e.g., Meditate for 30 days straight"
                                    rows="2"
                                    className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-white/50 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all resize-none"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-300 font-medium mb-2">Icon</label>
                                    <select
                                        value={newAchievement.icon}
                                        onChange={(e) => setNewAchievement({ ...newAchievement, icon: e.target.value })}
                                        className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-4 py-3 text-white focus:border-white/50 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all appearance-none"
                                    >
                                        <option value="star">Star</option>
                                        <option value="trophy">Trophy</option>
                                        <option value="flame">Flame</option>
                                        <option value="target">Target</option>
                                        <option value="clock">Clock</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-300 font-medium mb-2">Target</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newAchievement.targetValue}
                                        onChange={(e) => setNewAchievement({ ...newAchievement, targetValue: parseInt(e.target.value) || 1 })}
                                        className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-4 py-3 text-white focus:border-white/50 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 font-medium mb-2">Interval</label>
                                <select
                                    value={newAchievement.timeRange}
                                    onChange={(e) => setNewAchievement({ ...newAchievement, timeRange: e.target.value })}
                                    className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-4 py-3 text-white focus:border-white/50 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all appearance-none"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="alltime">All Time</option>
                                    <option value="custom">Custom Date</option>
                                </select>
                            </div>

                            {newAchievement.timeRange === 'custom' && (
                                <div>
                                    <label className="block text-sm text-gray-300 font-medium mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={newAchievement.customEndDate}
                                        onChange={(e) => setNewAchievement({ ...newAchievement, customEndDate: e.target.value })}
                                        className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl px-4 py-3 text-white focus:border-white/50 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-white hover:bg-gray-100 text-black font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.98] mt-2"
                            >
                                Create Achievement
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Collection Modal */}
            {showCollectionModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowCollectionModal(false)}>
                    <div className="bg-[#1A1A1A] rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar shadow-2xl border border-[#333333]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Trophy className="text-amber-500" size={24} />
                                Unlocked Collection ({unlockedCount})
                            </h3>
                            <button onClick={() => setShowCollectionModal(false)} className="text-gray-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {unlockedAchievements.length === 0 ? (
                            <div className="text-center py-20 bg-[#0A0A0A] rounded-xl border border-[#333333]">
                                <Trophy className="mx-auto text-gray-600 mb-4" size={48} />
                                <p className="text-gray-400">No achievements unlocked yet. Keep working!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {unlockedAchievements.map(achievement => (
                                    <AchievementCard key={achievement._id} achievement={achievement} showDelete={true} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Achievements;
