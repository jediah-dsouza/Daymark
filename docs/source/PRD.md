# PRD --- Daymark

## Frontend Remote / Virtual Internship --- Task 2

### Interactive Task Manager with reusable components, validated forms, and client-side state management

**Document status:** Implementation-ready Product Requirements Document\
**Version:** 1.0\
**Product codename:** Daymark\
**Project type:** Frontend-first React application\
**Primary objective:** Satisfy the internship Task 2 requirements
through a polished, production-minded task management experience built
with reusable components, form validation, deliberate state management,
responsive design, accessibility, motion, and sample data.

------------------------------------------------------------------------

# 1. Executive Summary

Daymark is a focused task-management web application for people who want
to see what matters today, capture work quickly, organize it into
projects, and move tasks through a simple execution flow without the
visual and interaction patterns associated with generic AI-generated
SaaS dashboards.

The product is intentionally designed as a **frontend application
first**. It will use realistic local/sample data and browser persistence
so the complete experience can be demonstrated without requiring a
backend. The architecture must keep data access behind a small
service/repository boundary so a real API can be introduced later
without rewriting the UI.

The application must demonstrate the internship's three explicit
implementation requirements:

1.  **Reusable components** --- shared primitives, layout components,
    form controls, task presentation components, filters, dialogs, and
    feedback components.
2.  **Form validation** --- validated task creation/editing and project
    creation/editing, with inline errors, accessible labels, invalid
    states, submission feedback, and reset behavior.
3.  **State management** --- deliberate local/lifted/context state;
    derived state where appropriate; no indiscriminate global state.

The design direction is intentionally **not** a generic dashboard. The
interface will have a strong editorial/workspace character: asymmetric
composition where useful, a restrained but recognizable palette,
distinctive typography, meaningful whitespace, compact data density
where execution requires it, and motion used only to communicate state
or continuity.

------------------------------------------------------------------------

# 2. Governing Development Principles

This PRD is governed by the user's Master Frontend Web Development
Workflow. The workflow explicitly treats frontend development as a
decision system rather than a mechanical checklist and defines the
sequence from product understanding through UI, state, data,
accessibility, motion, testing, visual QA, performance, deployment, and
iteration.

The implementation must preserve these principles:

-   Start from the user's goal, not from a library.
-   Define the MVP and non-goals before coding.
-   Map user flows before creating components.
-   Establish visual direction and design tokens before isolated screen
    styling.
-   Think hierarchically: application → pages → sections → components →
    primitives.
-   Create components for reuse, meaningful responsibility, independent
    behavior, readability, or stable UI concepts---not merely because a
    block is long.
-   Keep state minimal and derive values when they can be calculated.
-   Treat loading, empty, error, success, disabled, selected, expanded,
    and collapsed states as intentional UI states.
-   Build responsive behavior from the beginning.
-   Use semantic HTML first and ARIA only when necessary.
-   Use motion to communicate change, hierarchy, feedback, and
    continuity.
-   Test user behavior rather than implementation details.
-   Develop feature-by-feature as vertical slices.
-   Do not call a feature complete merely because it renders; it must
    work, be understandable, responsive, state-complete, accessible,
    tested, visually correct, performant enough, and maintainable.

The workflow's design direction stage specifically requires decisions
about visual personality, color, typography, density, spacing, shape,
icons, image treatment, borders, shadows, and motion personality. The
design system must therefore be an explicit project artifact, not an
accidental by-product of implementation.

------------------------------------------------------------------------

# 3. Internship Requirement Mapping

  -----------------------------------------------------------------------
  Internship requirement              Daymark implementation
  ----------------------------------- -----------------------------------
  Create a web application            Full responsive task-management web
                                      application

  Reusable components                 UI primitives + layout + task +
                                      project + feedback component
                                      families

  Form validation                     Create/edit task and project forms
                                      with schema-like validation rules
                                      and accessible inline errors

  State management                    Central application state for
                                      tasks/projects/preferences + local
                                      form state + derived selectors

  Professional frontend workflow      Product, IA, route map, design
                                      system, responsive strategy,
                                      accessibility, testing, visual QA

  Sample data                         Seeded realistic tasks, projects,
                                      activity, and metrics

  Functional demo without backend     Local browser persistence with
                                      resettable sample dataset

  Responsive UI                       Mobile, tablet, laptop, desktop,
                                      large desktop behavior specified

  UI quality                          Anti-slop design rules + design
                                      critique/QA gate

  Working product                     Every major page and interaction
                                      must work before progressing to the
                                      next build stage
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 4. Product Definition

## 4.1 Product

Daymark is a personal task manager centered on **today's execution**
rather than exhaustive project administration.

## 4.2 Primary user

A student, developer, designer, freelancer, knowledge worker, or
early-career professional managing multiple pieces of work and wanting a
clear daily execution surface.

## 4.3 User problem

Generic task tools can become noisy lists of records. Users need to
capture work, understand priority, see deadlines, and make progress
without navigating through excessive controls.

## 4.4 Primary user goal

> "I want to quickly understand what I need to do, decide what matters
> next, and update my work without fighting the interface."

## 4.5 Primary action

Create, prioritize, schedule, complete, and organize a task.

## 4.6 Secondary actions

-   Search tasks.
-   Filter and sort tasks.
-   Edit task details.
-   Move tasks between workflow states.
-   Create and manage projects.
-   Inspect project progress.
-   Review completed work.
-   Adjust application preferences.
-   Restore sample/demo data.

## 4.7 Success criteria

A user can:

1.  Open the application and understand its current state within
    seconds.
2.  Create a valid task without confusion.
3.  Receive useful validation when input is invalid.
4.  Edit and complete a task.
5.  Filter/search tasks and understand the result.
6.  Create a project and assign tasks to it.
7.  Navigate between major views without losing context.
8.  Use the application on mobile and desktop.
9.  Complete core flows using keyboard navigation.
10. Reload the browser and retain locally persisted application state.
11. Restore the sample dataset for demonstration.

------------------------------------------------------------------------

# 5. MVP / Scope Control

## 5.1 Must have

-   Dashboard / Today view.
-   All Tasks view.
-   Task creation.
-   Task editing.
-   Task completion.
-   Task deletion with confirmation.
-   Task priority.
-   Task due date.
-   Task status.
-   Task project assignment.
-   Task tags.
-   Search.
-   Filters.
-   Sorting.
-   Project list.
-   Project details.
-   Project creation/editing.
-   Responsive navigation.
-   Form validation.
-   Application state management.
-   Local persistence.
-   Sample data.
-   Loading/empty/error/success states where relevant.
-   Accessible keyboard interaction.
-   Toast/feedback system.
-   Modal/dialog behavior.
-   Responsive layout.
-   Visual QA.

## 5.2 Should have

-   Today / Upcoming / Completed task views.
-   Progress summaries.
-   Recent activity.
-   Quick-add task composer.
-   Keyboard shortcuts for high-frequency actions.
-   Command/search palette.
-   Dark theme.
-   Reduced-motion preference handling.
-   Undo after deletion/completion where appropriate.

## 5.3 Could have

