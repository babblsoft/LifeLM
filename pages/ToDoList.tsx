import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, CheckSquare, Square, Clock, Bell, Repeat, ChevronDown, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const ToDoListPage = () => {
    const { toDos, addToDo, toggleToDo, deleteToDo } = useApp();
    const [inputValue, setInputValue] = useState('');
    const [showOptions, setShowOptions] = useState(false);
    const [reminderTime, setReminderTime] = useState('');
    const [reminderFrequency, setReminderFrequency] = useState<number>(0);

    const handleAdd = () => {
        if (!inputValue.trim()) return;
        
        addToDo(
            inputValue, 
            reminderTime || undefined, 
            reminderFrequency > 0 ? reminderFrequency : undefined
        );
        
        setInputValue('');
        setReminderTime('');
        setReminderFrequency(0);
        setShowOptions(false);
    };

    return (
        <div className="h-full bg-cream pt-12 pb-24 px-6 flex flex-col">
            <h1 className="text-3xl font-serif font-bold text-charcoal mb-2">To-Do List</h1>
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-8">Quick Tasks & Reminders</p>

            {/* Input Section */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 transition-all">
                <div className="flex space-x-2 mb-3">
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Add a new task..." 
                        className="flex-1 bg-softGray rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-terra/20 transition-all text-charcoal"
                    />
                    <button 
                        onClick={handleAdd}
                        className="bg-terra text-white px-4 rounded-xl shadow-md hover:bg-opacity-90 flex items-center justify-center"
                    >
                        <Plus size={24} />
                    </button>
                </div>
                
                {/* Expandable Options */}
                <div className="space-y-3">
                    <button 
                        onClick={() => setShowOptions(!showOptions)}
                        className="flex items-center text-xs font-bold text-gray-400 hover:text-terra transition-colors"
                    >
                        <Bell size={14} className="mr-1" />
                        {showOptions ? 'Hide Reminder Options' : 'Set Notification & Repeat'}
                        <ChevronDown size={14} className={`ml-1 transform transition-transform ${showOptions ? 'rotate-180' : ''}`} />
                    </button>

                    {showOptions && (
                        <div className="grid grid-cols-2 gap-3 pt-2 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Start Time</label>
                                <input 
                                    type="datetime-local" 
                                    value={reminderTime}
                                    onChange={(e) => setReminderTime(e.target.value)}
                                    className="w-full bg-softGray rounded-lg p-2 text-xs text-charcoal focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Remind Me Every</label>
                                <select 
                                    value={reminderFrequency} 
                                    onChange={(e) => setReminderFrequency(Number(e.target.value))}
                                    className="w-full bg-softGray rounded-lg p-2 text-xs text-charcoal focus:outline-none appearance-none cursor-pointer"
                                >
                                    <option value={0}>Once (No Repeat)</option>
                                    <option value={10}>10 minutes</option>
                                    <option value={30}>30 minutes</option>
                                    <option value={60}>1 hour</option>
                                    <option value={180}>3 hours</option>
                                    <option value={1440}>Daily (24h)</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pb-safe no-scrollbar">
                {toDos.map(todo => (
                    <div 
                        key={todo.id} 
                        className={`p-4 rounded-xl flex flex-col space-y-2 border transition-all group ${
                            todo.completed 
                            ? 'bg-gray-50 border-gray-100 opacity-60' 
                            : 'bg-white border-gray-100 shadow-sm'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div 
                                className="flex items-center space-x-4 cursor-pointer flex-1"
                                onClick={() => toggleToDo(todo.id)}
                            >
                                <div className={todo.completed ? 'text-terra' : 'text-gray-300'}>
                                    {todo.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                                </div>
                                <span className={`flex-1 font-medium ${todo.completed ? 'line-through text-gray-400' : 'text-charcoal'}`}>
                                    {todo.text}
                                </span>
                            </div>
                            <button 
                                onClick={() => deleteToDo(todo.id)}
                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        {/* Metadata Row */}
                        {!todo.completed && (todo.reminderTime || todo.reminderFrequency) && (
                            <div className="flex items-center space-x-3 pl-9">
                                {todo.reminderTime && (
                                    <div className="flex items-center text-[10px] text-terra font-bold bg-terra/5 px-2 py-1 rounded-md">
                                        <Clock size={10} className="mr-1" />
                                        {format(parseISO(todo.reminderTime), 'MMM d, h:mm a')}
                                    </div>
                                )}
                                {todo.reminderFrequency ? (
                                    <div className="flex items-center text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                        <Repeat size={10} className="mr-1" />
                                        Every {todo.reminderFrequency}m
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                ))}
                {toDos.length === 0 && (
                    <div className="text-center text-gray-400 mt-12">
                        <p>No tasks yet.</p>
                        <p className="text-xs mt-2">Add a task to set a reminder.</p>
                    </div>
                )}
            </div>
        </div>
    );
};