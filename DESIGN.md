# Daymark — Design System

## Visual direction

**Editorial workspace · quiet confidence · warm precision · tactile controls · structured asymmetry · focused density · subtle motion.** Daymark should feel like a well-designed physical work journal translated into a modern digital workspace: authored and useful, not a generic dashboard template.

**Design movement:** Contemporary editorial / humanist product interface, with paper-and-ink warmth expressed through typography, ruled structure, and controlled accent—not faux-paper skeuomorphism.

**Brand essence:** A personal work journal for people who need to choose and complete today's work, distinguished by an editorial hierarchy and calm, trustworthy interaction. **Personality:** calm, capable, tactile.

**Voice:** concise, human, task-oriented. Name the next action and explain recovery without cheerleading. Examples: “Three tasks are on your plate today.” “Your changes are still here. Try saving again.” Avoid “Welcome back!”, generic claims, and filler.

**Wordmark/mark:** lowercase `daymark` in the display serif with a custom compact horizon mark: a short ruled baseline and a small rising arc/dot, a visual cue for marking the day rather than a streak or gamified achievement. Use the wordmark once in the shell, not as decorative repeats. Interactive mark has accessible name “Daymark, Today.”

## Visual principles

1. **Ink, paper, and one signal:** warm neutral surfaces and deep ink establish calm; muted terracotta is a functional action/focus signal. Status is always named in text or semantics, never color alone.
2. **Editorial hierarchy, operational density:** display serif is reserved for brand and page-level moments; highly readable sans handles navigation, task titles, forms, and dense metadata. Task content can scan quickly without card wrappers.
3. **Rules before boxes:** use whitespace and hairline dividers to group task rows and sections. Use containers only where grouping or overlays help; no nested cards, equal-weight dashboard tiles, default card shadows, or excessive pills.
4. **Tactile but immediate:** clear focus, pressed, selected, disabled, loading, and confirmation states; frequent task actions remain immediate. Motion supports continuity, not decoration.
5. **Responsive by composition:** preserve task hierarchy and action access at every width; mobile is intentionally single-column with touchable controls, not desktop squeezed smaller.

## Anti-references / rejection filter

- No purple-to-blue or decorative gradients, glassmorphism, blur, glow, or decorative grid backdrops.
- No generic SaaS-dashboard hero, giant greeting, decorative analytics, invented metrics, or repeated feature-card grids.
- No cards inside cards, every-section icon tiles, excessive rounded corners, heavy shadows, badge/pill overload, random emoji, or arbitrary decoration.
- No system-font-only visual identity; no Inter/Roboto-only typography treatment.
- No generic AI filler copy, fake user names/avatars/activity, hidden states, fake buttons, or color-only priority/status.
- No animation on every element, scroll-reveal delays, bounce, or motion that blocks repeated/keyboard interaction.
- No rigid single-line labels, clipped tags, desktop-only squeeze, horizontal overflow, or untested font/zoom/text-spacing layouts.
- Do not overcorrect into a sterile identity-free interface: keep the restrained serif/ink/terracotta signature and deliberate composition.

## Palette and color tokens

Palette intent: natural paper, graphite ink, muted olive-gray metadata, and a grounded terracotta action color. Dark mode is a low-glare ink-and-paper inverse, not pure black. Semantic colors communicate status but do not replace labels.

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--bg-canvas` | `#F5F2EA` | `#1D201D` | Application canvas |
| `--bg-surface` | `#FCFAF5` | `#252925` | Main readable surface |
| `--bg-surface-raised` | `#FFFFFF` | `#2C312C` | Dialog/popover surface only |
| `--text-primary` | `#292A24` | `#F1EEE5` | Body and headings |
| `--text-secondary` | `#55584F` | `#C6C6B8` | Supporting content |
| `--text-muted` | `#6A6D63` | `#A6A79A` | Metadata; not disabled text |
| `--border-subtle` | `#D9D5CA` | `#40453F` | Hairline structure |
| `--border-strong` | `#B7B2A6` | `#5A6058` | Emphasis, focus-adjacent structure |
| `--accent` | `#8F4935` | `#D18A6D` | Primary action/focus marker |
| `--accent-strong` | `#743A2B` | `#E3A184` | Hover/active accent |
| `--on-accent` | `#FCFAF5` | `#1D201D` | Contrast-safe foreground on the corresponding action fill |
| `--success` | `#42664A` | `#9AC29D` | Completed/success |
| `--warning` | `#80510F` | `#E5B66C` | Due/attention |
| `--danger` | `#9A3F35` | `#F0968A` | Destructive/error |
| `--info` | `#4E6470` | `#A6C0CF` | Neutral information |
| `--focus-ring` | `#8F4935` | `#E3A184` | Visible keyboard focus |