-   Calendar-style planning view.
-   Drag-and-drop ordering.
-   Recurring tasks.
-   Task subtasks.
-   Import/export JSON.
-   Focus mode.
-   Pinned tasks.
-   Custom project colors.
-   Rich task notes.

## 5.4 Not now

-   Authentication.
-   Real multi-user collaboration.
-   Server-side synchronization.
-   Notifications delivered by a backend.
-   Team permissions.
-   Billing.
-   AI task generation.
-   Chatbot.
-   Real-time collaboration.
-   Complex calendar integrations.

The non-goals protect the internship task from expanding into a full
SaaS product.

------------------------------------------------------------------------

# 6. Product Personality

## Desired feeling

**Calm, capable, tactile, editorial, focused, slightly distinctive.**

The interface should feel like a well-designed physical work journal
translated into a modern digital workspace---not a template marketplace
dashboard.

## Avoid

-   Purple-to-blue gradient hero/dashboard treatments.
-   Inter/Roboto/system-only typography as the entire visual identity.
-   Excessive rounded cards.
-   Card-inside-card-inside-card nesting.
-   Decorative sparkle icons.
-   Fake statistics.
-   Unnecessary glassmorphism.
-   Generic "Welcome back, \[Name\]!" dashboard copy.
-   Giant hero headings that waste workspace.
-   Decorative charts with no decision value.
-   Excessive badges.
-   Random gradients.
-   Every section having an icon tile.
-   Excessive drop shadows.
-   Motion for motion's sake.
-   Placeholder copy such as "Lorem ipsum", "No data yet" without a next
    action, or invented product claims.

This anti-slop layer is informed by the referenced Anti-Slop,
Impeccable, and Taste resources. Anti-Slop explicitly positions itself
as a filter rather than a style guide, while Impeccable and Taste
emphasize giving the implementation a deliberate design direction rather
than allowing generic AI defaults.

------------------------------------------------------------------------

# 7. Information Architecture

``` text
Daymark
├── Today
│   ├── Focus
│   ├── Upcoming
│   ├── Completed today
│   └── Activity
├── Tasks
│   ├── All
│   ├── Active
│   ├── Completed
│   └── Task detail / edit
├── Projects
│   ├── Project index
│   ├── Project detail
│   └── Project create/edit
└── Settings
    ├── Appearance
    ├── Preferences
    ├── Data
    └── About
```

Primary navigation:

-   Today
-   Tasks
-   Projects

Secondary navigation:

-   Settings

Utility controls:

-   Global search
-   Quick add
-   Theme control
-   User/demo menu

------------------------------------------------------------------------

# 8. Route Inventory

## Public / shell routes

### `/`

Redirect or render Today depending on application boot strategy.

### `/today`

Primary execution dashboard.

### `/tasks`

All task management.

### `/tasks/:taskId`

Task detail/edit surface.

### `/projects`

Project index.

### `/projects/:projectId`

Project detail.

### `/settings`

Application settings.

Optional future route:

### `/focus`

Not MVP. Reserved for future focus-mode experience.

------------------------------------------------------------------------

# 9. Route Requirements

## `/today`

**Purpose:** Give the user immediate situational awareness and a clear
next action.

**Audience:** Primary user.

**Primary action:** Complete or create a task.

**Required data:** - Today's tasks. - Overdue tasks. - Upcoming tasks. -
Project metadata. - Completion summary. - Recent activity.

**States:** - Initial boot. - Loaded with data. - Loaded with no
tasks. - Persistence failure. - Partial/invalid local data recovery. -
Quick-add open. - Task action loading. - Completion success. - Delete
confirmation.

**SEO:** Not a public SEO target.

**Authentication:** None for MVP.

## `/tasks`

**Purpose:** Full task management.

**Primary action:** Create task.

**Required data:** - All tasks. - Projects. - Tags. - Statuses. -
Priorities.

**States:** - Default list. - Search results. - Filtered results. -
Empty dataset. - Empty search. - Invalid persisted record recovery. -
Task form open. - Delete confirmation.

## `/tasks/:taskId`

**Purpose:** Inspect and edit one task.

**Primary action:** Save changes.

**States:** - Loading/boot. - Existing task. - Task not found. -
Editing. - Saving. - Save success. - Validation failure. - Delete
confirmation.

## `/projects`

**Purpose:** Show project-level organization and progress.

**Primary action:** Create project.

**Required data:** - Projects. - Task counts. - Completion percentages
derived from task state.

**States:** - Projects loaded. - No projects. - Create modal. - Edit
modal. - Delete confirmation. - Persistence failure.

## `/projects/:projectId`

**Purpose:** Focused project workspace.

**Primary action:** Create or complete a project task.

**Required data:** - Project. - Associated tasks. - Project activity. -
Derived progress.

**States:** - Project loaded. - Project not found. - No tasks. -
Filtered project tasks. - Task composer open.

## `/settings`

**Purpose:** Manage local preferences and demo data.

**Primary actions:** - Change appearance. - Toggle preferences. - Reset
sample data. - Clear local data.

**States:** - Default. - Save success. - Reset confirmation. - Reset
success. - Reset failure.

------------------------------------------------------------------------

# 10. User Flows

## Flow A --- First visit

``` text
Open Daymark
↓
Application boot
↓
Load persisted data
↓
If none exists → seed sample dataset
↓
Render Today
↓
User sees current work
↓
User can Quick Add / navigate
```

## Flow B --- Create task

``` text
Today / Tasks
↓
Quick Add or New Task
↓
Task form opens
↓
User enters title
↓
Optional details
↓
Client validation
↓
Invalid → inline error + focus
Valid → submit
↓
State updates
↓
Persistence updates
↓
Success feedback
↓
Task appears in current view
```

## Flow C --- Edit task

``` text
Task row/card
↓
Open details
↓
Edit
↓
Change fields
↓
Validate
↓
Save
↓
State update
↓
Persist
↓
Success feedback
```

## Flow D --- Complete task

``` text
Task checkbox/action
↓
Immediate visual feedback
↓
State changes to completed
↓
Derived counts update
↓
Activity entry created
↓
Persistence
↓
Optional undo window
```

## Flow E --- Create project

``` text
Projects
↓
New project
↓
Project form
↓
Validation
↓
Create
↓
State update
↓
Project appears
↓
Success feedback
```

## Flow F --- Search/filter

``` text
Search input
↓
Query changes
↓
Derived filtered task list
↓
No server request required
↓
Results update immediately
↓
No matches → contextual empty state
```

------------------------------------------------------------------------

# 11. UI / Data Model

## Task

``` ts
type Task = {
  id: string
  title: string
  description: string
  status: "inbox" | "todo" | "in-progress" | "completed"
  priority: "none" | "low" | "medium" | "high"
  dueDate: string | null
  projectId: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
  completedAt: string | null
}
```

## Project

``` ts
type Project = {
  id: string
  name: string
  description: string
  colorToken: string
  createdAt: string
  updatedAt: string
  archived: boolean
}
```

## Activity

``` ts
type Activity = {
  id: string
  type:
    | "task-created"
    | "task-completed"
    | "task-updated"
    | "project-created"
    | "project-updated"
  entityId: string
  message: string
  createdAt: string
}
```

