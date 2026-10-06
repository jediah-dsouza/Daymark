# Daymark

## Product overview

**A focused work journal for choosing and completing today's work.** Daymark is a frontend-first, local-first task manager built for students, knowledge workers, and early-career professionals. It makes the next useful action easy to see, lets people capture and organize work without an account or backend, and keeps tasks, projects, activity, and preferences in the current browser.

> See what matters today, make progress, and keep work organized without fighting the tool.

## Internship Task 2 requirement mapping

The project is designed to demonstrate the explicit Task 2 requirements in the supplied PRD:

| Requirement                       | Daymark implementation                                                                                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create a web application          | A complete responsive React task-management application with Today, Tasks, Projects, and Settings routes.                                                                 |
| Reusable components               | Shared layout, UI primitives, form controls, task/project components, dialogs, and feedback components.                                                                   |
| Form validation                   | Validated task and project forms with inline text errors, accessible field descriptions, first-invalid-field focus, preserved drafts, and submission feedback.            |
| State management                  | Local form state, feature-level derived state, and a small context/reducer boundary for tasks, projects, activity, preferences, and persistence status.                   |
| Professional frontend workflow    | Product definition, information architecture, route map, design system, vertical-slice delivery, accessibility, automated testing, visual QA, and documented stage gates. |
| Sample data                       | Ten realistic tasks, four named projects, useful activity, and date relationships that demonstrate focus, overdue, upcoming, completed, assigned, and unassigned work.    |
| Functional demo without a backend | Browser localStorage persistence behind a repository boundary, with explicit recovery, export, sample restore, and clear-data flows.                                      |
| Responsive UI                     | Purpose-designed mobile, tablet, laptop, desktop, and large-screen layouts, tested from 320px through 1440px without horizontal overflow.                                 |
| UI quality                        | A documented editorial design system and Anti-Slop rejection criteria, applied in cross-route visual review.                                                              |
| Working product                   | Each required route and core interaction is implemented as a complete vertical slice rather than a static mockup.                                                         |

## Features

- Today view with focus, overdue, upcoming, completed-today, progress, and recent activity; Quick Add; completion feedback; and Undo.
- Searchable Tasks list with combined status, priority, and project filters; sorting; task detail; validated create/edit; delete confirmation; and Undo.
- Projects index and detail with active/archive views, create/edit/archive/delete, task assignment and composition, derived progress, task filtering, and activity. Deleting a project preserves its tasks and leaves them unassigned.
- Settings for light/dark/system theme, compact density, reduced motion, completed-task visibility, and the default status for new tasks.
- Local JSON export, confirmed sample-data restore, and confirmed clear to a persistent empty workspace.
- Keyboard-accessible navigation, shortcuts, command/search palette, dialogs and menus, focus return, and responsive mobile navigation.
- Local storage error and malformed-data recovery states; no server account is required.

## Screens and routes

| Route                  | Page                                  |
| ---------------------- | ------------------------------------- |
| `/`                    | Today (intentional entry route)       |
| `/today`               | Today execution view                  |
| `/tasks`               | Searchable and filterable task list   |
| `/tasks/:taskId`       | Task details and editing              |
| `/projects`            | Active and archived projects          |
| `/projects/:projectId` | Project progress, tasks, and activity |
| `/settings`            | Preferences and local-data actions    |
| `*`                    | Not-found state                       |

The route manifest is served at `/manus-routes.json` and is kept in sync with the page routes.

## Tech stack

- React 19, TypeScript with strict project checks, and Vite 8.
- React Router 7 for route composition.
- pnpm 11 (`pnpm@11.25.0` is pinned in `package.json`); Node.js 22 or newer.
- Vitest, React Testing Library, and jsdom for unit/component tests; Playwright and axe-core for Chromium, Firefox, and WebKit browser journeys and accessibility audits.
- Lucide React icons; locally bundled Newsreader and DM Sans variable fonts.

## Architecture overview

The UI is organized by product feature. Page components compose shared shell, form, dialog, task-row, project-card, and feedback primitives. Feature selectors derive views from canonical state; mutation functions update records and activity together. UI components do not call `localStorage` directly.

```text
React Router / AppShell
        ↓
Feature pages and reusable UI
        ↓
AppProvider + reducer ─── selectors and feature mutations
        ↓
Storage repository (schema validation, recovery, serialization)
        ↓
Browser localStorage
```

