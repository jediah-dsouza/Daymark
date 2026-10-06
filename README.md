https://github.com/user-attachments/assets/9af80de3-23e9-4cb6-9fe3-816ab61191d5

# Daymark

> **A focused work journal for choosing and completing today's work.**

Daymark is a polished, frontend-first, local-first task manager designed
for students, knowledge workers, and early-career professionals. It
helps users identify what matters today, organize tasks and projects,
track progress, and manage preferences --- all without an account,
backend, or external API.

## ✨ Highlights

-   **Today-first workflow** for focus, overdue work, upcoming tasks,
    completed work, progress, and recent activity.
-   **Powerful task management** with search, filtering, sorting,
    validation, editing, deletion, and undo.
-   **Project organization** with active/archive views, task assignment,
    progress tracking, and activity.
-   **Local-first persistence** using browser `localStorage` behind a
    repository boundary.
-   **Responsive by design** across mobile, tablet, laptop, desktop, and
    large-screen layouts.
-   **Accessible interactions** with keyboard navigation, focus
    management, dialogs, shortcuts, and reduced-motion support.
-   **Theme and preference controls** including light/dark/system themes
    and compact density.
-   **Data portability** through JSON export, sample-data restore, and
    clear-workspace flows.
-   **Robust recovery** for malformed or unavailable browser storage.
-   **Automated quality checks** using Vitest, React Testing Library,
    Playwright, and axe-core.

------------------------------------------------------------------------

## 🎯 Internship Task 

Daymark was built to satisfy the core requirements of the internship
Task brief:

  -----------------------------------------------------------------------
  Requirement                         Implementation
  ----------------------------------- -----------------------------------
  Web application                     Complete responsive React
                                      task-management application

  Reusable components                 Shared layout, UI primitives,
                                      forms, dialogs, task rows, project
                                      cards, and feedback components

  Form validation                     Validated task/project forms with
                                      inline errors, accessible
                                      descriptions, focus management,
                                      preserved drafts, and submission
                                      feedback

  State management                    Feature-level state plus a
                                      context/reducer boundary for tasks,
                                      projects, activity, preferences,
                                      and persistence

  Sample data                         Realistic projects, tasks,
                                      activity, dates, priorities,
                                      statuses, and assignments

  Functional demo                     Browser-local persistence with
                                      recovery, export, restore, and
                                      clear-data flows

  Responsive UI                       Purpose-designed layouts tested
                                      from 320px through 1440px

  UI quality                          Authored editorial design system
                                      with documented Anti-Slop criteria

  Working product                     Core routes and interactions
                                      implemented as complete vertical
                                      slices
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 🚀 Core Features

### Today

-   Focused daily workspace
-   Overdue and upcoming work
-   Completed-today tracking
-   Progress indicators
-   Recent activity
-   Quick Add
-   Completion feedback and Undo

### Tasks

-   Search, filter, and sort
-   Status, priority, and project filters
-   Task details and editing
-   Validated create/edit forms
-   Delete confirmation
-   Undo support
-   Keyboard-friendly interactions

### Projects

-   Active and archived projects
-   Create, edit, archive, and delete
-   Task assignment and composition
-   Derived project progress
-   Project-level task filtering
-   Activity history
-   Deleting a project preserves its tasks as unassigned

### Settings & Data

-   Light / dark / system theme
-   Compact density
-   Reduced-motion preference
-   Completed-task visibility
-   Default status for new tasks
-   JSON workspace export
-   Sample-data restore
-   Persistent clear-workspace action

------------------------------------------------------------------------

## 🧭 Routes

  Route                    Purpose
  ------------------------ ---------------------------------------
  `/`                      Today --- intentional entry route
  `/today`                 Daily execution view
  `/tasks`                 Searchable and filterable task list
  `/tasks/:taskId`         Task details and editing
  `/projects`              Active and archived projects
  `/projects/:projectId`   Project progress, tasks, and activity
  `/settings`              Preferences and local-data actions

------------------------------------------------------------------------