## Preferences

``` ts
type Preferences = {
  theme: "light" | "dark" | "system"
  compactMode: boolean
  reducedMotion: boolean
  showCompletedToday: boolean
}
```

## UI filter state

``` ts
type TaskFilters = {
  search: string
  status: "all" | Task["status"]
  priority: "all" | Task["priority"]
  projectId: string | "all"
  sort: "dueDate" | "priority" | "createdAt" | "title"
}
```

Filters are UI state and should not be persisted unless there is a clear
product reason.

------------------------------------------------------------------------

# 12. Sample Dataset

The first build must contain realistic sample data.

## Projects

1.  Portfolio Refresh
2.  Internship Deliverables
3.  Personal Systems
4.  Learning Lab

## Sample tasks

-   Refine portfolio case-study layout --- high priority --- Portfolio
    Refresh.
-   Prepare Task 2 internship submission --- high --- Internship
    Deliverables.
-   Review frontend accessibility checklist --- medium --- Internship
    Deliverables.
-   Update project README --- medium --- Portfolio Refresh.
-   Complete React state-management notes --- medium --- Learning Lab.
-   Clean desktop project folders --- low --- Personal Systems.
-   Draft next week's learning plan --- low --- Learning Lab.
-   Audit mobile navigation --- medium --- Portfolio Refresh.
-   Finish component documentation --- high --- Internship Deliverables.
-   Review completed work from yesterday --- none --- Personal Systems.

Data must include: - Completed tasks. - Overdue task. - Due today
task. - Future task. - Tasks with no project. - Tasks with multiple
tags. - Different priorities. - Different statuses.

This ensures all visual and interaction states can be demonstrated
immediately.

------------------------------------------------------------------------

# 13. Design System

## 13.1 Design principle

The visual system should be recognizable without relying on novelty for
its own sake.

**Design keywords:** - Editorial workspace. - Quiet confidence. - Warm
precision. - Tactile controls. - Structured asymmetry. - Focused
density. - Subtle motion.

## 13.2 Color direction

Use a warm-neutral canvas rather than a default cool-gray SaaS
background.

Suggested token family:

``` text
--bg-canvas
--bg-surface
--bg-surface-raised
--text-primary
--text-secondary
--text-muted
--border-subtle
--border-strong
--accent
--accent-strong
--success
--warning
--danger
--info
```

The exact palette must be selected during design-system implementation
and documented in `DESIGN.md`. Do not scatter hex values throughout
components.

The accent should be used as a functional signal, not as decoration.

## 13.3 Typography

Use a deliberate type pairing rather than default system-only
typography.

Recommended direction:

-   Display/brand: distinctive editorial serif or characterful display
    face.
-   UI/body: highly legible neutral sans.
-   Numeric/data utility: optional tabular/mono treatment only where it
    improves scanning.

Typography must establish: - Page title. - Section heading. - Task
title. - Body. - Metadata. - Label. - Caption. - Numeric emphasis.

Do not use a display font for every element.

## 13.4 Spacing

Use a tokenized scale:

``` text
space-1
space-2
space-3
space-4
space-5
space-6
space-8
space-10
space-12
space-16
```

## 13.5 Radius

Use a restrained radius system:

``` text
radius-sm
radius-md
radius-lg
radius-pill
```

Avoid applying the largest radius to every element.

## 13.6 Borders

Use thin, low-contrast borders for structure.

Avoid heavy outlines around every card.

## 13.7 Shadows

Prefer: - No shadow for standard flat surfaces. - One subtle elevation
level for floating controls. - One stronger level for modal/dialog
layers.

Do not make every card float.

## 13.8 Icons

Use one consistent icon family.

Icons must: - Have consistent stroke weight. - Have accessible names
when interactive. - Never be the only communication for critical
state. - Avoid decorative icon repetition.

------------------------------------------------------------------------

# 14. Anti-Slop Design Contract

This is a hard project gate.

The application must fail visual review if it contains any of the
following without a documented product reason:

-   Generic gradient hero.
-   Generic SaaS dashboard template composition.
-   Excessive rounded containers.
-   Nested cards with no hierarchy.
-   Decorative icon tiles above every heading.
-   Random emoji as UI icons.
-   Fake metrics or fake user activity.
-   Unnecessary chart widgets.
-   Excessive glassmorphism.
-   Excessive blur.
-   Multiple competing accent colors.
-   Long paragraphs in dashboard cards.
-   Generic AI filler copy.
-   Buttons that look identical despite different importance.
-   Hover animation on every element.
-   Scroll animation that delays access to content.
-   Arbitrary spacing values where tokens would work.
-   Typography with no hierarchy.
-   Desktop-only composition squeezed into mobile.

Every unusual design choice must have a reason tied to product,
hierarchy, usability, or brand.

------------------------------------------------------------------------

# 15. Design-System Artifacts

Before implementation of the full application, create:

``` text
DESIGN.md
PRODUCT.md
```

`PRODUCT.md` contains: - Product purpose. - Audience. - Primary user
goal. - Context. - Constraints. - Voice. - Non-goals.

`DESIGN.md` contains: - Visual personality. - Anti-references. - Color
tokens. - Typography. - Spacing. - Shape. - Iconography. - Layout
rules. - Component rules. - Motion rules. - Responsive rules. -
Anti-slop rules.

This reflects the separation between product truth and visual direction
emphasized by Impeccable and the deliberate design-system approach
described by UI/UX Pro Max.

------------------------------------------------------------------------

# 16. Page-by-Page Component Inventory

# PAGE 1 --- Today

Route: `/today`

## Shell

### AppShell

Responsibilities: - Global page frame. - Navigation. - Responsive shell
behavior.

### SidebarNavigation

Desktop: - Brand mark. - Today. - Tasks. - Projects. - Settings. -
Current-location indicator.

Mobile: - Compact top navigation or drawer.

### TopBar

-   Page context.
-   Search trigger.
-   Quick Add.
-   Theme control.
-   User/demo menu.

## Today content

### TodayHeader

-   Date.
-   Greeting/contextual phrase.
-   Task count.
-   Primary New Task action.

### FocusSection

-   Section label.
-   Focus task list.
-   Focus task item.

### FocusTaskItem

-   Completion control.
-   Task title.
-   Priority marker.
-   Due date.
-   Project reference.
-   Tags.
-   More actions.

### ProgressSummary

-   Completed today.
-   Remaining today.
-   Completion ratio.
-   Progress visualization.

### UpcomingSection

-   Upcoming task groups.
-   Date labels.
-   Task rows.

### ActivitySection

-   Recent task/project events.
-   ActivityItem.

### EmptyTodayState

-   Contextual explanation.
-   Create task action.

### TodayErrorState

-   Human-readable message.
-   Retry/reset action.

### QuickAddDrawer

-   Title input.
-   Priority.
-   Due date.
-   Project.
-   Tags.
-   Save.
-   Cancel.

------------------------------------------------------------------------

# PAGE 2 --- Tasks

Route: `/tasks`

## Components

### TasksHeader

-   Page title.
-   Task count.
-   New Task.

