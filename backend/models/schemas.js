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
  pomodoros: { type: Number, default: 0 }
});

module.exports = {
  Task: mongoose.model('Task', taskSchema),
  Log: mongoose.model('Log', logSchema),
  Dump: mongoose.model('Dump', dumpSchema),
  Idea: mongoose.model('Idea', ideaSchema),
  Stats: mongoose.model('Stats', statsSchema)
};