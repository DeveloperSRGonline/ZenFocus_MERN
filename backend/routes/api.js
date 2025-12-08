const express = require('express');
const router = express.Router();
const { Task, Log, Dump, Idea, Stats } = require('../models/schemas');

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

module.exports = router;