Main source areas:

| Path                       | Responsibility                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| `src/app/`                 | Application routing and route-level tests.                                                   |
| `src/components/layout/`   | App shell, responsive navigation, and shared page layout.                                    |
| `src/components/ui/`       | Accessible reusable controls and dialog/form primitives.                                     |
| `src/components/feedback/` | Toast and persistence feedback.                                                              |
| `src/features/today/`      | Daily execution, Quick Add, task rows, and Today selectors.                                  |
| `src/features/tasks/`      | Task list, search/filter/sort, detail, form, selectors, mutations, and validation.           |
| `src/features/projects/`   | Project index/detail, project forms, task composition, selectors, mutations, and validation. |
| `src/features/settings/`   | Preferences, export, restore, clear, and confirmation flows.                                 |
| `src/state/`               | Shared application provider and reducer.                                                     |
| `src/services/storage/`    | Versioned localStorage repository, guarded decoder, recovery, and serialization.             |
| `src/data/`                | Deterministic, realistic sample records.                                                     |
| `src/styles/`              | Semantic design tokens, global styles, and shared primitives.                                |
| `src/utils/`               | Shared date and keyboard utilities.                                                          |
| `e2e/`                     | Critical user journeys, accessibility, keyboard, persistence, and viewport checks.           |
| `docs/`                    | Source documents, design/product decisions, and stage evidence.                              |

## State management and persistence

Temporary form drafts, open dialogs, focused controls, filters, and toast state stay local to the relevant UI. The `AppProvider` owns only the justified shared state: tasks, projects, activity, preferences, and persistence/recovery status. Its reducer handles replacement, application-data updates, and preference patches. Feature selectors compute counts, overdue/upcoming groups, filtered/sorted lists, and project progress instead of storing duplicate derived values.

The repository stores one schema-versioned record under `daymark:workspace:v1`. On first use, the app seeds the sample workspace. On subsequent visits, it parses and validates stored records, removes invalid records from the in-memory view, repairs missing project references, and avoids automatically overwriting malformed saved data. Storage read/write failures do not crash the app: the workspace remains available in memory, the persistence limitation is explained, and Retry is offered. Clearing data saves an empty workspace so a reload stays empty; restoring sample data is a separate, confirmed action. JSON export is a readable snapshot of the current workspace.

This is browser-local storage, not an encrypted vault; do not put secrets or highly sensitive information in task descriptions.

## Validation approach

Task and project forms validate on submit and then revalidate affected fields as users edit. Errors are textual and associated with their fields; the first invalid field receives focus, valid input is preserved, and an invalid form is not disabled before submission.

- Task titles are trimmed and must contain 2–120 characters. Descriptions allow up to 2,000 characters. Status and priority must be valid values; due dates must be real `YYYY-MM-DD` dates (past dates are allowed); a selected project must exist. Tags are trimmed, de-duplicated, limited to eight, and at most 24 characters each.
- Project names are trimmed and must contain 2–60 characters. Descriptions allow up to 300 characters. Accent colors are selected from the four supported design tokens.
- Stored JSON is treated as untrusted input: schema, entity fields, enum values, dates, and project relationships are checked before use. Recovery avoids replacing the original malformed value without an explicit user action.

## Sample-data behavior

The seeded workspace has four named projects—Portfolio Refresh, Internship Deliverables, Personal Systems, and Learning Lab—and ten tasks with realistic descriptions, tags, priorities, statuses, due dates, project links, and activity. It demonstrates three active tasks due today, overdue and upcoming work, completed examples, an unassigned task, and each status/priority value. Task IDs, content, and ordering are stable; due-date examples are derived from the current local calendar date so the demo remains useful over time.

Sample records appear automatically when storage is empty. Settings can restore them after confirmation at any time. A clear action instead saves an empty workspace and does not silently reseed on reload.

## Local setup

Requirements: Node.js **22+** and pnpm **11.25.0** (the repository pins the package-manager version).

```bash
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`. No API key, environment file, backend, database, or login is required for the local-first app.

## Development and test commands

