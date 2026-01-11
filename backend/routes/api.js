const express = require('express');
const router = express.Router();
const { Task, Log, Dump, Idea, Stats, Checklist, User, Achievement } = require('../models/schemas');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Apply to all routes below

// --- Helper for Stats ---
const getStats = async (user) => {
  let stats = await Stats.findOne({ user: user._id });
  if (!stats) stats = await Stats.create({ user: user._id, hydrationTarget: user.dailyGoal || 8 }); // Sync goal?
  return stats;
};

// --- TASKS ---
router.get('/tasks', async (req, res) => {
  const tasks = await Task.find({ user: req.user._id });
  res.json(tasks);
});

router.post('/tasks', async (req, res) => {
  const newTask = await Task.create({ ...req.body, user: req.user._id });
  res.json(newTask);
});

router.put('/tasks/:id', async (req, res) => {
  const updated = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  );
  if (!updated) return res.status(404).json({ message: 'Task not found' });
  res.json(updated);
});

router.delete('/tasks/:id', async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Deleted' });
});

// --- LOGS ---
router.get('/logs', async (req, res) => {
  const logs = await Log.find({ user: req.user._id }).sort({ date: -1 });
  res.json(logs);
});

router.post('/logs', async (req, res) => {
  const log = await Log.create({ ...req.body, user: req.user._id });
  res.json(log);
});

// --- DUMPS ---
router.get('/dumps', async (req, res) => {
  const dumps = await Dump.find({ user: req.user._id }).sort({ date: -1 });
  res.json(dumps);
});

router.post('/dumps', async (req, res) => {
  const dump = await Dump.create({ ...req.body, user: req.user._id });
  res.json(dump);
});

router.delete('/dumps/:id', async (req, res) => {
  await Dump.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Deleted' });
});

// --- IDEAS ---
router.get('/ideas', async (req, res) => {
  const ideas = await Idea.find({ user: req.user._id }).sort({ date: -1 });
  res.json(ideas);
});

router.post('/ideas', async (req, res) => {
  const idea = await Idea.create({ ...req.body, user: req.user._id });
  res.json(idea);
});

router.delete('/ideas/:id', async (req, res) => {
  await Idea.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Deleted' });
});

// --- STATS (Hydration & Pomodoro) ---
router.get('/stats', async (req, res) => {
  const stats = await getStats(req.user);
  const today = new Date().toISOString().split('T')[0];

  // Daily Reset Logic for Hydration
  const todayEntry = stats.hydrationHistory.find(h => h.date === today);
  if (!todayEntry) {
    if (stats.hydrationCount !== 0) {
      stats.hydrationCount = 0;
      await stats.save();
    }
  } else {
    if (stats.hydrationCount !== todayEntry.count) {
      stats.hydrationCount = todayEntry.count;
      await stats.save();
    }
  }

  res.json(stats);
});

router.post('/stats/water', async (req, res) => {
  const stats = await getStats(req.user);
  const today = new Date().toISOString().split('T')[0];

  const historyIndex = stats.hydrationHistory.findIndex(h => h.date === today);
  let currentCount = historyIndex >= 0 ? stats.hydrationHistory[historyIndex].count : 0;

  if (currentCount >= stats.hydrationTarget) {
    return res.json(stats);
  }

  let newCount = currentCount + 1;

  if (historyIndex >= 0) {
    stats.hydrationHistory[historyIndex].count = newCount;
  } else {
    stats.hydrationHistory.push({ date: today, count: newCount });
  }

  stats.hydrationCount = newCount;
  await stats.save();
  res.json(stats);
});

router.post('/stats/pomodoro', async (req, res) => {
  const stats = await getStats(req.user);
  const today = new Date().toISOString().split('T')[0];

  const historyIndex = stats.pomodoroHistory.findIndex(h => h.date === today);

  if (historyIndex >= 0) {
    stats.pomodoroHistory[historyIndex].count += 1;
  } else {
    stats.pomodoroHistory.push({ date: today, count: 1 });
  }

  stats.pomodoros += 1;
  await stats.save();
  res.json(stats);
});

router.put('/stats/hydration-target', async (req, res) => {
  const { target } = req.body;
  const stats = await getStats(req.user);
  stats.hydrationTarget = target || 8;
  await stats.save();
  res.json(stats);
});

router.put('/stats', async (req, res) => {
  // Only allow updating target/goals here basically
  const stats = await Stats.findOneAndUpdate(
    { user: req.user._id },
    req.body,
    { new: true, upsert: true }
  );
  res.json(stats);
});

// --- CHECKLIST with Auto-Cleanup ---
router.get('/checklist', async (req, res) => {
  // Cleanup for this user only
  const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
  await Checklist.deleteMany({ user: req.user._id, isCompleted: true, completedAt: { $lt: tenMinsAgo } });

  const items = await Checklist.find({ user: req.user._id }).sort({ isCompleted: 1, createdAt: -1 });
  res.json(items);
});

router.post('/checklist', async (req, res) => {
  const item = await Checklist.create({ ...req.body, user: req.user._id });
  res.json(item);
});

router.put('/checklist/:id', async (req, res) => {
  const updates = req.body;
  if (updates.isCompleted === true) {
    updates.completedAt = new Date();
  } else if (updates.isCompleted === false) {
    updates.completedAt = null;
  }

  const updated = await Checklist.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, updates, { new: true });
  res.json(updated);
});

router.delete('/checklist/:id', async (req, res) => {
  await Checklist.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Deleted' });
});

// --- USER PROFILE ---
router.get('/profile', async (req, res) => {
  // Return the user object from req.user
  res.json(req.user);
});

router.put('/profile', async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    req.body,
    { new: true }
  ).select('-password');
  res.json(updatedUser);
});