### TaskToolbar

-   SearchField.
-   FilterButton.
-   SortSelect.
-   ViewToggle if implemented.

### SearchField

-   Search icon.
-   Input.
-   Clear button.
-   Keyboard shortcut hint.

### FilterPopover

-   Status.
-   Priority.
-   Project.
-   Clear filters.

### SortMenu

-   Due date.
-   Priority.
-   Recently created.
-   Alphabetical.

### TaskList

-   List container.
-   Virtualization not required for MVP.

### TaskRow

-   Completion control.
-   Title.
-   Metadata.
-   Priority.
-   Due date.
-   Project.
-   Actions.

### TaskListEmpty

Different variants: - No tasks. - No search results. - No filter
results.

### TaskFormDialog

-   TitleField.
-   DescriptionField.
-   StatusSelect.
-   PrioritySelect.
-   DueDateField.
-   ProjectSelect.
-   TagsField.
-   FormActions.

### DeleteTaskDialog

-   Warning.
-   Cancel.
-   Delete.

### ToastRegion

-   Success.
-   Error.
-   Undo where applicable.

------------------------------------------------------------------------

# PAGE 3 --- Task Detail

Route: `/tasks/:taskId`

## Components

### TaskDetailHeader

-   Back navigation.
-   Task title.
-   Status.
-   More actions.

### TaskDetailBody

-   Description.
-   Due date.
-   Priority.
-   Project.
-   Tags.
-   Created/updated metadata.

### TaskEditForm

Same validation model as TaskFormDialog.

### TaskActivity

-   Task history.
-   Created.
-   Updated.
-   Completed.

### TaskNotFoundState

-   Explanation.
-   Return to tasks.

------------------------------------------------------------------------

# PAGE 4 --- Projects

Route: `/projects`

## Components

### ProjectsHeader

-   Title.
-   Project count.
-   New Project.

### ProjectGrid

-   Responsive project cards.

### ProjectCard

-   Project name.
-   Description.
-   Task count.
-   Completion progress.
-   Active/open task count.
-   Last updated.
-   Open action.

### ProjectEmptyState

-   Explanation.
-   Create project.

### ProjectFormDialog

-   Name.
-   Description.
-   Accent/color token.
-   Submit/cancel.

### DeleteProjectDialog

-   Explain effect on associated tasks.
-   Confirm/cancel.

------------------------------------------------------------------------

# PAGE 5 --- Project Detail

Route: `/projects/:projectId`

## Components

### ProjectDetailHeader

-   Project name.
-   Description.
-   Progress.
-   Edit.
-   More actions.

### ProjectProgress

-   Completed count.
-   Remaining count.
-   Progress bar/ring only if useful.

### ProjectTaskToolbar

-   Search.
-   Status filter.
-   Priority filter.
-   Sort.

### ProjectTaskList

-   Task rows.

### ProjectActivity

-   Project activity.

### ProjectEmptyState

-   Create first project task.

### ProjectNotFoundState

-   Return to Projects.

### ProjectTaskComposer

-   Compact task creation form.

------------------------------------------------------------------------

# PAGE 6 --- Settings

Route: `/settings`

## Components

### SettingsLayout

-   Settings navigation.
-   Main settings panel.

### AppearanceSection

-   Theme selector.
-   Reduced motion.
-   Compact mode.

### PreferencesSection

-   Show completed today.
-   Default task behavior.

### DataSection

-   Restore sample data.
-   Export data.
-   Clear local data.

### DangerActionDialog

-   Explicit confirmation.
-   Consequences.
-   Cancel/confirm.

### AboutSection

-   Product version.
-   Internship project context.
-   Technology summary.

------------------------------------------------------------------------

# 17. Reusable Component System

## UI primitives

``` text
Button
IconButton
Input
Textarea
Select
Checkbox
RadioGroup
Switch
DateInput
Label
FieldMessage
Badge
Divider
Tooltip
Popover
DropdownMenu
Dialog
Drawer
Tabs
ProgressBar
Skeleton
Spinner
Toast
ToastRegion
EmptyState
ErrorState
VisuallyHidden
```

## Layout components

``` text
AppShell
SidebarNavigation
TopBar
PageContainer
PageHeader
Section
Stack
Inline
ResponsiveGrid
```

## Feature components

``` text
TaskRow
TaskCard
TaskList
TaskForm
TaskQuickAdd
TaskFilters
TaskSearch
TaskSort
TaskDetail
ProjectCard
ProjectGrid
ProjectForm
ProjectTaskList
ActivityFeed
ActivityItem
ProgressSummary
```

## Why this component architecture

Components are extracted because they represent stable concepts,
repeated behavior, or independent interaction---not because of arbitrary
file length.

------------------------------------------------------------------------

# 18. Form Validation Requirements

## Task title

Required.

Rules: - Trim whitespace. - Minimum 2 characters. - Maximum 120
characters.

Errors: - "Give the task a name." - "Task names must contain at least 2
characters." - "Task names can be up to 120 characters."

## Description

Optional.

Maximum: - 2,000 characters.

## Priority

Valid enum only.

## Status

Valid enum only.

## Due date

Optional.

If supplied: - Must be a valid date. - UI must clearly communicate date
format. - Past dates are permitted because overdue tasks are a valid
state.

## Project

Optional. Must reference an existing project if supplied.

## Tags

Optional. - Trim. - Remove duplicates. - Maximum 8 tags. - Each tag
maximum 24 characters.

## Project name

Required. - Minimum 2 characters. - Maximum 60 characters.

## Project description

Optional. - Maximum 300 characters.

## Validation behavior

-   Validate on submit.
-   After first submit, validate affected fields on blur/change as
    appropriate.
-   Do not show errors before the user has meaningfully interacted with
    the form unless necessary.
-   Focus the first invalid field after submit.
-   Provide text error messages, not color alone.
-   Preserve valid user input.
-   Disable submit only for actual submission state, not simply because
    a field is invalid.
-   Prevent duplicate submission.

------------------------------------------------------------------------

# 19. State Management Architecture

Use a deliberately layered state model.

## Local state

Use for: - Form values. - Modal open/closed. - Temporary input. -
Focused control. - Popover state.

## Lifted state

Use where: - Task toolbar and list need shared filters. - Project detail
and task list need shared project context.

## Context/store-level application state

Use for: - Tasks. - Projects. - Activity. - Preferences. - Application
persistence status.

## Derived state

Calculate: - Today's task count. - Completion percentage. - Project task
counts. - Filtered tasks. - Overdue tasks. - Upcoming tasks. - Priority
counts.

Do not store values that can be derived reliably from existing state.

## Persistence

Use browser storage for MVP.

Architecture:

``` text
UI
 ↓
Application state
 ↓
Repository/service boundary
 ↓
localStorage
```

Do not scatter `localStorage.getItem()` and `setItem()` throughout
components.

------------------------------------------------------------------------

# 20. Persistence Requirements

Persist: - Tasks. - Projects. - Activity. - Preferences.

Do not persist: - Open modal. - Temporary form state. - Search text
unless explicitly justified. - Toast state. - Hover/focus state.