## 🛠️ Tech Stack

  Technology                  Role
  --------------------------- ------------------------------------------
  **React 19**                UI framework
  **TypeScript**              Strictly typed application code
  **Vite 8**                  Development and production build tooling
  **React Router 7**          Routing and route composition
  **pnpm 11.25.0**            Package management
  **Vitest**                  Unit and component testing
  **React Testing Library**   UI behavior testing
  **jsdom**                   Browser-like test environment
  **Playwright**              End-to-end browser testing
  **axe-core**                Accessibility auditing
  **Lucide React**            Icon system
  **Newsreader + DM Sans**    Local typography system

**Requirements:** Node.js **22+** and pnpm **11.25.0**.

------------------------------------------------------------------------

## 🏗️ Architecture

Daymark follows a feature-oriented architecture with a clear separation
between UI, application state, and persistence.

``` text
React Router / AppShell
        ↓
Feature pages + reusable UI
        ↓
AppProvider + reducer
        ↓
Selectors + feature mutations
        ↓
Storage repository
(schema validation + recovery + serialization)
        ↓
Browser localStorage
```

### Key architectural principles

-   UI components do **not** access `localStorage` directly.
-   Shared application state is kept intentionally small.
-   Derived values are calculated through selectors rather than
    duplicated in state.
-   Storage data is treated as untrusted input and validated before use.
-   Persistence failures do not crash the application.
-   The persistence layer can be replaced later without rewriting
    feature UI.

### Main source areas

``` text
src/
├── app/                 # Routing and route-level tests
├── components/
│   ├── layout/          # App shell and responsive navigation
│   ├── ui/              # Accessible reusable controls
│   └── feedback/        # Toast and persistence feedback
├── features/
│   ├── today/           # Daily execution and Quick Add
│   ├── tasks/           # Task list, forms, filters, selectors, mutations
│   ├── projects/        # Projects, task composition, validation
│   └── settings/        # Preferences and local-data actions
├── state/               # Shared provider and reducer
├── services/storage/    # Versioned localStorage repository
├── data/                # Deterministic sample records
├── styles/              # Design tokens and global styles
└── utils/               # Shared utilities

e2e/                     # Browser journeys and accessibility checks
docs/                    # Product, design, and stage documentation
```

------------------------------------------------------------------------

## 💾 Local-First Persistence

Daymark stores workspace data locally in the browser under a
schema-versioned record:

``` text
daymark:workspace:v1
```

On first use, the application seeds a realistic sample workspace. On
later visits, stored data is parsed and validated before being used.

The application also handles:

-   malformed stored data
-   missing project references
-   storage read/write failures
-   explicit workspace clearing
-   sample-data restoration
-   JSON export

> **Privacy note:** browser `localStorage` is not an encrypted vault. Do
> not store passwords, API keys, or highly sensitive information in task
> descriptions.

Data is tied to the current browser profile and origin. It is not
synchronized across devices and has no remote backup.

------------------------------------------------------------------------

## 🧪 Validation & Quality

Daymark uses explicit validation and testing to keep core
interactions reliable.

### Form validation

-   Task titles: **2--120 characters**
-   Task descriptions: **up to 2,000 characters**
-   Project names: **2--60 characters**
-   Project descriptions: **up to 300 characters**
-   Tags: trimmed, deduplicated, maximum of eight
-   Invalid dates, statuses, priorities, and project references are
    rejected
-   Stored JSON is validated before entering application state

Validation errors are textual, associated with their fields, and focus
is moved to the first invalid field.

### Development checks

``` bash
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm lint
pnpm format:check
pnpm audit
```

Playwright coverage includes Chromium, Firefox, and WebKit journeys,
with axe-core accessibility auditing for covered routes and interaction
states.

------------------------------------------------------------------------

## ♿ Accessibility

Accessibility is treated as a core product requirement rather than a
final polish step.

Daymark includes:

-   Semantic landmarks and headings
-   Explicit form labels and linked error messages
-   Visible keyboard focus
-   Keyboard-operable controls
-   Managed dialog focus and restoration
-   Escape-to-dismiss behavior
-   Polite live feedback
-   Color-independent status communication
-   Reduced-motion support
-   Theme support
-   Responsive layouts from **320px to 1440px**

