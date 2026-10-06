# Daymark Implementation Plan

## Goal and current state

Build the complete Daymark task-management application exactly against the supplied ZIP’s three authoritative documents: the Master Frontend Web Development Workflow, Complete Daymark Task 2 PRD, and Master AI Build Prompt. This is a fully working, responsive, accessible React application with validated task/project workflows, realistic local data, persistence, complete UI states, tests, visual QA, Anti-Slop review, and production-ready documentation—not a static prototype.

**Workspace inspection:** The ZIP contains the three requested Markdown sources, which were read completely. The starting workspace had no Daymark repository; the new managed React/Vite project is `/home/ubuntu/daymark`. Its Stage 2 foundation includes strict TypeScript, pinned pnpm, reviewed lifecycle permissions, host diagnostics, complete route manifest, responsive shell, persisted sample workspace, accessible primitives, favicon, and automated unit/component/E2E coverage. The Preview listener is active on configured port 3000.

**Current status:** Stages 0–9 are complete. The required production README is in place; the final type, unit/component, Chromium E2E, lint, format, build, and production smoke gates passed. Cross-browser, accessibility, responsive, performance/network, dependency/security, Preview, and Git evidence is recorded in `docs/STAGE-GATES.md`. The current address is a Preview, not a claimed public production deployment.

**Stage 5 checkpoint note:** Local `HEAD` and canonical `origin/main` both resolve to `b300ea3`. The Sandbox dashboard browser at https://manus.im/ showed the logged-out public home, so Version History could not be independently checked; do not claim a visible checkpoint card or successful publication from the Git push alone.

**No genuine product or technical blocker is known.** The PRD requires no backend, database, authentication, secret, or external account. Public publication was not requested; delivery will identify the Preview accurately unless publication is separately requested and confirmed.

## Product and scope

Daymark is a calm, focused, local-first task workspace for students and knowledge workers. Its primary goal is to help the user quickly understand today’s work, decide what matters next, and update it without noisy administration. Primary actions are to create, prioritize, schedule, complete, and organize tasks.

Required routes: `/` intentionally renders Today; `/today`; `/tasks`; `/tasks/:taskId`; `/projects`; `/projects/:projectId`; `/settings`. `/focus` remains future scope. Required tasks include create, edit, complete/uncomplete, delete with confirmation, status, priority, due date, project assignment, tags, search across task title/description and project name, combined filters (status/priority/project), sorting (due date/priority/created/title), activity, and local persistence. Projects support list/detail/create/edit/archive/delete, task composition/assignment, activity, and progress derived from real tasks. Deleting a project leaves its tasks intact and unassigned.

Settings will persist light/dark/system theme, compact mode, reduced motion, and show-completed-today behavior; restore sample data; export local JSON; clear local data with explicit confirmation; and show About information. Include the PRD’s “should have” features: Today/Upcoming/Completed views or equivalent, progress and recent activity, Quick Add, keyboard shortcuts, command/search palette, dark theme, reduced motion, and undo for completion/deletion where appropriate. Do not expand into the PRD’s “could have” or “not now” features.

## Staged execution and gates

1. **Stage 0 — Discovery:** complete; all three source documents read fully, product and constraints understood, five named design references reviewed, initial repository inspection and blockers recorded.
2. **Stage 1 — Product + design foundation:** complete; `PRODUCT.md`, `DESIGN.md`, stage-gate/discovery notes, required sample-data specification, visual references, and contrast-checked design tokens are in the project.
3. **Stage 2 — Application foundation:** complete; React + TypeScript + Vite, pinned package manager, reviewed lifecycle-script permissions, pre-edit language diagnostics, routing/metadata/full route manifest, global styles/tokens, accessible primitives, responsive AppShell/navigation/theme bootstrap, versioned local repository, and deterministic seed data all pass the foundation gate.
4. **Stage 3 — Today vertical slice:** complete; implement and verify focus/overdue/upcoming/completed groups, project context, progress, activity, Quick Add, create/complete/undo feedback, persistence, keyboard behavior, and empty/loading/error/recovery states. See the Stage 3 gate record.
5. **Stage 4 — Tasks vertical slice (complete):** list and task detail, search, combined filters, sorting, validated create/edit, delete confirmation/undo, completion, activity and persistence. Dialogs explicitly restore focus (with a logical fallback when deletion removes the opener); task action disclosures close with Escape and return focus. The complete Stage 4 gate record is in `docs/STAGE-GATES.md`.
6. **Stage 5 — Projects vertical slice (complete):** project index/detail, validated name/description/color forms, archive/delete actions, task relationships, derived progress/activity, focused project-task filters/sort, and a compact assigned-task composer are implemented and verified. The index provides an explicit Archived view; archive preserves assignment/history and disables new task assignment, while safe deletion preserves each task and sets affected `projectId` values to `null`. Progress/last-updated derive from canonical records; the composer uses the user’s default task status and fixes assignment to its project. Test, accessibility, viewport, visual QA, and public-preview evidence is recorded in `docs/STAGE-GATES.md`.
7. **Stage 6 — Settings + data (complete):** accessible appearance/preferences, restore/export/clear actions, explicit destructive confirmations, persistence feedback, and About information are implemented. Clear-data persists as a valid empty workspace so reload does not reseed; sample restore is the distinct path back to demo data. Evidence is in `docs/STAGE-GATES.md`.
8. **Stage 7 — Cross-application polish (complete):** shared route states, keyboard/focus behavior, reduced motion, responsive composition, mobile navigation, overflow, empty/error/success states, and Anti-Slop visual principles were reviewed. An unused scaffold was removed; all core routes were inspected at desktop/mobile sizes; the responsive mobile navigation now has explicit four-route browser coverage. Evidence is in `docs/STAGE-GATES.md`.
9. **Stage 8 — QA (complete):** the 74-test unit/component suite, all 24 Chromium/Firefox/WebKit E2E journeys, accessibility, responsive/visual, performance/network and dependency/security checks passed alongside lint, strict types, formatting, production build and production route smoke. Exact evidence and limitations are in `docs/STAGE-GATES.md`.
10. **Stage 9 — Production readiness (complete):** `README.md` covers every required PRD documentation topic, including internship mapping, architecture/state, validation, sample behavior, setup/testing/build/deployment, accessibility, design/Anti-Slop, limitations, and future scope. The final production build and all route/manifest smoke checks passed; the Preview/checkpoint/publication state is documented accurately in `docs/STAGE-GATES.md`.