On boot: 1. Read storage. 2. Validate the basic data shape. 3. If no
dataset exists, seed sample data. 4. If stored data is malformed, fail
safely and offer reset. 5. Never crash the entire UI because one local
record is invalid.

------------------------------------------------------------------------

# 21. Loading / Empty / Error / Success Matrix

  -------------------------------------------------------------------------------------
  Surface        Loading              Empty               Error          Success
  -------------- -------------------- ------------------- -------------- --------------
  App boot       Boot                 Seed sample data    Recovery panel Today rendered
                 indicator/skeleton                                      

  Today tasks    Skeleton rows        EmptyTodayState     Retry/reset    Task list

  Tasks search   Immediate local      NoResultsState      N/A            Filtered
                 update                                                  results

  Projects       Skeleton cards       ProjectEmptyState   Retry/reset    Project grid

  Task form      Submit loading       N/A                 Inline errors  Toast +
                                                                         updated list

  Project form   Submit loading       N/A                 Inline errors  Toast +
                                                                         updated grid

  Delete         Button loading       N/A                 Error toast    Undo/success

  Data reset     Confirmation +       N/A                 Error message  Success state
                 loading                                                 
  -------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 22. Interaction States

Every relevant interactive component must explicitly support:

-   Default.
-   Hover.
-   Focus-visible.
-   Pressed/active.
-   Disabled.
-   Loading.
-   Selected.
-   Expanded.
-   Collapsed.
-   Error.
-   Success.

Not every component requires every state, but no state should appear
accidentally.

------------------------------------------------------------------------

# 23. Motion System

Motion should be restrained and functional.

## Motion purposes

-   Dialog entrance/exit.
-   Drawer entrance/exit.
-   Task completion feedback.
-   Filter/popover transition.
-   Toast entrance/exit.
-   Navigation continuity.
-   Small layout transitions when a task moves state.

## Avoid

-   Constant floating objects.
-   Large parallax.
-   Slow page transitions.
-   Animation before usable content.
-   Scroll-triggered effects on every section.

## Timing

Use a small number of motion tokens:

``` text
duration-fast
duration-standard
duration-slow
ease-standard
ease-emphasized
```

Prefer appropriate easing rather than one generic transition for
everything.

Respect:

``` css
@media (prefers-reduced-motion: reduce)
```

Motion decisions are informed by Emil Kowalski's skills, which emphasize
choosing animation ingredients deliberately and auditing where motion
genuinely improves an interface.

------------------------------------------------------------------------

# 24. Responsive Strategy

## Mobile

-   Single-column content.
-   Sidebar becomes compact navigation/drawer.
-   Quick Add becomes a full-width or bottom-sheet style action.
-   Task metadata wraps intentionally.
-   Toolbar controls collapse into filters/sort menus.
-   Touch targets remain comfortable.
-   No horizontal overflow.

## Tablet

-   Compact sidebar or navigation rail.
-   Two-column project grid where space allows.
-   Task list remains primary.

## Laptop

-   Full sidebar.
-   Main content max-width.
-   Task/project layouts use structured columns.

## Desktop

-   Sidebar + main content.
-   Optional secondary information rail only where it improves
    decision-making.
-   Do not fill whitespace simply because the viewport is large.

## Large desktop

-   Preserve readable content width.
-   Do not stretch text into long lines.
-   Use whitespace intentionally.

------------------------------------------------------------------------

# 25. Accessibility Requirements

The application must support:

-   Semantic landmarks.
-   One logical page heading.
-   Correct heading hierarchy.
-   Visible focus.
-   Keyboard navigation.
-   Keyboard-operable dialogs.
-   Escape-to-close for dialogs/popovers where appropriate.
-   Focus trapping in modal dialogs where required.
-   Focus return after modal close.
-   Accessible labels for all form controls.
-   Descriptive validation messages.
-   Error association with inputs.
-   Color contrast.
-   Non-color-only status communication.
-   Screen-reader-friendly names.
-   Accessible navigation.
-   Reduced motion.
-   Touch-friendly controls.
-   No keyboard traps.

Critical flows must be completable with keyboard only.

------------------------------------------------------------------------

# 26. SEO / Metadata

The core application is an authenticated-like local workspace and is not
an SEO destination.

Nevertheless: - Use meaningful document titles. - Use semantic HTML. -
Keep route names meaningful. - Configure basic metadata. - If a public
landing page is later added, apply full SEO requirements from the master
workflow.

------------------------------------------------------------------------

# 27. Performance Requirements

-   Keep dependencies justified.
-   Avoid unnecessary state subscriptions.
-   Avoid unnecessary effects.
-   Avoid unnecessary global rerenders.
-   Lazy-load nonessential future-heavy features.
-   Keep icons lightweight.
-   Avoid massive image assets.
-   Avoid unnecessary animation libraries.
-   Use browser-native capabilities when they are sufficient.
-   Verify production build.
-   Inspect the browser Performance and Network panels before declaring
    performance complete.

The workflow explicitly treats performance as a product feature and
calls for review of JS size, CSS, images, fonts, network requests,
rendering, hydration, caching, lazy loading, and code splitting where
relevant.

------------------------------------------------------------------------

# 28. Technology Architecture

## Recommended stack

``` text
React
TypeScript
Vite
CSS Modules or organized CSS architecture
React Router
Native browser localStorage
Vitest
React Testing Library
Playwright
ESLint
Prettier
```

A lightweight stack is preferred because the project is a frontend
internship task and does not require a backend.

## Dependency rules

Before adding a dependency: - Verify the problem. - Check whether the
browser or React can solve it. - Check maintenance. - Check bundle
cost. - Check whether the dependency adds architectural complexity.

Do not install a library merely because it is fashionable.

------------------------------------------------------------------------

# 29. Proposed Folder Architecture

``` text
src/
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│   └── providers/
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── feedback/
│
├── features/
│   ├── tasks/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── task.types.ts
│   │   ├── task.validation.ts
│   │   └── task.selectors.ts
│   ├── projects/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── project.types.ts
│   │   └── project.validation.ts
│   ├── activity/
│   └── settings/
│
├── pages/
│   ├── TodayPage/
│   ├── TasksPage/
│   ├── TaskDetailPage/
│   ├── ProjectsPage/
│   ├── ProjectDetailPage/
│   └── SettingsPage/
│
├── services/
│   ├── storage/
│   └── repository/
│
├── state/
│   ├── AppStateProvider.tsx
│   └── appState.types.ts
│
├── hooks/
│
├── lib/
│
├── styles/
│   ├── tokens.css
│   ├── globals.css
│   └── utilities.css
│
├── data/
│   └── sampleData.ts
│
├── types/
│
└── utils/
```

------------------------------------------------------------------------

# 30. Page-Level Component Trees

## Today

``` text
TodayPage
└── AppShell
    ├── SidebarNavigation
    ├── TopBar
    │   ├── SearchTrigger
    │   ├── QuickAddButton
    │   └── UserMenu
    └── PageContainer
        ├── TodayHeader
        ├── FocusSection
        │   ├── SectionHeader
        │   └── TaskList
        │       └── TaskRow
        ├── ProgressSummary
        ├── UpcomingSection
        │   └── TaskList
        └── ActivitySection
            └── ActivityFeed
```