------------------------------------------------------------------------

## 🎨 Design Direction

Daymark uses a contemporary editorial workspace aesthetic built around:

-   Warm paper-like surfaces
-   Deep ink typography
-   Ruled grouping
-   Measured whitespace
-   Terracotta as the primary action color
-   **Newsreader** for editorial moments and the wordmark
-   **DM Sans** for navigation, controls, metadata, and task content

The interface intentionally prioritizes clarity, readability, density,
and calm interaction over decorative complexity.

### Anti-Slop Design Philosophy

The design system deliberately avoids generic AI-generated interface
patterns such as:

-   Decorative gradients
-   Glassmorphism
-   Glow effects
-   Repetitive feature-card grids
-   Excessive nested cards
-   Invented metrics
-   Fake activity
-   Filler copy
-   Random emoji
-   Excessive pills
-   Color-only state communication
-   Motion without a functional purpose

The result is intended to feel like a real productivity product rather
than a static design exercise.

See [`DESIGN.md`](DESIGN.md) for the full visual direction.

------------------------------------------------------------------------

## 📦 Getting Started

### 1. Clone the repository

``` bash
git clone <your-repository-url>
cd daymark
```

### 2. Enable the required package manager

``` bash
corepack enable
corepack prepare pnpm@11.25.0 --activate
```

### 3. Install dependencies

``` bash
pnpm install --frozen-lockfile
```

### 4. Start the development server

``` bash
pnpm dev
```

Open:

``` text
http://localhost:3000
```
------------------------------------------------------------------------

## 🏭 Production Build

Create a production build with:

``` bash
pnpm build
```

Preview the build locally with:

``` bash
pnpm preview
```

Vite outputs the production application to:

``` text
dist/
```
------------------------------------------------------------------------

## 📊 Sample Workspace

The seeded workspace includes four realistic projects:

-   **Portfolio Refresh**
-   **Internship Deliverables**
-   **Personal Systems**
-   **Learning Lab**

It also includes ten stable sample tasks demonstrating:

-   Tasks due today
-   Overdue work
-   Upcoming work
-   Completed tasks
-   Assigned and unassigned tasks
-   Different priorities
-   Different statuses
-   Activity history

Sample dates are derived from the current local calendar date so the
demonstration remains useful over time.

------------------------------------------------------------------------

## 🗺️ Future Enhancements

Potential future product phases include:

-   Recurring tasks
-   Calendar planning
-   Drag-and-drop ordering
-   Subtasks
-   Task pinning
-   Richer notes
-   Focus mode
-   Authentication
-   Cross-device synchronization
-   Collaboration

These are intentionally separate from the current MVP so the
local-first, quiet-by-design experience remains focused.

------------------------------------------------------------------------

## 📚 Project Documentation

  ----------------------------------------------------------------------------------
  Document                                       Purpose
  ---------------------------------------------- -----------------------------------
  [`PRODUCT.md`](PRODUCT.md)                     Product definition and product
                                                 decisions

  [`DESIGN.md`](DESIGN.md)                       Visual system and design direction

  [`docs/source/`](docs/source/)                 Authoritative PRD and workflow
                                                 sources

  [`docs/STAGE-GATES.md`](docs/STAGE-GATES.md)   Stage gates and verification
                                                 evidence

  [`plan.md`](plan.md)                           Implementation plan
  ----------------------------------------------------------------------------------

------------------------------------------------------------------------

## 📌 Project Status

**Status: Completed MVP**

The current implementation covers the defined Task scope, including
the core task/project workflows, local persistence, responsive behavior,
validation, accessibility, testing, and documented design/product
decisions.

------------------------------------------------------------------------

## 👤 Built For

Daymark was developed as a frontend internship project demonstrating
practical skills in:

**React · TypeScript · UI Architecture · State Management · Form
Validation · Responsive Design · Accessibility · Local Persistence ·
Automated Testing · Product-Oriented Frontend Development**
