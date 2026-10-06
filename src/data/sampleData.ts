import type { Activity, AppData, Project, Task } from '../types';
import { localDateOffset, timestampAgo } from '../utils/dates';

export const SAMPLE_PROJECTS: Project[] = [
  {
    id: 'project-portfolio',
    name: 'Portfolio Refresh',
    description: 'Rework selected case studies and the mobile experience of a personal portfolio.',
    colorToken: 'clay',
    createdAt: '2026-09-18T14:00:00.000Z',
    updatedAt: '2026-09-28T12:30:00.000Z',
    archived: false,
  },
  {
    id: 'project-internship',
    name: 'Internship Deliverables',
    description:
      'Prepare the written and technical materials for the frontend internship submission.',
    colorToken: 'rust',
    createdAt: '2026-09-17T09:15:00.000Z',
    updatedAt: '2026-10-01T15:20:00.000Z',
    archived: false,
  },
  {
    id: 'project-personal',
    name: 'Personal Systems',
    description: 'Small maintenance work that keeps files, notes, and weekly routines useful.',
    colorToken: 'olive',
    createdAt: '2026-09-12T10:00:00.000Z',
    updatedAt: '2026-09-26T11:45:00.000Z',
    archived: false,
  },
  {
    id: 'project-learning',
    name: 'Learning Lab',
    description: 'A working notebook for frontend concepts and small experiments.',
    colorToken: 'slate',
    createdAt: '2026-09-20T16:10:00.000Z',
    updatedAt: '2026-09-30T13:05:00.000Z',
    archived: false,
  },
];

function task(
  now: Date,
  item: Omit<Task, 'createdAt' | 'updatedAt' | 'completedAt'> & {
    createdDaysAgo: number;
    updatedMinutesAgo: number;
    completedMinutesAgo?: number;
  },
): Task {
  const { createdDaysAgo, updatedMinutesAgo, completedMinutesAgo, ...fields } = item;
  const created = new Date(now.getTime() - createdDaysAgo * 86_400_000).toISOString();
  return {
    ...fields,
    createdAt: created,
    updatedAt: timestampAgo(now, updatedMinutesAgo),
    completedAt: completedMinutesAgo === undefined ? null : timestampAgo(now, completedMinutesAgo),
  };
}