## Tasks

``` text
TasksPage
└── AppShell
    └── PageContainer
        ├── TasksHeader
        ├── TaskToolbar
        │   ├── SearchField
        │   ├── FilterPopover
        │   └── SortMenu
        └── TaskList
            ├── TaskRow[]
            └── TaskListEmpty
```

## Projects

``` text
ProjectsPage
└── AppShell
    └── PageContainer
        ├── ProjectsHeader
        └── ProjectGrid
            └── ProjectCard[]
```

## Project detail

``` text
ProjectDetailPage
└── AppShell
    └── PageContainer
        ├── ProjectDetailHeader
        ├── ProjectProgress
        ├── ProjectTaskToolbar
        ├── ProjectTaskList
        │   └── TaskRow[]
        └── ProjectActivity
```

------------------------------------------------------------------------

# 31. Search Behavior

Global search: - Search task title. - Search task description. - Search
project name. - Show grouped results where useful. - Keyboard shortcut
may open it. - Clear button available. - Empty search should not show an
empty-result error. - No-match state must suggest useful next actions.

Search should be client-side for MVP.

------------------------------------------------------------------------

# 32. Filtering and Sorting

Filters: - Status. - Priority. - Project.

Sort: - Due date. - Priority. - Created date. - Title.

Rules: - Filters combine predictably. - Clear all returns to the
unfiltered list. - Active filters are visibly represented. - Filter
state is not duplicated in multiple places. - Derived filtered results
are calculated from source state.

------------------------------------------------------------------------

# 33. Task Actions

Every task should support:

-   Complete/uncomplete.
-   Open.
-   Edit.
-   Delete.

Secondary: - Change priority. - Change status. - Change project.

Destructive actions require confirmation where accidental loss is
meaningful.

------------------------------------------------------------------------

# 34. Project Actions

Every project should support:

-   Open.
-   Edit.
-   Archive/delete.

Deletion behavior must be explicit regarding associated tasks. The
safest MVP rule is:

> Deleting a project does not delete its tasks; tasks become unassigned.

This avoids accidental cascading data loss.

------------------------------------------------------------------------

# 35. Feedback System

Use a centralized toast region for transient feedback.

Examples:

Success: - "Task added." - "Task updated." - "Task completed." -
"Project created."

Error: - "We couldn't save that task. Try again." - "That project could
not be removed."

Informational: - "Sample data restored."

Undo: - "Task deleted. Undo"

Toasts must: - Not be the only place critical errors appear. - Be
keyboard/screen-reader accessible. - Avoid excessive stacking. - Have
appropriate duration. - Allow dismissal.

------------------------------------------------------------------------

# 36. Data Integrity

Sample data must be deterministic.

Use stable IDs in development.

Provide: - `seedSampleData()` - `resetSampleData()` -
`validateStoredData()` - `loadState()` - `saveState()`

The storage layer must be the only location directly interacting with
browser storage.

------------------------------------------------------------------------

# 37. Testing Strategy

## Unit tests

Test: - Validation functions. - Date helpers. - Task filtering. -
Sorting. - Completion percentage. - Storage
serialization/deserialization.

## Component tests

Test: - TaskRow completion. - Task form validation. - Project form
validation. - Filter behavior. - Empty states. - Dialog behavior. -
Toast rendering.

## Integration tests

Test: - Create task → task appears. - Edit task → changes persist. -
Complete task → counts update. - Create project → project appears. -
Assign task → project count updates. - Search/filter → correct
results. - Reset sample data → dataset restored.

## E2E tests

Critical flows: 1. Load application. 2. Create task. 3. Edit task. 4.
Complete task. 5. Search task. 6. Create project. 7. Open project and
create task. 8. Change theme. 9. Reload and verify persistence. 10.
Restore sample data.

------------------------------------------------------------------------

# 38. Visual QA Protocol

For every route, inspect:

-   Page hierarchy.
-   Typography.
-   Spacing.
-   Alignment.
-   Component consistency.
-   Color contrast.
-   Border treatment.
-   Shadow treatment.
-   Icon consistency.
-   Focus states.
-   Empty states.
-   Error states.
-   Responsive behavior.
-   Mobile composition.
-   Tablet composition.
-   Desktop composition.
-   Large-screen whitespace.

Visual QA is not "does it look okay?" It is a comparison against the
intended design system.

------------------------------------------------------------------------

# 39. Anti-Slop Visual QA Gate

Before a route is marked complete, answer:

1.  Does the layout have a clear reason for its composition?
2.  Is there a distinctive visual identity?
3.  Are typography choices intentional?
4.  Is the spacing rhythm consistent?
5.  Are cards being used because they help grouping rather than because
    dashboards usually have cards?
6.  Are icons meaningful?
7.  Are animations communicating something?
8.  Is there unnecessary decoration?
9.  Is any copy generic or invented?
10. Does the page still feel good with decoration removed?
11. Does mobile preserve the hierarchy rather than merely shrinking
    desktop?
12. Is the primary action unmistakable?
13. Are secondary actions visually subordinate?
14. Does the interface have enough personality without becoming
    difficult to use?

Any "no" or "unclear" answer triggers a design pass.

------------------------------------------------------------------------

# 40. Build Method --- Vertical Slices

The project will NOT be built by completing all HTML, then all CSS, then
all JavaScript.

Each feature must be delivered as:

``` text
Requirement
↓
User flow
↓
UI states
↓
Component design
↓
Implementation
↓
Interaction
↓
State
↓
Sample data
↓
Persistence
↓
Accessibility
↓
Testing
↓
Visual QA
↓
Performance
↓
Refactor
↓
Feature complete
```

This follows the master workflow's vertical-slice model.

------------------------------------------------------------------------

# 41. Mandatory Build Gates

## Gate 0 --- Product and design foundation

Must be complete before application implementation: - Product
definition. - User flows. - IA. - Route map. - Component inventory. -
Design direction. - Design tokens. - PRODUCT.md. - DESIGN.md. - Sample
data specification.

## Gate 1 --- Application shell

Must be complete and functional: - App shell. - Navigation. - Routing. -
Responsive shell. - Theme. - Global tokens. - Sample data loaded.

**Do not proceed until Gate 1 passes.**

## Gate 2 --- Today vertical slice

Must work with sample data: - Task display. - Completion. - Quick add. -
Feedback. - Persistence. - Responsive behavior. - Keyboard behavior.

**Do not proceed until Gate 2 passes.**

## Gate 3 --- Tasks vertical slice

Must work: - Search. - Filters. - Sort. - Create. - Edit. - Delete. -
Validation. - Empty/error/success states. - Persistence.

**Do not proceed until Gate 3 passes.**

## Gate 4 --- Projects vertical slice

Must work: - Project list. - Project creation. - Project editing. -
Project detail. - Task assignment. - Project progress. - Empty/error
states.

**Do not proceed until Gate 4 passes.**

## Gate 5 --- Settings/data

Must work: - Theme. - Preferences. - Sample reset. - Clear data. -
Persistence.

## Gate 6 --- Quality

