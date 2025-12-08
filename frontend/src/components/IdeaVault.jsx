import React, { useState } from 'react';
import { Lightbulb, Trash2 } from 'lucide-react';

const IdeaVault = ({ ideas, addIdea, deleteIdea }) => {
  const [text, setText] = useState("");

  const handleAdd = () => {
    if (!text.trim()) return;
    addIdea({ text: text, date: new Date().toISOString() });
    setText("");
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-in fade-in zoom-in duration-300 pb-20 md:pb-0">
      <div className="w-full md:w-1/3 bg-[#151621] p-6 rounded-2xl border border-slate-800/50 shadow-xl flex flex-col">
        <div className="mb-6 border-l-4 border-amber-500 pl-3">
          <h2 className="text-xl font-bold text-white">Idea Vault</h2>
          <p className="text-xs text-slate-500">Capture the spark. Save it for later.</p>
        </div>
        
        <div className="flex-1 flex flex-col gap-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd(); }}}
            placeholder="New app idea, business concept, or creative spark..."
            className="flex-1 w-full bg-[#0B0C15] border border-slate-700 rounded-lg p-4 text-sm text-white focus:border-amber-500 focus:outline-none resize-none placeholder-slate-600 custom-scrollbar no-scrollbar leading-relaxed"
          />
          <button 
            onClick={handleAdd}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-lg shadow-amber-900/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wider text-sm flex items-center justify-center gap-2"
          >
            <Lightbulb size={16} /> Save Idea
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#151621] p-6 rounded-2xl border border-slate-800/50 shadow-xl flex flex-col overflow-hidden">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Saved Ideas</h3>
        <div className="flex-1 overflow-y-auto custom-scrollbar no-scrollbar space-y-3">
          {ideas.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
              <Lightbulb size={64} strokeWidth={1} className="mb-4"/>
              <p className="text-sm">No ideas saved yet.</p>
            </div>
          ) : (
            ideas.slice().map((idea) => (
              <div key={idea._id} className="bg-[#0B0C15] p-4 rounded-xl border border-slate-800 group hover:border-amber-500/30 transition-all">
                <div className="flex justify-between items-start gap-4">
                  <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed font-medium">{idea.text}</p>
                  <button 
                    onClick={() => deleteIdea(idea._id)}
                    className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="text-[10px] text-slate-600 mt-2 font-mono text-right">
                  {new Date(idea.date).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default IdeaVault;