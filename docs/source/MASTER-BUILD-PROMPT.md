# MASTER BUILD PROMPT — DAYMARK

You are the **lead product designer, senior frontend engineer, UX engineer, accessibility engineer, QA engineer, and visual QA reviewer** responsible for building the complete Daymark application described in the attached/provided PRD.

Your job is NOT to produce a quick prototype.

Your job is to take the PRD and Master Frontend Web Development Workflow as the **source of truth** and build a polished, production-quality frontend application from start to finish.

---

## 1. SOURCE OF TRUTH — READ BEFORE WRITING CODE

Before making any implementation decision:

1. Read the complete **Daymark Task 2 PRD**.
2. Read the complete **Master-Frontend-Web-Development Work-flow.md**.
3. Treat both documents as authoritative project requirements.
4. Do not replace their requirements with generic assumptions.
5. Preserve the terminology, architecture, design principles, workflow stages, quality gates, and Definition of Done described in those documents.

The PRD defines WHAT must be built.

The Master Frontend Workflow defines HOW the product must be designed, engineered, validated, and completed.

Do not skip either.

---

# 2. CORE PRODUCT

Build **Daymark**, a polished task-management web application designed around:

* calm productivity
* focus
* clarity
* tactile interaction
* editorial visual character
* strong information hierarchy
* deliberate motion
* excellent accessibility
* responsive behavior
* realistic sample data
* reusable architecture
* robust form validation
* predictable state management
* persistent browser data

Daymark must NOT look like a generic AI-generated SaaS dashboard.

It should feel like a product where deliberate design decisions were made.

---

# 3. NON-NEGOTIABLE DEVELOPMENT RULE

## DO NOT MOVE TO THE NEXT STAGE UNTIL THE CURRENT STAGE IS COMPLETE.

A stage is only complete when it is:

* fully implemented
* visually designed
* functional
* responsive
* accessible
* state-complete
* populated with realistic sample data
* tested where applicable
* visually reviewed
* free of obvious UI defects
* consistent with the PRD
* consistent with the Master Frontend Workflow

Do NOT create a skeleton and then move forward.

Do NOT leave placeholder components and continue.

Do NOT leave TODOs for core functionality.

Do NOT mark something complete simply because the route exists.

Do NOT substitute unfinished functionality with mock buttons.

If a stage fails validation, fix it before proceeding.

---

# 4. WORK IN VERTICAL SLICES

Follow the project's vertical-slice development model.

For every feature:

1. Design it.
2. Build the UI.
3. Connect state.
4. Connect data.
5. Implement interactions.
6. Implement validation.
7. Implement loading/empty/error/success/disabled/selected states.
8. Make it responsive.
9. Make it accessible.
10. Test it.
11. Perform visual QA.
12. Fix issues.
13. Only then proceed.

The final application must be usable at every completed stage.

---

# 5. DESIGN INTELLIGENCE RESOURCES

Use the following resources as **design intelligence and review references**, not as excuses to copy generic templates.

### UI/UX Pro Max

https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

Use it for:

* UI/UX patterns
* design-system reasoning
* typography
* color systems
* spacing
* interaction patterns
* accessibility
* responsive behavior
* navigation
* component decisions

### Impeccable

https://github.com/pbakaus/impeccable

Use it to:

* critique the interface
* identify generic AI patterns
* improve hierarchy
* improve spacing
* improve typography
* improve visual polish
* improve interaction quality
* perform visual refinement

### Taste Skill

https://github.com/Leonxlnx/taste-skill

Use its principles to deliberately tune:

* visual variance
* motion
* density
* composition
* design-system coherence
* anti-generic visual decisions

Do not blindly copy its aesthetics.

### Emil Kowalski Skills

https://github.com/emilkowalski/skills

Use these principles for:

* interaction design
* animation
* transitions
* easing
* timing
* motion hierarchy
* feedback
* reducing unnecessary animation

