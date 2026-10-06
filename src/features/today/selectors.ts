import type { Task, TaskPriority } from '../../types';
import { isSameLocalDay, localDateNow } from '../../utils/dates';

export interface UpcomingGroup {
  date: string;
  tasks: Task[];
}

export interface TodayProjection {
  today: string;
  overdue: Task[];
  focus: Task[];
  upcoming: UpcomingGroup[];
  completedToday: Task[];
  completedCount: number;
  remainingCount: number;
  completionPercent: number;
}

const priorityRank: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
  none: 3,
};

function byPriorityThenDueDate(left: Task, right: Task): number {
  return (
    priorityRank[left.priority] - priorityRank[right.priority] ||
    (left.dueDate ?? '').localeCompare(right.dueDate ?? '') ||
    left.title.localeCompare(right.title)
  );
}

export function projectToday(tasks: Task[], today = localDateNow()): TodayProjection {
  const active = tasks.filter((task) => task.status !== 'completed');
  const overdue = active
    .filter((task) => task.dueDate !== null && task.dueDate < today)
    .sort(
      (left, right) =>
        (left.dueDate ?? '').localeCompare(right.dueDate ?? '') ||
        byPriorityThenDueDate(left, right),
    );
  const focus = active.filter((task) => task.dueDate === today).sort(byPriorityThenDueDate);

  const upcomingByDate = new Map<string, Task[]>();
  for (const task of active) {
    if (!task.dueDate || task.dueDate <= today) continue;
    const group = upcomingByDate.get(task.dueDate) ?? [];
    group.push(task);
    upcomingByDate.set(task.dueDate, group);
  }
  const upcoming = [...upcomingByDate.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, groupTasks]) => ({
      date,
      tasks: groupTasks.sort(byPriorityThenDueDate),
    }));

  const completedToday = tasks
    .filter(
      (task) =>
        task.status === 'completed' &&
        task.completedAt !== null &&
        isSameLocalDay(task.completedAt, today),
    )
    .sort((left, right) => (right.completedAt ?? '').localeCompare(left.completedAt ?? ''));
  const completedCount = completedToday.length;
  const remainingCount = focus.length;
  const denominator = completedCount + remainingCount;

  return {
    today,
    overdue,
    focus,
    upcoming,
    completedToday,
    completedCount,
    remainingCount,
    completionPercent: denominator === 0 ? 0 : Math.round((completedCount / denominator) * 100),
  };
}

export function formatUpcomingGroup(date: string, today = localDateNow()): string {
  const tomorrowDate = new Date(`${today}T12:00:00`);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = `${tomorrowDate.getFullYear()}-${String(tomorrowDate.getMonth() + 1).padStart(2, '0')}-${String(tomorrowDate.getDate()).padStart(2, '0')}`;
  const parsed = new Date(`${date}T12:00:00`);
  if (date === tomorrow)
    return `Tomorrow · ${new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(parsed)}`;
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(parsed);
}
