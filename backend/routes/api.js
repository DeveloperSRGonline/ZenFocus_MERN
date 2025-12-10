const express = require('express');
const router = express.Router();
const { Task, Log, Dump, Idea, Stats, Checklist, UserProfile } = require('../models/schemas');

// --- Helper for Stats ---
const getStats = async () => {
  let stats = await Stats.findOne({ identifier: 'daily_stats' });
  if (!stats) stats = await Stats.create({ identifier: 'daily_stats' });
  return stats;
};

// --- TASKS ---
router.get('/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

router.post('/tasks', async (req, res) => {
  const newTask = await Task.create(req.body);
  res.json(newTask);
});

router.put('/tasks/:id', async (req, res) => {
  const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete('/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// --- LOGS ---
router.get('/logs', async (req, res) => {
  const logs = await Log.find().sort({ date: -1 });
  res.json(logs);
});

router.post('/logs', async (req, res) => {
  const log = await Log.create(req.body);
  res.json(log);
});

// --- DUMPS ---
router.get('/dumps', async (req, res) => {
  const dumps = await Dump.find().sort({ date: -1 });
  res.json(dumps);
});

router.post('/dumps', async (req, res) => {
  const dump = await Dump.create(req.body);
  res.json(dump);
});

router.delete('/dumps/:id', async (req, res) => {
  await Dump.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// --- IDEAS ---
router.get('/ideas', async (req, res) => {
  const ideas = await Idea.find().sort({ date: -1 });
  res.json(ideas);
});

router.post('/ideas', async (req, res) => {
  const idea = await Idea.create(req.body);
  res.json(idea);
});

router.delete('/ideas/:id', async (req, res) => {
  await Idea.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// --- STATS (Hydration & Pomodoro) ---
router.get('/stats', async (req, res) => {
  const stats = await getStats();
  const today = new Date().toISOString().split('T')[0];

  // Daily Reset Logic for Hydration
  const todayEntry = stats.hydrationHistory.find(h => h.date === today);
  if (!todayEntry) {
    // If no entry for today, reset count to 0 (visual reset) - effectively starting new day
    if (stats.hydrationCount !== 0) {
      stats.hydrationCount = 0;
      await stats.save();
    }
  } else {
    // Ensure top-level count matches history (sync fix)
    if (stats.hydrationCount !== todayEntry.count) {
      stats.hydrationCount = todayEntry.count;
      await stats.save();
    }
  }

  res.json(stats);
});

router.post('/stats/water', async (req, res) => {
  const stats = await getStats();
  const today = new Date().toISOString().split('T')[0];

  const historyIndex = stats.hydrationHistory.findIndex(h => h.date === today);
  let currentCount = historyIndex >= 0 ? stats.hydrationHistory[historyIndex].count : 0;

  // Don't increment if already at target
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
  const stats = await getStats();
  const today = new Date().toISOString().split('T')[0];

  const historyIndex = stats.pomodoroHistory.findIndex(h => h.date === today);

  if (historyIndex >= 0) {
    stats.pomodoroHistory[historyIndex].count += 1;
  } else {
    stats.pomodoroHistory.push({ date: today, count: 1 });
  }

  stats.pomodoros += 1; // Keep global total in sync
  await stats.save();
  res.json(stats);
});

router.put('/stats', async (req, res) => {
  const stats = await Stats.findOneAndUpdate(
    { identifier: 'daily_stats' },
    req.body,
    { new: true, upsert: true }
  );
  res.json(stats);
});

// --- CHECKLIST with Auto-Cleanup ---
router.get('/checklist', async (req, res) => {
  // Lazy cleanup: Delete completed items older than 10 minutes
  const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
  await Checklist.deleteMany({ isCompleted: true, completedAt: { $lt: tenMinsAgo } });

  const items = await Checklist.find().sort({ isCompleted: 1, createdAt: -1 }); // Uncompleted first
  res.json(items);
});

router.post('/checklist', async (req, res) => {
  const item = await Checklist.create(req.body);
  res.json(item);
});

router.put('/checklist/:id', async (req, res) => {
  const updates = req.body;

  // If completing, mark timestamp
  if (updates.isCompleted === true) {
    updates.completedAt = new Date();
  } else if (updates.isCompleted === false) {
    updates.completedAt = null; // Reset if unchecking
  }

  const updated = await Checklist.findByIdAndUpdate(req.params.id, updates, { new: true });
  res.json(updated);
});

router.delete('/checklist/:id', async (req, res) => {
  await Checklist.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// --- USER PROFILE ---
router.get('/profile', async (req, res) => {
  let profile = await UserProfile.findOne({ identifier: 'main_user' });
  if (!profile) profile = await UserProfile.create({ identifier: 'main_user' });
  res.json(profile);
});

router.put('/profile', async (req, res) => {
  const profile = await UserProfile.findOneAndUpdate(
    { identifier: 'main_user' },
    req.body,
    { new: true, upsert: true }
  );
  res.json(profile);
});

// --- DATA EXPORT ---
router.get('/export', async (req, res) => {
  try {
    const [tasks, logs, dumps, ideas, stats, checklist, profile] = await Promise.all([
      Task.find(),
      Log.find(),
      Dump.find(),
      Idea.find(),
      getStats(),
      Checklist.find(),
      UserProfile.findOne({ identifier: 'main_user' })
    ]);

    const fullData = {
      user: profile,
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