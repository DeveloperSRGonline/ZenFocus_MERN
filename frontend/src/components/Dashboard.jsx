import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Activity } from 'lucide-react';
import { AudioEngine, formatTime, parseTime } from '../utils/helpers';

const Timer = ({ onNotify, onSessionComplete, pomodoroStats }) => {
  const [mode, setMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [timeInput, setTimeInput] = useState("");

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      onNotify("Timer Finished", "Your session is complete.");
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

  const handleSetTime = (e) => {
    e.preventDefault();
    if (!timeInput) return;
    const isTimeFormat = /[:]|[ap]m/i.test(timeInput);
    if (isTimeFormat) {
      const parsed = parseTime(timeInput);
      if (!parsed) return alert("Invalid time format");
      const now = new Date();
      const targetDate = new Date();
      targetDate.setHours(parsed.h, parsed.m, 0, 0);
      let diffSeconds = Math.floor((targetDate - now) / 1000);
      if (diffSeconds <= 0) return alert("That time has already passed!");
      setTimeLeft(diffSeconds);
      setIsActive(false);
    } else {
      const mins = parseInt(timeInput);
      if (!isNaN(mins) && mins > 0) {
        setTimeLeft(mins * 60);
        setIsActive(false);
      }
    }
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
        <div className="flex flex-col items-center justify-center p-6 md:p-8 space-y-8 bg-[#151621] rounded-2xl shadow-xl border border-slate-800/50 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <form onSubmit={handleSetTime} className="w-full max-w-xs relative z-20">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                placeholder="25 min or 5:00 PM"
                className="flex-1 bg-[#0B0C15] border border-slate-700 rounded-lg px-4 py-2 text-center text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition-all text-base"
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors">Set</button>
            </div>
          </form>

          <div className="text-center relative py-4">
            <div className={`absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full ${isActive ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}></div>
            <div className={`text-7xl md:text-9xl font-bold font-mono tracking-tighter relative z-10 ${mode === 'work' ? 'text-indigo-400' : 'text-emerald-400'}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-slate-500 font-bold uppercase tracking-[0.2em] mt-4 text-xs">
              {isActive ? 'Focus Mode Active' : 'Ready to Start'}
            </div>
          </div>

          <div className="flex items-center space-x-6 z-10">
            <button
              onClick={() => setIsActive(!isActive)}
              className={`p-6 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 ${isActive ? 'bg-amber-500/20 text-amber-400 ring-2 ring-amber-500/50' : 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white hover:shadow-indigo-500/50'}`}
            >
              {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
            </button>
            <button
              onClick={() => { setIsActive(false); AudioEngine.toggleNoise(false); setIsSoundOn(false); }}
              className="p-6 rounded-full bg-[#0B0C15] text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 transition-all"
            >
              <RotateCcw size={32} />
            </button>
          </div>
          
          <button 
            onClick={toggleNoise}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors z-10 ${isSoundOn ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/50' : 'bg-[#0B0C15] text-slate-500'}`}
          >
            {isSoundOn ? <Volume2 size={14}/> : <VolumeX size={14}/>}
            {isSoundOn ? 'Noise On' : 'Noise Off'}
          </button>
        </div>

        <div className="bg-[#151621] rounded-2xl p-6 md:p-8 shadow-xl border border-slate-800/50 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
          <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
            <Activity className="text-emerald-400"/> Activity
          </h3>
          
          <div className="space-y-6 flex-1">
              <div>
                <div className="flex justify-between text-sm mb-2 text-slate-400 font-medium"><span>Pomodoros Today</span> <span>{pomodoroStats}</span></div>
                <div className="h-3 bg-[#0B0C15] rounded-full overflow-hidden">
                  <div style={{width: `${Math.min(pomodoroStats * 10, 100)}%`}} className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"></div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-end mt-4">
                 <div className="flex items-end justify-between h-32 gap-2 border-b border-slate-800 pb-2">
                   {[40, 65, 30, 85, 50, 90, 70].map((h, i) => (
                     <div key={i} className="w-full bg-[#0B0C15] rounded-t-sm relative group cursor-pointer hover:bg-[#1a1c2e] transition-colors">
                       <div 
                         style={{height: `${h}%`}} 
                         className="absolute bottom-0 w-full bg-indigo-600/50 group-hover:bg-indigo-500 rounded-t-sm transition-all"
                       ></div>
                     </div>
                   ))}
                 </div>
                 <div className="flex justify-between text-[10px] text-slate-600 mt-2 font-mono uppercase">
                   <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                 </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timer;