Token choice is centralized in `styles/tokens.css`; component styles consume semantic tokens rather than scattered hex values. Interactive action fills use `--on-accent`: warm paper (`#FCFAF5`) on the light terracotta fill (`#8F4935`, **6.35:1**) and dark ink (`#1D201D`) on the dark fill (`#D18A6D`, **5.93:1**). Their hover pairs are **8.45:1** and **7.60:1** respectively. A direct calculation found dark ink on the light terracotta provides only 2.19:1 for action text, so that conceptual pairing is rejected. Pair semantic color with labels, icon shape, or accessible text.

Contrast calculation (WCAG relative luminance, normal text; independently checked before implementation): light primary/secondary/muted text against canvas = **12.94:1 / 6.48:1 / 4.72:1**; light accent/success/warning/danger/info against canvas = **5.92:1 / 5.81:1 / 6.05:1 / 5.99:1 / 5.55:1**. Dark primary/secondary/muted against surface = **12.72:1 / 8.56:1 / 6.06:1**; dark accent/success/warning/danger/info against surface = **5.32:1 / 7.44:1 / 7.90:1 / 6.63:1 / 7.78:1**. Recheck actual text sizes, hover/disabled/control states, and component-specific surfaces during implementation and browser QA; decorative/disabled states do not excuse inadequate usable text contrast.

Project identity markers use four restrained tokens (clay/rust, rust, olive, slate) as a small dot or short rule beside a readable project name, never as a full colored text surface. They remain visually subordinate to the single action accent.

## Typography

- **Display / brand:** Newsreader variable, with `Georgia`/serif fallback. Use for wordmark, page titles, and rare editorial emphasis only.
- **Interface / body:** DM Sans variable, with system sans fallback. Use for task names, navigation, controls, forms, descriptions, and metadata.
- **Numeric utility:** DM Sans tabular figures for counts/date columns when it improves scanning; no separate display font for metrics.
- Load only the needed variable font files/weights locally where possible; provide robust fallbacks and avoid layout shift.

| Role | Desktop | Mobile | Weight/line-height |
| --- | --- | --- | --- |
| Display page heading | 2.35rem / 37.6px | 1.9rem / 30.4px | Newsreader 500 / 1.1 |
| Section heading | 1.25rem / 20px | 1.15rem / 18.4px | DM Sans 600 / 1.25 |
| Task title | 0.95rem / 15.2px | 0.95rem / 15.2px | DM Sans 500 / 1.4 |
| Body | 0.95rem / 15.2px | 0.95rem / 15.2px | DM Sans 400 / 1.55 |
| Control / label | 0.875rem / 14px | 0.875rem / 14px | DM Sans 500 / 1.4 |
| Metadata / caption | 0.8125rem / 13px | 0.8125rem / 13px | DM Sans 400/500 / 1.4 |

Never rely on font size or color alone to differentiate task state. Metadata remains readable at browser zoom and user text-spacing changes. Let long titles and tags wrap; do not hard-code line breaks for headings.

## Spacing, layout, shape, borders, and elevation

Spacing tokens, on a 4px base: `--space-1:4px`, `--space-2:8px`, `--space-3:12px`, `--space-4:16px`, `--space-5:20px`, `--space-6:24px`, `--space-8:32px`, `--space-10:40px`, `--space-12:48px`, `--space-16:64px`.

