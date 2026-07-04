# Design System (Visual Language Specification)

## Document Metadata
*   **Document ID**: LIMS-DOC-15
*   **Version**: 1.0.0
*   **Author**: Antigravity (LIMS Solution Architect)
*   **Status**: Approved
*   **Last Updated**: 2026-07-03
*   **Dependencies**:
    *   [LIMS-DOC-05: User Roles & Permissions](file:///d:/Projects/Micro_Lab/docs/05_user_roles_permissions.md)
    *   [LIMS-DOC-06: End-to-End Laboratory Workflow](file:///d:/Projects/Micro_Lab/docs/06_end_to_end_workflow.md)
    *   [LIMS-DOC-13: UI/UX Foundation](file:///d:/Projects/Micro_Lab/docs/13_ui_ux_foundation.md)
    *   [LIMS-DOC-13A: UI State Dictionary](file:///d:/Projects/Micro_Lab/docs/13a_ui_state_dictionary.md)
    *   [LIMS-DOC-13B: Interaction Pattern Library](file:///d:/Projects/Micro_Lab/docs/13b_interaction_pattern_library.md)
    *   [LIMS-DOC-14: Component Library Specs](file:///d:/Projects/Micro_Lab/docs/14_component_library.md)
*   **Required By**:
    *   [LIMS-DOC-16: Prompt Engineering Guide](file:///d:/Projects/Micro_Lab/docs/16_prompt_engineering_guide.md)
    *   [LIMS-DOC-17: Architectural Decisions (ADRs)](file:///d:/Projects/Micro_Lab/docs/17_architecture_decisions.md)
*   **Requested By**: Laboratory Director & UX Lead
*   **Reviewed By**: Solution Architect & Senior Microbiologist
*   **Approved By**: User
*   **Approval Date**: 2026-07-03

> **Scope Boundary**: This document defines the **visual language standards and token rules only**. It details the naming conventions, ratios, spacing grids, and behavior limits of the design system. It does **not** include CSS files, SCSS/SASS scripts, Tailwind configuration JSONs, CSS variables, React props, or Figma library implementation details. All code implementations belong in frontend packages.

> **Governance Rule — MANDATORY DESIGN STANDARD**: No screen, component, workflow, report, dashboard, or printable artifact may introduce new visual styles, colors, spacing, typography, icons, motion, or tokens unless those changes are documented and approved within the Design System (LIMS-DOC-15).

---

## Purpose

The purpose of this document is to serve as the **single source of truth for the visual language** of the entire Microbiology LIMS application. It establishes the design token architecture, layout rules, domain-specific visual mappings, and interface governance required to build a consistent, accessible, and clinically safe user experience.

---

## Scope

This document covers:
*   Design token architecture, naming conventions, and governance.
*   Foundational styles: Color systems, typography, spacing, grids, borders, elevation, and motion.
*   Layout density modes (Comfortable, Compact, High Density).
*   Laboratory domain-specific visual standards (Specimens, Organisms, Plates, AST, QC).
*   Data visualization and dashboard layout standards.
*   State-specific, print, accessibility, and internationalization visual standards.
*   Visual design verification checklists.

---

## Main Content

---

### 1. Design Token Architecture

The design token system manages design variables using a three-tier semantic hierarchy. This hierarchy allows visual styles to change at a global level without breaking layout bindings at the component level.

```
[ Global / Reference Tokens ] (ref.)  <-- Base values (math ratios, color palettes)
            │
            ▼
 [ System / Alias Tokens ] (sys.)     <-- Semantic roles (e.g. primary brand color, default text)
            │
            ▼
[ Component-Level Tokens ] (comp.)    <-- Direct element overrides (e.g. sidebar border color)
```

1.  **Global / Reference Tokens (`ref.`)**: These are static, context-free raw values (e.g., color hex palettes, text font scale ratios, base spacing dimensions). They are defined once and do not carry semantic meaning.
2.  **System / Alias Tokens (`sys.`)**: These assign semantic roles to reference tokens. They describe *how* a token is used (e.g., `sys.color.brand.primary` maps to `ref.color.teal.500`; `sys.spacing.default` maps to `ref.spacing.16`).
3.  **Component-Level Tokens (`comp.`)**: These bind system tokens to specific elements (e.g., `comp.sidebar.border` maps to `sys.color.border.default`). This is the only token tier that developers reference within reusable components (LIMS-DOC-14).

---

### 2. Color System

The color system uses a curated palette designed to support clinical focus, minimize eye strain during long shifts, and ensure that safety markers are easily readable.

#### Color Roles & Semantics
*   **Primary Accent (`sys.color.brand.primary`)**: Used for branding highlights, active navigation paths, and primary action triggers.
*   **Secondary Accent (`sys.color.brand.secondary`)**: Used for optional visual indicators, category tags, and secondary action hover highlights.
*   **Surface Base (`sys.color.surface.base`)**: The main page background color role. Low-brightness to reduce glare.
*   **Surface Raised (`sys.color.surface.raised`)**: Backdrops for cards, panels, and forms, separating content areas from the base background.
*   **Text Primary (`sys.color.text.primary`)**: High-contrast text color role. Used for primary labels, results, and headings.
*   **Text Secondary (`sys.color.text.secondary`)**: Mid-contrast color role. Used for supporting descriptions, timestamps, and captions.
*   **Border Default (`sys.color.border.default`)**: Structural rules, table gridlines, and form borders.

#### Status Color Roles
*   **Success (`sys.color.status.success`)**: Confirmed clinical releases, passed QC lots, or accepted specimen receipts.
*   **Warning (`sys.color.status.warning`)**: Impending SLA deadlines, QC lot warnings, or incubation timers nearing completion.
*   **Danger (`sys.color.status.danger`)**: Rejected specimen containers, critical values, and failed validation checks.
*   **Information (`sys.color.status.info`)**: Neutral, non-blocking logs, audit track records, and system changes.
*   **Pending (`sys.color.status.pending`)**: Awaiting user action or external events.

---

### 3. Typography

The typography system is optimized for reading dense data (such as zone diameters and MIC values) on standard laboratory displays.

#### Font Families
*   **UI Sans-Serif (`sys.font.family.ui`)**: Used for headings, menus, and labels to ensure modern legibility.
*   **Data Sans-Serif (`sys.font.family.data`)**: High-legibility font family optimized for numeric data tables and forms.
*   **Code Monospace (`sys.font.family.monospace`)**: Used for unique clinical identifiers (MRNs, specimen IDs, barcodes).

#### Typography Scale
Typography sizes use a structured step scale derived from a baseline (typically 16px/1rem).

| Scale Token | Hierarchy | Line Height | Usage |
| :--- | :--- | :--- | :--- |
| `sys.type.heading.page` | 2.25rem / Bold | 1.2 | Page title headings (SCR titles) |
| `sys.type.heading.section` | 1.5rem / Medium | 1.25 | Section headers inside screens |
| `sys.type.heading.subsection`| 1.125rem / Medium | 1.3 | Card headers and panel titles |
| `sys.type.body.default` | 1rem / Regular | 1.5 | General form inputs, description paragraphs |
| `sys.type.body.small` | 0.875rem / Regular | 1.4 | Helper text, secondary timestamps, log cards |
| `sys.type.label.default` | 0.875rem / Medium | 1.4 | Input form labels |
| `sys.type.monospace` | 0.875rem / Regular | 1.2 | Specimen IDs, Patient MRNs, Barcode numbers |
| `sys.type.numeric.result` | 1.125rem / Bold | 1.2 | AST susceptibility zone diameters, MIC output |

---

### 4. Spacing System

Spacing is constrained to a base-8 grid system. All margins, paddings, gaps, and structural alignment offsets must use the defined spacing multiples:

*   `sys.spacing.2xs` = 4px
*   `sys.spacing.xs` = 8px
*   `sys.spacing.sm` = 12px
*   `sys.spacing.md` = 16px
*   `sys.spacing.lg` = 24px
*   `sys.spacing.xl` = 32px
*   `sys.spacing.2xl` = 48px
*   `sys.spacing.3xl` = 64px
*   `sys.spacing.4xl` = 96px

No freeform spacing values or non-base-8 dimensions are permitted anywhere in the layout design.

---

### 5. Grid System

The page layout uses a structured grid columns strategy based on device categories to align components.

*   **Desktop Layout Grid**: 12 columns, 24px gutters, 24px outer page margins.
*   **Tablet Layout Grid**: 8 columns, 16px gutters, 16px outer page margins.
*   **Mobile Layout Grid**: 4 columns, 12px gutters, 12px outer page margins.

Page divisions for Layout Patterns (A, B, C, D) are defined in column groupings (e.g. Pattern A uses a 4-column left list and an 8-column right detail layout).

---

### 6. Border Radius

Border corner radius defines the visual style of containers, buttons, and badges.

*   `sys.radius.xs` = 2px (Used for input fields, table cell selections)
*   `sys.radius.sm` = 4px (Used for buttons, status badges, chips)
*   `sys.radius.md` = 8px (Used for panels, card containers, dropdown panels)
*   `sys.radius.lg` = 16px (Used for modals, notification drawers)
*   `sys.radius.circular` = 9999px (Used for avatar wrappers, indicators)

---

### 7. Elevation & Shadows

Depth elevation is used to differentiate layout layers using drop shadows.

*   `sys.elevation.0` (Flat): Baseline page backdrop. No shadow.
*   `sys.elevation.1` (Raised): Cards, list cells, and interactive table rows. Subtle diffuse shadow.
*   `sys.elevation.2` (Floating): Command palette dropdown overlays, autocomplete lists, popover menus. Medium shadow.
*   `sys.elevation.3` (Overlay): Modals, drawers, and persistent top notifications. Pronounced deep shadow.

---

### 8. Motion System

Animations must focus user attention on state transitions without causing delays in the clinical workspace.

*   **Transition Durations**:
    *   Fast (`sys.motion.duration.fast`): 100–120ms (Used for button states, popover menus, dropdown toggles).
    *   Medium (`sys.motion.duration.medium`): 150–200ms (Used for drawer slides, modal reveals, accordion transitions).
    *   Slow (`sys.motion.duration.slow`): 300ms (Used for toasts sliding, dashboard widget load-in).
*   **Easing Curves**:
    *   Standard Easing (`sys.motion.ease.standard`): For general element changes.
    *   Exit Easing (`sys.motion.ease.exit`): Fast acceleration, slow deceleration.
*   **Prefers-Reduced-Motion Compliance**: When a user's system preferences request reduced motion, all transition animations are replaced with instant changes. Sliding and scaling animations are disabled.

---

### 9. Iconography

*   **Sizing standards**: Icons are designed in three bounding box sizes: **16x16px** (status icons inside tables), **24x24px** (standard buttons, menu items), and **32x32px** (empty state headers).
*   **Visual alignment**: Icons must be centered within their bounding boxes. Labels are always paired textually.
*   **Consistency**: Status indicators must use the same shapes across the application (e.g. Warning is always a warning triangle shape).

---

### 10. Illustration Guidelines

*   **Palette constraints**: Illustrations used for empty or error states (CMP-405, CMP-406) must use a restricted three-color scheme (Neutral light gray, Brand secondary accent tint, Brand primary accent outline). High-contrast colors are prohibited in illustration vectors.
*   **Visual complexity**: Simple flat vectors only. Detailed sketches, realistic drawings, or photographic textures are prohibited.

---

### 11. Data Visualization Standards

Data visualizations (CMP-403, CMP-806) represent aggregated metrics and trends.
*   **Chart Color Palette**: Charts must use a pre-approved set of 6 categorical color tokens. These colors must remain distinguishable for colorblind users.
*   **Gridlines**: Rendered in a thin, low-contrast border color token (`sys.color.border.default`).
*   **Labels & Tooltips**: Text labels use `sys.type.body.small` style. Hover tooltips must use a high-contrast background with high-contrast text.

---

### 12. Status Color Mappings

Status colors map directly to the 19 specimen statuses defined in LIMS-DOC-13A, Section 5:

*   **Requested, Registered**: Map to `sys.color.status.pending`.
*   **Collected, In Transit, Received, Quality Review, Medical Validation**: Map to `sys.color.status.info`.
*   **Accepted, Report Generated, Delivered**: Map to `sys.color.status.success`.
*   **Rejected**: Maps to `sys.color.status.danger`.
*   **Processing, Culture, Incubation, Observation, Identification, AST**: Map to `sys.color.status.warning` (indicates in-progress laboratory steps).
*   **Archived**: Maps to `sys.color.text.secondary`.
*   **Disposed**: Maps to `sys.color.text.disabled`.

---

### 13. Print Design Standards

Print overrides are applied automatically to the 4 printable screens defined in LIMS-DOC-13, Section 15:
*   **Page Margins**: Enforces a 0.5-inch page margin.
*   **Hidden Elements**: Hides headers, sidebars, context bars, action bars, and buttons.
*   **Text overrides**: Converts body text to 10pt UI Sans-serif, identifiers to 9pt Monospace. Text colors force solid black (`#000000`) for high contrast on physical paper. Background cards lose fill colors and drop shadows.

---

## 14. Dark Mode Strategy

*   **Token Mapping**: Dark mode works by swapping the reference tokens mapped to system surface/text aliases. Alias token names (`sys.color.surface.base`) remain identical; their hex values swap (e.g., base surface shifts from light gray to dark gray/charcoal).
*   **Contrast Preservation**: Status colors must maintain their semantic meaning in dark mode. Tints are softened to prevent glowing highlights against dark backdrops. Contrast ratios must meet WCAG 2.1 AA (4.5:1 text contrast).
*   **User Option**: Swapping between Light and Dark mode is user-configurable from the preferences panel and does not require a page refresh.

---

## 15. Branding Guidelines

*   **Logo Padding**: The logo (CMP-103) requires a minimum padding clearance zone of equal width to its height, preventing text labels from crowding the emblem.
*   **Color Alignments**: Branding color tokens (`sys.color.brand.primary`) are reserved for primary user triggers, active indicators, and logos. They must not be used for generic panel backdrops.

---

## 16. Density Modes

Layout density defines padding scales based on task types.

*   **Comfortable Mode**: Standard view padding (16px base padding).
*   **Compact Mode**: Reduced grid cell and form section margins (12px base padding).
*   **High Density (Laboratory Mode)**: Micro spacing (8px base padding). Used to fit large data sets on a single screen without scrolling.

---

## 17. Internationalization (LTR/RTL)

*   **Layout Flow**: Structural components (Sidebar, Workspace Layout) support LTR and RTL orientations automatically. When RTL is active, the Sidebar slides in from the right; table text columns align right.
*   **Icon Mirroring**: Navigational arrows and linear timeline indicators mirror orientation directions when RTL is active. Clinical diagnostic icons (microscopes, syringe symbols) are static and do not mirror.

---

## 18. Accessibility Contrast Rules

*   **WCAG 2.1 AA Compliance**: All text elements (CMP-101) must maintain a contrast ratio of 4.5:1 against their background surface, except large-scale text (above 18pt) which requires a 3:1 ratio.
*   **UI Components**: Non-text interactive components (buttons, input fields, checkboxes) must maintain a contrast ratio of 3:1 against their background surface.
*   **Focus Rings**: The focus ring (`sys.color.focus.ring`) must maintain a 3:1 contrast against adjacent surface colors.

---

## 19. Token Naming Conventions

All tokens must follow a strict, lowercase naming syntax to ensure consistency across design libraries and code frameworks:

`[namespace].[category].[concept].[variant].[state]`

*   `namespace` = `ref` (reference), `sys` (system), `comp` (component)
*   `category` = `color`, `type`, `spacing`, `radius`, `elevation`, `motion`
*   `concept` = name of the visual concept (e.g., `brand`, `heading`, `border`, `button`)
*   `variant` = sub-type or scale point (e.g., `primary`, `large`, `default`, `danger`)
*   `state` = optional interaction state tag (e.g., `hover`, `focus`, `disabled`)

Example: `sys.color.status.danger.hover`

---

## 20. Token Governance

*   **Proposing Tokens**: Developers or designers submit a design change request (DCR) specifying the token name, namespace, value, and rationale.
*   **Review Process**: The Solution Architect and UX Lead review the DCR for compliance with naming conventions and accessibility rules.
*   **Approval**: Approved tokens are added to this design system document and deployed to the asset packages.

---

## 21. Versioning Strategy

The design token system follows semantic versioning:
*   **Major Change (X.0.0)**: Deleting existing tokens or changing their semantic mapping in a backward-incompatible way.
*   **Minor Change (1.X.0)**: Adding new tokens without modifying existing ones.
*   **Patch Change (1.0.X)**: Fixing color values or adjusting typography line heights without changing token names.

---

## 22. Layout Density Standards

Density modes define the padding hierarchy based on workflow tasks to manage information density.

| Density Mode | Intended Usage | Padding Philosophy | Information Density | Screen Types | Accessibility |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Comfortable** | High-level overviews, settings pages, and patient registration forms. | 16px baseline padding on elements. | Low density. Highlights key information. | SCR-000, SCR-001, SCR-014, SCR-019. | Maximum readability. Recommended for users with visual fatigue or mobility impairments. |
| **Compact** | Standard laboratory worklists, queues, and search directories. | 12px padding between inputs and cells. | Medium density. Combines data structure with legibility. | SCR-002, SCR-004, SCR-006, SCR-007, SCR-013. | Normal standard. Touch targets remain large enough for basic stylus/finger taps. |
| **High Density (Lab Mode)** | Complex diagnostic matrices (e.g., AST Entry, plate reads) where scrolling is highly undesirable. | 8px padding on cell grids and table components. | Maximum density. Fits complex tables on a single viewport screen. | SCR-009, SCR-010, SCR-012. | Requires zoom support (up to 200%) and clear focus rings. |

---

## 23. Responsive Design Philosophy

Layout adaptation ensures that LIMS interfaces remain functional across varying viewport sizes, focusing on laboratory workstations as the primary platform.

#### Desktop (1280px+) & Wide (1600px+)
*   **Navigation**: Left sidebar expanded (240px wide). Persistent breadcrumb trail and Context Bar.
*   **Tables**: Renders all columns. Row sorting, filtering, and bulk actions are visible.
*   **Forms**: Side-by-side multi-column form sections.
*   **Dashboards**: Grid layout with multiple widget panels (KPI metrics, worklists, notifications).
*   **Workflows**: Timeline Panel (CMP-504) is visible in a persistent right panel.

#### Tablet (768px - 1279px)
*   **Navigation**: Left sidebar collapses to icon-only view (64px wide). Hamburger toggle expands sidebar as drawer.
*   **Tables**: Hides secondary columns (e.g. uploader initials, secondary timestamps). Clicking a row opens a bottom sheet or modal detail view.
*   **Forms**: Reorganizes to single-column layout. Form sections collapse to accordions.
*   **Dashboards**: KPI cards stack horizontally. Notifications panel collapses to tab views.
*   **Workflows**: Timeline Panel collapses and is toggled via header action button.

#### Mobile (360px - 767px)
*   **Navigation**: Sidebar hidden. Hamburger menu in header toggles navigation drawer.
*   **Tables**: Columns collapse entirely to card format. Secondary actions hidden behind swipe options (IP-MOB-02).
*   **Forms**: Single-column layout. Large inputs consume full width. Next/Back buttons navigate steps.
*   **Dashboards**: KPI metrics stack vertically. Worklists show only the top 5 urgent items.
*   **Workflows**: Workspace details stack. Timeline Panel hidden; viewable via dedicated action panel.

---

## 24. Microbiology Domain Visual Standards

To guarantee clinical safety and readability, specific laboratory concepts must follow standardized visual rules.

---

#### 24.1 Specimens

*   **Identities**: Specimen IDs (e.g. `SP-2026-001847`) are rendered in `sys.type.monospace` inside a solid bordered badge.
*   **Specimen Status**: Indicated by the Status Badge (CMP-408) which pairs color and text label.
*   **Collection Markers**: Collection time and transport status are shown with icons (CMP-102) to distinguish them from registration data.

---

#### 24.2 Organisms

*   **Species Names**: Scientific binomial nomenclature (e.g. *Escherichia coli*) is always rendered in *italics* using the standard UI font family, ensuring clinical correctness.
*   **Organism Codes**: Monospaced tags display ATCC numbers or reference registry identifiers.

---

#### 24.3 Culture Plates

*   **Agar Media Lots**: Shown using media cards (CMP-812) featuring color stripes corresponding to the media type (e.g. Red for Blood Agar, Pink for MacConkey Agar).
*   **Inoculation Indicators**: Visual logs showing streak quadrants (e.g., Q1, Q2, Q3, Q4) are represented using grid icons.

---

#### 24.4 AST Results

*   **Susceptibility Matrix**: S/I/R output values are color-coded:
    *   **Susceptible (S)**: Standard green text or badge (`sys.color.status.success`).
    *   **Intermediate (I)**: Yellow background or border warning (`sys.color.status.warning`).
    *   **Resistant (R)**: High-contrast red background or text alert (`sys.color.status.danger`).
*   **MIC Values**: Renders numeric metrics alongside dilution cells in clear monospaced text block rows.

---

#### 24.5 QC Results

*   **Pass / Fail Indicators**: Pass uses checkmark icons in success green; Fail uses high-contrast warnings in danger red.
*   **QC Expiration Warning**: Lots nearing expiration show warning amber borders.

---

#### 24.6 Critical Findings

*   **Clinical Value Flags**: Critical values (e.g. positive blood culture reads) are highlighted with a high-contrast crimson border, flashing warning icon, and persistent header banner alerts.
*   **Dismiss Limit**: Critical warnings cannot be dismissed until physician notification log confirmation is complete.

---

#### 24.7 Validation

*   **Pathologist Sign-off**: validated reports display an immutable digital signature mark at the page bottom, showing pathologist name, license uploader reference, timestamp, and signature validation lock graphic.

---

#### 24.8 Equipment

*   **Device Status**: incubator or mass spectrometer connection states are indicated via colored dot markers: Green = Active, Yellow = Warning/Alert state, Red = Offline, Gray = Idle/Standby.

---

#### 24.9 Media Lots

*   **Lot Cards**: Expiration status is mapped to timers. Expired lots show a red border and a locked indicator block.

---

## 25. Data Visualization Philosophy

Dashboards and analytical views map data to specific chart types to avoid misinterpretation of clinical metrics.

```
Metric Trend ────> Line Chart / Trend Indicator (SLA progression)
Distribution  ───> Distribution Chart / Bar Chart (organism prevalence)
Comparison ──────> Bar Chart / Stacked Chart (volume by clinic)
Current State ──> KPI Card / Gauge (active load / capacity)
```

*   **KPI Cards**: Display single key metrics (e.g. "Total Samples: 1,420"). Includes trend indicators showing comparisons to previous periods. Used at page tops.
*   **Line Charts**: Display metric progression over time (e.g. SLA average turnaround time trends).
*   **Bar Charts**: Compare discrete categories (e.g. sample volume by clinical ward).
*   **Stacked Charts**: Show parts of a whole across categories (e.g. AST S/I/R distribution per organism type).
*   **Trend Indicators**: Small upward or downward arrow icons paired with metrics, indicating performance direction.
*   **Gauges**: Display active utilization rates against capacity limits (e.g. incubator shelf utilization percentages).
*   **Heatmaps**: Display frequency density grids (e.g. contamination events grouped by plating bench and shift time).
*   **Tables**: Preferred over charts when users require exact clinical values (e.g. antibiogram statistics).
*   **Distribution Charts**: Display statistical range distribution (e.g. zone diameter range distributions for QC organism lots).

---

## 26. Empty, Loading, Success & Error Visual Language

Consistency in feedback patterns is governed by the following visual rules.

---

#### 26.1 Empty Screen & Table

*   **Visual Elements**: Empty screens render center-aligned illustrations, simple headings, description text, and a primary button. Empty tables show a thin container box featuring descriptive copy (e.g., "No specimens matching filter").

---

#### 26.2 Loading Screen, Panel, & Skeletons

*   **Loading Layout**: Standard page loads replace tables and forms with light gray skeletons matching the shapes of text blocks, cards, and input fields. Inline actions (saving forms) disable elements and add loading states to buttons.

---

#### 26.3 Inline, Critical, Success, & Warning Messages

*   **Inline Messages**: Appear adjacent to fields or table headers. Success uses green checks; Warning uses amber alerts; Error uses red highlights and descriptive texts.
*   **Critical Alerts**: Render as solid red header banners that do not close until acknowledged by the user.

---

## 27. Visual Hierarchy Standards

Visual elements are sized and placed based on their importance to focus the user's attention.

*   **Primary Information**: Specimen ID, isolate identification, patient name. Rendered in large, high-contrast typography (`sys.type.heading.subsection` or `sys.type.body.default` with bold weight) at the top of card layouts or lists.
*   **Secondary Information**: Collection date, requesting physician, uploader comments. Rendered in regular weight using default body sizing.
*   **Metadata**: Record ID, database timestamps, user login logs. Rendered in subdued small text (`sys.type.body.small`) using secondary gray contrast.
*   **Supporting Content**: Secondary actions, print links, help prompts. Displayed in Tertiary outline buttons or small text links.
*   **Clinical Alerts & Critical Findings**: Positive growth flags, expired lot warnings. Rendered with semantic colors (Red/Yellow) and flashing icons. Positioned at page centers or top header regions.

---

## 28. Clinical Safety Visual Rules

High-risk actions require distinct visual treatments to prevent accidental inputs.

*   **Medical Validation**: Action buttons require digital signature input prompts. The final button changes from default brand accent to high-contrast emerald green on valid entries.
*   **Report Approval**: Review screens show draft watermarks across all document pages until validation commits.
*   **Delete Actions**: Buttons use destructive red fills. Confirmation dialogs render red headers and list exactly what will be deleted.
*   **Critical Result Review**: Alerts flash until confirmed. Confirmation boxes require ticking a checkbox to confirm notifications were sent to the physician.
*   **Record Lock**: locked screens display a lock banner below the context bar and cover the form area with a semi-opaque backdrop scrim.
*   **Override Actions**: Fields requiring clinical overrides highlight with amber borders. An override text input box expands inline.

---

## 29. Dashboard Design Standards

Dashboard (SCR-000) widgets follow strict layout grids to ensure information density is balanced.

*   **Widget Spacing**: Card components are separated by a standard spacing gap (`sys.spacing.lg` = 24px) using the 12-column grid.
*   **KPI Placement**: Key metric cards are aligned horizontally at the top of the dashboard page.
*   **Worklists**: Positioned in the left columns, occupying 8 columns on desktop viewports.
*   **Alerts**: Critical alerts panel positioned top-right, consuming 4 columns to ensure visibility.
*   **Recent Activity**: Placed below the alerts panel in the right sidebar grid columns.
*   **Personalization**: Minimal customization. Users may expand or collapse widgets, but the layout structure remains fixed.

---

## 30. Design Governance

*   **Token Approval Process**: Changing token definitions requires raising a design change request (DCR). Rationale and contrast verification are reviewed before updates commit.
*   **Visual Review Process**: Core screens are reviewed for alignment with density scales and font sizes before implementation.
*   **UX Review Process**: Screen transitions and input tab orders are reviewed against LIMS-DOC-13B interaction patterns.
*   **Accessibility Review**: Designs undergo colorblindness simulations and keyboard path checks.
*   **Version Approval**: Major design updates commit to the next minor or major SemVer release.
*   **Deprecation Policy**: Obsolete styles are marked deprecated in token logs, with replacement recommendations provided.

---

## 31. Design Quality Checklist

Every new screen layout design must satisfy the following checklist criteria:

- [ ] **Accessibility Compliant**: All text contrast ratios meet WCAG 2.1 AA targets (4.5:1 / 3:1). Contrast rings are visible.
- [ ] **Token Usage Verified**: All layout styles reference approved design token aliases (`sys.*` or `comp.*`). No hardcoded colors or sizing values exist.
- [ ] **Responsive Behavior Reviewed**: Column adaptation and card layouts render correctly across Desktop, Laptop, Tablet, and Mobile viewports.
- [ ] **Interaction Patterns Followed**: All hover, focus, click, and transition behaviors match LIMS-DOC-13B specifications.
- [ ] **UI States Supported**: Skeletons, loading states, empty layouts, and error banners are defined.
- [ ] **Clinical Terminology Verified**: Organism binomial nomenclature is italicized. Specimen status terminology matches LIMS-DOC-06.
- [ ] **Design Consistency Validated**: Spacing is constrained to the base-8 grid. Layout density matches comfortable, compact, or high-density rules based on screen context.

---

## Cross-Document Traceability

Visual specifications in this document trace directly to previously approved architecture documents:
*   **LIMS-DOC-06 End-to-End Workflow**: Governs specimen status badge mapping colors (Section 12) and clinical safety rules (Section 28).
*   **LIMS-DOC-13 UI/UX Foundation**: Defines baseline layouts, screen IDs, and core typography definitions.
*   **LIMS-DOC-13A UI State Dictionary**: Mapped to loading, empty, and validation states (Section 26).
*   **LIMS-DOC-13B Interaction Pattern Library**: Mapped to button actions, dialog overlays, and mobile touch targets.
*   **LIMS-DOC-14 Component Library**: Component token overrides are derived from system aliases mapped in Section 4.

---

## Review Checklist
- [x] Includes all 31 sections defined in the implementation plan.
- [x] Establishes a 3-tier Design Token Architecture mapping Global, System, and Component tokens.
- [x] Defines color, typography, base-8 spacing, layout grids, border radius, and elevation tokens.
- [x] Incorporates the Mandatory Design Governance Standard rule.
- [x] Specifies three Layout Density modes: Comfortable, Compact, and High Density.
- [x] Details Responsive Design adaptation rules across four device breakpoints.
- [x] Standardizes visual treatment for 9 key Microbiology Domain concepts.
- [x] Maps data visualization guidelines to 9 chart categories.
- [x] Standardizes visual language for Empty, Loading, and Error states aligned to LIMS-DOC-13A.
- [x] Defines visual hierarchy guidelines for primary, secondary, and alert information.
- [x] Details Clinical Safety visual rules for high-risk validation, override, and deletion actions.
- [x] Establishes Grid, Spacing, and Widget placement rules for Dashboards.
- [x] Outlines Design Governance processes (DCRs, reviews, SemVer versioning).
- [x] Integrates a Design Quality Checklist.
- [x] Verifies that the document contains no code, CSS, SCSS, Tailwind, React, or TypeScript properties.
- [x] Traces design rules back to LIMS-DOC-06, -13, -13A, -13B, and -14.
- [x] Follows the LIMS-DOC template structure.
