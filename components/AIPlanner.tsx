import React, { useState } from 'react';
import { X, BrainCircuit, CheckCircle2, ArrowRight } from 'lucide-react';
import { Task } from '../types';
import { smartPlan } from '../services/geminiService';

interface AIPlannerProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

const AIPlanner: React.FC<AIPlannerProps> = ({ isOpen, onClose, tasks }) => {
  const [plan, setPlan] = useState<{ taskId: string; reason: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const activeTasks = tasks.filter(t => !t.completed);

  const handleGeneratePlan = async () => {
    setLoading(true);
    const result = await smartPlan(activeTasks);
    setPlan(result);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      
      {/* Sidebar */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>

        <div className="mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Smart Planner</h2>
              <p className="text-sm text-slate-500">Optimize your schedule with AI</p>
            </div>
          </div>

          {activeTasks.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <CheckCircle2 size={48} className="mx-auto mb-4 opacity-50" />
              <p>You have no active tasks to plan!</p>
            </div>
          ) : (
            <>
              {!plan.length && !loading && (
                <div className="text-center py-8">
                  <p className="text-slate-600 mb-6">
                    I can analyze your {activeTasks.length} pending tasks to suggest the most effective order based on priority and urgency.
                  </p>
                  <button
                    onClick={handleGeneratePlan}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                  >
                    Generate Plan
                  </button>
                </div>
              )}

              {loading && (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-slate-100 rounded-xl"></div>
                  ))}
                </div>
              )}

              {plan.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-800">Recommended Focus Order</h3>
                  {plan.map((item, idx) => {
                    const task = tasks.find(t => t.id === item.taskId);
                    if (!task) return null;
                    return (
                      <div key={item.taskId} className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                        <div className="flex items-start gap-3">
                            <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                {idx + 1}
                            </span>
                            <div>
                                <h4 className="font-medium text-slate-900">{task.title}</h4>
                                <p className="text-sm text-slate-500 mt-1 flex items-start gap-2">
                                    <ArrowRight size={14} className="mt-0.5 text-indigo-400 shrink-0" />
                                    {item.reason}
                                </p>
                            </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  <button 
                    onClick={() => setPlan([])}
                    className="w-full py-3 text-slate-500 hover:text-indigo-600 text-sm font-medium mt-4"
                  >
                    Reset Plan
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPlanner;