Must pass: - Unit tests. - Component tests. - Integration tests. -
Critical E2E tests. - Accessibility audit. - Visual QA. - Cross-browser
checks. - Production build. - Performance review.

------------------------------------------------------------------------

# 42. Critical Rule: No Premature Progression

The user's explicit development rule is:

> Do not move on to the next stages in development until everything is
> fully built, designed, and working with sample data.

Therefore:

-   A route is not complete because its static layout exists.
-   A component is not complete because it renders.
-   A form is not complete until validation and submission work.
-   A task list is not complete until its state changes work.
-   A project page is not complete until project/task relationships
    work.
-   A responsive layout is not complete until it is tested at target
    viewport classes.
-   A visual system is not complete until representative screens use it
    consistently.
-   A feature cannot be marked done while critical UI states are
    missing.

The project proceeds gate-by-gate, not file-by-file.

------------------------------------------------------------------------

# 43. Development Sequence

## Phase 0 --- Discovery

-   Read PRD.
-   Confirm product assumptions.
-   Create PRODUCT.md.
-   Create DESIGN.md.
-   Finalize sample data.

## Phase 1 --- Design system

-   Tokens.
-   Typography.
-   Color.
-   Spacing.
-   Components.
-   Motion.
-   Responsive rules.
-   Anti-slop rules.

## Phase 2 --- Foundation

-   Initialize project.
-   Configure TypeScript.
-   Configure linting/formatting.
-   Set Git.
-   Establish CSS architecture.
-   Build primitives.
-   Build AppShell.
-   Build navigation.

## Phase 3 --- Today

Complete entire Today vertical slice.

## Phase 4 --- Tasks

Complete entire Tasks vertical slice.

## Phase 5 --- Projects

Complete entire Projects vertical slice.

## Phase 6 --- Settings

Complete entire Settings/data vertical slice.

## Phase 7 --- Cross-application polish

-   Consistency.
-   Accessibility.
-   Motion.
-   Error states.
-   Empty states.
-   Responsive refinement.

## Phase 8 --- QA

-   Tests.
-   Browser QA.
-   Visual QA.
-   Performance.
-   Security/dependency review.

## Phase 9 --- Production

-   Build.
-   Deploy.
-   Smoke test.
-   Documentation.

------------------------------------------------------------------------

# 44. Git Strategy

Use meaningful commits:

``` text
chore: initialize Daymark frontend
docs: add product and design foundations
feat: add application shell and navigation
feat: add today task workflow
feat: add task management workflow
feat: add task validation
feat: add project management workflow
feat: add local persistence
feat: add settings and demo data reset
a11y: improve dialog focus management
test: cover task workflows
test: cover project workflows
perf: reduce unnecessary application renders
refactor: simplify task state selectors
docs: add setup and architecture guide
```

Avoid meaningless commits such as: - final - final2 - changes -
updates - fixes

------------------------------------------------------------------------

# 45. Definition of Done

A Daymark feature is done only when:

-   It works.
-   It is understandable.
-   It is responsive.
-   It handles relevant states.
-   It is accessible.
-   It is tested.
-   It is visually correct.
-   It performs acceptably.
-   It is maintainable.
-   It works with realistic sample data.
-   It survives a browser reload where persistence is expected.
-   It has no known critical console errors.
-   It passes the anti-slop visual gate.

This directly follows the workflow's definition of done.

------------------------------------------------------------------------

# 46. Production Readiness Gate

## Functionality

-   [ ] Core task flow works.
-   [ ] Project flow works.
-   [ ] Forms validate.
-   [ ] Persistence works.
-   [ ] Reset sample data works.

## Responsiveness

-   [ ] Mobile.
-   [ ] Tablet.
-   [ ] Laptop.
-   [ ] Desktop.
-   [ ] Large desktop.

## Accessibility

-   [ ] Keyboard.
-   [ ] Focus.
-   [ ] Semantic HTML.
-   [ ] Labels.
-   [ ] Errors.
-   [ ] Contrast.
-   [ ] Reduced motion.
-   [ ] Dialog behavior.

## Performance

-   [ ] Production build succeeds.
-   [ ] No obvious excessive rerenders.
-   [ ] Dependencies reviewed.
-   [ ] Assets reviewed.
-   [ ] Network inspected.

## Error handling

-   [ ] Invalid form input.
-   [ ] Missing task.
-   [ ] Missing project.
-   [ ] Storage failure.
-   [ ] Malformed stored data.
-   [ ] Destructive confirmation.

## Quality

-   [ ] Visual QA.
-   [ ] Cross-browser QA.
-   [ ] Tests pass.
-   [ ] Anti-slop gate passes.

## Security

-   [ ] No secrets.
-   [ ] Unsafe HTML avoided.
-   [ ] Dependencies reviewed.
-   [ ] Client-side data treated as untrusted.

## Deployment

-   [ ] Production build.
-   [ ] Deployment configuration.
-   [ ] Smoke test.
-   [ ] README.

------------------------------------------------------------------------

# 47. README Requirements

The repository README must include:

1.  Product overview.
2.  Internship task mapping.
3.  Features.
4.  Screens/pages.
5.  Tech stack.
6.  Architecture overview.
7.  State-management explanation.
8.  Validation approach.
9.  Sample-data behavior.
10. Local setup.
11. Development commands.
12. Testing commands.
13. Production build.
14. Deployment.
15. Accessibility notes.
16. Design-system notes.
17. Anti-slop design philosophy.
18. Known limitations.
19. Future enhancements.

------------------------------------------------------------------------

# 48. Suggested Project Deliverables

``` text
README.md
PRD.md
PRODUCT.md
DESIGN.md
```

Application source:

``` text
src/
```

Tests:

``` text
tests/
```

Optional:

``` text
docs/
  architecture.md
  testing.md
```

------------------------------------------------------------------------

# 49. Design Resource Integration

## UI/UX Pro Max

Use as a design intelligence/reference layer for: - Style exploration. -
Palette reasoning. - Typography pairing. - UX guidance. -
Accessibility. - Responsive behavior. - Stack-specific React guidance. -
Design-system generation.

The referenced repository describes searchable UI styles, palettes, font
pairings, UX guidelines, icons, motion presets, chart types, and stack
guidance; it also supports generating and persisting a master design
system with page-level overrides.

For Daymark: - Generate/establish one master design system. - Keep
page-specific deviations exceptional. - Do not let automated style
recommendations override the product direction in this PRD.

## Impeccable

Use as the design critique/polish layer: - Critique. - Audit. -
Polish. - Distill. - Animate. - Bolder/quieter adjustments. -
Detector-style checks against generic frontend patterns.

The referenced project explicitly separates durable product truth from
visual direction and provides design commands for critique/polish and
related iteration.

## Taste Skill

Use as the taste and variance layer: - Tune layout variance. - Tune
motion. - Tune density. - Avoid predictable AI composition. - Review
typography and spacing. - Use redesign audits when a screen becomes
generic.

The current repository describes v2 as a design-language skill that
tunes variance, motion, and density and includes a redesign-audit
protocol.

## Emil Kowalski Skills

