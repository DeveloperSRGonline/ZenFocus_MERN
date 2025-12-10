const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: String,
  status: { type: String, default: 'todo' }, // todo, inprogress, done
  date: Date,
  time: String, // "14:00"
  notified: { type: Boolean, default: false }
});

const logSchema = new mongoose.Schema({
  taskName: String,
  start: String,
  end: String,
  duration: Number,
  date: { type: Date, default: Date.now }
});

const dumpSchema = new mongoose.Schema({
  text: String,
  date: { type: Date, default: Date.now }
});

const ideaSchema = new mongoose.Schema({
  text: String,
  date: { type: Date, default: Date.now }
});

// Single document to hold daily/global stats like hydration and pomodoros
const statsSchema = new mongoose.Schema({
  identifier: { type: String, default: 'daily_stats' },
  hydrationCount: { type: Number, default: 0 },
  hydrationTarget: { type: Number, default: 8 },
  hydrationHistory: [{
    date: String, // Format: YYYY-MM-DD
    count: { type: Number, default: 0 }
  }],
  pomodoros: { type: Number, default: 0 },
  pomodoroHistory: [{
    date: String, // Format: YYYY-MM-DD
    count: { type: Number, default: 0 }
  }]
});

const checklistSchema = new mongoose.Schema({
  text: String,
  isCompleted: { type: Boolean, default: false },
  completedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const userProfileSchema = new mongoose.Schema({
  identifier: { type: String, default: 'main_user' }, // Single user constraint
  name: { type: String, default: 'Zen Master' },
  bio: { type: String, default: 'Focus is the key to reality.' },
  avatar: { type: String, default: 'default' },
  theme: { type: String, default: 'dark' },
  dailyGoal: { type: Number, default: 8 }
});

module.exports = {
  Task: mongoose.model('Task', taskSchema),
  Log: mongoose.model('Log', logSchema),
  Dump: mongoose.model('Dump', dumpSchema),
  Idea: mongoose.model('Idea', ideaSchema),
  Stats: mongoose.model('Stats', statsSchema),
  Checklist: mongoose.model('Checklist', checklistSchema),
  UserProfile: mongoose.model('UserProfile', userProfileSchema)
};