import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Clock, Calendar as CalendarIcon, Layout, Layers, Brain, Lightbulb,
  Menu, Bell, X, Droplets, CheckSquare, Plus, User
} from 'lucide-react';
import confetti from 'canvas-confetti';

import Timer from './components/Dashboard';
import BrainDump from './components/BrainDump';
import IdeaVault from './components/IdeaVault';
import DailyStack from './components/DailyStack';
import KanbanBoard from './components/KanbanBoard';
import CalendarView, { TaskModal } from './components/CalendarView';
import Checklist from './components/Checklist';
import Profile from './components/Profile';
import { Toast, InputWithVoice } from './components/Shared';
import { AudioEngine, sendNotification } from './utils/helpers';

// Configure Axios - use environment variable for API URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- Mobile Nav ---
const MobileNav = ({ activeTab, setActiveTab }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#151621] border-t border-slate-800 p-2 flex overflow-x-auto no-scrollbar gap-2 z-50 md:hidden">
      {[
        { id: 'dashboard', icon: Clock, label: 'Focus' },
        { id: 'calendar', icon: CalendarIcon, label: 'Plan' },
        { id: 'kanban', icon: Layout, label: 'Board' },
        { id: 'stack', icon: Layers, label: 'Stack' },
        { id: 'dump', icon: Brain, label: 'Clear' },
        { id: 'ideas', icon: Lightbulb, label: 'Ideas' },
        { id: 'checklist', icon: CheckSquare, label: 'Tasks' },
        { id: 'profile', icon: User, label: 'Me' },
      ].map(item => (
        <button key={item.id} onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all min-w-[60px] shrink-0 ${activeTab === item.id ? 'text-indigo-400' : 'text-slate-500'}`}
        >
          <item.icon size={20} className={`mb-1 ${activeTab === item.id ? 'fill-indigo-500/10' : ''}`} />
          <span className="text-[9px] font-bold tracking-wider uppercase whitespace-nowrap">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

const WidgetsContent = ({ hydration, onDrink, quickTask, setQuickTask, addTask, tasks }) => (
  <>
    <div className="bg-gradient-to-br from-cyan-900 to-blue-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group border border-blue-800/50">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <Droplets size={80} className="absolute -top-2 -right-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:rotate-12" />
      <h3 className="font-bold text-lg mb-1 relative z-10 flex items-center gap-2">Hydration</h3>
      <div className="flex items-end gap-2 mb-4 relative z-10">
        <span className="text-4xl font-bold font-mono">{hydration.count}</span>
        <span className="opacity-60 text-xs font-bold uppercase tracking-wider mb-1">/ {hydration.target} cups</span>
      </div>
      <button onClick={onDrink} className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold py-2 rounded-lg relative z-10 flex items-center justify-center gap-2 text-sm uppercase tracking-wider transition-all">
        <Plus size={16} /> Drink Water
      </button>
    </div>

    <div className="bg-[#151621] rounded-2xl p-6 shadow-lg border border-slate-800 flex-1 flex flex-col">
      <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
        <CheckSquare size={18} className="text-emerald-500" /> Quick Add Task
      </h3>
      <div className="mb-4">
        <InputWithVoice
          value={quickTask}
          onChange={setQuickTask}
          onEnter={() => { if (quickTask) { addTask({ title: quickTask, status: 'todo' }); setQuickTask(""); } }}
          placeholder="Type & Enter..."
          className="bg-[#0B0C15] border-slate-700 text-sm"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar no-scrollbar space-y-2">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">My Queue</div>
        {tasks.filter(t => t.status === 'todo').slice(0, 8).map(task => (
          <div key={task._id} className="text-sm p-3 bg-[#0B0C15] rounded border border-slate-800 text-slate-400 truncate flex items-center gap-2 hover:border-indigo-500/50 transition-colors">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
            {task.title}
          </div>
        ))}
        {tasks.filter(t => t.status === 'todo').length === 0 && (
          <div className="text-center text-slate-600 text-xs py-8 italic">All caught up!</div>
        )}
      </div>
    </div>
  </>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [dumps, setDumps] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [pomodoroStats, setPomodoroStats] = useState(0);
  const [pomodoroHistory, setPomodoroHistory] = useState([]);
  const [hydration, setHydrationState] = useState({ count: 0, target: 8 });
  const [checklistItems, setChecklistItems] = useState([]);
  const [userProfile, setUserProfile] = useState({});
  const [toast, setToast] = useState(null);
  const [quickTask, setQuickTask] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [showMobileWidgets, setShowMobileWidgets] = useState(false);

  // Refresh Checklist on tab switch (triggers auto-cleanup of old items)
  useEffect(() => {
    if (activeTab === 'checklist') {
      axios.get('/checklist').then(res => setChecklistItems(res.data)).catch(console.error);
    }
  }, [activeTab]);

  // --- Initial Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, logsRes, dumpsRes, ideasRes, statsRes, checkRes, profileRes] = await Promise.all([
          axios.get('/tasks'),
          axios.get('/logs'),
          axios.get('/dumps'),
          axios.get('/ideas'),
          axios.get('/stats'),
          axios.get('/checklist'),
          axios.get('/profile')
        ]);
        setTasks(tasksRes.data);
        setLogs(logsRes.data);
        setDumps(dumpsRes.data);
        setIdeas(ideasRes.data);
        setChecklistItems(checkRes.data);
        setUserProfile(profileRes.data);
        if (statsRes.data) {
          setHydrationState({ count: statsRes.data.hydrationCount, target: statsRes.data.hydrationTarget });
          setPomodoroStats(statsRes.data.pomodoros);
          setPomodoroHistory(statsRes.data.pomodoroHistory || []);
        }
      } catch (err) {
        console.error("Error fetching data", err);
        setToast({ message: "Failed to load data from server" });
      }
    };
    fetchData();
    document.documentElement.classList.add('dark');

    // Periodic sync with backend (every 30 seconds)
    // This ensures UI reflects manual database changes
    const syncInterval = setInterval(async () => {
      try {
        const statsRes = await axios.get('/stats');
        if (statsRes.data) {
          setHydrationState({ count: statsRes.data.hydrationCount, target: statsRes.data.hydrationTarget });
          setPomodoroStats(statsRes.data.pomodoros);
          setPomodoroHistory(statsRes.data.pomodoroHistory || []);
        }
      } catch (err) {
        console.error("Error syncing stats", err);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(syncInterval);
  }, []);

  // --- CRUD Operations Wrapper ---

  // Hydration & Stats Sync
  const drinkWater = async () => {
    // Don't allow clicking if already at target
    if (hydration.count >= hydration.target) {
      setToast({ message: "🎯 Daily goal already reached!" });
      return;
    }

    try {
      const res = await axios.post('/stats/water');
      const newCount = res.data.hydrationCount;
      const target = res.data.hydrationTarget;
      const oldCount = hydration.count;

      // Always sync with backend response
      setHydrationState({ count: newCount, target: target });

      // Trigger confetti when hitting the target (first time)
      if (newCount === target && oldCount < target) {
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'],
            zIndex: 10000
          });
          setToast({ message: "🎉 Hydration Goal Reached! Great job!" });
        }, 0);
      }
    } catch (e) {
      console.error('💥 Error in drinkWater:', e);
      // Optimistic update with limit
      setHydrationState(prev => {
        const next = Math.min(prev.count + 1, prev.target);
        if (next === prev.target && prev.count < prev.target) {
          setTimeout(() => {
            confetti({
              particleCount: 150,
              spread: 90,
              origin: { y: 0.6 },
              colors: ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'],
              zIndex: 10000
            });
          }, 0);
        }
        return { ...prev, count: next };
      });
    }
  };

  const incrementPomodoro = async () => {
    try {
      const res = await axios.post('/stats/pomodoro');
      setPomodoroStats(res.data.pomodoros);
      setPomodoroHistory(res.data.pomodoroHistory || []);
    } catch (e) {
      console.error(e);
      // Fallback local update if offline
      setPomodoroStats(p => p + 1);
    }
  }

  // Tasks
  const addTask = async (t) => {
    try {
      const res = await axios.post('/tasks', t);
      setTasks([...tasks, res.data]);
    } catch (e) { console.error(e); }
  };

  const updateStatus = async (id, s) => {
    try {
      setTasks(tasks.map(t => t._id === id ? { ...t, status: s } : t)); // Optimistic UI
      await axios.put(`/tasks/${id}`, { status: s });
    } catch (e) { console.error(e); }
  };

  const deleteTask = async (id) => {
    try {
      setTasks(tasks.filter(t => t._id !== id));
      await axios.delete(`/tasks/${id}`);
    } catch (e) { console.error(e); }
  };

  const updateTaskTime = async (id, dateStr, timeStr) => {
    const newDate = `${dateStr}T00:00:00.000Z`;
    try {
      setTasks(tasks.map(t => t._id === id ? { ...t, date: newDate, time: timeStr, notified: false } : t));
      await axios.put(`/tasks/${id}`, { date: newDate, time: timeStr, notified: false });
    } catch (e) { console.error(e); }
  };

  const updateTaskDate = async (id, dateStr) => {
    const newDate = `${dateStr}T00:00:00.000Z`;
    try {
      setTasks(tasks.map(t => t._id === id ? { ...t, date: newDate } : t));
      await axios.put(`/tasks/${id}`, { date: newDate });
    } catch (e) { console.error(e); }
  };

  const updateTaskDetails = async (id, updates) => {
    try {
      setTasks(tasks.map(t => t._id === id ? { ...t, ...updates } : t));
      setEditingTask(null);
      await axios.put(`/tasks/${id}`, updates);
    } catch (e) { console.error(e); }
  };

  // Logs
  const addLog = async (log) => {
    try {
      const res = await axios.post('/logs', log);
      setLogs([res.data, ...logs]);
    } catch (e) { console.error(e); }
  };

  // Dumps
  const addDump = async (dump) => {
    try {
      const res = await axios.post('/dumps', dump);
      setDumps([...dumps, res.data]);
    } catch (e) { console.error(e); }
  };

  const deleteDump = async (id) => {
    try {
      setDumps(dumps.filter(d => d._id !== id));
      await axios.delete(`/dumps/${id}`);
    } catch (e) { console.error(e); }
  };

  // Ideas
  const addIdea = async (idea) => {
    try {
      const res = await axios.post('/ideas', idea);
      setIdeas([...ideas, res.data]);
    } catch (e) { console.error(e); }
  };

  const deleteIdea = async (id) => {
    try {
      setIdeas(ideas.filter(i => i._id !== id));
      await axios.delete(`/ideas/${id}`);
    } catch (e) { console.error(e); }
  };

  // Checklist
  const addChecklistItem = async (text) => {
    try {
      const res = await axios.post('/checklist', { text });
      setChecklistItems([res.data, ...checklistItems]);
    } catch (e) { console.error(e); }
  };

  const toggleChecklistItem = async (id, isCompleted) => {
    try {
      // Optimistic
      setChecklistItems(items => items.map(i => i._id === id ? { ...i, isCompleted, completedAt: isCompleted ? new Date() : null } : i));
      const res = await axios.put(`/checklist/${id}`, { isCompleted });
      // Update with server response to ensure consistency
      setChecklistItems(items => items.map(i => i._id === id ? res.data : i));
    } catch (e) { console.error(e); }
  };

  const deleteChecklistItem = async (id) => {
    try {
      setChecklistItems(items => items.filter(i => i._id !== id));
      await axios.delete(`/checklist/${id}`);
    } catch (e) { console.error(e); }
  };

  // Profile
  const updateProfile = async (data) => {
    try {
      const res = await axios.put('/profile', data);
      setUserProfile(res.data);
      // Also update hydration target if changed
      if (data.dailyPomodoroGoal) {
        // You might want to sync this to Stats too? 
        // For now, dashboard just reads it from userProfile
      }
      setToast({ message: "Profile updated successfully" });
    } catch (e) { console.error(e); }
  };

  const exportData = async () => {
    try {
      const res = await axios.get('/export');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `zenfocus_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      setToast({ message: "Data exported successfully" });
    } catch (e) {
      console.error(e);
      setToast({ message: "Export failed" });
    }
  };

  // Notifications
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      setTasks(prevTasks => {
        let hasChanges = false;
        const nextTasks = prevTasks.map(task => {
          if (task.date && task.time && !task.notified) {
            const taskDate = new Date(task.date);
            const [hours, mins] = task.time.split(':');
            const alertTime = new Date(taskDate);
            alertTime.setHours(parseInt(hours), parseInt(mins), 0, 0);
            const diff = now.getTime() - alertTime.getTime();
            if (diff >= 0 && diff < 60000) {
              sendNotification("Task Reminder", task.title);
              setToast({ message: `Reminder: ${task.title}` });
              hasChanges = true;
              // Ideally update backend here too, but for perf we might skip aggressive sync for just notification flag
              return { ...task, notified: true };
            }
          }
          return task;
        });
        return hasChanges ? nextTasks : prevTasks;
      });
    };
    const interval = setInterval(checkReminders, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-[100dvh] font-sans bg-[#0B0C15] text-slate-200 selection:bg-indigo-500/30 overflow-hidden">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .dragging-ghost { pointer-events: none; z-index: 9999; opacity: 0.8; transform: scale(1.05); }
        @keyframes shimmer { 
          from { transform: translateX(-150%) skewX(12deg); } 
          to { transform: translateX(150%) skewX(12deg); } 
        }
        .dashed-border { border-style: dashed; }
      `}</style>

      {toast && <Toast message={toast.message} onClose={() => setToast(null)} />}

      {/* Nav Sidebar (Desktop) */}
      <nav className="w-20 bg-[#151621] border-r border-slate-800 hidden md:flex flex-col items-center py-8 gap-8 shadow-2xl z-20">
        <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
          <Clock size={24} fill="currentColor" />
        </div>
        <div className="flex flex-col gap-6 w-full px-2">
          {[
            { id: 'dashboard', icon: Clock, label: 'Focus' },
            { id: 'calendar', icon: CalendarIcon, label: 'Plan' },
            { id: 'kanban', icon: Layout, label: 'Board' },
            { id: 'stack', icon: Layers, label: 'Stack' },
            { id: 'dump', icon: Brain, label: 'Clear' },
            { id: 'ideas', icon: Lightbulb, label: 'Ideas' },
            { id: 'checklist', icon: CheckSquare, label: 'Tasks' },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 group ${activeTab === item.id ? 'bg-[#0B0C15] text-indigo-400 border border-slate-800 shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}>
              <item.icon size={22} className={`mb-1 group-hover:scale-110 transition-transform ${activeTab === item.id ? 'fill-indigo-500/10' : ''}`} />
              <span className="text-[9px] font-bold tracking-wider uppercase">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-auto mb-4">
          <button onClick={() => setActiveTab('profile')} className={`h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md border-2 ${activeTab === 'profile' ? 'border-emerald-400 ring-2 ring-emerald-500/50' : 'border-[#0B0C15]'}`}>
            {userProfile.name ? userProfile.name.charAt(0) : 'U'}
          </button>
        </div>
      </nav>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 p-4 md:p-8 overflow-hidden flex flex-col relative z-10">
          <header className="mb-4 md:mb-6 flex justify-between items-end">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white capitalize tracking-tight flex items-center gap-3">
                {activeTab} <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
              </h1>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowMobileWidgets(!showMobileWidgets)} className="p-2 text-slate-500 hover:text-indigo-400 transition-colors md:hidden">
                <Menu size={20} />
              </button>
              <button onClick={() => { Notification.requestPermission(); AudioEngine.init(); }} className="p-2 text-slate-500 hover:text-indigo-400 transition-colors">
                <Bell size={20} />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-hidden relative">
            {activeTab === 'dashboard' && (
              <div className="h-full flex flex-col animate-in fade-in duration-500 overflow-y-auto custom-scrollbar no-scrollbar">
                <div className="w-full max-w-5xl mx-auto">
                  <Timer
                    onNotify={(t, b) => { sendNotification(t, b); setToast({ message: b }); }}
                    onSessionComplete={incrementPomodoro}
                    pomodoroStats={pomodoroStats}
                    pomodoroHistory={pomodoroHistory}
                    dailyGoal={userProfile.dailyGoal}
                    tasks={tasks} // Kanban tasks
                    checklistItems={checklistItems} // Quick tasks
                  />
                </div>
              </div>
            )}

            {activeTab === 'calendar' && (
              <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CalendarView
                  tasks={tasks}
                  addTask={addTask}
                  updateTaskTime={updateTaskTime}
                  updateTaskDate={updateTaskDate}
                  onEditTask={setEditingTask}
                  deleteTask={deleteTask}
                />
              </div>
            )}

            {activeTab === 'kanban' && (
              <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <KanbanBoard tasks={tasks} updateTaskStatus={updateStatus} deleteTask={deleteTask} />
              </div>
            )}

            {activeTab === 'stack' && (
              <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <DailyStack logs={logs} addLog={addLog} />
              </div>
            )}

            {activeTab === 'dump' && (
              <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <BrainDump dumps={dumps} addDump={addDump} deleteDump={deleteDump} />
              </div>
            )}

            {activeTab === 'ideas' && (
              <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <IdeaVault ideas={ideas} addIdea={addIdea} deleteIdea={deleteIdea} />
              </div>
            )}

            {activeTab === 'checklist' && (
              <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Checklist
                  items={checklistItems}
                  onAdd={addChecklistItem}
                  onToggle={toggleChecklistItem}
                  onDelete={deleteChecklistItem}
                />
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Profile
                  profile={userProfile}
                  onUpdateProfile={updateProfile}
                  onExportData={exportData}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar (Desktop) */}
        <aside className="w-80 bg-[#151621] border-l border-slate-800 p-6 hidden xl:flex flex-col gap-6 z-20 shadow-2xl">
          <WidgetsContent hydration={hydration} onDrink={drinkWater} quickTask={quickTask} setQuickTask={setQuickTask} addTask={addTask} tasks={tasks} />
        </aside>

        {/* Mobile Widgets Drawer */}
        {showMobileWidgets && (
          <div className="fixed inset-0 z-50 xl:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileWidgets(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#151621] border-l border-slate-800 p-6 flex flex-col gap-6 animate-in slide-in-from-right duration-300">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-white">Tools</h3>
                <button onClick={() => setShowMobileWidgets(false)}><X size={20} className="text-slate-500" /></button>
              </div>
              <WidgetsContent hydration={hydration} onDrink={drinkWater} quickTask={quickTask} setQuickTask={setQuickTask} addTask={addTask} tasks={tasks} />
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingTask && (
          <TaskModal
            date={new Date(editingTask.date)}
            taskToEdit={editingTask}
            onClose={() => setEditingTask(null)}
            onUpdate={updateTaskDetails}
            onDelete={deleteTask}
            onAdd={addTask}
          />
        )}
      </main>
    </div>
  );
};

export default App;