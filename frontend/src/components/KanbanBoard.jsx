import React, { useState, useEffect, useRef } from 'react';
import { Clock, Trash2, Plus, MoreVertical } from 'lucide-react';
import { useMobileDrag } from '../utils/helpers';

const KanbanBoard = ({ tasks, updateTaskStatus, deleteTask, onAdd }) => {
    const columns = [
        { id: 'Queue', label: 'Queue', color: 'border-[#333333]' },
        { id: 'inprogress', label: 'In Progress', color: 'border-[#444444]' },
        { id: 'done', label: 'Done', color: 'border-[#555555]' }
    ];

    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const onDragStart = (e, taskId) => e.dataTransfer.setData("taskId", taskId);

    const handleMoveTask = (taskId, newStatus) => {
        updateTaskStatus(taskId, newStatus);
        setOpenMenuId(null);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex flex-row flex-1 overflow-x-auto gap-4 md:gap-6 h-full pb-20 md:pb-2 snap-x snap-mandatory px-4 md:px-0">
                {columns.map(col => (
                    <div key={col.id}
                        data-drop-zone="kanban-col"
                        data-drop-value={col.id}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => updateTaskStatus(e.dataTransfer.getData("taskId"), col.id)}
                        className={`flex-1 min-w-[85vw] md:min-w-[350px] rounded-2xl flex flex-col h-full bg-[#1A1A1A] border ${col.color} shadow-lg shrink-0 snap-center`}>

                        {/* Header */}
                        <div className="p-4 font-bold text-white flex justify-between items-center border-b border-[#333333] bg-[#0A0A0A] rounded-t-2xl sticky top-0 z-10">
                            <div className="flex items-center gap-2">
                                {col.label}
                                <span className="bg-[#1A1A1A] text-xs px-2 py-1 rounded text-gray-400 border border-[#333333]">{tasks.filter(t => t.status === col.id).length}</span>
                            </div>
                            {/* Plus button for Queue */}
                            {col.id === 'Queue' && onAdd && (
                                <button onClick={onAdd} className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-md active:scale-95">
                                    <Plus size={16} />
                                </button>
                            )}
                        </div>

                        {/* Task List */}
                        <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar no-scrollbar relative">
                            {tasks.filter(t => t.status === col.id).map(task => (
                                <div key={task._id}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, task._id)}
                                    className="bg-[#0A0A0A] p-4 rounded-xl shadow-sm border border-[#333333] cursor-grab active:cursor-grabbing hover:border-indigo-500/50 group relative text-gray-300 transition-all hover:translate-y-[-2px] select-none card-hover"
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="font-medium text-white flex-1 break-words">{task.title}</div>

                                        {/* Mobile Menu Button */}
                                        <div className="relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === task._id ? null : task._id);
                                                }}
                                                className="p-1 text-gray-500 hover:text-white rounded hover:bg-[#333333] transition-colors"
                                            >
                                                <MoreVertical size={16} />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {openMenuId === task._id && (
                                                <div ref={menuRef} className="absolute right-0 top-full mt-1 w-40 bg-[#1A1A1A] border border-[#444444] rounded-lg shadow-xl z-50 overflow-hidden text-sm animate-in fade-in zoom-in duration-100">
                                                    {columns.map(targetCol => (
                                                        targetCol.id !== col.id && (
                                                            <button
                                                                key={targetCol.id}
                                                                onClick={() => handleMoveTask(task._id, targetCol.id)}
                                                                className="w-full text-left px-4 py-2 text-gray-300 hover:bg-[#333333] hover:text-white border-b border-[#333333] last:border-0"
                                                            >
                                                                Move to {targetCol.id === 'Queue' ? 'Todo' : targetCol.label}
                                                            </button>
                                                        )
                                                    ))}
                                                    <button
                                                        onClick={() => { deleteTask(task._id); }}
                                                        className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-500/10 font-bold"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {task.time && <div className="text-xs text-gray-500 mt-2 flex items-center gap-1 font-mono"><Clock size={12} />{task.time}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KanbanBoard;