Motion should communicate state and hierarchy rather than exist for decoration.

### Anti-Slop

https://github.com/miqdadbadjuber/anti-slop

Use it as a FINAL QUALITY FILTER.

Before considering the UI complete, aggressively inspect the application for:

* generic AI aesthetics
* excessive rounded cards
* unnecessary gradients
* excessive glassmorphism
* meaningless decorative elements
* repetitive card grids
* weak typography
* poor spacing
* generic copy
* excessive pills
* excessive shadows
* visual sameness
* unnecessary animations
* template-like layouts
* arbitrary visual noise

If something feels like "AI-generated frontend," redesign it.

---

# 6. DESIGN DIRECTION

Follow the PRD's Daymark design direction.

The interface should communicate:

**calm + capable + tactile + editorial + focused + distinctive**

Do NOT default to:

* generic blue SaaS
* purple AI gradients
* glassmorphism everywhere
* giant hero sections
* excessive rounded containers
* floating cards everywhere
* excessive badges
* excessive shadows
* dashboard-template layouts
* meaningless illustrations
* decorative gradients without purpose

Use a warm-neutral visual foundation.

Use a distinctive editorial/display typography treatment paired with a highly readable interface sans.

Use:

* deliberate spacing
* strong hierarchy
* restrained borders
* controlled shadows
* purposeful accent color
* consistent iconography
* intentional density
* carefully designed states

Every visual choice should have a reason.

---

# 7. REQUIRED APPLICATION ROUTES

Implement every route defined in the PRD:

* `/`
* `/today`
* `/tasks`
* `/tasks/:taskId`
* `/projects`
* `/projects/:projectId`
* `/settings`

Implement `/focus` only if the PRD's optional future scope is explicitly included.

The root route should behave intentionally and must not feel like an accidental redirect.

Every route must have:

* loading behavior where relevant
* empty state
* error state where relevant
* success feedback where relevant
* responsive layout
* accessible navigation
* proper document title/metadata
* correct active navigation state

---

# 8. REQUIRED PAGES

Build every page and every major component defined by the PRD.

## TODAY

Implement:

* AppShell
* SidebarNavigation
* TopBar
* TodayHeader
* FocusSection
* FocusTaskItem
* ProgressSummary
* UpcomingSection
* ActivitySection
* EmptyTodayState
* TodayErrorState
* QuickAddDrawer

The page must feel like the user's working home rather than a generic dashboard.

---

## TASKS

Implement:

* TasksHeader
* TaskToolbar
* SearchField
* FilterPopover
* SortMenu
* TaskList
* TaskRow
* TaskListEmpty
* TaskFormDialog
* DeleteTaskDialog
* ToastRegion

Implement real:

* search
* filtering
* sorting
* creation
* editing
* deletion
* completion
* validation
* feedback

---

## TASK DETAIL

Implement:

* TaskDetailHeader
* TaskDetailBody
* TaskEditForm
* TaskActivity
* TaskNotFoundState

The detail page must be a genuine usable page, not simply a larger version of a task row.

---

## PROJECTS

Implement:

* ProjectsHeader
* ProjectGrid
* ProjectCard
* ProjectEmptyState
* ProjectFormDialog
* DeleteProjectDialog

Projects must connect to the actual task data.

---

## PROJECT DETAIL

Implement:

* ProjectDetailHeader
* ProjectProgress
* ProjectTaskToolbar
* ProjectTaskList
* ProjectActivity
* ProjectEmptyState
* ProjectNotFoundState
* ProjectTaskComposer

Project progress and task counts must be derived from real application state.

---

## SETTINGS

Implement:

* SettingsLayout
* AppearanceSection
* PreferencesSection
* DataSection
* DangerActionDialog
* AboutSection

Settings must actually affect the application where applicable.

---

# 9. REUSABLE COMPONENT ARCHITECTURE

Create a real reusable component system.

Include the primitives specified in the PRD:

* Button
* IconButton
* Input
* Textarea
* Select
* Checkbox
* RadioGroup
* Switch
* DateInput
* Label
* FieldMessage
* Badge
* Divider
* Tooltip
* Popover
* DropdownMenu
* Dialog
* Drawer
* Tabs
* ProgressBar
* Skeleton
* Spinner
* Toast
* ToastRegion
* EmptyState
* ErrorState
* VisuallyHidden

Also implement reusable layout components:

* AppShell
* SidebarNavigation
* TopBar
* PageContainer
* PageHeader
* Section
* Stack
* Inline
* ResponsiveGrid

Do not duplicate UI logic unnecessarily between pages.

---

# 10. DATA MODEL

Implement the data models defined by the PRD:

* Task
* Project
* Activity
* Preferences
* TaskFilters

Use strongly typed TypeScript models.

Avoid `any` unless there is an exceptional and documented reason.

Create realistic seed data.

Use the sample projects and tasks defined in the PRD.

The initial application must look populated and demonstrate the product immediately.

---

# 11. STATE MANAGEMENT

Implement the PRD's state architecture.

Separate:

### Local UI state

Examples:

* dialogs
* drawers
* popovers
* temporary form values
* expanded sections

### Shared application state

Examples:

* tasks
* projects
* activity
* preferences
* filters
* persistence status

### Derived state

Examples:

* completion percentage
* task counts
* project counts
* overdue tasks
* upcoming tasks
* filtered tasks
* completed tasks
* active tasks

Do not duplicate derived state unnecessarily.

---

# 12. PERSISTENCE

Use browser persistence through a repository/service boundary.

Architecture should follow:

UI
↓
Application State
↓
Repository / Service
↓
localStorage

Do NOT scatter `localStorage` calls throughout components.

Persist:

* tasks
* projects
* activity
* preferences

Do NOT persist temporary UI state unnecessarily.

Seed sample data when no application data exists.

Validate stored data before using it.

Handle corrupted/invalid stored data safely.

---

# 13. FORM VALIDATION

Implement the PRD's validation requirements.

## Task

Title:

* required
* 2–120 characters

Description:

* optional
* maximum 2,000 characters

Priority:

* valid enum

Status:

* valid enum

Due date:

* optional
* valid date

Project:

* must exist when supplied

Tags:

* maximum 8
* maximum 24 characters each
* trim
* deduplicate

## Project

Name:

* 2–60 characters

Description:

* maximum 300 characters

Validation behavior:

* validate on submit
* then validate affected fields on blur/change
* focus the first invalid field
* show textual error messages
* never rely only on color
* preserve valid user input
* prevent duplicate submissions

---

# 14. COMPLETE UI STATE COVERAGE

Every meaningful component must account for its relevant states.

At minimum consider:

* loading
* empty
* error
* success
* disabled
* hover
* focus
* active
* selected
* expanded
* collapsed
* submitting
* validation error
* not found

Do not build only the "happy path."

---

# 15. RESPONSIVE DESIGN

The application must work properly across:

* mobile
* tablet
* laptop
* desktop
* large desktop

Do not simply shrink desktop layouts.

Adapt:

* navigation
* spacing
* task rows
* forms
* dialogs
* drawers
* grids
* toolbars
* typography
* information density

There must be:

* no horizontal overflow
* no clipped content
* no inaccessible controls
* no broken dialogs
* no unusable mobile forms

---

# 16. ACCESSIBILITY

Treat accessibility as a core requirement.

Implement:

* semantic HTML
* correct landmarks
* logical heading hierarchy
* keyboard navigation
* visible focus states
* accessible labels
* accessible validation errors
* dialog focus management
* focus return
* appropriate ARIA only where necessary
* sufficient contrast
* non-color-only status communication
* reduced-motion support
* usable touch targets
* screen-reader-friendly controls

Test keyboard flows manually and/or automatically.

---

# 17. MOTION