**Non-negotiable gate:** Do not advance merely because a route renders. Each current stage must be fully implemented, designed, usable with realistic data, responsive, state-complete, accessible, tested where applicable, visually reviewed, and free of known critical defects. Failed gates are fixed before proceeding.

## Architecture and project structure

Use the PRD’s lightweight stack: React, strict TypeScript, Vite, React Router, browser localStorage behind a repository/service boundary, Vitest, React Testing Library, Playwright, ESLint, and Prettier. Use Lucide React as one consistent icon family; use locally bundled variable Newsreader and DM Sans for the intentional display/UI pairing. Avoid a large component framework or unnecessary dependencies. Pin the package manager and handle lifecycle-script permissions using the WebDev dependency-setup rules.

Proposed structure:

```text
/home/ubuntu/daymark/
├── public/
│   ├── favicon.svg              # Daymark horizon mark
│   └── manus-routes.json        # synchronized complete page-route manifest
├── e2e/                         # Playwright critical user journeys
│   ├── shell.spec.ts
│   └── today.spec.ts
├── src/
│   ├── app/                     # app entry, router, document titles, providers
│   ├── components/
│   │   ├── ui/                  # semantic reusable controls/primitives
│   │   ├── layout/              # AppShell, navigation, page/section layouts
│   │   └── feedback/            # toasts, empty/error/loading states
│   ├── features/
│   │   ├── today/               # Today route, selectors, Quick Add, task rows
│   │   ├── tasks/               # task types, validation, selectors, components
│   │   ├── projects/            # project types, validation, selectors, components
│   │   ├── activity/            # activity feed and formatters
│   │   └── settings/            # preference/data-management views
│   ├── pages/                   # Today, Tasks, Task Detail, Projects,
│   │                            # Project Detail, Settings route surfaces
│   ├── services/
│   │   ├── storage/             # single localStorage boundary, migrations,
│   │   │                            # validation, import/export and recovery
│   │   └── repository/          # app-facing persistence contract
│   ├── state/                   # shared app state/provider/reducer/actions
│   ├── data/                    # stable seed dataset and relative date helpers
│   ├── styles/                  # semantic tokens, global styles, utilities
│   └── utils/                   # date, ids, formatting and pure helpers
│   └── test/                    # shared Vitest setup; unit tests colocated
├── docs/source/                 # exact copies of the three authoritative sources
├── docs/design/                 # reviewed design and screenshot artifacts
├── PRODUCT.md
├── DESIGN.md
├── README.md
└── package.json / lockfile / TypeScript, Vite, lint and test configuration
```

State boundaries: local component state for forms/dialogs/popovers/focus/temporary input; lifted state for page toolbars and lists; shared context/reducer for tasks, projects, activity, preferences, and persistence status. Keep filters and transient UI state out of persisted storage. Derive task groups, completion summaries, project counts/progress, search/filter/sort results, and overdue/upcoming values from canonical data. Browser storage is untrusted: validate version/shape and individual records, retain recoverable valid data, seed when absent, surface recoverable corruption/storage errors, and never let one invalid record crash the app.

Serving is entirely client-side; no server/database is enabled. Development uses the managed project’s configured port 3000 bound to `0.0.0.0`, and the static `/manus-routes.json` page manifest is created and checked before the first dev-server start. Use relative browser-facing URLs. Start one resident dev server after meaningful UI exists, verify its HTTP readiness, and reuse it.

## Design decisions

