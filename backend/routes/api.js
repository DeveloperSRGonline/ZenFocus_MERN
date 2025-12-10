const express = require('express');
const router = express.Router();
const { Task, Log, Dump, Idea, Stats, Checklist, User } = require('../models/schemas');
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

module.exports = router;