Motion must be deliberate.

Use motion for:

* dialog entrance/exit
* drawer transitions
* toast appearance
* task completion feedback
* navigation continuity
* meaningful state changes

Avoid:

* constant floating animations
* unnecessary hover animations
* excessive bouncing
* animation on every element
* slow transitions that make the interface feel sluggish

Respect:

`prefers-reduced-motion`

Use consistent easing and duration tokens.

---

# 18. ICONS

Use one coherent icon family.

Do not mix unrelated icon styles.

Icons should:

* communicate meaning
* have accessible labels when needed
* align optically
* use consistent sizing
* not replace necessary text labels

Do not use emojis as primary UI icons.

---

# 19. COPY

Write real product copy.

Do not use:

* Lorem ipsum
* placeholder paragraphs
* "Click here"
* "Something went wrong" without useful context
* generic AI marketing copy
* meaningless feature descriptions

Use concise, human, product-oriented language.

---

# 20. ERROR HANDLING

Errors must help the user recover.

Examples:

Bad:

"Error."

Better:

"That task couldn't be saved. Your changes are still here. Try again."

Provide recovery actions where appropriate.

---

# 21. TESTING

Implement testing appropriate to the architecture.

Include:

### Unit tests

For:

* validation
* filtering
* sorting
* derived calculations
* persistence utilities
* data transformation

### Component tests

For:

* forms
* task interactions
* dialogs
* filters
* project interactions
* empty/error states

### Integration tests

For:

* create task
* edit task
* complete task
* delete task
* create project
* project/task relationships
* persistence

### E2E tests

Cover critical user journeys:

1. First visit
2. Create task
3. Edit task
4. Complete task
5. Delete task
6. Create project
7. Assign task to project
8. Search/filter tasks
9. Refresh and verify persistence
10. Navigate between pages

---

# 22. VISUAL QA

After implementation, inspect the application like a professional product designer.

Check:

* typography
* hierarchy
* spacing
* alignment
* density
* contrast
* borders
* shadows
* icon consistency
* responsive behavior
* interaction feedback
* empty states
* error states
* dialogs
* forms
* navigation
* visual rhythm

Look for:

* awkward wrapping
* inconsistent spacing
* oversized controls
* tiny text
* excessive cards
* excessive pills
* generic layouts
* visual noise
* dead space
* weak hierarchy
* inconsistent component styling

Fix every meaningful issue you find.

---

# 23. ANTI-SLOP QUALITY GATE

Before declaring the project complete, ask:

1. Does this look like a generic AI-generated dashboard?
2. Are there unnecessary rounded cards?
3. Are gradients being used without purpose?
4. Is there excessive glassmorphism?
5. Are too many things presented as cards?
6. Is typography distinctive enough?
7. Does the visual hierarchy feel intentional?
8. Are spacing decisions consistent?
9. Is the interface overly decorative?
10. Does motion have a purpose?
11. Are empty states actually designed?
12. Does mobile feel intentionally designed?
13. Does the product have a recognizable visual personality?
14. Does the UI feel like a coherent product rather than a collection of components?

If any answer indicates a problem:

**FIX IT.**

Do not rationalize unfinished or generic design.

---

# 24. CODE QUALITY

Write production-quality TypeScript/React.

Follow:

* clear naming
* small focused components
* predictable state flow
* reusable abstractions
* strict typing
* separation of concerns
* accessible markup
* maintainable CSS
* consistent formatting
* linting
* no unnecessary dependencies
* no dead code
* no duplicated business logic

Do not over-engineer.

Do not create abstractions before they are justified.

---

# 25. PROJECT ARCHITECTURE

Follow the PRD's architecture.

Organize code into appropriate areas such as:

```text
src/
  app/
  components/
  features/
  pages/
  services/
  state/
  hooks/
  lib/
  styles/
  data/
  types/
  utils/
```

Feature logic should remain close to its feature where practical.

