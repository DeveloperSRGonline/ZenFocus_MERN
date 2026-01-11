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
        <div className="h-full flex flex-col pb-20 md:pb-8 animate-fade-in-up">
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
                        <Check className="text-white" size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Quick Tasks</h2>
                        <p className="text-sm text-gray-500">
                            Completed items auto-delete after 10 minutes
                        </p>
                    </div>
                </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="mb-6 group flex gap-3">
                <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add a quick task..."
                    className="flex-1 bg-[#1A1A1A] border border-[#333333] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-white/50 focus:ring-2 focus:ring-white/10 transition-all placeholder:text-gray-600 shadow-sm"
                />
                <button
                    type="submit"
                    className="p-3 bg-white hover:bg-gray-100 rounded-xl text-black transition-all shadow-md shrink-0 active:scale-95"
                >
                    <Plus size={20} />
                </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
                {/* Active List */}
                <div className="bg-[#1A1A1A] rounded-2xl p-5 border border-[#333333] flex flex-col shadow-md card-hover">
                    <h3 className="text-gray-400 font-bold mb-4 uppercase tracking-wider text-sm flex items-center justify-between">
                        To Do <span className="bg-white/10 text-white px-2.5 py-0.5 rounded-full text-xs font-semibold">{activeItems.length}</span>
                    </h3>
                    <div className="space-y-2.5 flex-1 overflow-y-auto pr-1 custom-scrollbar max-h-[500px]">
                        {activeItems.map(item => (
                            <div key={item._id} className="group flex items-center gap-3 p-3 bg-[#0A0A0A] rounded-xl border border-[#333333] hover:border-white/30 hover:bg-[#151515] transition-all animate-slide-in-left">
                                <button
                                    onClick={() => onToggle(item._id, true)}
                                    className="h-5 w-5 rounded-full border-2 border-gray-600 hover:border-white flex items-center justify-center transition-colors shrink-0"
                                >
                                </button>
                                <span className="text-gray-300 flex-1 break-words text-sm">{item.text}</span>
                                <button
                                    onClick={() => onDelete(item._id)}
                                    className="text-gray-600 hover:text-white transition-all shrink-0 p-1 hover:bg-white/10 rounded"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        {activeItems.length === 0 && (
                            <div className="text-center text-gray-600 py-12">
                                <div className="text-sm font-medium">No pending tasks</div>
                                <div className="text-xs text-gray-700 mt-1">Add a task to get started</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Completed List */}
                <div className="bg-[#0A0A0A] rounded-2xl p-5 border-2 border-dashed border-[#333333] flex flex-col">
                    <h3 className="text-gray-500 font-bold mb-4 uppercase tracking-wider text-sm flex items-center justify-between">
                        Completed <span className="flex items-center gap-1 text-[10px] normal-case bg-white/5 text-gray-400 px-2 py-1 rounded-md border border-white/10 font-semibold"><Clock size={10} /> Auto-clears in 10m</span>
                    </h3>
                    <div className="space-y-2.5 flex-1 overflow-y-auto pr-1 custom-scrollbar max-h-[500px]">
                        {completedItems.map(item => (
                            <div key={item._id} className="group flex items-center gap-3 p-3 bg-[#1A1A1A] rounded-xl border border-[#333333] hover:bg-[#151515] hover:shadow-sm transition-all">
                                <button
                                    onClick={() => onToggle(item._id, false)}
                                    className="h-5 w-5 rounded-full bg-white border-2 border-white flex items-center justify-center text-black hover:bg-gray-200 transition-colors shrink-0"
                                >
                                    <Check size={12} strokeWidth={3} />
                                </button>
                                <span className="text-gray-600 line-through decoration-gray-700 flex-1 break-words text-sm">{item.text}</span>
                                <span className="text-[10px] text-gray-700 font-medium">
                                    {new Date(item.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <button
                                    onClick={() => onDelete(item._id)}
                                    className="text-gray-700 hover:text-white opacity-0 group-hover:opacity-100 transition-all shrink-0 p-1 hover:bg-white/10 rounded"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        {completedItems.length === 0 && (
                            <div className="text-center text-gray-700 py-12">
                                <div className="text-sm font-medium">Nothing completed yet</div>
                                <div className="text-xs text-gray-800 mt-1">Complete tasks to see them here</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checklist;
