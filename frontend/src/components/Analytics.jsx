import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Droplet, Calendar, Target, Flame, Award, Trophy } from 'lucide-react';

const Analytics = ({
    pomodoroStats,
    pomodoroHistory,
    hydrationHistory,
    hydration,
    tasks,
    logs,
    achievements
}) => {
    const [timeRange, setTimeRange] = useState('week'); // 'week' or 'month'
    const [isAnimating, setIsAnimating] = useState(true);

    // Trigger animation on mount
    useEffect(() => {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    // Calculate stats
    const calculateStats = () => {
        const now = new Date();
        const daysToCheck = timeRange === 'week' ? 7 : 30;

        // Total pomodoros
        const totalPomodoros = pomodoroStats || 0;

        // Average pomodoros per day
        const avgPomodoros = pomodoroHistory.length > 0
            ? Math.round(pomodoroHistory.reduce((sum, h) => sum + h.count, 0) / Math.max(pomodoroHistory.length, 1))
            : 0;

        // Active days (days with pomodoros)
        const activeDays = pomodoroHistory.filter(h => h.count > 0).length;

        // Total focus hours from logs
        const totalMinutes = logs.reduce((sum, log) => sum + (log.duration || 0), 0);
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;

        // Achievements stats
        const totalAchievements = achievements?.length || 0;
        const unlockedAchievements = achievements?.filter(a => a.isUnlocked).length || 0;
        const achievementProgress = totalAchievements > 0 ? Math.round((unlockedAchievements / totalAchievements) * 100) : 0;

        // Hydration consistency
        // Hydration consistency (Real Data)
        const hydrationDaysToCheck = hydrationHistory.length > 0 ? hydrationHistory.length : 1;
        const totalHydrationConsistency = hydrationHistory.reduce((sum, day) => {
            // Assuming each day entry has { count, target } - schema says count only?
            // Schema: count. Target is in Stats document root.
            // We'll estimate target is 8.
            const dayConsistency = Math.min((day.count || 0) / 8, 1);
            return sum + dayConsistency;
        }, 0);
        const hydrationConsistency = hydrationHistory.length > 0
            ? Math.round((totalHydrationConsistency / daysToCheck) * 100)
            : (hydration.count > 0 ? Math.round((hydration.count / 8) * 100) : 0);

        // Best focus day
        const bestDay = pomodoroHistory.reduce((max, h) => h.count > max.count ? h : max, { count: 0 });

        // Longest streak
        let currentStreak = 0;
        let longestStreak = 0;
        pomodoroHistory.forEach(h => {
            if (h.count > 0) {
                currentStreak++;
                longestStreak = Math.max(longestStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        });

        // Focus distribution (simplified)
        // Removed dummy distribution logic

        return {
            totalPomodoros,
            avgPomodoros,
            activeDays,
            totalHours,
            remainingMinutes,
            hydrationConsistency,
            bestDay: bestDay.count,
            longestStreak,
            longestStreak,
            totalAchievements,
            unlockedAchievements,
            achievementProgress
        };
    };

    const stats = calculateStats();

    // Get last 7 days for charts
    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            const pomodoroData = pomodoroHistory.find(h => h.date === dateStr);
            const pomodoros = pomodoroData ? pomodoroData.count : 0;

            days.push({
                day: dayName,
                date: dateStr,
                pomodoros: pomodoros,
                hydration: 0 // Placeholder
            });
        }
        return days;
    };

    const last7Days = getLast7Days();
    const maxPomodoros = Math.max(...last7Days.map(d => d.pomodoros), 4);

    return (
        <div className="h-full overflow-y-auto custom-scrollbar pb-20 md:pb-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
                            <TrendingUp className="text-white" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Analytics</h2>
                    </div>

                    {/* Time Range Toggle */}
                    <div className="flex gap-2 bg-[#1A1A1A] rounded-lg p-1 border border-[#333333]">
                        <button
                            onClick={() => setTimeRange('week')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${timeRange === 'week'
                                ? 'bg-white text-black'
                                : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setTimeRange('month')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${timeRange === 'month'
                                ? 'bg-white text-black'
                                : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            Month
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#1A1A1A] rounded-xl p-5 border border-[#333333] card-hover">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="text-white" size={16} />
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Pomodoros</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats.totalPomodoros}</div>
                        <div className="text-xs text-gray-600 mt-1">{stats.avgPomodoros} avg/day</div>
                    </div>

                    <div className="bg-[#1A1A1A] rounded-xl p-5 border border-[#333333] card-hover">
                        <div className="flex items-center gap-2 mb-2">
                            <Droplet className="text-white" size={16} />
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Hydration</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{hydration.count}</div>
                        <div className="text-xs text-gray-600 mt-1">{hydration.count} avg/day</div>
                    </div>

                    <div className="bg-[#1A1A1A] rounded-xl p-5 border border-[#333333] card-hover">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="text-white" size={16} />
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Active Days</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats.activeDays}</div>
                        <div className="text-xs text-gray-600 mt-1">7 possible</div>
                    </div>

                    <div className="bg-[#1A1A1A] rounded-xl p-5 border border-[#333333] card-hover">
                        <div className="flex items-center gap-2 mb-2">
                            <Trophy className="text-white" size={16} />
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Achievements</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats.unlockedAchievements}</div>
                        <div className="text-xs text-gray-600 mt-1">{stats.achievementProgress}% unlocked</div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Focus Trends Chart */}
                    <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#333333] card-hover">
                        <h3 className="text-base font-bold text-white mb-6">Focus Trends</h3>
                        <div className="h-64 relative">
                            {/* Y-axis */}
                            <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-gray-600">
                                <span>4</span>
                                <span>3</span>
                                <span>2</span>
                                <span>1</span>
                                <span>0</span>
                            </div>

                            {/* Chart area */}
                            <div className="ml-10 h-full border-l border-b border-[#333333] relative">
                                {/* Grid lines */}
                                <div className="absolute inset-0 flex flex-col justify-between">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="border-t border-[#222222]" />
                                    ))}
                                </div>

                                {/* Line chart */}
                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 700 100" preserveAspectRatio="none">
                                    <polyline
                                        points={last7Days.map((d, i) =>
                                            `${(i * 100) + 50},${100 - (d.pomodoros / maxPomodoros) * 100}`
                                        ).join(' ')}
                                        fill="none"
                                        stroke="#FFFFFF"
                                        strokeWidth="2"
                                        className="drop-shadow-lg"
                                    />
                                    {last7Days.map((d, i) => (
                                        <circle
                                            key={i}
                                            cx={(i * 100) + 50}
                                            cy={100 - (d.pomodoros / maxPomodoros) * 100}
                                            r="4"
                                            fill="#FFFFFF"
                                            className="drop-shadow-lg"
                                        />
                                    ))}
                                </svg>

                                {/* X-axis labels */}
                                <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-600">
                                    {last7Days.map((d, i) => (
                                        <span key={i}>{d.day}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex items-center justify-center gap-2 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-white" />
                                <span className="text-gray-400">Pomodoros</span>
                            </div>
                        </div>
                    </div>

                    {/* Daily Activity Bar Chart */}
                    <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#333333] card-hover">
                        <h3 className="text-base font-bold text-white mb-6">Daily Activity</h3>
                        <div className="h-64 relative">
                            {/* Y-axis */}
                            <div className="absolute left-0 top-0 bottom-8 w-8 flex flex-col justify-between text-xs text-gray-600">
                                <span>4</span>
                                <span>3</span>
                                <span>2</span>
                                <span>1</span>
                                <span>0</span>
                            </div>

                            {/* Chart area */}
                            <div className="ml-10 h-full border-l border-b border-[#333333] relative">
                                {/* Grid lines */}
                                <div className="absolute inset-0 flex flex-col justify-between">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="border-t border-[#222222]" />
                                    ))}
                                </div>

                                {/* Bars */}
                                <div className="absolute inset-0 flex items-end justify-around px-4 pb-1">
                                    {last7Days.map((d, i) => {
                                        const height = (d.pomodoros / maxPomodoros) * 100;
                                        return (
                                            <div key={i} className="flex-1 flex items-end justify-center gap-1 group relative">
                                                <div
                                                    className="w-full max-w-[30px] bg-white rounded-t transition-all hover:bg-gray-200"
                                                    style={{ height: `${height}%` }}
                                                >
                                                    {d.pomodoros > 0 && (
                                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0A0A0A] px-2 py-1 rounded text-xs whitespace-nowrap border border-[#333333]">
                                                            <div className="text-white">Pomodoros: {d.pomodoros}</div>
                                                            <div className="text-gray-400">Water Glasses: 0</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* X-axis labels */}
                                <div className="absolute -bottom-6 left-0 right-0 flex justify-around text-xs text-gray-600 px-4">
                                    {last7Days.map((d, i) => (
                                        <span key={i}>{d.day}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex items-center justify-center gap-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-white" />
                                <span className="text-gray-400">Pomodoros</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-gray-500" />
                                <span className="text-gray-500">Water Glasses</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Summary (Full Width now) */}

                    {/* Summary */}
                    <div className="bg-[#1A1A1A] rounded-xl p-6 border border-[#333333] card-hover">
                        <h3 className="text-base font-bold text-white mb-6">Summary</h3>
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Longest Focus Streak</span>
                                <span className="text-white font-bold text-lg">{stats.longestStreak} days</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Best Focus Day</span>
                                <span className="text-white font-bold text-lg">{stats.bestDay} sessions</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Hydration Consistency</span>
                                <span className="text-white font-bold text-lg">{stats.hydrationConsistency}%</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Total Focus Hours</span>
                                <span className="text-white font-bold text-lg">{stats.totalHours}h {stats.remainingMinutes}m</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Achievements Unlocked</span>
                                <span className="text-white font-bold text-lg">{stats.unlockedAchievements} / {stats.totalAchievements}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add animation keyframes */}
            <style>{`
        @keyframes spin-slow {
          from {
            transform: rotate(-90deg);
          }
          to {
            transform: rotate(270deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 1s ease-out;
        }
      `}</style>
        </div>
    );
};

export default Analytics;