Shared primitives belong in shared component locations.

Business/data logic should not be buried inside presentational components.

---

# 26. DESIGN TOKENS

Create a coherent token system for:

* colors
* typography
* spacing
* radii
* borders
* shadows
* transitions
* motion
* breakpoints
* layout widths

Do not scatter arbitrary values everywhere.

Use tokens consistently.

---

# 27. PRODUCT DETAILS MUST BE REAL

Every visible interaction should actually work.

For example:

If there is an "Add task" button:

→ it opens the actual form.

If the form is submitted:

→ validation runs.

If valid:

→ task is created.

Then:

→ state updates.

Then:

→ UI updates.

Then:

→ activity is recorded where specified.

Then:

→ persistence occurs.

Then:

→ feedback is shown.

Then:

→ the user can continue working.

Do not fake interactions.

---

# 28. SAMPLE DATA

The application must ship with realistic sample data.

Use the PRD's sample projects, tasks, activities, and preferences.

The initial state should demonstrate:

* active tasks
* completed tasks
* overdue/upcoming tasks where applicable
* multiple priorities
* multiple projects
* project progress
* activity history
* realistic task descriptions
* realistic tags

Avoid fake-looking filler data.

---

# 29. DEVELOPMENT PROCESS

Follow this exact sequence:

## STAGE 0 — DISCOVERY

Read:

* PRD
* Master Workflow
* design resource guidance

Then summarize the implementation constraints internally.

Do not code yet.

---

## STAGE 1 — PRODUCT + DESIGN FOUNDATION

Create and establish:

* PRODUCT.md
* DESIGN.md
* design tokens
* typography
* colors
* spacing
* component principles
* interaction principles
* motion principles
* accessibility principles

Validate the visual direction before building the application.

---

## STAGE 2 — APPLICATION FOUNDATION

Implement:

* project setup
* routing
* global styles
* tokens
* AppShell
* navigation
* responsive structure
* base primitives

Do not move forward until the foundation is polished.

---

## STAGE 3 — TODAY VERTICAL SLICE

Complete Today from:

UI
→ state
→ data
→ interactions
→ persistence
→ validation
→ accessibility
→ responsive behavior
→ tests
→ visual QA

Only proceed when fully complete.

---

## STAGE 4 — TASKS VERTICAL SLICE

Fully implement:

* list
* search
* filters
* sorting
* create
* edit
* delete
* completion
* validation
* persistence
* feedback
* responsive behavior
* accessibility
* tests
* visual QA

Only proceed when fully complete.

---

## STAGE 5 — PROJECTS VERTICAL SLICE

Fully implement:

* project creation
* editing
* deletion
* project list
* project detail
* task relationships
* project progress
* project filtering
* project activity
* responsive behavior
* accessibility
* tests
* visual QA

Only proceed when fully complete.

---

## STAGE 6 — SETTINGS + DATA

Fully implement:

* appearance
* preferences
* data management
* reset behavior
* persistence
* destructive confirmation
* feedback
* accessibility
* responsive behavior

Only proceed when fully complete.

---

## STAGE 7 — QUALITY

Perform:

* lint
* type checking
* unit tests
* component tests
* integration tests
* E2E tests
* accessibility review
* responsive review
* visual QA
* anti-slop review
* performance review

Fix issues.

Repeat until clean.

---

# 30. DO NOT ASK ME TO MANUALLY FINISH CORE WORK

Do not respond with:

"Now you can implement X."

If you have the tools necessary to implement it, implement it.

Do not leave core functionality for me.

Do not give me pseudo-code instead of implementation.

Do not create a design-only prototype when the requirement is a working application.

---

# 31. TOOL AND DEPENDENCY DISCIPLINE

Before installing dependencies:

1. Check whether an existing dependency already solves the problem.
2. Prefer lightweight, stable solutions.
3. Avoid unnecessary libraries.
4. Do not add a dependency solely for visual novelty.
5. Explain any significant dependency that is introduced.

