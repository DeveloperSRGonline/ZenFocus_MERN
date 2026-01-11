import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Clock, Calendar as CalendarIcon, Layout, Layers, Brain, Lightbulb,
  Bell, Droplets, CheckSquare, User, LogOut, Loader, Settings as SettingsIcon, Trophy, TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GoogleOAuthProvider } from '@react-oauth/google';

import Timer from './components/Dashboard';
import BrainDump from './components/BrainDump';
import IdeaVault from './components/IdeaVault';
import DailyStack from './components/DailyStack';
import KanbanBoard from './components/KanbanBoard';
import CalendarView, { TaskModal } from './components/CalendarView';
import Checklist from './components/Checklist';
import Profile from './components/Profile';
import Health from './components/Health';
import Settings from './components/Settings';
import Achievements from './components/Achievements';
import Analytics from './components/Analytics';
import Login from './components/Login';
import Register from './components/Register';
import { Toast } from './components/Shared';
import { AudioEngine, sendNotification } from './utils/helpers';
import { AuthProvider, useAuth } from './context/AuthContext';
import { syncManager } from './utils/syncManager';

// Configure Axios - use environment variable for API URL
// Updated: Removed right sidebar and filtered tasks for today only
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- Mobile Nav ---
const MobileNav = ({ activeTab, setActiveTab, logout }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-[#333333] p-2 flex overflow-x-auto no-scrollbar gap-2 z-50 md:hidden shadow-lg">
      {[
        { id: 'dashboard', icon: Clock, label: 'Focus' },
        { id: 'calendar', icon: CalendarIcon, label: 'Plan' },
        { id: 'kanban', icon: Layout, label: 'Board' },
        { id: 'stack', icon: Layers, label: 'Stack' },
        { id: 'dump', icon: Brain, label: 'Clear' },
        { id: 'ideas', icon: Lightbulb, label: 'Ideas' },
        { id: 'checklist', icon: CheckSquare, label: 'Tasks' },
        { id: 'health', icon: Droplets, label: 'Health' },
        { id: 'analytics', icon: TrendingUp, label: 'Stats' },
        { id: 'achievements', icon: Trophy, label: 'Awards' },
        { id: 'settings', icon: SettingsIcon, label: 'Settings' },
        { id: 'profile', icon: User, label: 'Me' },
      ].map(item => (
        <button key={item.id} onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all min-w-[60px] shrink-0 ${activeTab === item.id ? 'text-white bg-white/10' : 'text-gray-500 hover:text-white'}`}
        >
          <item.icon size={20} className={`mb-1 ${activeTab === item.id ? 'fill-indigo-500/10' : ''}`} />
          <span className="text-[9px] font-bold tracking-wider uppercase whitespace-nowrap">{item.label}</span>
        </button>
      ))}
      <button onClick={logout} className="flex flex-col items-center justify-center p-2 rounded-lg transition-all min-w-[60px] shrink-0 text-red-500 hover:text-red-400">
        <LogOut size={20} className="mb-1" />
        <span className="text-[9px] font-bold tracking-wider uppercase whitespace-nowrap">Logout</span>
      </button>
    </div>
  );
};

const AuthenticatedApp = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [dumps, setDumps] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [pomodoroStats, setPomodoroStats] = useState(0);
  const [pomodoroHistory, setPomodoroHistory] = useState([]);
  const [hydrationHistory, setHydrationHistory] = useState([]);
  const [hydration, setHydrationState] = useState({ count: 0, target: 8 });
  const [checklistItems, setChecklistItems] = useState([]);
  const [userProfile, setUserProfile] = useState({});
  const [toast, setToast] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  // Settings state
  const [timerDurations, setTimerDurations] = useState({ work: 25, shortBreak: 5, longBreak: 15 });
  const [notificationsEnabled, setNotificationsEnabled] = useState(Notification.permission === 'granted');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);

  // Achievements state
  const [achievements, setAchievements] = useState([]);

  // Helper to check if a date is today
  const isToday = (dateString) => {
    if (!dateString) return true; // If no date set, assume it's for today
    const taskDate = new Date(dateString);
    const today = new Date();
    return taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear();
  };

  // Filter tasks to show only today's tasks
  const todayTasks = tasks.filter(t => isToday(t.date));
  const todayLogs = logs.filter(l => isToday(l.date));
  const todayDumps = dumps.filter(d => isToday(d.date));
  const todayIdeas = ideas.filter(i => isToday(i.date));
  const todayChecklistItems = checklistItems.filter(i => isToday(i.date || i.createdAt));

  // Refresh Checklist on tab switch (triggers auto-cleanup of old items)
  useEffect(() => {
    if (activeTab === 'checklist') {
      axios.get('/checklist').then(res => setChecklistItems(res.data)).catch(console.error);
    }
  }, [activeTab]);

  // --- Persistence Logic ---
  const saveStateToLocal = () => {
    const state = {
      tasks, logs, dumps, ideas,
      pomodoroStats, pomodoroHistory, hydrationHistory, hydration,
      checklistItems, userProfile, achievements,
      timerDurations, notificationsEnabled, soundEnabled, autoStartBreaks
    };
    localStorage.setItem('zenfocus_state', JSON.stringify(state));
  };

  useEffect(() => {
    const timer = setTimeout(saveStateToLocal, 1000); // Debounce save
    return () => clearTimeout(timer);
  }, [tasks, logs, dumps, ideas, pomodoroStats, pomodoroHistory, hydrationHistory, hydration, checklistItems, userProfile, achievements, timerDurations, notificationsEnabled, soundEnabled, autoStartBreaks]);

  // Sync Manager Init
  useEffect(() => {
    const handleOnline = () => {
      setToast({ message: "Online: Syncing data..." });
      syncManager.processQueue({
        addTask: (data) => axios.post('/tasks', data),
        updateTask: (id, updates) => axios.put(`/tasks/${id}`, updates),
        deleteTask: (id) => axios.delete(`/tasks/${id}`),
        updateProfile: (data) => axios.put('/profile', data),
        updateSettings: (data) => axios.put('/profile', { settings: data }),
        addLog: (data) => axios.post('/logs', data),
        addDump: (data) => axios.post('/dumps', data),
        addIdea: (data) => axios.post('/ideas', data),
        addChecklist: (data) => axios.post('/checklist', data)
      }).then(() => setToast({ message: "Sync Complete!" }));
    };
    window.addEventListener('online', handleOnline);
    // Try sync on mount if online
    if (navigator.onLine) handleOnline();
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  // --- Daily Refresh Logic ---
  const checkForNewDay = () => {
    const lastVisit = localStorage.getItem('zen_last_visit_date');
    const today = new Date().toLocaleDateString();

    if (lastVisit !== today) {
      console.log("New day! Resetting daily stats.");
      setHydrationState({ count: 0, target: 8 });
      setPomodoroStats(0);
      localStorage.setItem('zen_last_visit_date', today);
      setToast({ message: "☀️ Good morning! Daily stats refreshed." });
      return true;
    }
    return false;
  };

  // --- Initial Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      const isNewDay = checkForNewDay();

      // Load from LocalStorage first (Cache-first)
      const localState = JSON.parse(localStorage.getItem('zenfocus_state') || 'null');
      if (localState) {
        setTasks(localState.tasks || []);
        setLogs(localState.logs || []);
        setDumps(localState.dumps || []);
        setIdeas(localState.ideas || []);
        setPomodoroStats(localState.pomodoroStats || 0);
        setPomodoroHistory(localState.pomodoroHistory || []);
        setHydrationHistory(localState.hydrationHistory || []);
        setHydrationState(localState.hydration || { count: 0, target: 8 });
        setChecklistItems(localState.checklistItems || []);
        setUserProfile(localState.userProfile || {});
        setAchievements(localState.achievements || []);
        if (localState.timerDurations) setTimerDurations(localState.timerDurations);
        if (localState.notificationsEnabled !== undefined) setNotificationsEnabled(localState.notificationsEnabled);
        if (localState.soundEnabled !== undefined) setSoundEnabled(localState.soundEnabled);
        if (localState.autoStartBreaks !== undefined) setAutoStartBreaks(localState.autoStartBreaks);
      }

      try {
        const [tasksRes, logsRes, dumpsRes, ideasRes, statsRes, checkRes, profileRes, achievementsRes] = await Promise.all([
          axios.get('/tasks'),
          axios.get('/logs'),
          axios.get('/dumps'),
          axios.get('/ideas'),
          axios.get('/stats'),
          axios.get('/checklist'),
          axios.get('/profile'),
          axios.get('/achievements')
        ]);
        setTasks(tasksRes.data);
        setLogs(logsRes.data);
        setDumps(dumpsRes.data);
        setIdeas(ideasRes.data);
        setChecklistItems(checkRes.data);
        setUserProfile(profileRes.data);

        // Load Settings from Profile
        if (profileRes.data.settings) {
          const s = profileRes.data.settings;
          if (s.timerDurations) setTimerDurations(s.timerDurations);
          if (s.notificationsEnabled !== undefined) setNotificationsEnabled(s.notificationsEnabled);
          if (s.soundEnabled !== undefined) setSoundEnabled(s.soundEnabled);
          if (s.autoStartBreaks !== undefined) setAutoStartBreaks(s.autoStartBreaks);
        }

        setAchievements(achievementsRes.data);

        if (statsRes.data) {
          if (!isNewDay) {
            setHydrationState({ count: statsRes.data.hydrationCount, target: statsRes.data.hydrationTarget });
            setPomodoroStats(statsRes.data.pomodoros);
          }
          setPomodoroHistory(statsRes.data.pomodoroHistory || []);
          setHydrationHistory(statsRes.data.hydrationHistory || []);
        }

        // Check achievements on load
        axios.post('/achievements/check').then(res => {
          if (res.data.updates && res.data.updates.length > 0) {
            // Refresh achievements if any were unlocked
            axios.get('/achievements').then(achRes => setAchievements(achRes.data));
            res.data.updates.forEach(ach => {
              if (ach.isUnlocked && !achievements.find(a => a._id === ach._id && a.isUnlocked)) {
                confetti({
                  particleCount: 200,
                  spread: 100,
                  origin: { y: 0.6 },
                  colors: ['#f59e0b', '#eab308', '#fbbf24'],
                  zIndex: 10000
                });
                setToast({ message: `🏆 Achievement Unlocked: ${ach.title}!` });
              }
            });
          }
        }).catch(console.error);
      } catch (err) {
        console.error("Error fetching data, interacting offline", err);
        setToast({ message: "Offline Mode Active" });
      }
    };

    fetchData();
    document.documentElement.classList.add('dark');

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
    }, 30000);

    return () => clearInterval(syncInterval);
  }, []);

  // --- CRUD Operations Wrapper ---

  // Hydration & Stats Sync
  const drinkWater = async () => {
    if (hydration.count >= hydration.target) {
      setToast({ message: "🎯 Daily goal already reached!" });
      return;
    }

    try {
      const res = await axios.post('/stats/water');
      const newCount = res.data.hydrationCount;
      const target = res.data.hydrationTarget;
      const oldCount = hydration.count;

      setHydrationState({ count: newCount, target: target });

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
      // Check achievements
      setTimeout(() => checkAchievements(), 500);
    } catch (e) {
      console.error('💥 Error in drinkWater:', e);
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
      // Check achievements
      setTimeout(() => checkAchievements(), 500);
    } catch (e) {
      console.error(e);
      setPomodoroStats(p => p + 1);
    }
  }

  // Tasks
  // Tasks
  const addTask = async (t) => {
    // Optimistic / Offline ID
    const tempId = t._id || `temp_${Date.now()}`;
    const taskWithDate = { ...t, _id: tempId, date: t.date || new Date().toLocaleDateString('en-CA') };

    setTasks(prev => [...prev, taskWithDate]);

    try {
      // If we are online, clean the _id before sending if it's temp?
      // Actually backend ignores _id usually or we shouldn't send it if it's temp.
      // But we need to update the local task with real ID after.
      const { _id, ...toSend } = taskWithDate;
      const res = await axios.post('/tasks', toSend);

      // Replace temp ID with real ID
      setTasks(prev => prev.map(pt => pt._id === tempId ? res.data : pt));
    } catch (e) {
      console.error("Offline: Queuing addTask");
      syncManager.addToQueue({ type: 'ADD_TASK', payload: taskWithDate });
    }
  };

  const updateStatus = async (id, s) => {
    setTasks(prev => prev.map(t => t._id === id ? { ...t, status: s } : t));
    try {
      await axios.put(`/tasks/${id}`, { status: s });
    } catch (e) {
      console.error("Offline: Queuing updateTask");
      syncManager.addToQueue({ type: 'UPDATE_TASK', payload: { id, updates: { status: s } } });
    }
  };

  const deleteTask = async (id) => {
    setTasks(prev => prev.filter(t => t._id !== id));
    try {
      await axios.delete(`/tasks/${id}`);
    } catch (e) {
      console.error("Offline: Queuing deleteTask");
      syncManager.addToQueue({ type: 'DELETE_TASK', payload: { id } });
    }
  };

  const updateTaskTime = async (id, dateStr, timeStr, endTimeStr = null) => {
    const newDate = `${dateStr}T00:00:00.000Z`;
    try {
      const updates = { date: newDate, time: timeStr, notified: false };
      if (endTimeStr) updates.endTime = endTimeStr;

      setTasks(tasks.map(t => t._id === id ? { ...t, ...updates } : t));
      await axios.put(`/tasks/${id}`, updates);
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
    // Ideally we don't need optimistic update for logs as they are background?
    // But for "Stack" tab, we do.
    const tempDate = new Date().toISOString();
    const tempLog = { ...log, _id: `temp_${Date.now()}`, date: log.date || tempDate };
    setLogs(prev => [tempLog, ...prev]);

    try {
      const res = await axios.post('/logs', log);
      setLogs(prev => prev.map(l => l._id === tempLog._id ? res.data : l));
    } catch (e) {
      console.error("Offline: Queuing addLog");
      syncManager.addToQueue({ type: 'ADD_LOG', payload: log });
    }
  };

  // Dumps
  const addDump = async (dump) => {
    const tempDump = { ...dump, _id: `temp_${Date.now()}`, date: new Date().toISOString() };
    setDumps(prev => [...prev, tempDump]);

    try {
      const res = await axios.post('/dumps', dump);
      setDumps(prev => prev.map(d => d._id === tempDump._id ? res.data : d));
    } catch (e) {
      console.error("Offline: Queuing addDump");
      syncManager.addToQueue({ type: 'ADD_DUMP', payload: dump });
    }
  };

  const deleteDump = async (id) => {
    try {
      setDumps(dumps.filter(d => d._id !== id));
      await axios.delete(`/dumps/${id}`);
    } catch (e) { console.error(e); }
  };

  // Ideas
  const addIdea = async (idea) => {
    const tempIdea = { ...idea, _id: `temp_${Date.now()}`, date: new Date().toISOString() };
    setIdeas(prev => [...prev, tempIdea]);

    try {
      const res = await axios.post('/ideas', idea);
      setIdeas(prev => prev.map(i => i._id === tempIdea._id ? res.data : i));
    } catch (e) {
      console.error("Offline: Queuing addIdea");
      syncManager.addToQueue({ type: 'ADD_IDEA', payload: idea });
    }
  };

  const deleteIdea = async (id) => {
    try {
      setIdeas(ideas.filter(i => i._id !== id));
      await axios.delete(`/ideas/${id}`);
    } catch (e) { console.error(e); }
  };

  // Checklist
  const addChecklistItem = async (text) => {
    const tempItem = { _id: `temp_${Date.now()}`, text, isCompleted: false, createdAt: new Date().toISOString() };
    setChecklistItems(prev => [tempItem, ...prev]);

    try {
      const res = await axios.post('/checklist', { text });
      setChecklistItems(prev => prev.map(i => i._id === tempItem._id ? res.data : i));
    } catch (e) {
      console.error("Offline: Queuing addChecklist");
      syncManager.addToQueue({ type: 'ADD_CHECKLIST', payload: { text } });
    }
  };

  const toggleChecklistItem = async (id, isCompleted) => {
    try {
      setChecklistItems(items => items.map(i => i._id === id ? { ...i, isCompleted, completedAt: isCompleted ? new Date() : null } : i));
      const res = await axios.put(`/checklist/${id}`, { isCompleted });
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
    setUserProfile(prev => ({ ...prev, ...data })); // Optimistic
    try {
      const res = await axios.put('/profile', data);
      setUserProfile(res.data);
      setToast({ message: "Profile updated successfully" });
    } catch (e) {
      console.error("Offline: Queuing updateProfile");
      syncManager.addToQueue({ type: 'UPDATE_PROFILE', payload: data });
      setToast({ message: "Profile saved locally" });
    }
  };

  const exportData = async () => {
    try {
      const res = await axios.get('/export');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `zenfocus_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      setToast({ message: "Data exported successfully" });
    } catch (e) {
      console.error(e);
      setToast({ message: "Export failed" });
    }
  };

  // Achievements
  const createAchievement = async (achievement) => {
    try {
      const res = await axios.post('/achievements', achievement);
      setAchievements([...achievements, res.data]);
      setToast({ message: "Achievement created successfully!" });
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to create achievement" });
    }
  };

  const deleteAchievement = async (id) => {
    try {
      await axios.delete(`/achievements/${id}`);
      setAchievements(achievements.filter(a => a._id !== id));
      setToast({ message: "Achievement deleted" });
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to delete achievement" });
    }
  };

  // Check achievements (call this after actions)
  const checkAchievements = async () => {
    try {
      const res = await axios.post('/achievements/check');
      if (res.data.updates && res.data.updates.length > 0) {
        // Refresh achievements
        const achRes = await axios.get('/achievements');
        setAchievements(achRes.data);

        // Show confetti for newly unlocked
        res.data.updates.forEach(ach => {
          if (ach.isUnlocked) {
            confetti({
              particleCount: 200,
              spread: 100,
              origin: { y: 0.6 },
              colors: ['#f59e0b', '#eab308', '#fbbf24'],
              zIndex: 10000
            });
            setToast({ message: `🏆 Achievement Unlocked: ${ach.title}!` });
          }
        });
      }
    } catch (e) {
      console.error('Achievement check error:', e);
    }
  };

  // Update hydration target from settings
  const updateHydrationTarget = async (newTarget) => {
    try {
      // Update backend
      await axios.put('/stats/hydration-target', { target: newTarget });
      // Update local state
      setHydrationState(prev => ({ ...prev, target: newTarget }));
      setToast({ message: "Hydration goal updated!" });
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to update hydration goal" });
    }
  };

  // Sync Settings to Backend
  const updateProfileSettings = async (updates) => {
    const currentSettings = {
      timerDurations, notificationsEnabled, soundEnabled, autoStartBreaks
    };
    const newSettings = { ...currentSettings, ...updates };
    // Optimistic update handled by local setters

    try {
      await axios.put('/profile', { settings: newSettings });
    } catch (e) {
      console.error("Offline: Queuing updateSettings");
      syncManager.addToQueue({ type: 'UPDATE_SETTINGS', payload: newSettings });
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
    <div className="flex h-[100dvh] font-sans bg-[#0A0A0A] text-white selection:bg-white/20 overflow-hidden">
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
      <nav className="w-20 bg-[#1A1A1A] border-r border-[#333333] hidden md:flex flex-col items-center py-8 gap-8 shadow-lg z-20">
        <div className="p-3 bg-white rounded-xl text-black shadow-lg">
          <Clock size={24} fill="currentColor" />
        </div>
        <div className="flex flex-col gap-6 w-full px-2 overflow-y-auto no-scrollbar">
          {[
            { id: 'dashboard', icon: Clock, label: 'Focus' },
            { id: 'calendar', icon: CalendarIcon, label: 'Plan' },
            { id: 'kanban', icon: Layout, label: 'Board' },
            { id: 'stack', icon: Layers, label: 'Stack' },
            { id: 'dump', icon: Brain, label: 'Clear' },
            { id: 'ideas', icon: Lightbulb, label: 'Ideas' },
            { id: 'checklist', icon: CheckSquare, label: 'Tasks' },
            { id: 'health', icon: Droplets, label: 'Health' },
            { id: 'analytics', icon: TrendingUp, label: 'Stats' },
            { id: 'achievements', icon: Trophy, label: 'Awards' },
            { id: 'settings', icon: SettingsIcon, label: 'Settings' },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 group ${activeTab === item.id ? 'bg-white/10 text-white border border-white/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
              <item.icon size={22} className={`mb-1 group-hover:scale-110 transition-transform ${activeTab === item.id ? 'fill-indigo-500/10' : ''}`} />
              <span className="text-[9px] font-bold tracking-wider uppercase">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-auto mb-4 flex flex-col gap-4 items-center">
          <button onClick={logout} className="text-gray-500 hover:text-white transition-colors" title="Logout">
            <LogOut size={20} />
          </button>
          <button onClick={() => setActiveTab('profile')} className={`h-10 w-10 rounded-full bg-white flex items-center justify-center text-black font-bold text-xs shadow-md border-2 transition-all hover-lift ${activeTab === 'profile' ? 'border-white ring-2 ring-white/30' : 'border-[#1A1A1A]'}`}>
            {user.avatar && user.avatar !== 'default' ? <img src={user.avatar} alt="User" className="h-full w-full rounded-full object-cover" /> : (user.name ? user.name.charAt(0) : 'U')}
          </button>
        </div>
      </nav>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} logout={logout} />

      <main className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 p-4 md:p-8 overflow-hidden flex flex-col relative z-10">
          <header className="mb-4 md:mb-6 flex justify-between items-end">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white capitalize tracking-tight flex items-baseline gap-4">
                {activeTab}
                <div className="h-2 w-2 rounded-full bg-white animate-pulse translate-y-[-2px]"></div>
                <span className="text-gray-500 font-bold uppercase tracking-widest text-xs hidden md:inline-block">
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </h1>
              <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px] md:hidden block mt-1">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="flex gap-2">
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
                    userProfile={userProfile}
                    onNotify={(t, b) => { sendNotification(t, b); setToast({ message: b }); }}
                    onSessionComplete={incrementPomodoro}
                    pomodoroStats={pomodoroStats}
                    pomodoroHistory={pomodoroHistory}
                    dailyGoal={user.dailyGoal || 8}
                    tasks={todayTasks}
                    checklistItems={checklistItems}
                    timerDurations={timerDurations}
                    onUpdateTimerDurations={setTimerDurations}
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
                <KanbanBoard
                  tasks={todayTasks}
                  updateTaskStatus={updateStatus}
                  deleteTask={deleteTask}
                  onAdd={() => setEditingTask({ isNew: true, status: 'todo' })}
                />
              </div>
            )}

            {activeTab === 'stack' && (
              <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <DailyStack logs={todayLogs} addLog={addLog} />
              </div>
            )}

            {activeTab === 'dump' && (
              <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <BrainDump dumps={todayDumps} addDump={addDump} deleteDump={deleteDump} />
              </div>
            )}

            {activeTab === 'ideas' && (
              <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <IdeaVault ideas={todayIdeas} addIdea={addIdea} deleteIdea={deleteIdea} />
              </div>
            )}

            {activeTab === 'checklist' && (
              <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Checklist
                  items={todayChecklistItems}
                  onAdd={addChecklistItem}
                  onToggle={toggleChecklistItem}
                  onDelete={deleteChecklistItem}
                />
              </div>
            )}

            {activeTab === 'health' && (
              <Health hydration={hydration} onDrink={drinkWater} />
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

            {activeTab === 'settings' && (
              <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Settings
                  userProfile={userProfile}
                  onUpdateProfile={updateProfile}
                  onExportData={exportData}
                  timerDurations={timerDurations}
                  onUpdateTimerDurations={(val) => { setTimerDurations(val); updateProfileSettings({ timerDurations: val }); }}
                  notificationsEnabled={notificationsEnabled}
                  onToggleNotifications={(val) => { setNotificationsEnabled(val); updateProfileSettings({ notificationsEnabled: val }); }}
                  soundEnabled={soundEnabled}
                  onToggleSound={(val) => { setSoundEnabled(val); updateProfileSettings({ soundEnabled: val }); }}
                  pomodoroStats={pomodoroStats}
                  autoStartBreaks={autoStartBreaks}
                  onToggleAutoStartBreaks={(val) => { setAutoStartBreaks(val); updateProfileSettings({ autoStartBreaks: val }); }}
                  hydrationTarget={hydration.target}
                  onUpdateHydrationTarget={updateHydrationTarget}
                />
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Achievements
                  achievements={achievements}
                  onCreateAchievement={createAchievement}
                  onDeleteAchievement={deleteAchievement}
                />
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Analytics
                  pomodoroStats={pomodoroStats}
                  pomodoroHistory={pomodoroHistory}
                  hydrationHistory={hydrationHistory}
                  hydration={hydration}
                  tasks={tasks}
                  logs={logs}
                  achievements={achievements}
                />
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {
          editingTask && (
            <TaskModal
              date={new Date()}
              taskToEdit={editingTask.isNew ? null : editingTask}
              initialStatus={editingTask.status}
              onClose={() => setEditingTask(null)}
              onUpdate={updateTaskDetails}
              onDelete={deleteTask}
              onAdd={(t) => { addTask(t); setEditingTask(null); }}
            />
          )
        }
      </main >
    </div >
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();
  const [view, setView] = useState('login');

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0B0C15] text-white"><Loader className="animate-spin" size={40} /></div>;

  if (!user) {
    return view === 'login'
      ? <Login onSwitchToRegister={() => setView('register')} />
      : <Register onSwitchToLogin={() => setView('login')} />;
  }

  return <AuthenticatedApp />;
};

const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;