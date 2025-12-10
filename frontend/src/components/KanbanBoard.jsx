import React from 'react';
import { Clock, Trash2 } from 'lucide-react';
import { useMobileDrag } from '../utils/helpers';

const KanbanBoard = ({ tasks, updateTaskStatus, deleteTask }) => {
    const columns = [
        { id: 'todo', label: 'To Do', color: 'border-slate-700' },
        { id: 'inprogress', label: 'In Progress', color: 'border-indigo-900/50' },
        { id: 'done', label: 'Done', color: 'border-emerald-900/50' }
    ];

    const { onTouchStart, onTouchMove, onTouchEnd } = useMobileDrag((taskId, dropValue, dropZone) => {
        if (dropZone === 'kanban-col') {
            updateTaskStatus(taskId, dropValue);
        }
    });

    const onDragStart = (e, taskId) => e.dataTransfer.setData("taskId", taskId);

    return (
        <div className="flex flex-row flex-1 overflow-x-auto gap-4 md:gap-6 h-full pb-20 md:pb-2 snap-x snap-mandatory px-4 md:px-0">
            {columns.map(col => (
                <div key={col.id}
                    data-drop-zone="kanban-col"
                    data-drop-value={col.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => updateTaskStatus(e.dataTransfer.getData("taskId"), col.id)}
                    className={`flex-1 min-w-[85vw] md:min-w-[350px] rounded-2xl flex flex-col h-full bg-[#151621] border ${col.color} shadow-lg shrink-0 snap-center`}>
                    <div className="p-4 font-bold text-slate-300 flex justify-between items-center border-b border-slate-800 bg-[#1a1c29] rounded-t-2xl">
                        {col.label} <span className="bg-[#0B0C15] text-xs px-2 py-1 rounded text-slate-500 border border-slate-800">{tasks.filter(t => t.status === col.id).length}</span>
                    </div>
                    <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar no-scrollbar">
                        {tasks.filter(t => t.status === col.id).map(task => (
                            <div key={task._id} draggable onDragStart={(e) => onDragStart(e, task._id)}
                                onTouchStart={(e) => onTouchStart(e, task._id)}
                                onTouchMove={onTouchMove}
                                onTouchEnd={onTouchEnd}
                                className="bg-[#0B0C15] p-4 rounded-xl shadow-sm border border-slate-800 cursor-grab active:cursor-grabbing hover:border-indigo-500/50 group relative text-slate-200 transition-all hover:translate-y-[-2px] select-none"
                            >
                                <div className="font-medium pr-6">{task.title}</div>
                                {task.time && <div className="text-xs text-slate-500 mt-3 flex items-center gap-1 font-mono"><Clock size={12} />{task.time}</div>}
                                <button onClick={() => deleteTask(task._id)} className="absolute top-4 right-4 opacity-100 md:opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-opacity"><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KanbanBoard;