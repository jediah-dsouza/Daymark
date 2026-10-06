# Daymark Discovery Record

**Status:** Stages 0–9 complete; production readiness, required README, final build, smoke checks, and truthful Preview/publication reporting are complete.
**Authority:** `DAYMARK-TASK-2-PRD.md`, `MASTER-FRONTEND-WEB-DEVELOPMENT-WORKFLOW.md`, and `MASTER BUILD PROMPT — DAYMARK.md` from the supplied ZIP.

## Product understanding

Daymark is a local-first, single-user task-management workspace for students and knowledge workers who need to capture, prioritize, schedule, organize, and complete work without a noisy project-administration dashboard. Its central goal is: **quickly understand what needs doing, decide what matters next, and update work without fighting the interface.** The first view should be useful immediately from a deterministic sample dataset; tasks, projects, activity, and preferences persist in browser storage behind a repository boundary.

The PRD's required routes are `/`, `/today`, `/tasks`, `/tasks/:taskId`, `/projects`, `/projects/:projectId`, and `/settings`. No authentication, collaboration, server sync, AI task generation, billing, or team permissions are in MVP. The principal data models are Task, Project, Activity, Preferences, and TaskFilters; derived counts/progress/overdue/upcoming/filter results should be computed rather than duplicated.

## Governing implementation gates

1. **Stage 0 — Discovery:** source review, product/UX understanding, design-resource guidance, constraints and blockers.
2. **Stage 1 — Product + design foundation:** `PRODUCT.md`, `DESIGN.md`, design tokens, typography/color/spacing, component/interaction/motion/accessibility principles, sample-data specification; validate visual direction before app implementation.
3. **Stage 2 — Application foundation:** initialize/configure project, global styles/tokens, semantic primitives, routing, AppShell, responsive navigation, sample data. Do not proceed until the shell is polished.
4. **Stage 3 — Today vertical slice:** useful seeded Today experience, completion, Quick Add, feedback, persistence, accessibility, responsive behavior, tests and visual QA.
5. **Stage 4 — Tasks vertical slice:** search, combined filters, sorting, task list/detail and full validated create/edit/delete/complete flow, persistence, feedback, tests and visual QA.
6. **Stage 5 — Projects vertical slice:** validated project CRUD, list/detail, task assignment/composition, derived progress, activity, explicit non-cascading deletion, tests and visual QA.
7. **Stage 6 — Settings + data:** persisted appearance/preferences, reset/export/clear data and explicit destructive confirmations.
8. **Stage 7 — Cross-application polish:** reconcile shared components/states, accessibility, motion, error/empty/loading/success handling and responsive refinement.
9. **Stage 8 — QA:** unit/component/integration/E2E, accessibility/responsive/visual/cross-browser/performance/security/dependency checks and production build; fix and re-verify failures.
10. **Stage 9 — Production readiness:** README/documentation, production build and smoke test, accurate preview/publication status.

**No stage advances until its required scope is fully implemented, designed, functional, responsive, state-complete, accessible, tested where applicable, populated with realistic data, visually reviewed and free of obvious defects.**

## Design-reference review

The five sources named by the build prompt were reviewed through their official GitHub repositories. Their shared contribution is a critique/filter layer—not an alternate product specification: keep product truth separate from visual direction, compose around real tasks and hierarchy, avoid generic AI/SaaS defaults, make text resilient to narrow widths/zoom/scaling, make controls keyboard- and screen-reader-operable, treat motion as optional and purposeful, and inspect rendered states across breakpoints. Specific transferable guidance and source links are recorded in `DESIGN.md`.

An image search found notebook/paper imagery, but no image is selected for product use: a local task-management workspace has no product need for decorative photography, and the PRD explicitly warns against meaningless illustration and decoration.

## Genuine blockers and assumptions

- **No existing application repository or project files were present** in the initial workspace. This was not a requirements blocker; a new managed React/Vite project is now initialized at `/home/ubuntu/daymark`, and its Stage 2 gate is complete.
- **No suitable configured WebDev connector entry appeared** in session config, but the built-in `webdev-mcp` tools are available in this Sandbox, so work can proceed through the supported managed project path.
- **No backend/authentication is required** by the PRD. Use client-side state plus localStorage and a replaceable repository boundary; do not add server/database services.
- The PRD lists “default task behavior” in Settings without defining its exact meaning. Stage 1 records a narrow interpretation: persist a default status (`inbox` or `todo`) for newly created tasks; retain the required Preferences fields.
- `/` will intentionally render the Today experience (with Today active) rather than being an accidental blank/redirect route.
- Sample due dates will be relative to the user's local calendar date, while seed IDs/content/order are stable. This keeps overdue/today/upcoming demonstrations valid on first visit without persisting stale dates.
- No product, permission, credential, or technical blocker currently prevents the next stage. Stage 2 passed its unit/component, E2E, accessibility, responsive, TypeScript, lint, format, build, route-manifest, and visual gates. Stage 3 Today also passed 28 unit/component tests, 13 Chromium E2E tests, axe checks, responsive/visual review, route-manifest verification, and production build. Public publication is not requested; the eventual delivery should be labeled accurately as a preview unless publication is separately authorized.
