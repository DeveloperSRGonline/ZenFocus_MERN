import React, { useState } from 'react';
import { Layout, AlignJustify, ChevronLeft, ChevronRight, Plus, Pen, Trash2, X } from 'lucide-react';
import { useMobileDrag, parseTime, formatTimeToString } from '../utils/helpers';
import { InputWithVoice } from './Shared';

const Timeline = ({ tasks, date, onUpdateTaskTime, onDropUnscheduled, onEditTask, onDeleteTask }) => {
  const hours = Array.from({ length: 13 }, (_, i) => i + 1); 
  const dateStr = date.toISOString().split('T')[0];
  const daysTasks = tasks.filter(t => t.date && t.date.startsWith(dateStr));
  const unscheduled = daysTasks.filter(t => !t.time);

  const { onTouchStart, onTouchMove, onTouchEnd } = useMobileDrag((taskId, dropValue, dropZone) => {
    if (dropZone === 'timeline-slot') {
      onUpdateTaskTime(taskId, dateStr, dropValue);
    }
  });

  const onDragStart = (e, taskId) => e.dataTransfer.setData("taskId", taskId);
  
  const handleDrop = (e, hour) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    onUpdateTaskTime(taskId, dateStr, timeStr);
  };

  return (
    <div className="flex flex-col h-full bg-[#151621] rounded-2xl shadow-xl border border-slate-800/50 overflow-hidden pb-20 md:pb-0">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#1a1c29]">
        <h3 className="font-bold text-slate-200">{date.toDateString()} Timeline</h3>
        <span className="text-xs text-slate-500 hidden md:block">Drag to block time • Double click to edit</span>
        <span className="text-xs text-slate-500 md:hidden">Long press to drag • Double tap edit</span>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-slate-800 p-3 bg-[#0B0C15] overflow-x-auto md:overflow-y-auto no-scrollbar flex md:flex-col gap-2 shrink-0">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider md:mb-3 shrink-0 self-center md:self-auto mr-4 md:mr-0">Unscheduled</h4>
          {unscheduled.map(task => (
             <div 
               key={task._id} 
               draggable 
               onDragStart={(e) => onDragStart(e, task._id)}
               onTouchStart={(e) => onTouchStart(e, task._id)}
               onTouchMove={onTouchMove}
               onTouchEnd={onTouchEnd}
               onDoubleClick={() => onEditTask(task)}
               className="bg-[#151621] p-3 rounded border border-slate-700 cursor-grab active:cursor-grabbing hover:border-indigo-500 text-sm text-slate-300 shadow-sm transition-all min-w-[150px] md:min-w-0"
             >
               {task.title}
             </div>
          ))}
          {unscheduled.length === 0 && <div className="text-xs text-slate-600 italic text-center mt-2 md:mt-4">Empty</div>}
        </div>

        <div className="flex-1 overflow-y-auto relative custom-scrollbar no-scrollbar bg-[#0B0C15]">
          {hours.map(hour => {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            const tasksInSlot = daysTasks.filter(t => t.time && t.time.startsWith(timeStr.slice(0,3)));
            return (
              <div 
                key={hour} 
                data-drop-zone="timeline-slot"
                data-drop-value={timeStr}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, hour)}
                className="flex border-b border-slate-800 min-h-[80px] group hover:bg-[#151621] transition-colors"
              >
                <div className="w-16 text-right pr-3 py-2 text-xs font-mono font-medium text-slate-500 border-r border-slate-800 bg-[#12131e]">
                  {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                </div>
                <div className="flex-1 p-1 relative">
                  {tasksInSlot.map(task => (
                    <div 
                      key={task._id}
                      draggable 
                      onDragStart={(e) => onDragStart(e, task._id)}
                      onTouchStart={(e) => onTouchStart(e, task._id)}
                      onTouchMove={onTouchMove}
                      onTouchEnd={onTouchEnd}
                      onDoubleClick={() => onEditTask(task)}
                      className="relative z-10 bg-indigo-900/40 text-indigo-200 text-sm p-2 rounded mb-1 border-l-4 border-indigo-500 cursor-pointer hover:bg-indigo-900/60 transition-colors shadow-sm group flex justify-between items-start gap-2 select-none"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-[10px] opacity-75">{task.time}</div>
                        <div className="truncate font-medium">{task.title}</div>
                      </div>
                      <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded p-0.5 backdrop-blur-sm">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEditTask(task); }} 
                          className="p-1 hover:bg-indigo-500/50 rounded text-indigo-200 hover:text-white transition-colors"
                          title="Edit"
                        >
                          <Pen size={12} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteTask(task._id); }} 
                          className="p-1 hover:bg-red-500/50 rounded text-red-300 hover:text-white transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="absolute inset-0 z-0" /> 
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

    if (taskToEdit) {
      onUpdate(taskToEdit._id, { title, time: formattedTime });
    } else {
      onAdd({ title, date: date.toISOString(), time: formattedTime, status: 'todo' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#151621] rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in duration-200 border border-slate-700">
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <h3 className="font-bold text-xl text-white">{taskToEdit ? 'Edit Task' : `New Task: ${date.toLocaleDateString()}`}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={24}/></button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Task Description</label>
            <InputWithVoice value={title} onChange={setTitle} placeholder="What needs to be done?" className="bg-[#0B0C15] border-slate-700 text-white"/>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Time (Optional)</label>
            <input 
              type="text" 
              value={timeInput} 
              onChange={(e) => setTimeInput(e.target.value)} 
              placeholder="e.g. 9am, 14:00, 5:30 PM"
              className="w-full bg-[#0B0C15] border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none placeholder-slate-600 text-base"
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            {taskToEdit && (
              <button onClick={() => { onDelete(taskToEdit._id); onClose(); }} className="px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-bold rounded-lg transition-colors">
                <Trash2 size={20} />
              </button>
            )}
            <button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-900/40 uppercase tracking-wider text-sm transition-all transform active:scale-95">
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
    for(let i=0; i<startPad; i++) days.push(<div key={`empty-${i}`} className="h-24 md:h-28 bg-[#0B0C15]/50 border border-slate-800/50"/>);
    for(let d=1; d<=totalDays; d++) {
      const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
      const dateStr = dateObj.toISOString().split('T')[0];
      const dayTasks = tasks.filter(t => t.date && t.date.startsWith(dateStr));
      const isToday = new Date().toISOString().split('T')[0] === dateStr;
      
      days.push(
        <div key={d} 
          data-drop-zone="calendar-day"
          data-drop-value={dateStr}
          onClick={() => { setTimelineDate(dateObj); setViewMode('timeline'); }}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, dateStr)}
          className={`h-24 md:h-28 border border-slate-800 p-1 md:p-2 cursor-pointer hover:bg-[#1a1c29] transition-colors bg-[#151621] relative group overflow-hidden ${isToday ? 'bg-indigo-900/10' : ''}`}
        >
          <div className={`text-xs md:text-sm font-bold mb-1 md:mb-2 flex justify-between ${isToday ? 'text-indigo-400' : 'text-slate-400'}`}>
            {d} {isToday && <span className="text-[9px] bg-indigo-500 text-white px-1.5 py-0.5 rounded hidden md:inline">TODAY</span>}
          </div>
          <div className="space-y-1 overflow-y-auto max-h-[50px] md:max-h-[70px] no-scrollbar">
             {dayTasks.map(t => (
               <div 
                key={t._id} 
                draggable
                onDragStart={(e) => { e.stopPropagation(); onDragStart(e, t._id); }}
                onTouchStart={(e) => onTouchStart(e, t._id)}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onDoubleClick={(e) => { e.stopPropagation(); onEditTask(t); }}
                className="text-[9px] md:text-[10px] bg-[#232536] text-slate-300 px-1 py-0.5 md:py-1 rounded truncate border-l-2 border-indigo-500/50 cursor-grab active:cursor-grabbing select-none"
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
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
             {viewMode === 'month' 
               ? currentDate.toLocaleString('default', { month: 'short', year: 'numeric' })
               : timelineDate.toDateString()
             }
           </h2>
           <div className="flex bg-[#151621] rounded-lg p-1 border border-slate-800">
             <button onClick={() => setViewMode('month')} className={`p-2 rounded ${viewMode === 'month' ? 'bg-[#232536] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><Layout size={16}/></button>
             <button onClick={() => setViewMode('timeline')} className={`p-2 rounded ${viewMode === 'timeline' ? 'bg-[#232536] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><AlignJustify size={16}/></button>
           </div>
        </div>
        <div className="flex gap-2">
          {viewMode === 'month' ? (
             <>
               <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth()-1)))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 border border-slate-800"><ChevronLeft size={20}/></button>
               <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth()+1)))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 border border-slate-800"><ChevronRight size={20}/></button>
             </>
          ) : (
             <>
               <button onClick={() => setTimelineDate(new Date(timelineDate.setDate(timelineDate.getDate()-1)))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 border border-slate-800"><ChevronLeft size={20}/></button>
               <button onClick={() => setTimelineDate(new Date(timelineDate.setDate(timelineDate.getDate()+1)))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 border border-slate-800"><ChevronRight size={20}/></button>
             </>
          )}
          <button onClick={() => setSelectedDate(viewMode === 'month' ? new Date() : timelineDate)} className="ml-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider shadow-lg shadow-indigo-900/30 flex items-center gap-2">
            <Plus size={16}/> <span className="hidden md:inline">Add Task</span>
          </button>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="flex-1 bg-[#151621] rounded-2xl shadow-xl border border-slate-800/50 overflow-hidden flex flex-col">
          <div className="grid grid-cols-7 text-center border-b border-slate-800 bg-[#0B0C15] text-[10px] font-bold uppercase tracking-widest text-slate-500 py-3">
            {['S','M','T','W','T','F','S'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 flex-1 overflow-y-auto custom-scrollbar no-scrollbar">{renderMonth()}</div>
        </div>
      ) : (
        <Timeline 
          tasks={tasks} 
          date={timelineDate} 
          onUpdateTaskTime={updateTaskTime} 
          onEditTask={onEditTask} 
          onDeleteTask={deleteTask}
        />
      )}

      {selectedDate && (
        <TaskModal 
          date={selectedDate} 
          onClose={() => setSelectedDate(null)} 
          onAdd={(t) => { addTask(t); setSelectedDate(null); }} 
        />
      )}
    </div>
  );
};

export default CalendarView;