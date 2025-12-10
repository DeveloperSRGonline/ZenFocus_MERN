import React, { useState } from 'react';
import { Check, Trash2, Plus, Clock } from 'lucide-react';

const Checklist = ({ items, onAdd, onToggle, onDelete }) => {
    const [newItem, setNewItem] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newItem.trim()) {
            onAdd(newItem);
            setNewItem('');
        }
    };

    const activeItems = items.filter(i => !i.isCompleted);
    const completedItems = items.filter(i => i.isCompleted);

    return (
        <div className="h-full flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Check className="text-emerald-500" /> Quick Tasks
                </h2>
                <p className="text-slate-400 text-sm">
                    Simple checklist. Completed items auto-delete after 10 minutes.
                </p>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="relative mb-8 group">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add a quick task..."
                    className="w-full bg-[#151621] border border-slate-700 rounded-xl py-4 pl-6 pr-14 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-lg placeholder:text-slate-600 shadow-lg"
                />
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors"
                >
                    <Plus size={20} />
                </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-hidden">
                {/* Active List */}
                <div className="bg-[#151621] rounded-2xl p-6 border border-slate-800 flex flex-col shadow-xl">
                    <h3 className="text-slate-300 font-bold mb-4 uppercase tracking-wider text-sm flex items-center justify-between">
                        To Do <span className="bg-slate-800 px-2 py-0.5 rounded-full text-xs">{activeItems.length}</span>
                    </h3>
                    <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {activeItems.map(item => (
                            <div key={item._id} className="group flex items-center gap-3 p-3 bg-[#0B0C15] rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-all animate-in fade-in slide-in-from-left-4 duration-300">
                                <button
                                    onClick={() => onToggle(item._id, true)}
                                    className="h-6 w-6 rounded-full border-2 border-slate-600 hover:border-emerald-500 flex items-center justify-center transition-colors"
                                >
                                </button>
                                <span className="text-slate-300 flex-1 break-words">{item.text}</span>
                                <button
                                    onClick={() => onDelete(item._id)}
                                    className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {activeItems.length === 0 && (
                            <div className="text-center text-slate-600 italic py-10">No pending tasks</div>
                        )}
                    </div>
                </div>

                {/* Completed List */}
                <div className="bg-[#151621]/50 rounded-2xl p-6 border border-slate-800/50 flex flex-col dashed-border">
                    <h3 className="text-slate-400 font-bold mb-4 uppercase tracking-wider text-sm flex items-center justify-between">
                        Completed <span className="flex items-center gap-1 text-[10px] normal-case bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded border border-emerald-900/50"><Clock size={10} /> Auto-clears in 10m</span>
                    </h3>
                    <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {completedItems.map(item => (
                            <div key={item._id} className="group flex items-center gap-3 p-3 bg-[#0B0C15]/50 rounded-xl border border-slate-800/50 opacity-60 hover:opacity-100 transition-all">
                                <button
                                    onClick={() => onToggle(item._id, false)}
                                    className="h-6 w-6 rounded-full bg-emerald-500 border-2 border-emerald-500 flex items-center justify-center text-[#0B0C15]"
                                >
                                    <Check size={14} strokeWidth={4} />
                                </button>
                                <span className="text-slate-400 line-through decoration-slate-600 flex-1 break-words">{item.text}</span>
                                <span className="text-[10px] text-slate-600 font-mono">
                                    {new Date(item.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <button
                                    onClick={() => onDelete(item._id)}
                                    className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {completedItems.length === 0 && (
                            <div className="text-center text-slate-700 italic py-10">Nothing completed yet</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checklist;
