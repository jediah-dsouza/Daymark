import { createSampleData } from '../../data/sampleData';
import {
  DEFAULT_PREFERENCES,
  type Activity,
  type ActivityType,
  type AppData,
  type DefaultTaskStatus,
  type Preferences,
  type Project,
  type ProjectColorToken,
  type Task,
  type TaskPriority,
  type TaskStatus,
  type ThemePreference,
} from '../../types';
import { isValidLocalDate } from '../../utils/dates';

export const STORAGE_KEY = 'daymark:workspace:v1';
const SCHEMA_VERSION = 1;

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export interface LoadResult {
  data: AppData;
  status: 'available' | 'memory-only';
  storageMessage: string | null;
  recoveryMessage: string | null;
  persistOnMount: boolean;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === 'string';
const isIsoTimestamp = (value: unknown): value is string =>
  isString(value) && !Number.isNaN(Date.parse(value));
const STATUSES: TaskStatus[] = ['inbox', 'todo', 'in-progress', 'completed'];
const PRIORITIES: TaskPriority[] = ['none', 'low', 'medium', 'high'];
const ACTIVITY_TYPES: ActivityType[] = [
  'task-created',
  'task-completed',
  'task-updated',
  'project-created',
  'project-updated',
];
const THEMES: ThemePreference[] = ['light', 'dark', 'system'];
const DEFAULT_STATUSES: DefaultTaskStatus[] = ['inbox', 'todo'];
const COLORS: ProjectColorToken[] = ['clay', 'rust', 'olive', 'slate'];

function readTask(value: unknown): Task | null {
  if (!isRecord(value)) return null;
  const {
    id,
    title,
    description,
    status,
    priority,
    dueDate,
    projectId,
    tags,
    createdAt,
    updatedAt,
    completedAt,
  } = value;
  if (!isString(id) || !isString(title) || !title.trim() || !isString(description)) return null;
  if (!STATUSES.includes(status as TaskStatus) || !PRIORITIES.includes(priority as TaskPriority))
    return null;
  if (dueDate !== null && (!isString(dueDate) || !isValidLocalDate(dueDate))) return null;
  if (projectId !== null && !isString(projectId)) return null;
  if (
    !Array.isArray(tags) ||
    !tags.every(isString) ||
    !isIsoTimestamp(createdAt) ||
    !isIsoTimestamp(updatedAt)
  )
    return null;
  if (completedAt !== null && !isIsoTimestamp(completedAt)) return null;
  return {
    id,
    title: title.trim(),
    description,
    status: status as TaskStatus,
    priority: priority as TaskPriority,
    dueDate: dueDate as string | null,
    projectId: projectId as string | null,
    tags: tags
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 8),
    createdAt,
    updatedAt,
    completedAt: completedAt as string | null,
  };
}

function readProject(value: unknown): Project | null {
  if (!isRecord(value)) return null;
  const { id, name, description, colorToken, createdAt, updatedAt, archived } = value;
  if (!isString(id) || !isString(name) || !name.trim() || !isString(description)) return null;
  if (
    !COLORS.includes(colorToken as ProjectColorToken) ||
    !isIsoTimestamp(createdAt) ||
    !isIsoTimestamp(updatedAt) ||
    typeof archived !== 'boolean'
  )
    return null;
  return {
    id,
    name: name.trim(),
    description,
    colorToken: colorToken as ProjectColorToken,
    createdAt,
    updatedAt,
    archived,
  };
}

function readActivity(value: unknown): Activity | null {
  if (!isRecord(value)) return null;
  const { id, type, entityId, message, createdAt } = value;
  if (
    !isString(id) ||
    !ACTIVITY_TYPES.includes(type as ActivityType) ||
    !isString(entityId) ||
    !isString(message) ||
    !isIsoTimestamp(createdAt)
  )
    return null;
  return { id, type: type as ActivityType, entityId, message, createdAt };
}