- **Design movement:** contemporary editorial / humanist product interface; paper-and-ink warmth without faux-paper skeuomorphism.
- **Core principles:** Today-first information hierarchy; task-operational density; rules/whitespace before boxes; tactile yet immediate interactions.
- **Color philosophy:** natural warm canvas, deep graphite ink, readable muted metadata, and one functional terracotta accent. Dark mode is low-glare ink/paper, not pure black. Status uses text/semantics in addition to color. Light canvas/surface/ink/accent are `#F5F2EA`, `#FCFAF5`, `#292A24`, `#8F4935`; dark canvas/surface/ink/accent are `#1D201D`, `#252925`, `#F1EEE5`, `#D18A6D`. Semantic tokens and contrast ratios are specified in `DESIGN.md` and will be rechecked against rendered controls/states.
- **Layout paradigm:** restrained desktop sidebar and an asymmetric editorial Today composition (primary focus list plus narrow progress/activity rail); the rail collapses into a single mobile flow with compact top header and touchable bottom primary navigation. Tasks use ruled lists; project cards appear only when comparison benefits from grouping.
- **Signature elements:** the Newsreader lowercase `daymark` wordmark with a horizon/day-mark symbol; short terracotta focus rule beside active navigation or priority; fine separators and editorial date labels around real task content.
- **Interaction philosophy:** clear state and feedback, immediate frequent task actions, no fake controls, accessible labels/errors, useful recovery, and preserved input/focus. One primary action per local context; quiet secondary actions.
- **Animation:** optional and functional. Frequent/keyboard actions are immediate. Occasional dialogs/drawers/popovers/toasts use restrained opacity/transform transitions of 120–240ms, no bounce or layout animation, hover only for fine pointers, and reduced-motion alternatives.
- **Typography:** Newsreader variable for wordmark/page titles only; DM Sans variable for UI/body/task/form text; tabular figures for scannable counts where useful. Bundle only needed font files and supply robust fallbacks.
- **Brand essence:** “A personal work journal that helps people choose and complete today’s work with less interface noise.” Personality: calm, capable, tactile.
- **Brand voice:** concise and work-oriented; example lines: “Three tasks are on your plate today.” / “Your changes are still here. Try saving again.” Avoid generic greetings and invented claims.
- **Wordmark/logo:** a short ruled baseline and rising arc/dot, suggesting a daily mark rather than streak/gamification; use sparingly and provide an accessible name.
- **Signature brand color:** grounded terracotta `#8F4935` in light mode, adapted to `#D18A6D` in dark mode; use for primary action/focus, not broad decoration.

The five named design resources are review filters, not replacement specifications: UI/UX Pro Max contributes responsive/contrast/text-resilience checks; Impeccable contributes product/visual truth separation and critique/audit/harden process; Taste contributes contextual variance/motion/density; Emil Kowalski contributes frequency-aware motion guidance; Anti-Slop rejects generic decoration without stripping product identity. The supplied PRD and workflow remain authoritative. No decorative photo/illustration will be used because this is an internal task workspace and the PRD says to omit meaningless imagery.

## Data, validation, and sample behavior

Use the required models and validation messages/rules from the PRD. Task title: required, trimmed, 2–120 chars, with exact errors “Give the task a name.”, “Task names must contain at least 2 characters.”, and “Task names can be up to 120 characters.” Description max 2,000; valid priority/status enums; optional valid date (past dates allowed); optional existing project; tags trimmed/deduplicated, max 8, max 24 chars each. Project name required 2–60; optional description max 300. Validate on submit and affected fields on blur/change after the first submit; focus first invalid field; textual linked errors; preserve input; prevent duplicate submission; disable only while actually submitting.

Use four named projects (Portfolio Refresh, Internship Deliverables, Personal Systems, Learning Lab) and all ten named PRD sample tasks. Seed stable IDs/content/order, realistic descriptions, timestamps, tags, statuses, priorities, assignments and activity; ensure exactly three active tasks due today, an active overdue task, two completed tasks, future tasks, an unassigned task, multiple tags and every status/priority variant. Use local-date-relative due offsets so the sample stays demonstrative on future visits.

## Verification approach

Verification follows the same vertical gates as implementation: test user-observable behavior and state/persistence, not implementation details. At the end of each slice, run the narrowest relevant unit/component/integration checks, verify keyboard and responsive behavior, inspect its visual states against `DESIGN.md`, fix issues, and only then advance. Final QA covers the PRD’s critical journeys, validation/storage/date/filter/sort/progress logic, task/project relations and deletion consequences, persistence after reload, reset/export/clear, route states, keyboard/dialog/focus/reduced-motion/accessibility, contrast and no color-only status, mobile through large desktop, cross-browser layout, console/network/performance, dependency/security review, lint/typecheck and production build. Confirm the static route manifest matches source and run a Preview smoke test. Do not claim public publication unless confirmed.

## Assumptions and open risks

- `/` renders the Today view with Today navigation active.
- The PRD mentions “default task behavior” but does not define it; interpret this narrowly as a persisted default status (`inbox` or `todo`) for new tasks, preserving the required Preferences fields.
- Sample due dates are relative to the local calendar date while IDs and content remain stable.
- Project deletion unassigns tasks; archiving preserves project/task data.
- No task-specific visual assets are required; decorative imagery is intentionally omitted.
- No unresolved product blocker is known. The managed project is populated and the configured port-3000 Preview is listening; public publication was not requested.