| Command                                    | Purpose                                                                                  |
| ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `pnpm dev`                                 | Start the Vite development server on port 3000.                                          |
| `pnpm typecheck`                           | Run strict TypeScript project checks.                                                    |
| `pnpm test`                                | Run all unit and component tests once.                                                   |
| `pnpm test:watch`                          | Run Vitest in watch mode.                                                                |
| `pnpm test:e2e`                            | Run the Playwright Chromium suite; the config starts or reuses the port-3000 app server. |
| `PLAYWRIGHT_BROWSER=firefox pnpm test:e2e` | Run the browser journeys in Firefox. Use `webkit` for WebKit.                            |
| `pnpm lint`                                | Run ESLint.                                                                              |
| `pnpm format:check`                        | Check source, test, and configuration formatting.                                        |
| `pnpm audit`                               | Audit the dependency graph for known advisories.                                         |

Install the Playwright engines before cross-browser tests with `pnpm exec playwright install chromium firefox webkit`. Depending on the Linux host, Playwright may also need system libraries (`pnpm exec playwright install --with-deps chromium firefox webkit`). The optional `PLAYWRIGHT_BROWSER` value accepts only `chromium`, `firefox`, or `webkit`.

## Production build and deployment

```bash
pnpm build
pnpm preview
```

Vite writes the static application to `dist/`; the preview server is available on port 3000. Stop `pnpm dev` before starting `pnpm preview`, because both scripts use that port. Deploy the contents of `dist/` to a static host. Configure the host to serve `index.html` for application-page routes (SPA fallback), while continuing to serve real assets and `/manus-routes.json` normally. No application server is required. The built app has been smoke-tested on direct navigation to all declared routes.

The current managed environment provides a Preview. A successful local build, Git push, or Preview response is not evidence of a published production deployment; no public production URL is claimed here.

## Accessibility

Daymark uses semantic landmarks and headings, native form controls where appropriate, explicit labels and linked error text, visible keyboard focus, keyboard-operable controls, managed dialog focus and focus restoration, Escape dismissal, and polite live feedback. Priority and status are not communicated by color alone. Theme and reduced-motion preferences are supported; authored motion is restrained and respects reduced-motion settings. Layout and critical journeys are checked at widths from 320px to 1440px. Browser tests run axe-core WCAG A/AA, WCAG 2.1/2.2 AA, and best-practice audits for covered routes and interaction states; visual and keyboard review supplements automated checks.

## Design-system notes

The visual direction is a contemporary editorial workspace: warm paper surfaces, deep ink typography, ruled grouping, measured whitespace, and one grounded terracotta action color. Newsreader is reserved for wordmark and page-level editorial moments; DM Sans carries navigation, task content, metadata, and controls. Semantic tokens centralize color, spacing, typography, focus, and motion. Flat task lists and compact project structure preserve operational density without turning the product into an analytics dashboard.

## Anti-Slop design philosophy

The design system is deliberately authored rather than generator-generic. It rejects decorative gradients, glassmorphism, glow, repeated feature-card grids, nested cards, invented metrics, fake activity, filler copy, random emoji, excessive pills, color-only state, and motion without a job. Whitespace, typography, task readability, accessible interaction, and clear recovery take priority over decorative novelty. See `DESIGN.md` for the durable visual direction and `docs/STAGE-GATES.md` for recorded reviews.

## Known limitations

- Data belongs to this browser profile and origin. It is not synchronized across browsers or devices and is not backed up remotely. Clearing browser site data or losing the profile can remove it; JSON export is the manual backup path.
- Browser storage may be unavailable, blocked, or full. In that case Daymark explains that changes are memory-only and may not survive a reload.
- The MVP has no accounts, authentication, server API, collaboration, shared projects, notifications, or server-side recovery.
- The current managed address is a Preview, not a confirmed public production deployment.

## Future enhancements

These are possible separate product-phase ideas, not commitments or part of the current MVP: recurring tasks, calendar planning, drag-and-drop ordering, subtasks, pinning, richer notes, focus mode, authentication, cross-device synchronization, and collaboration. Any such work should be separately scoped against the PRD rather than weakening the local-first, quiet-by-design core.

## Project documentation

- [Product definition](PRODUCT.md)
- [Design system](DESIGN.md)
- [Authoritative PRD and supplied workflow sources](docs/source/)
- [Stage gates and verification evidence](docs/STAGE-GATES.md)
- [Implementation plan](plan.md)