Use for: - Animation decisions. - Easing. - Duration. - Interaction
feedback. - Motion review. - Finding genuine animation opportunities. -
Avoiding unnecessary animation.

The repository explicitly includes animation creation/review/improvement
skills and a tool for finding places where motion genuinely benefits the
UI.

## Anti-Slop

Use as the final rejection filter: - Remove generic AI UI patterns. -
Remove filler copy. - Require purpose for unusual techniques. - Review
liveliness and rhythm. - Run a delivery gate before shipping.

Anti-Slop describes itself as a filter rather than a style guide;
therefore Daymark's `DESIGN.md` remains the source of visual direction
while Anti-Slop functions as the quality/rejection layer.

------------------------------------------------------------------------

# 50. Design Review Hierarchy

When visual feedback conflicts, use this order:

``` text
1. Product usability
2. Accessibility
3. Information hierarchy
4. Design-system consistency
5. Responsive behavior
6. Interaction clarity
7. Performance
8. Brand personality
9. Decorative novelty
```

Novelty never overrides usability.

------------------------------------------------------------------------

# 51. Sample Data Demo Scenarios

The finished application must visibly demonstrate:

### Scenario 1

User opens Today and sees: - 3 focus tasks. - 1 overdue task. - 2
completed tasks. - Upcoming tasks. - Activity.

### Scenario 2

User creates an invalid task: - Empty title. - Validation appears. -
First invalid field receives focus. - No record is created.

### Scenario 3

User creates a valid task: - Task appears immediately. - Counts
update. - Activity updates. - Data persists after reload.

### Scenario 4

User completes a task: - Completion feedback appears. - Task moves to
completed state. - Progress updates. - Activity records completion.

### Scenario 5

User searches: - Search results update. - No-result state works.

### Scenario 6

User creates a project: - Project appears. - Open project. - Create
task. - Project progress changes.

### Scenario 7

User changes theme: - UI updates. - Preference persists.

### Scenario 8

User resets sample data: - Confirmation. - Data reset. - UI returns to
known demonstration state.

------------------------------------------------------------------------

# 52. Edge Cases

Must handle:

-   Empty task title.
-   Whitespace-only title.
-   Extremely long title.
-   Extremely long description.
-   Duplicate tags.
-   Missing project reference.
-   Deleted project with tasks.
-   Task not found.
-   Project not found.
-   Empty task list.
-   Empty project list.
-   Search with no matches.
-   Multiple simultaneous filters.
-   Completed overdue task.
-   No due date.
-   Invalid stored data.
-   Local storage unavailable.
-   Duplicate form submission.
-   Rapid completion toggles.
-   Dialog opened from mobile.
-   Keyboard-only operation.
-   Reduced-motion preference.

------------------------------------------------------------------------

# 53. Quality Metrics

The project should be considered successful when:

-   All MVP flows are functional.
-   No critical interaction depends on mouse-only behavior.
-   Forms have useful validation.
-   Application state is centralized only where justified.
-   Sample data demonstrates every major state.
-   No route has obvious generic template composition.
-   No critical console errors.
-   Production build succeeds.
-   Critical tests pass.
-   Visual QA passes at mobile and desktop sizes.
-   The UI remains coherent when content length changes.

------------------------------------------------------------------------

# 54. Explicit Non-Requirements

Do not spend implementation time on:

-   Backend architecture.
-   Database schema.
-   Authentication server.
-   Team collaboration.
-   Payment systems.
-   AI features.
-   Real-time sockets.
-   Server authorization.
-   Enterprise permissions.

If these appear later, they should be treated as a separate product
phase.

------------------------------------------------------------------------

# 55. Final Project Outcome

The finished Task 2 project should demonstrate that the developer can
take a product requirement and produce a complete frontend application
rather than only a styled screen.

The final artifact must demonstrate:

``` text
Product thinking
+
Information architecture
+
Page/route planning
+
Design system
+
Reusable components
+
Semantic HTML
+
Responsive CSS
+
JavaScript interaction
+
React architecture
+
State management
+
Validated forms
+
Sample data
+
Browser persistence
+
Loading / empty / error / success states
+
Accessibility
+
Purposeful motion
+
Testing
+
Debugging
+
Visual QA
+
Performance review
+
Git discipline
+
Production readiness
```

------------------------------------------------------------------------

# 56. Final Master Acceptance Checklist

## Product

-   [ ] Primary user defined.
-   [ ] Problem defined.
-   [ ] Primary goal defined.
-   [ ] MVP defined.
-   [ ] Non-goals defined.

## UX

-   [ ] User flows mapped.
-   [ ] IA defined.
-   [ ] Navigation defined.
-   [ ] Routes defined.
-   [ ] Primary actions defined.

## Design

-   [ ] Visual direction defined.
-   [ ] Design tokens defined.
-   [ ] Typography defined.
-   [ ] Color defined.
-   [ ] Spacing defined.
-   [ ] Shape defined.
-   [ ] Icons defined.
-   [ ] Motion defined.
-   [ ] Anti-slop rules defined.

## Architecture

-   [ ] Folder structure defined.
-   [ ] Component boundaries defined.
-   [ ] State boundaries defined.
-   [ ] Data boundary defined.
-   [ ] Persistence boundary defined.

## Development

-   [ ] Semantic HTML.
-   [ ] Responsive CSS.
-   [ ] React components.
-   [ ] State management.
-   [ ] Forms.
-   [ ] Validation.
-   [ ] Sample data.
-   [ ] Persistence.
-   [ ] Loading states.
-   [ ] Empty states.
-   [ ] Error states.
-   [ ] Success states.

## Accessibility

-   [ ] Keyboard.
-   [ ] Focus.
-   [ ] Labels.
-   [ ] Errors.
-   [ ] Contrast.
-   [ ] Reduced motion.
-   [ ] Modal focus.

## Testing

-   [ ] Unit.
-   [ ] Component.
-   [ ] Integration.
-   [ ] Critical E2E.

## QA

-   [ ] Mobile.
-   [ ] Tablet.
-   [ ] Desktop.
-   [ ] Cross-browser.
-   [ ] Visual QA.
-   [ ] Anti-slop QA.
-   [ ] Performance review.

## Delivery

-   [ ] Production build.
-   [ ] Smoke test.
-   [ ] README.
-   [ ] Git history.
-   [ ] Deployment.
-   [ ] Documentation.

------------------------------------------------------------------------

# 57. Non-Negotiable Development Rule

**Do not move to the next stage until the current stage is fully built,
designed, functional, responsive, state-complete, accessible, tested
where applicable, and demonstrable with sample data.**

A partially implemented page does not count as a completed stage.

The project should progress by verified vertical slices, not by
accumulating unfinished screens.

------------------------------------------------------------------------

# 58. Closing Product Principle

Daymark should not try to impress users by adding more interface.

It should impress through:

-   clarity,
-   hierarchy,
-   responsiveness,
-   tactile interaction,
-   useful feedback,
-   deliberate typography,
-   restrained motion,
-   strong state handling,
-   and a visual identity that feels authored rather than generated.

The ultimate standard is:

> **The interface should feel like someone made deliberate design
> decisions.**