- Desktop shell: 248px full sidebar; content area max-width 1160px; page padding 48px with a fluid clamp. Large screens preserve readable line lengths and intentional whitespace.
- Tablet: compact 80px navigation rail when space allows; two-column project layout only when each column remains comfortable.
- Mobile: 320–767px; single column, compact top bar and fixed bottom primary navigation with safe-area inset, content padding 20px (16px at very narrow widths); Quick Add/drawers become full-width or bottom-sheet-like.
- Breakpoint checkpoints: 375px mobile, 768px tablet, 1024px laptop, 1440px desktop; also inspect 320px, 1280px, and large viewport/zoom/text-size cases.
- Today uses an editorial two-column composition at wide sizes: execution list is primary; progress/activity sit in a narrow supporting rail. Collapse to a single readable flow on mobile; do not preserve empty rails by adding cards.
- Tasks use a search/filter toolbar above a ruled list. At narrow widths, metadata wraps below title and filters/sort become compact controls without hiding the active-filter state.
- Projects use a responsive grid only when it improves comparison; otherwise use project rows. Details emphasize derived progress and associated tasks rather than decorative metric tiles.

Shape tokens: `--radius-sm:4px`, `--radius-md:8px`, `--radius-lg:12px` (dialog/sheet only), `--radius-pill:999px` (round switch/checkbox only). Controls have visible hit areas at least 40px high, with touch-critical controls targeting 44px. Standard lists and surfaces are flat. Use hairline `1px` borders as structure; shadow levels are none for default surfaces, subtle for popovers/drawers, stronger but restrained for modal depth.

Z-index tokens: base 0, sticky navigation 10, popover 20, modal backdrop 30, dialog 40, toast 50. Overlay content must not cover focus indication or become clipped by scroll containers.

## Brand, iconography, and component rules

Use one coherent outline icon family (Lucide React), consistent optical size/stroke. Decorative icons are rare; interactive icon buttons have visible text alternatives or accessible names, 40–44px targets, and tooltips only when helpful. Icons never carry critical state alone.

Component boundaries follow stable concepts and repeated behavior, not arbitrary file length. Build shared primitives for buttons/icon buttons, inputs/textarea/select/date, checkbox/radio/switch, labels/field errors, badges, divider, tooltip/popover/menu, dialog/drawer/tabs, progress/skeleton/spinner, toast region, empty/error state, and visually-hidden text. Compose AppShell, navigation, page header/section/layout primitives, task row/list/form/detail, project card/grid/form/detail, and activity items. Don't duplicate validation, state selectors, dialog behavior, or task mutation logic.

- Primary button: terracotta filled; one unmistakable primary action per local context. Secondary is quiet outline/flat; destructive uses text+icon/label and confirmation rather than competing solid red buttons.
- Task rows: white/paper surface on canvas, thin separators, checkbox, task title, compact priority cue plus readable label when needed, date, project, tags, and a restrained more-actions menu. Avoid a card per task.
- Priority and status: labels/icons/text remain available to assistive technology; a dot/short rule may reinforce meaning.
- Forms: persistent label above each field; concise helper text; textual inline error linked with `aria-describedby`; do not show untouched-field errors before submit; after submit validate on blur/change; focus first invalid field; keep valid inputs and do not disable submit merely because fields are invalid.
- Dialogs: semantic dialog, labelled heading, Escape/cancel where safe, focus trap where modal, initial focus appropriate to task, return focus to opener, prevent duplicate submit, and use mobile full-height/bottom-sheet layout without clipping.
- Feedback: centralized, dismissible, polite-live toast region for transient success/info/undo; critical errors also remain inline. Avoid toast stacks that obscure content.
- Empty states: concise reason and next action, not empty illustration. Error/recovery states explain what happened and provide retry/reset where appropriate.

## Interaction and state principles

- Follow input → event → state update → derived view → feedback. Persist through the repository boundary only.
- Task completion updates status, completion date, activity and derived counts atomically from the user's perspective; allow rapid toggles without race/stale-undo behavior.
- Dialogs/menus/popovers close with Escape where appropriate; outside click is not the only dismissal method. Keyboard users can reach and operate every control.
- Search is immediate and local for the MVP; empty query is neutral, zero matches provide a useful next action, and active filters remain visible/clearable.
- Disabled controls explain why where not obvious. Loading is reserved for actual asynchronous/persistence operations; local optimistic interactions stay responsive.
- Browser storage failure falls back safely to in-memory operation and persistent recovery notice rather than crashing. Malformed stored data is validated per record; valid data survives and user gets a recovery/reset action.
- Preserve browser/history navigation and document title for all routes, including not-found task/project states.