function readPreferences(value: unknown): { preferences: Preferences; changed: boolean } {
  const source = isRecord(value) ? value : {};
  const preferences: Preferences = {
    theme: THEMES.includes(source.theme as ThemePreference)
      ? (source.theme as ThemePreference)
      : DEFAULT_PREFERENCES.theme,
    compactMode:
      typeof source.compactMode === 'boolean'
        ? source.compactMode
        : DEFAULT_PREFERENCES.compactMode,
    reducedMotion:
      typeof source.reducedMotion === 'boolean'
        ? source.reducedMotion
        : DEFAULT_PREFERENCES.reducedMotion,
    showCompletedToday:
      typeof source.showCompletedToday === 'boolean'
        ? source.showCompletedToday
        : DEFAULT_PREFERENCES.showCompletedToday,
    defaultTaskStatus: DEFAULT_STATUSES.includes(source.defaultTaskStatus as DefaultTaskStatus)
      ? (source.defaultTaskStatus as DefaultTaskStatus)
      : DEFAULT_PREFERENCES.defaultTaskStatus,
  };
  const changed =
    !isRecord(value) ||
    Object.keys(DEFAULT_PREFERENCES).some(
      (key) => source[key] !== preferences[key as keyof Preferences],
    );
  return { preferences, changed };
}

function seedResult(
  recoveryMessage: string | null,
  status: LoadResult['status'] = 'available',
  storageMessage: string | null = null,
): LoadResult {
  return {
    data: createSampleData(),
    status,
    storageMessage,
    recoveryMessage,
    persistOnMount: recoveryMessage === null && status === 'available',
  };
}

export function loadAppData(storage: StorageLike | null, now = new Date()): LoadResult {
  if (!storage)
    return {
      ...seedResult(
        null,
        'memory-only',
        'This browser does not expose local storage. Changes will remain available only until you close this page.',
      ),
      data: createSampleData(now),
    };
  let serialized: string | null;
  try {
    serialized = storage.getItem(STORAGE_KEY);
  } catch {
    return {
      ...seedResult(
        null,
        'memory-only',
        'Daymark could not read local storage. Changes will remain in this page only.',
      ),
      data: createSampleData(now),
    };
  }
  if (serialized === null)
    return { ...seedResult(null), data: createSampleData(now), persistOnMount: true };

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized) as unknown;
  } catch {
    return {
      ...seedResult(
        'Saved Daymark data could not be read. The sample workspace is open in memory; the original saved value has not been overwritten.',
      ),
      data: createSampleData(now),
    };
  }
  if (!isRecord(parsed) || parsed.schemaVersion !== SCHEMA_VERSION || !isRecord(parsed.data)) {
    return {
      ...seedResult(
        'Saved Daymark data has an unsupported shape or version. The sample workspace is open in memory; the original saved value has not been overwritten.',
      ),
      data: createSampleData(now),
    };
  }

  const raw = parsed.data;
  const rawTasks = Array.isArray(raw.tasks) ? raw.tasks : [];
  const rawProjects = Array.isArray(raw.projects) ? raw.projects : [];
  const rawActivity = Array.isArray(raw.activity) ? raw.activity : [];
  const tasks = rawTasks.map(readTask).filter((item): item is Task => item !== null);
  const projects = rawProjects.map(readProject).filter((item): item is Project => item !== null);
  const activity = rawActivity.map(readActivity).filter((item): item is Activity => item !== null);
  const validProjectIds = new Set(projects.map((project) => project.id));
  let repairedLinks = 0;
  const linkedTasks = tasks.map((task) => {
    if (task.projectId && !validProjectIds.has(task.projectId)) {
      repairedLinks += 1;
      return { ...task, projectId: null };
    }
    return task;
  });
  const prefResult = readPreferences(raw.preferences);
  const invalidCount =
    rawTasks.length -
    tasks.length +
    rawProjects.length -
    projects.length +
    rawActivity.length -
    activity.length +
    repairedLinks;
  const missingCollections =
    !Array.isArray(raw.tasks) || !Array.isArray(raw.projects) || !Array.isArray(raw.activity);
  const recoveryMessage =
    invalidCount > 0 || missingCollections || prefResult.changed
      ? `Daymark loaded the ${linkedTasks.length} usable task${linkedTasks.length === 1 ? '' : 's'} and ${projects.length} usable project${projects.length === 1 ? '' : 's'}. Some saved records needed repair; the original saved value has not been overwritten.`
      : null;
  return {
    data: { tasks: linkedTasks, projects, activity, preferences: prefResult.preferences },
    status: 'available',
    storageMessage: null,
    recoveryMessage,
    persistOnMount: recoveryMessage === null,
  };
}

export function serializeAppData(data: AppData, space?: number): string {
  return JSON.stringify({ schemaVersion: SCHEMA_VERSION, data }, null, space);
}

export function getBrowserStorage(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}
