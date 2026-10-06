import type { Activity, AppData, Project, Task, TaskFilters } from '../../types';
import { selectTasks } from '../tasks/selectors';

export interface ProjectSummary {
  totalTasks: number;
  completedTasks: number;
  openTasks: number;
  completionPercent: number;
  lastUpdatedAt: string;
}

export function selectProjects(projects: Project[], archived = false): Project[] {
  return projects
    .filter((project) => project.archived === archived)
    .sort(
      (left, right) =>
        right.updatedAt.localeCompare(left.updatedAt) || left.name.localeCompare(right.name),
    );
}

export function getProjectSummary(
  project: Project,
  tasks: Task[],
  activity: Activity[] = [],
): ProjectSummary {
  const linkedTasks = tasks.filter((task) => task.projectId === project.id);
  const completedTasks = linkedTasks.filter((task) => task.status === 'completed').length;
  const latestTaskUpdate = linkedTasks.reduce(
    (latest, task) => (task.updatedAt > latest ? task.updatedAt : latest),
    project.updatedAt,
  );
  const lastUpdatedAt = activity.reduce(
    (latest, item) =>
      item.entityId === project.id && item.createdAt > latest ? item.createdAt : latest,
    latestTaskUpdate,
  );
  return {
    totalTasks: linkedTasks.length,
    completedTasks,
    openTasks: linkedTasks.length - completedTasks,
    completionPercent:
      linkedTasks.length === 0 ? 0 : Math.round((completedTasks / linkedTasks.length) * 100),
    lastUpdatedAt,
  };
}

export function selectProjectTasks(
  projectId: string,
  tasks: Task[],
  projects: Project[],
  filters: TaskFilters,
): Task[] {
  return selectTasks(
    tasks.filter((task) => task.projectId === projectId),
    projects,
    { ...filters, projectId: 'all' },
  );
}

export function selectProjectActivity(projectId: string, data: AppData, limit = 100): Activity[] {
  const taskIds = new Set(
    data.tasks.filter((task) => task.projectId === projectId).map((task) => task.id),
  );
  return data.activity
    .filter((item) => item.entityId === projectId || taskIds.has(item.entityId))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, limit);
}
