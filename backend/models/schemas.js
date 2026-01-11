const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  avatar: { type: String, default: 'default' },
  bio: { type: String, default: 'Focus is the key to reality.' },
  theme: { type: String, default: 'dark' },
  dailyGoal: { type: Number, default: 8 },
  createdAt: { type: Date, default: Date.now },
  settings: {
    timerDurations: {
      work: { type: Number, default: 25 },
      shortBreak: { type: Number, default: 5 },
      longBreak: { type: Number, default: 15 }
    },
    notificationsEnabled: { type: Boolean, default: true },
    soundEnabled: { type: Boolean, default: false },
    autoStartBreaks: { type: Boolean, default: false }
  }
});

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  status: { type: String, default: 'todo' },
  date: Date,
  time: String,
  endTime: String,
  notified: { type: Boolean, default: false }
});

const logSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taskName: String,
  start: String,
  end: String,
  duration: Number,
  date: { type: Date, default: Date.now }
});

const dumpSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: String,
  date: { type: Date, default: Date.now }
});

const ideaSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: String,
  date: { type: Date, default: Date.now }
});

const statsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hydrationCount: { type: Number, default: 0 },
  hydrationTarget: { type: Number, default: 8 },
  hydrationHistory: [{
    date: String,
    count: { type: Number, default: 0 }
  }],
  pomodoros: { type: Number, default: 0 },
  pomodoroHistory: [{
    date: String,
    count: { type: Number, default: 0 }
  }]
});

const checklistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: String,
  isCompleted: { type: Boolean, default: false },
  completedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const achievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: 'trophy' }, // Icon identifier
  type: { type: String, required: true }, // 'pomodoro', 'hydration', 'tasks', 'custom', etc.
  targetValue: { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  isUnlocked: { type: Boolean, default: false },
  unlockedAt: Date,
  isCustom: { type: Boolean, default: false },
  timeRange: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'alltime', 'custom'],
    default: 'alltime'
  },
  customEndDate: Date, // For custom time range
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Task: mongoose.model('Task', taskSchema),
  Log: mongoose.model('Log', logSchema),
  Dump: mongoose.model('Dump', dumpSchema),
  Idea: mongoose.model('Idea', ideaSchema),
  Stats: mongoose.model('Stats', statsSchema),
  Checklist: mongoose.model('Checklist', checklistSchema),
  Achievement: mongoose.model('Achievement', achievementSchema)
};