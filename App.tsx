import React, { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, CheckSquare, BrainCircuit, BellRing } from 'lucide-react';
import { Task, Priority, SubTask, DailyStats } from './types';
import { loadTasks, saveTasks, loadStats, updateStats } from './services/storageService';
import TaskForm from './components/TaskForm';
import TaskItem from './components/TaskItem';
import AIPlanner from './components/AIPlanner';
import DashboardStats from './components/DashboardStats';

// Helper to check notification permissions
const checkNotificationPermission = () => {
  if (!("Notification" in window)) return false;
  return Notification.permission === "granted";
};

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [view, setView] = useState<'list' | 'dashboard'>('list');
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(checkNotificationPermission());

  // Load initial data
  useEffect(() => {
    const loadedTasks = loadTasks();
    setTasks(loadedTasks);
    setStats(loadStats());
  }, []);

  // Save tasks on change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Request Notification Permission
  const requestNotification = useCallback(async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === "granted");
  }, []);

  // Notification checker interval
  useEffect(() => {
    if (!notificationsEnabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      tasks.forEach(task => {
        if (!task.completed && task.dueDate) {
          const due = new Date(task.dueDate);
          const timeDiff = due.getTime() - now.getTime();
          
          // Notify if due within 15 minutes (approx 900000ms) and hasn't been notified yet (simple logic for MVP)
          // For a real app, we'd flag the task as "notified" in state to avoid spam.
          // Here we just check a tight window (e.g., between 14 and 15 mins remaining)
          if (timeDiff > 0 && timeDiff < 60000 * 15 && timeDiff > 60000 * 14) {
             new Notification(`Reminder: ${task.title}`, {
               body: `This task is due in 15 minutes! Priority: ${task.priority}`,
               icon: '/vite.svg' // Fallback icon
             });
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [tasks, notificationsEnabled]);

  const addTask = (title: string, priority: Priority, dueDate: string | null) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      priority,
      dueDate,
      subtasks: [],
      createdAt: Date.now()
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const newCompleted = !t.completed;
        updateStats(newCompleted); // Update daily stats
        setStats(loadStats()); // Reload stats for UI
        return { ...t, completed: newCompleted };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addSubtasks = (taskId: string, newSubtasks: SubTask[]) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, subtasks: [...t.subtasks, ...newSubtasks] } : t
    ));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s)
        };
      }
      return t;
    }));
  };

  const activeTasksCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <CheckSquare size={20} strokeWidth={3} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              MindfulDo
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
             {!notificationsEnabled && (
                 <button onClick={requestNotification} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Enable Notifications">
                     <BellRing size={20} />
                 </button>
             )}
            <button 
              onClick={() => setIsPlannerOpen(true)}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
            >
              <BrainCircuit size={16} />
              <span className="hidden sm:inline">Smart Plan</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        
        {/* View Toggle */}
        <div className="flex gap-4 mb-8">
            <button 
                onClick={() => setView('list')}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${view === 'list' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                My Tasks ({activeTasksCount})
            </button>
            <button 
                onClick={() => setView('dashboard')}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${view === 'dashboard' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Productivity & Insights
            </button>
        </div>

        {view === 'list' ? (
            <>
                <TaskForm onAdd={addTask} />
                <div className="space-y-1">
                    {tasks.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            <p>No tasks yet. Add one to get started!</p>
                        </div>
                    ) : (
                        tasks
                        .sort((a, b) => {
                            if (a.completed === b.completed) return 0;
                            return a.completed ? 1 : -1;
                        })
                        .map(task => (
                            <TaskItem 
                                key={task.id} 
                                task={task} 
                                onToggle={toggleTask} 
                                onDelete={deleteTask}
                                onAddSubtasks={addSubtasks}
                                onToggleSubtask={toggleSubtask}
                            />
                        ))
                    )}
                </div>
            </>
        ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <DashboardStats stats={stats} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-indigo-100 text-sm font-medium mb-1">Total Active</p>
                                <h3 className="text-4xl font-bold">{activeTasksCount}</h3>
                            </div>
                            <div className="p-3 bg-white/10 rounded-xl">
                                <CheckSquare size={24} />
                            </div>
                        </div>
                        <p className="mt-4 text-sm text-indigo-100">
                            {activeTasksCount === 0 ? "All caught up! Great job." : "Tasks waiting for your attention."}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                        <h3 className="font-semibold text-slate-800 mb-2">Completion Rate</h3>
                         <div className="flex items-end gap-2">
                            <span className="text-4xl font-bold text-slate-900">
                                {tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%
                            </span>
                         </div>
                         <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                            <div 
                                className="bg-green-500 h-full rounded-full transition-all duration-1000" 
                                style={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0}%` }}
                            />
                         </div>
                    </div>
                </div>
            </div>
        )}
      </main>
      
      <AIPlanner 
        isOpen={isPlannerOpen} 
        onClose={() => setIsPlannerOpen(false)}
        tasks={tasks}
      />
    </div>
  );
};

export default App;