// --- DATA EXPORT ---
router.get('/export', async (req, res) => {
  try {
    const [tasks, logs, dumps, ideas, stats, checklist] = await Promise.all([
      Task.find({ user: req.user._id }),
      Log.find({ user: req.user._id }),
      Dump.find({ user: req.user._id }),
      Idea.find({ user: req.user._id }),
      getStats(req.user),
      Checklist.find({ user: req.user._id }),
    ]);

    const fullData = {
      user: req.user,
      timestamp: new Date(),
      stats: stats,
      tasks,
      logs,
      brain_dumps: dumps,
      ideas,
      checklist_items: checklist
    };

    res.json(fullData);
  } catch (e) {
    res.status(500).json({ error: "Export failed" });
  }
});

// --- ACHIEVEMENTS ---
// Default achievements template
const DEFAULT_ACHIEVEMENTS = [
  { title: 'First Focus', description: 'Complete your first Pomodoro session', icon: 'clock', type: 'pomodoro', targetValue: 1 },
  { title: 'Focus Warrior', description: 'Complete 10 Pomodoro sessions', icon: 'flame', type: 'pomodoro', targetValue: 10 },
  { title: 'Hydration Hero', description: 'Reach daily hydration goal 7 times', icon: 'droplet', type: 'hydration', targetValue: 7 },
  { title: 'Task Master', description: 'Complete 50 tasks', icon: 'check-circle', type: 'tasks', targetValue: 50 },
  { title: 'Time Tracker', description: 'Log 100 hours of focus time', icon: 'timer', type: 'logs', targetValue: 100 },
  { title: 'Consistency King', description: 'Maintain a 30-day focus streak', icon: 'trending-up', type: 'streak', targetValue: 30 },
  { title: 'Brain Dump Master', description: 'Create 100 brain dump notes', icon: 'file-text', type: 'dumps', targetValue: 100 },
  { title: 'Goal Getter', description: 'Achieve 5 weekly goals', icon: 'target', type: 'weekly_goals', targetValue: 5 }
];

// Initialize default achievements for a user
const initializeAchievements = async (userId) => {
  const existingCount = await Achievement.countDocuments({ user: userId, isCustom: false });
  if (existingCount === 0) {
    const achievements = DEFAULT_ACHIEVEMENTS.map(ach => ({ ...ach, user: userId }));
    await Achievement.insertMany(achievements);
  }
};

// Get all achievements
router.get('/achievements', async (req, res) => {
  await initializeAchievements(req.user._id);
  const achievements = await Achievement.find({ user: req.user._id }).sort({ isUnlocked: -1, createdAt: -1 });
  res.json(achievements);
});

// Create custom achievement
router.post('/achievements', async (req, res) => {
  const { title, description, icon, type, targetValue, timeRange, customEndDate } = req.body;

  const achievement = await Achievement.create({
    user: req.user._id,
    title,
    description,
    icon: icon || 'star',
    type: type || 'custom',
    targetValue,
    isCustom: true,
    timeRange: timeRange || 'alltime',
    customEndDate: customEndDate ? new Date(customEndDate) : null
  });

  res.json(achievement);
});

// Update achievement progress
router.put('/achievements/:id/progress', async (req, res) => {
  const { currentValue } = req.body;
  const achievement = await Achievement.findOne({ _id: req.params.id, user: req.user._id });

  if (!achievement) return res.status(404).json({ message: 'Achievement not found' });

  achievement.currentValue = currentValue;

  // Auto-unlock if target reached
  if (currentValue >= achievement.targetValue && !achievement.isUnlocked) {
    achievement.isUnlocked = true;
    achievement.unlockedAt = new Date();
  }

  await achievement.save();
  res.json(achievement);
});

// Delete custom achievement
router.delete('/achievements/:id', async (req, res) => {
  const achievement = await Achievement.findOne({ _id: req.params.id, user: req.user._id });

  if (!achievement) return res.status(404).json({ message: 'Achievement not found' });
  if (!achievement.isCustom) return res.status(400).json({ message: 'Cannot delete default achievements' });

  await Achievement.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Trigger achievement check (called after actions)
router.post('/achievements/check', async (req, res) => {
  try {
    await initializeAchievements(req.user._id);
    const achievements = await Achievement.find({ user: req.user._id, isUnlocked: false });
    const stats = await getStats(req.user);
    const tasks = await Task.find({ user: req.user._id });
    const logs = await Log.find({ user: req.user._id });
    const dumps = await Dump.find({ user: req.user._id });

    const updates = [];

    for (const ach of achievements) {
      let newValue = ach.currentValue;

      switch (ach.type) {
        case 'pomodoro':
          newValue = stats.pomodoros || 0;
          break;
        case 'hydration':
          const hydrationGoalDays = stats.hydrationHistory?.filter(h => h.count >= stats.hydrationTarget).length || 0;
          newValue = hydrationGoalDays;
          break;
        case 'tasks':
          newValue = tasks.filter(t => t.status === 'done').length;
          break;
        case 'logs':
          const totalHours = logs.reduce((sum, log) => sum + (log.duration || 0), 0) / 60;
          newValue = Math.floor(totalHours);
          break;
        case 'dumps':
          newValue = dumps.length;
          break;
      }

      if (newValue !== ach.currentValue) {
        ach.currentValue = newValue;
        if (newValue >= ach.targetValue && !ach.isUnlocked) {
          ach.isUnlocked = true;
          ach.unlockedAt = new Date();
        }
        await ach.save();
        updates.push(ach);
      }
    }

    res.json({ message: 'Achievements checked', updates });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Achievement check failed' });
  }
});

module.exports = router;