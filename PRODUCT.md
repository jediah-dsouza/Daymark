# Daymark — Product Definition

## Product purpose

Daymark is a calm, focused personal task manager built around **today's execution**. It helps people capture work quickly, decide what matters next, organize work into projects, and move tasks through a simple workflow without turning a personal to-do list into an administration system.

**Product promise:** See the next useful action, make progress, and keep your work organized without fighting the tool.

## Audience and context

### Primary user

A student, developer, designer, freelancer, knowledge worker, or early-career professional managing several pieces of work across personal and professional projects.

### Context of use

- The user opens the app to orient around the day, not to inspect an abstract analytics dashboard.
- Work may be captured rapidly and clarified later; tasks can be unassigned or remain in `inbox`.
- Due dates, priority, status, project, and tags help the user scan and act.
- The first visit must be populated with realistic data so the experience is understandable without setup.
- This is a frontend-first internship project. The demo works without a backend or account and stores data in the browser.

## User problem and goals

Generic task tools can become noisy lists of records. The user needs to capture work, understand priority and deadlines, and make progress without navigating excessive controls.

**Primary user goal:** “I want to quickly understand what I need to do, decide what matters next, and update my work without fighting the interface.”

### Primary action

Create, prioritize, schedule, complete, and organize a task.

### Secondary actions

Search tasks and projects; combine filters; sort; edit task details; move tasks through workflow states; create/manage projects; inspect progress; review completed work; tune preferences; export, clear, or restore demo data.

### Success criteria

A user can orient quickly; create a valid task and recover from invalid input; edit and complete a task; search/filter/sort and understand the result; create a project and assign work; navigate without losing context; use keyboard and mobile/desktop layouts; reload and retain browser-persisted state; and restore the sample dataset.

## Product principles

1. **Today first:** Prioritize a clear next action over exhaustive administration.
2. **Capture without friction:** Quick Add starts with only the essential required task title and makes optional detail easy to add.
3. **Progress is legible:** Status, priority, due date, project, and completion are understandable without color alone.
4. **State is trustworthy:** Mutations update derived counts/activity and persist consistently; failures explain what remains safe and what the user can do.
5. **Local-first, replaceable data boundary:** The MVP uses browser storage; UI components do not call localStorage directly.
6. **Quiet by design:** Product usefulness, accessibility, and hierarchy outrank novelty, decoration, or dashboard conventions.

## MVP scope

### Required

- Today, Tasks, Task Detail, Projects, Project Detail, and Settings; `/` intentionally renders Today.
- Create/edit/complete/uncomplete/delete tasks; task status, priority, due date, project, tags, and description.
- Search; combined status/priority/project filters; due date/priority/created/title sorting.
- Create/edit/archive/delete projects; project deletion explicitly unassigns associated tasks rather than deleting them.
- Derived task/project progress and counts, seeded activity, centralized feedback/toasts, accessible dialogs, responsive navigation and layouts.
- Validated task/project forms, sample data, browser persistence, malformed-data recovery, local-storage failure handling, loading/empty/error/success states, and a sample-data reset.
- Export local data and clear local data with explicit confirmation, as specified by the Settings page inventory.

### Should-have scope included in this implementation

Today / Upcoming / Completed task views or equivalent clearly navigable task states; progress summaries and recent activity; Quick Add; keyboard shortcuts for frequent actions; a command/search palette; dark/system themes; reduced-motion support; and undo after deletion or completion where appropriate. These remain subordinate to the PRD's must-haves.

### Out of scope

Authentication, multi-user collaboration, server-side synchronization, backend notifications, team permissions, billing, AI task generation/chat, real-time collaboration, complex calendar integrations, and focus mode. Optional future ideas such as recurring tasks, calendar planning, drag/drop ordering, subtasks, pinning, custom colors beyond supplied tokens, and rich-text notes are not required for MVP.

## Information architecture and routes

| Route | Purpose | Primary action | Key states |
| --- | --- | --- | --- |
| `/` | Intentional Today entry point | Complete or create a task | Boot, loaded, empty, recovery/error |
| `/today` | Daily execution surface | Complete or create a task | Focus, overdue, upcoming, completed today, activity; empty/error; Quick Add; completion feedback |
| `/tasks` | Searchable task management | Create task | Default, search, combined filters, sort, no matches, empty dataset, form, delete confirmation |
| `/tasks/:taskId` | Genuine task detail/edit page | Save changes | Existing, editing, validation error, saving/success, not found, delete confirmation |
| `/projects` | Project organization and progress | Create project | Loaded, empty, create/edit, archive/delete confirmation, persistence error |
| `/projects/:projectId` | Focused project workspace | Create/complete project task | Loaded, empty, filtered, composer, edit, not found |
| `/settings` | Appearance, preferences and local data | Save preference or manage data | Default, success, reset/clear confirmation, loading, persistence/recovery error |

