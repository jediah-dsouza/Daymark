import type { Activity, AppData, Project } from '../../types';
import type { ProjectFormFields } from './validation';

function makeId(kind: 'project' | 'activity'): string {
  const token =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${kind}-${token}`;
}

function activityEvent(
  entityId: string,
  message: string,
  createdAt: string,
  id = makeId('activity'),
): Activity {
  return { id, type: 'project-updated', entityId, message, createdAt };
}

export function createProjectRecord(
  fields: ProjectFormFields,
  now = new Date(),
  id = makeId('project'),
  activityId = makeId('activity'),
): { project: Project; activity: Activity } {
  const timestamp = now.toISOString();
  const project: Project = {
    ...fields,
    id,
    createdAt: timestamp,
    updatedAt: timestamp,
    archived: false,
  };
  return {
    project,
    activity: {
      ...activityEvent(project.id, `Created ${project.name}`, timestamp, activityId),
      type: 'project-created',
    },
  };
}

export function updateProjectRecord(
  current: Project,
  fields: ProjectFormFields,
  now = new Date(),
  activityId = makeId('activity'),
): { project: Project; activity: Activity } {
  const timestamp = now.toISOString();
  const project = { ...current, ...fields, updatedAt: timestamp };
  return {
    project,
    activity: activityEvent(project.id, `Updated ${project.name}`, timestamp, activityId),
  };
}

export function withCreatedProject(data: AppData, project: Project, activity: Activity): AppData {
  return {
    ...data,
    projects: [project, ...data.projects],
    activity: [activity, ...data.activity].slice(0, 100),
  };
}

export function withUpdatedProject(data: AppData, project: Project, activity: Activity): AppData {
  return {
    ...data,
    projects: data.projects.map((item) => (item.id === project.id ? project : item)),
    activity: [activity, ...data.activity].slice(0, 100),
  };
}

export function withArchivedProject(
  data: AppData,
  projectId: string,
  archived: boolean,
  now = new Date(),
  activityId = makeId('activity'),
): AppData {
  const current = data.projects.find((item) => item.id === projectId);
  if (!current || current.archived === archived) return data;
  const timestamp = now.toISOString();
  const project = { ...current, archived, updatedAt: timestamp };
  const activity = activityEvent(
    project.id,
    archived ? `Archived ${project.name}` : `Restored ${project.name}`,
    timestamp,
    activityId,
  );
  return withUpdatedProject(data, project, activity);
}

export function withRemovedProject(
  data: AppData,
  projectId: string,
  now = new Date(),
  activityId = makeId('activity'),
): { data: AppData; removed: Project | null; unassignedCount: number } {
  const project = data.projects.find((item) => item.id === projectId);
  if (!project) return { data, removed: null, unassignedCount: 0 };

  const timestamp = now.toISOString();
  const affectedTasks = data.tasks.filter((task) => task.projectId === projectId);
  const taskUpdates: Activity[] = affectedTasks.map((task) => ({
    id: makeId('activity'),
    type: 'task-updated',
    entityId: task.id,
    message: `Unassigned from ${project.name}`,
    createdAt: timestamp,
  }));
  const projectActivity = activityEvent(
    project.id,
    `Removed ${project.name}; kept ${affectedTasks.length} task${affectedTasks.length === 1 ? '' : 's'} unassigned`,
    timestamp,
    activityId,
  );

  return {
    data: {
      ...data,
      projects: data.projects.filter((item) => item.id !== projectId),
      tasks: data.tasks.map((task) =>
        task.projectId === projectId ? { ...task, projectId: null, updatedAt: timestamp } : task,
      ),
      activity: [projectActivity, ...taskUpdates, ...data.activity].slice(0, 100),
    },
    removed: project,
    unassignedCount: affectedTasks.length,
  };
}
