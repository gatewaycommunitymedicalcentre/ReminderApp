import { Task, DailyStats } from '../types';
import { LOCAL_STORAGE_KEY, STATS_STORAGE_KEY } from '../constants';

export const loadTasks = (): Task[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("Failed to load tasks", e);
    return [];
  }
};

export const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
};

export const loadStats = (): DailyStats[] => {
  try {
    const saved = localStorage.getItem(STATS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

export const updateStats = (completed: boolean) => {
  const stats = loadStats();
  const today = new Date().toISOString().split('T')[0];
  const existingIndex = stats.findIndex(s => s.date === today);

  if (completed) {
    if (existingIndex >= 0) {
      stats[existingIndex].completedCount += 1;
    } else {
      stats.push({ date: today, completedCount: 1 });
    }
  } else {
    // If unchecking a task, technically we should decrease, 
    // but for simplicity in this demo we usually track "done" events or keep it simple.
    // Let's decrement if > 0 to be accurate to current state.
    if (existingIndex >= 0 && stats[existingIndex].completedCount > 0) {
      stats[existingIndex].completedCount -= 1;
    }
  }
  
  // Keep only last 7 days
  const recentStats = stats.slice(-7);
  localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(recentStats));
};