Primary navigation: Today, Tasks, Projects. Settings is secondary navigation. Utilities: global search/command palette, Quick Add, theme control, and an honest demo/workspace menu. Reserved `/focus` is not included.

## Core user flows

### First visit

Open Daymark → boot/loading state → read and validate browser state → if absent, initialize sample data → Today renders with real counts, tasks, activity, and projects → user can Quick Add or navigate.

### Quick capture

Today/Tasks/project detail → Quick Add → enter title and optional details → validate on submit → invalid input stays in the form and focuses the first invalid field → valid task updates state and activity → repository persists → task appears in the relevant view → accessible success feedback is offered.

### Edit and complete

Open task detail or task row action → edit fields and submit → validate → update state/activity/persistence → show feedback. Completion toggles immediately, derived summaries update, activity is recorded, and a short undo window restores the prior task state when available.

### Create and organize a project

Projects → New Project → validate → create → open detail → compose/assign tasks → see counts/progress derived from current task state. Deleting a project requires confirmation and leaves tasks intact but unassigned; archiving hides it from the active-project view without removing task data.

### Search/filter/sort

Type in local search or the command palette → derive grouped task/project matches without a network request → combine status, priority, and project filters predictably → select a supported sort order → clear filters or search → contextual no-results guidance when needed.

### Settings/data

Change a preference → apply immediately and persist → offer feedback. Restore sample data, export a JSON snapshot, or clear browser data → explain consequences → destructive operations require confirmation → recover into a known seeded or empty state.

## Data model and behavior

### Task

`id`, `title`, `description`, `status: inbox | todo | in-progress | completed`, `priority: none | low | medium | high`, `dueDate: YYYY-MM-DD | null`, `projectId: string | null`, `tags: string[]`, `createdAt`, `updatedAt`, `completedAt: string | null`.

### Project

`id`, `name`, `description`, `colorToken`, `createdAt`, `updatedAt`, `archived: boolean`.

### Activity

`id`, `type: task-created | task-completed | task-updated | project-created | project-updated`, `entityId`, human-readable `message`, `createdAt`.

### Preferences

Required: `theme: light | dark | system`, `compactMode`, `reducedMotion`, `showCompletedToday`. Narrow interpretation of the otherwise undefined “default task behavior” setting: `defaultTaskStatus: inbox | todo` for new tasks. Filters, dialog state, temporary form values, focus/hover state, and toasts are not persisted.

### Derived, not stored

Today/overdue/upcoming/completed task groups, project task totals/open/completed counts/progress, filtered/sorted lists, active-filter count, task completion summaries, and priority summaries are selectors over canonical application state.

## Sample-data specification

Use stable IDs and the four PRD projects:

- **Portfolio Refresh** — selected portfolio case studies and mobile experience (`clay`).
- **Internship Deliverables** — written and technical internship submission materials (`rust`).
- **Personal Systems** — files, notes, and useful routines (`olive`).
- **Learning Lab** — frontend study notes and experiments (`slate`).

Seed the ten named PRD tasks with realistic descriptions, tags, timestamps, statuses, priorities, due dates, and project relationships. Required demo composition: exactly three active focus tasks due today; at least one active overdue task; two completed tasks (including completed-today examples); future/upcoming tasks; an unassigned task; multiple tags; all priority and status values; and activity entries. The named examples are: Refine portfolio case-study layout; Prepare Task 2 internship submission; Review frontend accessibility checklist; Update project README; Complete React state-management notes; Clean desktop project folders; Draft next week's learning plan; Audit mobile navigation; Finish component documentation; Review completed work from yesterday. Seed date offsets from the user's current local calendar date so the demo stays meaningful; retain deterministic IDs, project/task content, and ordering.

## Settings interpretation and unresolved behavior

The PRD's Settings inventory includes “default task behavior” without a detailed schema. Daymark will expose the most directly useful interpretation—default status for newly created tasks (`Inbox` or `To do`)—as a persisted preference, while preserving every required Preferences field. The UI should make the effect explicit.

No other product decisions are blocked. A missing existing repo is an initialization task, not a product blocker. Do not add unrequested backend or authentication features.
