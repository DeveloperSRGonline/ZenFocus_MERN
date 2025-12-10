import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Activity, Settings, X, Coffee, Brain, Zap } from 'lucide-react';
import { AudioEngine, formatTime } from '../utils/helpers';

const Timer = ({ onNotify, onSessionComplete, pomodoroStats, pomodoroHistory = [], dailyGoal, tasks = [], checklistItems = [] }) => {
  const [mode, setMode] = useState('work');
  const [durations, setDurations] = useState({ work: 25, shortBreak: 5, longBreak: 15 });
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempDurations, setTempDurations] = useState({ work: 25, shortBreak: 5, longBreak: 15 });

  // Derived Stats
  const { weeklyData, todayCount } = React.useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = days[d.getDay()];

      const entry = pomodoroHistory.find(h => h.date === dateStr);
      const count = entry ? entry.count : 0;
      data.push({ label: dayLabel, count });
    }

    const maxCount = Math.max(...data.map(d => d.count), 8); // Scale based on max, min 8
    const processedData = data.map(d => ({ ...d, height: (d.count / maxCount) * 100 }));

    const todayEntry = pomodoroHistory.find(h => h.date === todayStr);
    return { weeklyData: processedData, todayCount: todayEntry ? todayEntry.count : 0 };
  }, [pomodoroHistory]);

  // Calculate Task Stats (Kanban + Checklist)
  const taskStats = React.useMemo(() => {
    const kanbanDone = tasks.filter(t => t.status === 'done').length;
    const kanbanTodo = tasks.length - kanbanDone;

    // Checklist: completed vs others
    const checkDone = checklistItems.filter(i => i.isCompleted).length;
    const checkTodo = checklistItems.length - checkDone;

    const totalDone = kanbanDone + checkDone;
    const totalTodo = kanbanTodo + checkTodo;
    const total = totalDone + totalTodo;
    const percent = total > 0 ? Math.round((totalDone / total) * 100) : 0;

    return { totalDone, totalTodo, total, percent };
  }, [tasks, checklistItems]);

  // Pie Chart Component
  const PieChart = ({ percent }) => (
    <div className="relative h-28 w-28 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0"
      style={{ background: `conic-gradient(#10b981 ${percent}%, #1e293b ${percent}% 100%)` }}>
      <div className="absolute inset-2 bg-[#151621] rounded-full flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-white">{percent}%</span>
        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Done</span>
      </div>
    </div>
  );

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      const title = mode === 'work' ? "Focus Session Complete" : "Break Over";
      const body = mode === 'work' ? "Great job! Take a break." : "Time to focus again.";
      onNotify(title, body);
      if (mode === 'work') onSessionComplete();
      AudioEngine.toggleNoise(false);
      setIsSoundOn(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, onNotify, onSessionComplete]);

  const toggleNoise = () => {
    setIsSoundOn(!isSoundOn);
    AudioEngine.toggleNoise(!isSoundOn);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(durations[newMode] * 60);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const newDurations = { ...tempDurations };
    setDurations(newDurations);
    if (!isActive) {
      setTimeLeft(newDurations[mode] * 60);
    }
    setShowSettings(false);
  };

  const modeConfig = {
    work: { label: 'Focus', color: 'text-indigo-400', bg: 'from-indigo-600 to-purple-700', icon: Brain },
    shortBreak: { label: 'Short Break', color: 'text-emerald-400', bg: 'from-emerald-500 to-teal-600', icon: Coffee },
    longBreak: { label: 'Long Break', color: 'text-sky-400', bg: 'from-sky-500 to-blue-600', icon: Zap },
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-20 md:pb-0">
      <div className="text-center mb-6 animate-in slide-in-from-top-10 duration-700">
        <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 mb-4 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
          "Main apne past ka gulaam nahi hoon."
        </h1>
        <p className="text-slate-400 text-sm md:text-base tracking-wide font-medium">
          Stop thinking. Start stacking actions. <span className="text-indigo-400">Action kills fear.</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col items-center justify-between p-6 md:p-8 space-y-8 bg-[#151621] rounded-2xl shadow-xl border border-slate-800/50 relative overflow-hidden min-h-[400px]">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          {/* Header Actions */}
          <div className="w-full flex justify-between items-center relative z-10">
            <div className="flex gap-2 p-1 bg-[#0B0C15] rounded-xl border border-slate-800">
              {Object.keys(modeConfig).map((m) => {
                const Icon = modeConfig[m].icon;
                return (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${mode === m ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <Icon size={14} />
                    <span className="hidden md:inline">{modeConfig[m].label}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => { setTempDurations(durations); setShowSettings(true); }}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>

          {/* Timer Display */}
          <div className="text-center relative py-4 flex-1 flex flex-col justify-center items-center">
            <div className={`absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full ${isActive ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}></div>
            <div className={`text-7xl md:text-9xl font-bold font-mono tracking-tighter relative z-10 ${modeConfig[mode].color} transition-colors duration-500`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-slate-500 font-bold uppercase tracking-[0.2em] mt-4 text-xs">
              {isActive ? `${modeConfig[mode].label} in progress` : 'Ready to Start'}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 z-10">
            <button
              onClick={toggleNoise}
              className={`p-4 rounded-full transition-all ${isSoundOn ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50' : 'bg-[#0B0C15] text-slate-500 hover:text-white border border-slate-800'}`}
            >
              {isSoundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>

            <button
              onClick={() => {
                if (!isActive && Notification.permission === 'default') {
                  Notification.requestPermission();
                }
                setIsActive(!isActive);
              }}
              className={`p-6 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 ${isActive ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/50' : `bg-gradient-to-br ${modeConfig[mode].bg} text-white hover:shadow-lg hover:shadow-indigo-500/25`}`}
            >
              {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
            </button>

            <button
              onClick={() => { setIsActive(false); AudioEngine.toggleNoise(false); setIsSoundOn(false); setTimeLeft(durations[mode] * 60); }}
              className="p-4 rounded-full bg-[#0B0C15] text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 transition-all"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          {/* Settings Modal */}
          {showSettings && (
            <div className="absolute inset-0 z-50 bg-[#151621]/95 backdrop-blur-sm flex flex-col p-6 animate-in fade-in duration-200 overflow-hidden">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Settings size={18} className="text-indigo-400" /> Timer Settings
                </h3>
                <div className="flex gap-2">
                  {Notification.permission !== 'granted' && (
                    <button onClick={() => Notification.requestPermission()} className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded hover:bg-indigo-500/30 transition-colors">
                      Enable Notifications
                    </button>
                  )}
                  <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6 flex-1 flex flex-col min-h-0">
                <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Focus Duration (min)</label>
                    <input
                      type="number"
                      value={tempDurations.work}
                      onChange={e => setTempDurations({ ...tempDurations, work: Math.max(1, parseInt(e.target.value) || 0) })}
                      className="w-full bg-[#0B0C15] border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Short Break (min)</label>
                    <input
                      type="number"
                      value={tempDurations.shortBreak}
                      onChange={e => setTempDurations({ ...tempDurations, shortBreak: Math.max(1, parseInt(e.target.value) || 0) })}
                      className="w-full bg-[#0B0C15] border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Long Break (min)</label>
                    <input
                      type="number"
                      value={tempDurations.longBreak}
                      onChange={e => setTempDurations({ ...tempDurations, longBreak: Math.max(1, parseInt(e.target.value) || 0) })}
                      className="w-full bg-[#0B0C15] border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 shrink-0">
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="bg-[#151621] rounded-2xl p-6 md:p-8 shadow-xl border border-slate-800/50 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
          <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
            <Activity className="text-emerald-400" /> Activity
          </h3>

          <div className="space-y-6 flex-1 flex flex-col">
            {/* Task Pie Chart Section */}
            <div className="flex items-center justify-around gap-4 bg-[#0B0C15] p-4 rounded-xl border border-slate-800/50">
              <PieChart percent={taskStats.percent} />
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  <div>
                    <div className="text-xl font-bold text-white leading-none">{taskStats.totalDone}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Completed</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-slate-600"></div>
                  <div>
                    <div className="text-xl font-bold text-slate-400 leading-none">{taskStats.totalTodo}</div>
                    <div className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">Remaining</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Focus Graph - Simplified Vertical Bar Chart */}
            <div className="flex-1 flex flex-col justify-end min-h-[120px]">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
                <Activity size={12} /> Weekly Focus
              </div>
              <div className="flex items-end justify-between h-full gap-2 border-b border-slate-800 pb-2">
                {weeklyData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end gap-1 h-full group relative cursor-pointer">
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none border border-slate-700">
                      {d.count}
                    </div>
                    <div
                      style={{ height: `${d.height}%` }}
                      className={`w-full rounded-t-sm transition-all duration-500 ${d.label === ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()] ? 'bg-gradient-to-t from-indigo-500 to-purple-500' : 'bg-slate-700 group-hover:bg-slate-600'}`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[8px] text-slate-600 mt-1 font-mono uppercase">
                {weeklyData.map((d, i) => <span key={i} className="flex-1 text-center">{d.label}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timer;