import React, { useState } from 'react';
import { Check, Trash2, Calendar, ChevronDown, ChevronUp, Sparkles, Loader2 } from 'lucide-react';
import { Task, SubTask, Priority } from '../types';
import { PRIORITY_COLORS } from '../constants';
import { breakdownTask } from '../services/geminiService';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAddSubtasks: (taskId: string, subtasks: SubTask[]) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onToggle, 
  onDelete, 
  onAddSubtasks,
  onToggleSubtask 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBreakingDown, setIsBreakingDown] = useState(false);

  const handleBreakdown = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.subtasks.length > 0 || isBreakingDown) {
        setIsExpanded(!isExpanded);
        return;
    }

    setIsBreakingDown(true);
    setIsExpanded(true);
    
    try {
      const steps = await breakdownTask(task.title);
      const newSubtasks: SubTask[] = steps.map(step => ({
        id: crypto.randomUUID(),
        title: step,
        completed: false
      }));
      onAddSubtasks(task.id, newSubtasks);
    } catch (err) {
      console.error("Failed to breakdown", err);
    } finally {
      setIsBreakingDown(false);
    }
  };

  const formatDate = (isoString: string | null) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <div className={`group bg-white rounded-xl border mb-3 transition-all duration-200 ${
      task.completed ? 'border-slate-100 opacity-60' : 'border-slate-200 hover:border-indigo-200 shadow-sm hover:shadow-md'
    }`}>
      <div className="p-4 flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            task.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-slate-300 hover:border-indigo-500 text-transparent'
          }`}
        >
          <Check size={14} strokeWidth={3} />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-base font-medium truncate pr-2 ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
              {task.title}
            </h4>
            <div className="flex items-center gap-2 shrink-0">
               {/* Priority Badge */}
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${PRIORITY_COLORS[task.priority]}`}>
                {task.priority}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            {task.dueDate && (
              <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500 font-semibold' : 'text-slate-500'}`}>
                <Calendar size={12} />
                {formatDate(task.dueDate)}
              </div>
            )}
            
            {/* AI Breakdown Button */}
            {!task.completed && (
                <button 
                    onClick={handleBreakdown}
                    className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                    {isBreakingDown ? (
                        <>
                         <Loader2 size={12} className="animate-spin" />
                         Thinking...
                        </>
                    ) : (
                        <>
                         <Sparkles size={12} />
                         {task.subtasks.length > 0 ? (isExpanded ? 'Hide Steps' : `Show ${task.subtasks.length} Steps`) : 'Break Down'}
                        </>
                    )}
                </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <button 
          onClick={() => onDelete(task.id)}
          className="text-slate-300 hover:text-red-500 transition-colors p-1"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Subtasks Section */}
      {isExpanded && task.subtasks.length > 0 && (
        <div className="bg-slate-50 border-t border-slate-100 p-3 pl-12 rounded-b-xl animate-in slide-in-from-top-1">
          <div className="space-y-2">
            {task.subtasks.map(sub => (
              <div key={sub.id} className="flex items-center gap-3">
                <button
                  onClick={() => onToggleSubtask(task.id, sub.id)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    sub.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {sub.completed && <Check size={10} />}
                </button>
                <span className={`text-sm ${sub.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  {sub.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;
