const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true }, // sparse for Google auth without email? No, Google always gives email. But just in case.
  password: { type: String }, // Optional if using Google Auth only
  googleId: { type: String, unique: true, sparse: true },
  avatar: { type: String, default: 'default' },
  bio: { type: String, default: 'Focus is the key to reality.' },
  theme: { type: String, default: 'dark' },
  dailyGoal: { type: Number, default: 8 }, // Pomodoro goal
  createdAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  status: { type: String, default: 'todo' },
  date: Date,
  time: String,
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

module.exports = {
  User: mongoose.model('User', userSchema),
  Task: mongoose.model('Task', taskSchema),
  Log: mongoose.model('Log', logSchema),
  Dump: mongoose.model('Dump', dumpSchema),
  Idea: mongoose.model('Idea', ideaSchema),
  Stats: mongoose.model('Stats', statsSchema),
  Checklist: mongoose.model('Checklist', checklistSchema)
};