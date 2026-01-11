import React, { useState } from 'react';
import { Send, Brain, Trash2 } from 'lucide-react';

const BrainDump = ({ dumps, addDump, deleteDump }) => {
  const [text, setText] = useState("");

  const handleAdd = () => {
    if (!text.trim()) return;
    addDump({ text: text, date: new Date().toISOString() });
    setText("");
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in-up pb-20 md:pb-0">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
          <Brain className="text-white" size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Brain Dump</h2>
          <p className="text-sm text-gray-500">Clear your mind, capture every thought</p>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-[#1A1A1A] rounded-2xl shadow-md border border-[#333333] overflow-hidden transition-all hover:border-white/30 p-3">
        <div className="flex items-end gap-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd(); } }}
            placeholder="What's on your mind?"
            className="flex-1 bg-transparent border-none p-2 text-white placeholder-gray-600 focus:outline-none resize-none text-sm min-h-[60px] max-h-[150px]"
            rows="2"
          />
          <button
            onClick={handleAdd}
            disabled={!text.trim()}
            className="p-3 rounded-xl bg-white hover:bg-gray-100 text-black transition-all transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Dumps List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
          {dumps.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 py-16">
              <div className="p-4 bg-white/5 rounded-full mb-3">
                <Brain size={40} strokeWidth={1.5} className="text-gray-700" />
              </div>
              <p className="text-sm font-medium">Your mind is clear</p>
              <p className="text-xs text-gray-700 mt-1">Start dumping your thoughts here</p>
            </div>
          ) : (
            dumps.slice().reverse().map((dump) => (
              <div
                key={dump._id}
                className="bg-[#1A1A1A] rounded-xl p-3.5 border border-[#333333] group hover:border-white/30 hover:shadow-md transition-all card-hover animate-slide-in-left"
              >
                <div className="flex justify-between items-start gap-3">
                  <p className="text-gray-300 text-sm leading-relaxed flex-1 whitespace-pre-wrap">{dump.text}</p>
                  <button
                    onClick={() => deleteDump(dump._id)}
                    className="text-gray-600 hover:text-white transition-colors shrink-0 p-1 hover:bg-white/10 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-1 w-1 rounded-full bg-white"></div>
                  <div className="text-[10px] text-gray-600 font-medium">
                    {new Date(dump.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {new Date(dump.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
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