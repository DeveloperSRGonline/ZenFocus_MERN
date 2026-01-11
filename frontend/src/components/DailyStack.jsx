import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { calculateDuration } from '../utils/helpers';

const DailyStack = ({ logs, addLog }) => {
  const [taskName, setTaskName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const totalHours = logs.reduce((acc, log) => acc + log.duration, 0);

  const handleAdd = () => {
    if (!taskName || !start || !end) return;
    const duration = calculateDuration(start, end);
    addLog({
      taskName,
      start,
      end,
      duration,
      date: new Date().toISOString()
    });
    setTaskName("");
    setStart("");
    setEnd("");
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 h-full animate-in fade-in zoom-in duration-300 pb-20 md:pb-0 overflow-hidden">
      <div className="w-full md:w-1/3 bg-[#1A1A1A] p-4 md:p-6 rounded-2xl border border-[#333333] shadow-xl flex flex-col overflow-y-auto shrink-0 max-h-[60%] md:max-h-full">
        <div className="mb-6 border-l-4 border-indigo-600 pl-3">
          <h2 className="text-xl font-bold text-white">Add New Task</h2>
          <p className="text-xs text-gray-500">Log your work to the stack</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Task Name</label>
            <input
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              placeholder="e.g., Frontend Study"
              className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl p-3 text-sm text-white focus:border-white/50 focus:outline-none placeholder-gray-600 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Start Time</label>
              <input
                type="text"
                value={start}
                onChange={e => setStart(e.target.value)}
                placeholder="9:00 AM"
                className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl p-3 text-sm text-white focus:border-white/50 focus:outline-none placeholder-gray-600 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">End Time</label>
              <input
                type="text"
                value={end}
                onChange={e => setEnd(e.target.value)}
                placeholder="5:00 PM"
                className="w-full bg-[#0A0A0A] border border-[#333333] rounded-xl p-3 text-sm text-white focus:border-white/50 focus:outline-none placeholder-gray-600 transition-colors"
              />
            </div>
          </div>

          <div className="text-[10px] text-gray-500 text-center font-mono py-1">Format: "9am", "14:00", "5:30 PM"</div>

          <button
            onClick={handleAdd}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wider text-sm mt-2"
          >
            + Add To Stack
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#1A1A1A] p-4 md:p-6 rounded-2xl border border-[#333333] shadow-xl flex flex-col relative overflow-hidden min-h-0">
        <div className="flex justify-between items-end mb-6 border-b border-[#333333] pb-4">
          <h2 className="text-xl font-bold text-white">Completed Tasks</h2>
          <div className="text-right">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Hours Today</div>
            <div className="text-2xl font-bold text-indigo-400 font-mono">{totalHours.toFixed(1)}h</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar no-scrollbar space-y-2">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-600">
              <Zap size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">No tasks logged yet.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log._id} className="bg-[#0A0A0A] p-4 rounded-xl border border-[#333333] flex justify-between items-center group hover:border-white/30 transition-colors">
                <div>
                  <div className="font-bold text-white">{log.taskName}</div>
                  <div className="text-xs text-gray-500 font-mono mt-1">{log.start} - {log.end}</div>
                </div>
                <div className="text-white font-mono font-bold text-sm bg-gray-800/50 px-2 py-1 rounded">
                  {log.duration.toFixed(1)}h
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyStack;