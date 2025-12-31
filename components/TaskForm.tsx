import React, { useState } from 'react';
import { Plus, Wand2, Loader2 } from 'lucide-react';
import { Priority } from '../types';
import { suggestPriority } from '../services/geminiService';

interface TaskFormProps {
  onAdd: (title: string, priority: Priority, dueDate: string | null) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    // Format date properly to ISO string if exists
    let formattedDate: string | null = null;
    if (dueDate) {
        formattedDate = new Date(dueDate).toISOString();
    }

    onAdd(title, priority, formattedDate);
    setTitle('');
    setDueDate('');
    setPriority(Priority.MEDIUM);
    setShowOptions(false);
  };

  const handleMagicPriority = async () => {
    if (!title.trim()) return;
    setIsAnalyzing(true);
    const suggested = await suggestPriority(title, dueDate || null);
    setPriority(suggested);
    setIsAnalyzing(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 mb-6 transition-all">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setShowOptions(true)}
            placeholder="Add a new task..."
            className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 outline-none text-lg"
          />
          <button
            type="submit"
            disabled={!title.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition-colors disabled:opacity-50"
          >
            <Plus size={24} />
          </button>
        </div>

        {showOptions && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-4 items-center animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500 uppercase">Due Date</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-sm bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-600 outline-none focus:border-indigo-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500 uppercase flex items-center gap-2">
                Priority
                <button
                  type="button"
                  onClick={handleMagicPriority}
                  disabled={isAnalyzing || !title}
                  className="text-indigo-500 hover:text-indigo-700 disabled:opacity-30"
                  title="Ask AI to suggest priority"
                >
                  {isAnalyzing ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                </button>
              </label>
              <div className="flex gap-2">
                {(Object.values(Priority) as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      priority === p
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default TaskForm;
