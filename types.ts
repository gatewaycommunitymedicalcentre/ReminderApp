export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate: string | null; // ISO string
  priority: Priority;
  subtasks: SubTask[];
  createdAt: number;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  completedCount: number;
}
