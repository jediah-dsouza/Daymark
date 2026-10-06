import { describe, expect, it } from 'vitest';
import { createSampleData } from '../../data/sampleData';
import {
  createProjectRecord,
  updateProjectRecord,
  withArchivedProject,
  withCreatedProject,
  withRemovedProject,
  withUpdatedProject,
} from './mutations';
import type { ProjectFormFields } from './validation';

const now = new Date('2026-10-02T12:00:00.000Z');
const fields: ProjectFormFields = {
  name: 'Research Notes',
  description: 'A focused reading list.',
  colorToken: 'slate',
};

describe('project mutations', () => {
  it('creates a project record and project-created activity', () => {
    const created = createProjectRecord(fields, now, 'project-new', 'activity-new');
    expect(created.project).toEqual({
      ...fields,
      id: 'project-new',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      archived: false,
    });
    expect(created.activity).toMatchObject({
      id: 'activity-new',
      type: 'project-created',
      entityId: 'project-new',
      message: 'Created Research Notes',
    });
    const data = withCreatedProject(createSampleData(now), created.project, created.activity);
    expect(data.projects[0]).toEqual(created.project);
    expect(data.activity[0]).toEqual(created.activity);
  });

  it('updates editable fields and records an update event', () => {
    const project = createSampleData(now).projects[0]!;
    const updated = updateProjectRecord(project, fields, now, 'activity-edit');
    expect(updated.project).toMatchObject({
      ...fields,
      id: project.id,
      archived: false,
      updatedAt: now.toISOString(),
    });
    expect(updated.activity).toMatchObject({
      type: 'project-updated',
      message: 'Updated Research Notes',
    });
    expect(
      withUpdatedProject(createSampleData(now), updated.project, updated.activity).projects.find(
        (item) => item.id === project.id,
      ),
    ).toEqual(updated.project);
  });

  it('archives and restores a project without changing task assignment', () => {
    const data = createSampleData(now);
    const task = data.tasks.find((item) => item.projectId === 'project-portfolio')!;
    const archived = withArchivedProject(data, 'project-portfolio', true, now, 'activity-archive');
    expect(archived.projects.find((item) => item.id === 'project-portfolio')?.archived).toBe(true);
    expect(archived.tasks.find((item) => item.id === task.id)?.projectId).toBe('project-portfolio');
    expect(archived.activity[0]).toMatchObject({ message: 'Archived Portfolio Refresh' });
    const restored = withArchivedProject(
      archived,
      'project-portfolio',
      false,
      now,
      'activity-restore',
    );
    expect(restored.projects.find((item) => item.id === 'project-portfolio')?.archived).toBe(false);
    expect(restored.activity[0]).toMatchObject({ message: 'Restored Portfolio Refresh' });
    expect(withArchivedProject(restored, 'project-portfolio', false, now)).toBe(restored);
  });

  it('deletes only the project, preserves and unassigns all its tasks, and records each change', () => {
    const data = createSampleData(now);
    const originalTasks = data.tasks.filter((item) => item.projectId === 'project-internship');
    const result = withRemovedProject(data, 'project-internship', now, 'activity-delete-project');
    expect(result.removed?.name).toBe('Internship Deliverables');
    expect(result.unassignedCount).toBe(originalTasks.length);
    expect(result.data.projects.some((item) => item.id === 'project-internship')).toBe(false);
    for (const original of originalTasks) {
      const updated = result.data.tasks.find((item) => item.id === original.id)!;
      expect(updated).toEqual({ ...original, projectId: null, updatedAt: now.toISOString() });
      expect(
        result.data.activity.some(
          (event) =>
            event.entityId === original.id &&
            event.message === 'Unassigned from Internship Deliverables',
        ),
      ).toBe(true);
    }
    expect(result.data.activity[0]).toMatchObject({
      id: 'activity-delete-project',
      message: `Removed Internship Deliverables; kept ${originalTasks.length} tasks unassigned`,
    });
    expect(result.data.tasks).toHaveLength(data.tasks.length);
  });
});