Do not introduce a huge UI framework if the PRD calls for a custom design system.

---

# 32. GIT DISCIPLINE

Use meaningful commits after completed vertical slices.

Examples:

```text
feat: establish Daymark design system
feat: build application shell
feat: implement Today vertical slice
feat: implement task management
feat: implement project management
feat: implement settings and persistence
test: add critical user journey coverage
fix: resolve responsive navigation issues
fix: improve task form accessibility
refactor: consolidate shared UI primitives
```

Do not create meaningless commits such as:

```text
update
changes
stuff
final
final-final
```

---

# 33. DOCUMENTATION

Maintain:

### README.md

Include:

* product overview
* features
* technology stack
* setup instructions
* development commands
* architecture overview
* design system overview
* testing
* accessibility
* persistence
* project structure
* sample data
* internship task mapping

### PRODUCT.md

Describe:

* product principles
* users
* goals
* scope
* UX principles

### DESIGN.md

Describe:

* visual direction
* typography
* color
* spacing
* components
* motion
* responsive behavior
* accessibility
* anti-slop decisions

---

# 34. FINAL ACCEPTANCE CRITERIA

Do NOT call Daymark complete until all of the following are true:

* [ ] Every required route exists.
* [ ] Every required page is implemented.
* [ ] Every required component is implemented.
* [ ] Components are genuinely reusable.
* [ ] Task creation works.
* [ ] Task editing works.
* [ ] Task deletion works.
* [ ] Task completion works.
* [ ] Search works.
* [ ] Filtering works.
* [ ] Sorting works.
* [ ] Project creation works.
* [ ] Project editing works.
* [ ] Project deletion works.
* [ ] Project/task relationships work.
* [ ] Progress calculations work.
* [ ] Form validation works.
* [ ] Error handling works.
* [ ] Success feedback works.
* [ ] Empty states exist.
* [ ] Loading states exist where appropriate.
* [ ] Not-found states exist.
* [ ] Data persists across refresh.
* [ ] Invalid stored data is handled safely.
* [ ] Sample data is realistic.
* [ ] Mobile layout works.
* [ ] Tablet layout works.
* [ ] Desktop layout works.
* [ ] Keyboard navigation works.
* [ ] Focus states work.
* [ ] Dialog accessibility works.
* [ ] Reduced motion works.
* [ ] TypeScript passes.
* [ ] Lint passes.
* [ ] Tests pass.
* [ ] Critical E2E flows pass.
* [ ] No obvious console errors.
* [ ] No obvious visual defects.
* [ ] No horizontal overflow.
* [ ] Design system is consistent.
* [ ] Typography is intentional.
* [ ] Motion is intentional.
* [ ] UI does not look generic or AI-generated.
* [ ] Anti-Slop review passes.
* [ ] README is complete.
* [ ] PRODUCT.md is complete.
* [ ] DESIGN.md is complete.

---

# 35. FINAL BEHAVIOR

Act as the owner of the implementation.

Think before coding.

Inspect before changing.

Build in vertical slices.

Validate each slice.

Fix problems immediately.

Do not prematurely progress.

Do not hide incomplete work.

Do not substitute mock functionality for real functionality.

Do not sacrifice accessibility for aesthetics.

Do not sacrifice usability for visual novelty.

Do not sacrifice maintainability for speed.

Do not sacrifice visual quality for technical completion.

The goal is not simply:

"the app runs."

The goal is:

**A complete, polished, responsive, accessible, maintainable, visually distinctive, fully functional Daymark application that satisfies the PRD and the Master Frontend Web Development Workflow.**

Most importantly:

> **Do not move to the next stage until the current stage is fully built, designed, functional, responsive, state-complete, accessible, tested where applicable, and demonstrable with realistic sample data.**

Begin by reading the PRD and Master Frontend Workflow, establishing the product/design foundation, and then execute the stages sequentially.