export function createSampleData(now = new Date()): AppData {
  const tasks: Task[] = [
    task(now, {
      id: 'task-portfolio-layout',
      title: 'Refine portfolio case-study layout',
      description:
        'Tighten the story, improve hierarchy, and make the project outcomes easier to scan.',
      status: 'in-progress',
      priority: 'high',
      dueDate: localDateOffset(0, now),
      projectId: 'project-portfolio',
      tags: ['portfolio', 'case study'],
      createdDaysAgo: 3,
      updatedMinutesAgo: 35,
    }),
    task(now, {
      id: 'task-internship-submission',
      title: 'Prepare Task 2 internship submission',
      description:
        'Review the brief, check the final links, and prepare a concise submission note.',
      status: 'todo',
      priority: 'high',
      dueDate: localDateOffset(0, now),
      projectId: 'project-internship',
      tags: ['internship', 'review'],
      createdDaysAgo: 2,
      updatedMinutesAgo: 90,
    }),
    task(now, {
      id: 'task-accessibility-checklist',
      title: 'Review frontend accessibility checklist',
      description:
        'Check keyboard use, labels, focus order, contrast, and responsive text behavior.',
      status: 'todo',
      priority: 'medium',
      dueDate: localDateOffset(0, now),
      projectId: 'project-internship',
      tags: ['accessibility', 'quality'],
      createdDaysAgo: 4,
      updatedMinutesAgo: 180,
    }),
    task(now, {
      id: 'task-project-readme',
      title: 'Update project README',
      description:
        'Document the local setup, current architecture, and the latest project decisions.',
      status: 'inbox',
      priority: 'medium',
      dueDate: localDateOffset(-1, now),
      projectId: 'project-portfolio',
      tags: ['documentation', 'readme'],
      createdDaysAgo: 5,
      updatedMinutesAgo: 1_440,
    }),
    task(now, {
      id: 'task-state-notes',
      title: 'Complete React state-management notes',
      description:
        'Compare local, lifted, reducer, and context state with examples from recent work.',
      status: 'in-progress',
      priority: 'medium',
      dueDate: localDateOffset(3, now),
      projectId: 'project-learning',
      tags: ['react', 'state'],
      createdDaysAgo: 7,
      updatedMinutesAgo: 320,
    }),
    task(now, {
      id: 'task-desktop-folders',
      title: 'Clean desktop project folders',
      description: 'Archive finished work and leave current project folders easy to find.',
      status: 'completed',
      priority: 'low',
      dueDate: localDateOffset(0, now),
      projectId: null,
      tags: ['maintenance'],
      createdDaysAgo: 2,
      updatedMinutesAgo: 280,
      completedMinutesAgo: 280,
    }),
    task(now, {
      id: 'task-learning-plan',
      title: "Draft next week's learning plan",
      description:
        'Choose a realistic set of frontend concepts and reserve time for a small experiment.',
      status: 'inbox',
      priority: 'low',
      dueDate: localDateOffset(5, now),
      projectId: 'project-learning',
      tags: ['planning', 'learning'],
      createdDaysAgo: 1,
      updatedMinutesAgo: 75,
    }),
    task(now, {
      id: 'task-mobile-navigation',
      title: 'Audit mobile navigation',
      description:
        'Check reachability, labels, safe-area spacing, and route state at narrow widths.',
      status: 'todo',
      priority: 'medium',
      dueDate: localDateOffset(1, now),
      projectId: 'project-portfolio',
      tags: ['mobile', 'navigation'],
      createdDaysAgo: 6,
      updatedMinutesAgo: 600,
    }),
    task(now, {
      id: 'task-component-docs',
      title: 'Finish component documentation',
      description: 'Explain common usage, accessibility behavior, and the shared form conventions.',
      status: 'todo',
      priority: 'high',
      dueDate: localDateOffset(2, now),
      projectId: 'project-internship',
      tags: ['components', 'documentation'],
      createdDaysAgo: 3,
      updatedMinutesAgo: 1_020,
    }),
    task(now, {
      id: 'task-review-yesterday',
      title: 'Review completed work from yesterday',
      description:
        'Revisit yesterday’s notes and capture any follow-up that still needs attention.',
      status: 'completed',
      priority: 'none',
      dueDate: localDateOffset(0, now),
      projectId: 'project-personal',
      tags: ['review'],
      createdDaysAgo: 2,
      updatedMinutesAgo: 75,
      completedMinutesAgo: 75,
    }),
  ];

  const activity: Activity[] = [
    {
      id: 'activity-1',
      type: 'task-completed',
      entityId: 'task-desktop-folders',
      message: 'Cleaned desktop project folders',
      createdAt: timestampAgo(now, 280),
    },
    {
      id: 'activity-2',
      type: 'task-completed',
      entityId: 'task-review-yesterday',
      message: 'Reviewed completed work from yesterday',
      createdAt: timestampAgo(now, 75),
    },
    {
      id: 'activity-3',
      type: 'task-updated',
      entityId: 'task-portfolio-layout',
      message: 'Updated portfolio case-study layout',
      createdAt: timestampAgo(now, 35),
    },
    {
      id: 'activity-4',
      type: 'project-updated',
      entityId: 'project-internship',
      message: 'Updated Internship Deliverables',
      createdAt: timestampAgo(now, 210),
    },
    {
      id: 'activity-5',
      type: 'task-created',
      entityId: 'task-learning-plan',
      message: "Added next week's learning plan",
      createdAt: timestampAgo(now, 1_440),
    },
  ];

  return {
    tasks,
    projects: SAMPLE_PROJECTS.map((project) => ({
      ...project,
      createdAt: new Date(now.getTime() - 14 * 86_400_000).toISOString(),
    })),
    activity,
    preferences: {
      theme: 'system',
      compactMode: false,
      reducedMotion: false,
      showCompletedToday: true,
      defaultTaskStatus: 'inbox',
    },
  };
}
