export type TaskStatus = 'inbox' | 'todo' | 'in-progress' | 'completed';
export type TaskPriority = 'none' | 'low' | 'medium' | 'high';
export type ThemePreference = 'light' | 'dark' | 'system';
export type DefaultTaskStatus = 'inbox' | 'todo';
export type ProjectColorToken = 'clay' | 'rust' | 'olive' | 'slate';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  projectId: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  colorToken: ProjectColorToken;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export type ActivityType =
  'task-created' | 'task-completed' | 'task-updated' | 'project-created' | 'project-updated';

export interface Activity {
  id: string;
  type: ActivityType;
  entityId: string;
  message: string;
  createdAt: string;
}

export interface Preferences {
  theme: ThemePreference;
  compactMode: boolean;
  reducedMotion: boolean;
  showCompletedToday: boolean;
  defaultTaskStatus: DefaultTaskStatus;
}

export interface AppData {
  tasks: Task[];
  projects: Project[];
  activity: Activity[];
  preferences: Preferences;
}

export type PersistenceStatus = 'available' | 'memory-only';
export type TaskSort = 'dueDate' | 'priority' | 'createdAt' | 'title';

export interface TaskFilters {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  projectId: string | 'all' | 'unassigned';
  sort: TaskSort;
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'system',
  compactMode: false,
  reducedMotion: false,
  showCompletedToday: true,
  defaultTaskStatus: 'inbox',
};