## Motion system

Motion is an optional means of communicating feedback or continuity. Repeated task completion and keyboard-triggered navigation should be immediate; avoid animating list geometry or delaying state. Use short entrances/exits only for occasional dialogs, drawers, popovers, and toasts.

Tokens: `--duration-fast:120ms`, `--duration-standard:180ms`, `--duration-slow:240ms`; `--ease-standard:cubic-bezier(0.2,0,0,1)`, `--ease-emphasized:cubic-bezier(0.2,0.8,0.2,1)`. Prefer opacity/transform over layout properties; no `transition: all`, bounce, scale-from-zero, or slow entrance. Hover effects are limited to fine-pointer devices. `prefers-reduced-motion: reduce` removes nonessential transforms/transitions while preserving immediate state and feedback.

## Accessibility and responsive acceptance

- Use semantic landmarks, one clear page h1, ordered headings, native forms/buttons/inputs, accessible names, and ARIA only where needed.
- Ensure keyboard completion of all critical flows: Tab/Shift+Tab, Enter/Space, Escape; command palette list navigation uses documented arrow-key behavior with a non-trapping fallback.
- Visible focus is never removed; modal focus is managed and restored. Errors are announced and associated with inputs; live feedback is polite and non-blocking.
- Status is not color-only. Recheck contrast on actual button/text/control combinations, including dark mode and focus/hover/disabled variants.
- Comfortable touch targets; no horizontal overflow at 320–375px; labels, tags, task titles/descriptions, and project names wrap or have an accessible full-value path.
- Check zoom, text scaling/spacing, long content, responsive layout, and all modal/toolbar states. Test light/dark/system, reduced motion, empty, error, and populated views.

## Design-reference principles used

The five named external references are supplemental review tools only; the Daymark PRD and Master Workflow outrank them.

- **UI/UX Pro Max:** Design a coherent system; prevent clipping under narrow widths, zoom, and text-spacing changes; keep chips/status operable and not color-only; check visible focus, reduced motion, contrast, and the 375/768/1024/1440px checkpoints. Do not import unrelated generator examples.
- **Impeccable:** Keep durable product truth separate from visual direction; critique hierarchy, clarity, and emotional resonance; prefer flat surfaces and hairline-first structure; audit, adapt, and harden. Its own brand system is not Daymark's.
- **Taste Skill:** Infer variance, motion, and density from the brief rather than accepting generic defaults; audit before a redesign and refine typography/spacing/color deliberately. Its marketing-oriented presets do not prescribe this dense product UI.
- **Emil Kowalski Skills:** Motion is optional and frequency-aware; frequent/keyboard actions should be immediate, occasional UI transitions short and purposeful; favor transform/opacity; respect reduced motion; no bounce, ease-in, or `transition: all`.
- **Anti-Slop:** A filter, not a style guide. Require a reason for visual treatments; compose from actual task content; avoid generic clutter without stripping Daymark of a distinctive identity.

Official sources: [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), [Impeccable](https://github.com/pbakaus/impeccable), [Taste Skill](https://github.com/Leonxlnx/taste-skill), [Emil Kowalski Skills](https://github.com/emilkowalski/skills), [Anti-Slop](https://github.com/miqdadbadjuber/anti-slop).

## Visual QA questions

Before a route or component is considered complete, check: Is the composition rooted in its user goal? Is the primary action unmistakable? Are display and UI type used intentionally? Does the spacing rhythm hold with variable text? Are boxes/cards used for true grouping only? Do project/status colors remain secondary to readable names? Does every motion have a function and reduced-motion behavior? Is any decoration or copy generic? Does the design retain a Daymark signature without noise? Does mobile preserve information priority? Does keyboard/focus remain correct after create, edit, delete, completion, route change, rapid toggle, and dialog dismissal? Any unclear or negative answer triggers a design pass.
