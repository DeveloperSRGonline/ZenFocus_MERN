import React, { useState } from 'react';
import { CornerDownLeft, Brain, Trash2 } from 'lucide-react';

const BrainDump = ({ dumps, addDump, deleteDump }) => {
  const [text, setText] = useState("");

  const handleAdd = () => {
    if (!text.trim()) return;
    addDump({ text: text, date: new Date().toISOString() });
    setText("");
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-in fade-in zoom-in duration-300 pb-20 md:pb-0">
      <div className="w-full md:w-1/3 bg-[#151621] p-6 rounded-2xl border border-slate-800/50 shadow-xl flex flex-col">
        <div className="mb-6 border-l-4 border-emerald-500 pl-3">
          <h2 className="text-xl font-bold text-white">Brain Dump</h2>
          <p className="text-xs text-slate-500">Unload your mind. Write it down.</p>
        </div>
        
        <div className="flex-1 flex flex-col gap-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd(); }}}
            placeholder="What's bothering you? What's on your mind?..."
            className="flex-1 w-full bg-[#0B0C15] border border-slate-700 rounded-lg p-4 text-sm text-white focus:border-emerald-500 focus:outline-none resize-none placeholder-slate-600 custom-scrollbar no-scrollbar leading-relaxed"
          />
          <button 
            onClick={handleAdd}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-900/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wider text-sm flex items-center justify-center gap-2"
          >
            <CornerDownLeft size={16} /> Dump It
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#151621] p-6 rounded-2xl border border-slate-800/50 shadow-xl flex flex-col overflow-hidden">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Thoughts Log</h3>
        <div className="flex-1 overflow-y-auto custom-scrollbar no-scrollbar space-y-3">
          {dumps.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
              <Brain size={64} strokeWidth={1} className="mb-4"/>
              <p className="text-sm">Your mind is clear.</p>
            </div>
          ) : (
            dumps.slice().map((dump) => (
              <div key={dump._id} className="bg-[#0B0C15] p-4 rounded-xl border border-slate-800 group hover:border-emerald-500/30 transition-all">
                <div className="flex justify-between items-start gap-4">
                  <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">{dump.text}</p>
                  <button 
                    onClick={() => deleteDump(dump._id)}
                    className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="text-[10px] text-slate-600 mt-2 font-mono text-right">
                  {new Date(dump.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {new Date(dump.date).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BrainDump;