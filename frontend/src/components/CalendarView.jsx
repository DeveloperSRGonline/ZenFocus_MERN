import React, { useState } from 'react';
import {
  Clock, Calendar as CalendarIcon, Layout, AlignJustify, ChevronLeft, ChevronRight, Plus, X, Trash2, List, Pen
} from 'lucide-react';
import { useMobileDrag, parseTime, formatTimeToString } from '../utils/helpers';
import { InputWithVoice } from './Shared';

const QueuePopover = ({ tasks, date, onEditTask, onAddNew, onClose }) => {
  const formatTo12Hour = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    let hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };
  const dateStr = date.toLocaleDateString('en-CA');
  const daysTasks = tasks.filter(t => t.date && t.date.startsWith(dateStr));
  const unscheduled = daysTasks.filter(t => !t.time);
  const scheduled = daysTasks.filter(t => t.time).sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="absolute top-16 right-4 md:right-auto md:left-[350px] w-64 bg-[#1A1A1A] border border-[#333333] rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Task Queue</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={14} /></button>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
        <div>
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Unscheduled</h4>
          <div className="space-y-2">
            {unscheduled.map(task => (
              <div
                key={task._id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("taskId", task._id)}
                onClick={() => onEditTask(task)}
                className="bg-[#252525] p-2 rounded cursor-grab active:cursor-grabbing hover:bg-[#333333] border border-transparent hover:border-indigo-500/50 transition-all text-xs text-gray-300 shadow-sm"
              >
                {task.title}
              </div>
            ))}
            {unscheduled.length === 0 && <div className="text-xs text-gray-600 italic text-center">Empty</div>}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Scheduled</h4>
            <button onClick={onAddNew} className="flex items-center gap-1 text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded hover:bg-indigo-500/20 transition-colors uppercase font-bold tracking-wider">
              <Plus size={10} /> New
            </button>
          </div>
          <div className="space-y-2">
            {scheduled.map(task => (
              <div
                key={task._id}
                onClick={() => onEditTask(task)}
                className="bg-[#1A1A1A] p-2 rounded border border-[#333333] cursor-pointer hover:border-indigo-500/50 text-xs text-gray-300 shadow-sm transition-all flex flex-col gap-0.5 group"
              >
                <div className="truncate font-medium">{task.title}</div>
                <div className="text-[9px] font-mono text-gray-500">{formatTo12Hour(task.time)}{task.endTime ? ` - ${formatTo12Hour(task.endTime)}` : ''}</div>
              </div>
            ))}
            {scheduled.length === 0 && <div className="text-xs text-gray-600 italic text-center">No tasks</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

const Timeline = ({ tasks, date, onUpdateTaskTime, onEditTask, onDeleteTask }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  /* formatTo12Hour is now defined in QueuePopover, but Timeline uses it for Grid. Keeping basic one here for Grid */
  const formatTo12Hour = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    let hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  const dateStr = date.toLocaleDateString('en-CA');
  const daysTasks = tasks.filter(t => t.date && t.date.startsWith(dateStr));

  const { onTouchStart, onTouchMove, onTouchEnd } = useMobileDrag((taskId, dropValue, dropZone) => {
    if (dropZone === 'timeline-slot') {
      onUpdateTaskTime(taskId, dateStr, dropValue);
    }
  });

  const onDragStart = (e, taskId) => e.dataTransfer.setData("taskId", taskId);

  const handleDrop = (e, hour) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");

    // Calculate fractional time (15 min granularity)
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const height = rect.height;
    const ratio = Math.max(0, Math.min(1, offsetY / height));
    const totalMinutes = Math.floor(ratio * 60);
    const roundedMinutes = Math.round(totalMinutes / 15) * 15;
    const minutes = roundedMinutes === 60 ? 45 : roundedMinutes;

    const timeStr = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    // Calculate new End Time to preserve duration
    const task = tasks.find(t => t._id === taskId);
    let newEndTime = null;
    if (task && task.time && task.endTime) {
      const [oldH, oldM] = task.time.split(':').map(Number);
      const [oldEndH, oldEndM] = task.endTime.split(':').map(Number);
      const durationMins = (oldEndH * 60 + oldEndM) - (oldH * 60 + oldM);

      const [newH, newM] = timeStr.split(':').map(Number);
      const newTotalMins = newH * 60 + newM + durationMins;

      // Handle day rollover strictly? For now just wrap 24h
      const newEndH = Math.floor(newTotalMins / 60) % 24;
      const newEndM = newTotalMins % 60;
      newEndTime = formatTimeToString(newEndH, newEndM);
    }

    onUpdateTaskTime(taskId, dateStr, timeStr, newEndTime);
  };

  const formatHourLabel = (h) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hours12 = h % 12 || 12;
    return `${hours12} ${ampm}`;
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#1A1A1A] rounded-xl md:rounded-2xl shadow-xl border border-[#333333] overflow-hidden">
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
        {/* Sidebar REMOVED - Moved to QueuePopover */}

        <div className="flex-1 overflow-y-auto relative custom-scrollbar bg-[#0A0A0A] pb-20">
          {hours.map(hour => {
            const tasksInSlot = daysTasks.filter(t => t.time && parseInt(t.time.split(':')[0]) === hour);
            return (
              <div
                key={hour}
                data-drop-zone="timeline-slot"
                data-drop-value={`${hour.toString().padStart(2, '0')}:00`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, hour)}
                className="flex border-b border-[#333333] min-h-[100px] group hover:bg-[#151515] transition-colors relative"
              >
                {/* Visual Guidelines */}
                <div className="absolute inset-x-0 top-1/4 border-t border-indigo-500/20 border-dashed pointer-events-none flex justify-end pr-1">
                  <span className="text-[8px] text-gray-600 font-mono -mt-2">15</span>
                </div>
                <div className="absolute inset-x-0 top-2/4 border-t border-indigo-500/40 border-dashed pointer-events-none flex justify-end pr-1">
                  <span className="text-[8px] text-gray-600 font-mono -mt-2">30</span>
                </div>
                <div className="absolute inset-x-0 top-3/4 border-t border-indigo-500/20 border-dashed pointer-events-none flex justify-end pr-1">
                  <span className="text-[8px] text-gray-600 font-mono -mt-2">45</span>
                </div>

                <div className="w-12 md:w-16 text-right pr-2 md:pr-3 py-2 text-[10px] md:text-xs font-mono font-medium text-gray-500 border-r border-[#333333] bg-[#0F0F0F] shrink-0 sticky left-0 z-20">
                  {formatHourLabel(hour)}
                </div>
                <div className="flex-1 p-1 relative z-10 w-full">
                  {tasksInSlot.map(task => {
                    const minutes = parseInt(task.time.split(':')[1]) || 0;
                    const topPercent = (minutes / 60) * 100;
                    return (
                      <div
                        key={task._id}
                        draggable
                        onDragStart={(e) => onDragStart(e, task._id)}
                        onTouchStart={(e) => onTouchStart(e, task._id)}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                        onDoubleClick={() => onEditTask(task)}
                        style={{
                          top: `${topPercent}%`,
                          height: task.endTime ? `${((parseInt(task.endTime.split(':')[0]) * 60 + parseInt(task.endTime.split(':')[1])) - (hour * 60 + minutes)) / 60 * 100}px` : 'auto',
                          minHeight: '30px',
                          zIndex: 10
                        }}
                        className="absolute left-1 right-1 bg-[#252525] text-white text-xs p-1.5 rounded border-l-4 border-indigo-500 cursor-pointer hover:bg-[#333333] transition-colors shadow-sm group/card flex justify-between items-center gap-2 select-none overflow-hidden"
                      >
                        <div className="min-w-0 flex-1 flex flex-col justify-center">
                          <span className="font-mono opacity-75 text-gray-400 text-[9px] leading-tight">
                            {formatTo12Hour(task.time)}{task.endTime ? ` - ${formatTo12Hour(task.endTime)}` : ''}
                          </span>
                          <span className="truncate font-medium leading-tight">{task.title}</span>
                        </div>
                        <div className="flex gap-1 opacity-100 md:opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/40 rounded p-0.5 backdrop-blur-sm">
                          <button
                            onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                            className="p-1 hover:bg-white/20 rounded text-gray-300 hover:text-white transition-colors"
                          >
                            <Pen size={10} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteTask(task._id); }}
                            className="p-1 hover:bg-red-500/20 rounded text-gray-300 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const TaskModal = ({ date, taskToEdit, onClose, onAdd, onUpdate, onDelete }) => {
  const [title, setTitle] = useState(taskToEdit ? taskToEdit.title : "");
  const [timeInput, setTimeInput] = useState(taskToEdit ? taskToEdit.time : "");
  const [endTimeInput, setEndTimeInput] = useState(taskToEdit ? taskToEdit.endTime : "");
  // Initialize with task date or passed date prop
  const [selectedDate, setSelectedDate] = useState(
    taskToEdit && taskToEdit.date
      ? new Date(taskToEdit.date).toLocaleDateString('en-CA')
      : (date ? new Date(date).toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA'))
  );

  const handleSave = () => {
    if (!title) return;

    let formattedTime = "";
    if (timeInput) {
      const parsed = parseTime(timeInput);
      if (parsed) {
        formattedTime = formatTimeToString(parsed.h, parsed.m);
      } else {
        formattedTime = timeInput;
      }
    }

    let formattedEndTime = "";
    if (endTimeInput) {
      const parsed = parseTime(endTimeInput);
      if (parsed) {
        formattedEndTime = formatTimeToString(parsed.h, parsed.m);
      } else {
        formattedEndTime = endTimeInput;
      }
    }

    const finalDate = new Date(selectedDate);
    // Use Local Date String to avoid Timezone shifts (e.g. creating in evening showing up next day UTC)
    const isoDate = finalDate.toLocaleDateString('en-CA');

    if (taskToEdit) {
      onUpdate(taskToEdit._id, { title, time: formattedTime, endTime: formattedEndTime, date: isoDate });
    } else {
      onAdd({ title, date: isoDate, time: formattedTime, endTime: formattedEndTime, status: 'Queue' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-200 border border-[#333333]">
        <div className="flex justify-between items-center mb-6 border-b border-[#333333] pb-4">
          <h3 className="font-bold text-xl text-white">{taskToEdit ? 'Edit Task' : 'New Task'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={24} /></button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Task Description</label>
            <InputWithVoice value={title} onChange={setTitle} placeholder="What needs to be done?" className="bg-[#0A0A0A] border-[#333333] text-white placeholder-gray-600" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#333333] rounded-lg p-3 text-white focus:border-white/50 focus:outline-none placeholder-gray-600 text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Start Time</label>
              <input
                type="text"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                placeholder="e.g. 2pm"
                className="w-full bg-[#0A0A0A] border border-[#333333] rounded-lg p-3 text-white focus:border-white/50 focus:outline-none placeholder-gray-600 text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">End Time</label>
              <input
                type="text"
                value={endTimeInput}
                onChange={(e) => setEndTimeInput(e.target.value)}
                placeholder="e.g. 3:30pm"
                className="w-full bg-[#0A0A0A] border border-[#333333] rounded-lg p-3 text-white focus:border-white/50 focus:outline-none placeholder-gray-600 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            {taskToEdit && (
              <button onClick={() => { onDelete(taskToEdit._id); onClose(); }} className="px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold rounded-lg transition-colors border border-red-500/20">
                <Trash2 size={20} />
              </button>
            )}
            <button onClick={handleSave} className="flex-1 bg-white hover:bg-gray-100 text-black font-bold py-3 rounded-lg shadow-lg uppercase tracking-wider text-sm transition-all transform active:scale-95">
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CalendarView = ({ tasks, addTask, updateTaskTime, updateTaskDate, onEditTask, deleteTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month');
  const [timelineDate, setTimelineDate] = useState(new Date());
  const [showQueue, setShowQueue] = useState(false);

  const getDaysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDay = (d) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();

  const { onTouchStart, onTouchMove, onTouchEnd } = useMobileDrag((taskId, dropValue, dropZone) => {
    if (dropZone === 'calendar-day') {
      updateTaskDate(taskId, dropValue);
    }
  });

  const onDragStart = (e, taskId) => e.dataTransfer.setData("taskId", taskId);
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (e, dateStr) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    updateTaskDate(taskId, dateStr);
  };

  const renderMonth = () => {
    const days = [];
    const totalDays = getDaysInMonth(currentDate);
    const startPad = getFirstDay(currentDate);
    for (let i = 0; i < startPad; i++) days.push(<div key={`empty-${i}`} className="min-h-[6rem] md:min-h-[7rem] bg-[#0A0A0A]/50" />);
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
      const dateStr = dateObj.toLocaleDateString('en-CA');
      const dayTasks = tasks.filter(t => t.date && t.date.startsWith(dateStr));
      const todayStr = new Date().toLocaleDateString('en-CA');
      const isToday = todayStr === dateStr;

      days.push(
        <div key={d}
          data-drop-zone="calendar-day"
          data-drop-value={dateStr}
          onClick={() => { setTimelineDate(dateObj); setViewMode('timeline'); }}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, dateStr)}
          className={`min-h-[6rem] md:min-h-[7rem] p-1 md:p-2 cursor-pointer hover:bg-[#151515] transition-colors bg-[#1A1A1A] relative group overflow-hidden flex flex-col ${isToday ? 'bg-indigo-900/10 border border-indigo-500/50' : ''}`}
        >
          <div className={`text-xs md:text-sm font-bold mb-1 md:mb-2 flex justify-between ${isToday ? 'text-indigo-400' : 'text-gray-400'}`}>
            {d} {isToday && <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded hidden md:inline">TODAY</span>}
          </div>
          <div className="space-y-1 overflow-y-auto flex-1 min-h-0 no-scrollbar">
            {dayTasks.map(t => (
              <div
                key={t._id}
                draggable
                onDragStart={(e) => { e.stopPropagation(); onDragStart(e, t._id); }}
                onTouchStart={(e) => onTouchStart(e, t._id)}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onDoubleClick={(e) => { e.stopPropagation(); onEditTask(t); }}
                className="text-[9px] md:text-[10px] bg-[#333333] text-gray-300 px-1 py-0.5 md:py-1 rounded truncate border-l-2 border-white/50 cursor-grab active:cursor-grabbing select-none"
              >
                {t.time && <span className="opacity-50 font-mono mr-1">{t.time}</span>}{t.title}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="h-full flex flex-col pb-20 md:pb-0">
      <div className="mb-4 flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {viewMode === 'month'
              ? currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })
              : timelineDate.toDateString()
            }
          </h2>
          <div className="flex bg-[#1A1A1A] rounded-lg p-1 border border-[#333333]">
            <button onClick={() => setViewMode('month')} className={`p-2 rounded ${viewMode === 'month' ? 'bg-[#333333] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}><Layout size={16} /></button>
            <button onClick={() => setViewMode('timeline')} className={`p-2 rounded ${viewMode === 'timeline' ? 'bg-[#333333] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}><AlignJustify size={16} /></button>
          </div>
        </div>

        <div className="flex gap-2 relative">
          {viewMode === 'timeline' && (
            <button
              onClick={() => setShowQueue(!showQueue)}
              className={`p-2 rounded-lg border border-[#333333] transition-colors ${showQueue ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' : 'text-gray-400 hover:text-white hover:bg-[#333333]'}`}
              title="Toggle Task Queue"
            >
              <List size={20} />
            </button>
          )}

          {viewMode === 'month' ? (
            <>
              <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-[#333333] rounded-lg text-gray-400 border border-[#333333]"><ChevronLeft size={20} /></button>
              <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-[#333333] rounded-lg text-gray-400 border border-[#333333]"><ChevronRight size={20} /></button>
            </>
          ) : (
            <>
              <button onClick={() => setTimelineDate(new Date(timelineDate.setDate(timelineDate.getDate() - 1)))} className="p-2 hover:bg-[#333333] rounded-lg text-gray-400 border border-[#333333]"><ChevronLeft size={20} /></button>
              <button onClick={() => setTimelineDate(new Date(timelineDate.setDate(timelineDate.getDate() + 1)))} className="p-2 hover:bg-[#333333] rounded-lg text-gray-400 border border-[#333333]"><ChevronRight size={20} /></button>
            </>
          )}
          <button onClick={() => setSelectedDate(viewMode === 'month' ? new Date() : timelineDate)} className="ml-2 bg-white hover:bg-gray-100 text-black px-3 md:px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all">
            <Plus size={16} /> <span className="hidden md:inline">Add Task</span>
          </button>

          {/* Queue Popover */}
          {showQueue && viewMode === 'timeline' && (
            <QueuePopover
              tasks={tasks}
              date={timelineDate}
              onEditTask={onEditTask}
              onAddNew={() => setSelectedDate(timelineDate)}
              onClose={() => setShowQueue(false)}
            />
          )}
        </div>
      </div>

      {
        viewMode === 'month' ? (
          <div className="flex-1 bg-[#1A1A1A] rounded-2xl shadow-xl border border-[#333333] overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto custom-scrollbar bg-[#333333] border border-[#333333]">
              <div className="min-w-[800px] md:min-w-0 flex flex-col h-full">
                <div className="grid grid-cols-7 text-center border-b border-[#333333] bg-[#0A0A0A] text-[10px] font-bold uppercase tracking-widest text-gray-500 py-3 shrink-0 sticky top-0 z-10">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-px flex-1">{renderMonth()}</div>
              </div>
            </div>
          </div>
        ) : (
          <Timeline
            tasks={tasks}
            date={timelineDate}
            onUpdateTaskTime={updateTaskTime}
            onEditTask={onEditTask}
            onDeleteTask={deleteTask}
            onAddNew={() => setSelectedDate(timelineDate)}
          />
        )
      }

      {
        selectedDate && (
          <TaskModal
            date={selectedDate}
            onClose={() => setSelectedDate(null)}
            onAdd={(t) => { addTask(t); setSelectedDate(null); }}
          />
        )
      }
    </div >
  );
};

export default CalendarView;