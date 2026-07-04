# UI/UX Foundation

## Document Metadata
*   **Document ID**: LIMS-DOC-13
*   **Version**: 1.0.1
*   **Author**: Antigravity (LIMS Solution Architect)
*   **Status**: Approved
*   **Last Updated**: 2026-07-03
*   **Dependencies**: [LIMS-DOC-05](file:///d:/Projects/Micro_Lab/docs/05_user_roles_permissions.md), [LIMS-DOC-06](file:///d:/Projects/Micro_Lab/docs/06_end_to_end_workflow.md)
*   **Requested By**: Laboratory Director & UX Lead
*   **Reviewed By**: Solution Architect & Senior Microbiologist
*   **Approved By**: User
*   **Approval Date**: 2026-07-03

> **Scope Boundary**: This document defines the **experience layer** — how users move through the system, what they encounter on each screen, and what the interaction rules are. It does **not** describe React components, state management, or implementation code. Those concerns are addressed exclusively in [LIMS-DOC-14: Component Library](file:///d:/Projects/Micro_Lab/docs/14_component_library.md).

---

## Purpose
The purpose of this document is to answer **"How does the user experience the laboratory?"** It establishes the complete information architecture, navigation model, role-based user journeys, screen hierarchy, interaction patterns, accessibility standards, and responsive behavior that govern every screen in the LIMS. It is the contract that every frontend developer must follow before writing a single line of UI code.

---

## Scope
This document covers:
*   Design philosophy and product UX principles
*   Information architecture (IA) and site map
*   Navigation model and primary navigation structure
*   Role-based user journeys (all 7 roles)
*   Screen inventory and hierarchy
*   Global layout patterns
*   Interaction pattern standards
*   Form and validation behavior
*   Empty, error, and loading state standards
*   Notification and alert system
*   Responsive and adaptive behavior
*   Accessibility (WCAG 2.1 AA) requirements
*   Design tokens (visual language, not code)
*   Standard screen lifecycle (initialization to exit)
*   Workspace model (logical groupings of related screens)
*   Global Command Palette and productivity shortcuts
*   Global Quick Actions area
*   Unsaved changes detection and confirmation strategy
*   Record locking and concurrent editing behavior
*   Specimen Timeline Panel
*   Favorites and recently accessed items
*   Keyboard productivity shortcuts

---

## Main Content

---

### 1. Design Philosophy

The LIMS user interface serves laboratory professionals who make time-critical, clinically significant decisions. The following philosophy governs every design decision:

#### 1.1 Core UX Principles

| # | Principle | What It Means in Practice |
| :--- | :--- | :--- |
| **UX-P01** | **Workflow First** | Every screen must reflect a step in the clinical workflow. No screen exists without a workflow justification. |
| **UX-P02** | **Clarity Over Cleverness** | The interface must be immediately understandable to a first-time user. Avoid metaphors, icons without labels, or ambiguous actions. |
| **UX-P03** | **Reduce Cognitive Load** | Each screen focuses on one primary task. Secondary information is accessible but not presented by default. |
| **UX-P04** | **Error Prevention First** | The system must prevent errors before they happen. Destructive actions require confirmation. Invalid inputs are caught inline before submission. |
| **UX-P05** | **Minimal Navigation Distance** | A user must be able to reach any task-relevant screen in 3 clicks or fewer from their role's default landing screen. |
| **UX-P06** | **Permission-Transparent UI** | The interface must only show what a user is allowed to do. Hidden elements must be truly removed from the viewport, never simply greyed out (unless they are genuinely read-only fields). |
| **UX-P07** | **Traceability Always Visible** | Specimen ID, Patient MRN, and the current workflow stage must always be visible in the screen context bar when working inside a specimen record. |
| **UX-P08** | **Accessibility by Default** | Every interaction must be achievable via keyboard alone. Color alone is never used to convey status. |
| **UX-P09** | **Speed is a Feature** | Laboratory staff cannot afford lag. Every data entry screen must be optimized for speed: fast tab order, keyboard submission, and minimal form fields per screen. |
| **UX-P10** | **Auditability at the Surface** | When a user takes an irreversible action (validate, reject, amend), the system must display what will be recorded in the audit trail before confirming. |

#### 1.2 Anti-Patterns to Avoid

The following patterns are explicitly prohibited in this system:

*   **Modal overload**: Never stack modals. If a second confirmation is needed, navigate to a dedicated confirmation screen.
*   **Ambiguous icons**: Every icon that triggers an action must have a visible text label.
*   **Silent failures**: Any failed server action must produce a visible, specific error message — never silent data loss.
*   **Pagination without context**: Lists must always show "Showing X–Y of Z results."
*   **Auto-navigation without announcement**: The system must not redirect users to a new page without an explicit action or a visible countdown.

---

### 2. Design Token System (Visual Language)

Design tokens define the visual language of the system. They are system-level constraints, not implementation values. The final values (hex codes, rem sizes, etc.) are defined in the Component Library (LIMS-DOC-14). The semantic names defined here are the contract.

#### 2.1 Color Palette — Semantic Roles

| Token Name | Semantic Role | Usage Context |
| :--- | :--- | :--- |
| `color.brand.primary` | Brand identity anchor | Application logo, primary call-to-action buttons, active navigation states |
| `color.brand.secondary` | Supporting accent | Secondary actions, hover highlights, selected state badges |
| `color.surface.base` | Page background | Main content area background |
| `color.surface.raised` | Card / panel background | All cards, modals, side panels |
| `color.surface.overlay` | Modal scrim | Dimming layer behind modal dialogs |
| `color.text.primary` | High-contrast body text | All primary labels, form values, headings |
| `color.text.secondary` | Subdued supporting text | Captions, metadata, placeholder labels |
| `color.text.disabled` | Inactive field text | Read-only field content |
| `color.status.success` | Confirmed positive outcome | Accepted specimen, validated report, passed QC |
| `color.status.warning` | Requires attention | SLA approaching, QC lot nearing expiry |
| `color.status.danger` | Requires immediate action | Critical value flagged, specimen rejected, overdue SLA |
| `color.status.info` | Neutral informational | Status change notifications, incubation started |
| `color.status.pending` | Awaiting action | Sample received but not yet processed, awaiting pathologist |
| `color.border.default` | Structural separators | Card borders, input field borders, table row dividers |
| `color.focus.ring` | Keyboard focus indicator | All interactive elements in keyboard navigation mode (minimum 3px offset) |

#### 2.2 Typography Scale — Semantic Roles

| Token Name | Role | Typical Use |
| :--- | :--- | :--- |
| `type.heading.page` | Page title | H1 per page — one per screen |
| `type.heading.section` | Section title | H2 — major content sections |
| `type.heading.subsection` | Subsection title | H3 — card titles, panel headers |
| `type.body.default` | Primary reading body text | Form labels, table cell values, paragraphs |
| `type.body.small` | Supporting / metadata text | Timestamps, captions, helper text |
| `type.label.default` | Form input labels | All form field labels (always visible, never placeholder-only) |
| `type.monospace` | Technical identifiers | Specimen IDs, MRNs, barcode strings, audit log entries |
| `type.numeric.result` | Laboratory result values | Zone diameters, MIC values, colony counts |

**Font family hierarchy**: The system uses a primary sans-serif for UI, a secondary sans-serif for data-dense tables, and a monospace font for identifiers. Specific families are specified in LIMS-DOC-14.

#### 2.3 Spacing Scale

A base-8 spacing system governs all margins, padding, and gaps. Permitted spacing values are multiples of 4px: `4, 8, 12, 16, 24, 32, 48, 64, 96`. No freeform spacing values are permitted in the design.

#### 2.4 Elevation (Shadow) Scale

| Level | Name | Use |
| :--- | :--- | :--- |
| `elevation.0` | Flat | Page background, table rows |
| `elevation.1` | Raised | Cards, list items |
| `elevation.2` | Floating | Dropdowns, tooltips |
| `elevation.3` | Overlay | Modal dialogs, side panels |

#### 2.5 Border Radius Scale

| Token | Value Intent | Use |
| :--- | :--- | :--- |
| `radius.xs` | Sharp | Input fields, table cells |
| `radius.sm` | Slight | Badges, tags, small buttons |
| `radius.md` | Rounded | Cards, panels |
| `radius.lg` | Pill | Full-width banners, modal containers |

---

### 3. Information Architecture (IA)

The IA defines the structural skeleton of the application — the complete hierarchy of all screens, modules, and their relationships.

#### 3.1 Top-Level Domains

The application is organized into **6 primary navigation domains**:

```
LIMS Application
│
├── 1. Reception Domain        (WF-001 to WF-005)
│   ├── Patient Registration
│   ├── Client Directory
│   ├── Order Placement
│   ├── Order Directory
│   └── Barcode Workspace
│
├── 2. Laboratory Domain       (WF-006 to WF-012)
│   ├── Receipt Bench
│   ├── Plating Bench
│   ├── Cabinet Workspace (Incubation)
│   ├── Observation Screen
│   └── AST Entry Screen
│
├── 3. Validation Domain       (WF-013 to WF-015)
│   ├── QC Dashboard
│   └── Pathologist Desk
│
├── 4. Reporting Domain        (WF-015 to WF-017)
│   ├── Report Archive
│   └── Physician Portal (External-facing)
│
├── 5. Operations Domain       (WF-016, WF-018)
│   ├── Invoicing Desk
│   ├── Storage Desk
│   └── QC & CAPA Ledger
│
└── 6. Administration Domain   (Cross-cutting)
    ├── Dashboard (Landing / Home)
    ├── User Management
    ├── Tenant Settings
    └── Audit Trail Logs
```

#### 3.2 Screen Inventory & Hierarchy

Every named screen in the system, its parent domain, its primary workflow, and the role(s) who can see it:

| Screen ID | Screen Name | Domain | Workflow(s) | Visible To |
| :--- | :--- | :--- | :--- | :--- |
| **SCR-000** | Dashboard (Home) | Administration | Cross-cutting | All roles |
| **SCR-001** | Patient Registration | Reception | WF-001 | Processor, Admin |
| **SCR-002** | Client Directory | Reception | WF-002 | Processor, Admin |
| **SCR-003** | Order Placement | Reception | WF-003 | Processor, Admin |
| **SCR-004** | Order Directory | Reception | WF-004 | Processor, Admin |
| **SCR-005** | Barcode Workspace | Reception | WF-005 | Processor, Admin |
| **SCR-006** | Receipt Bench | Laboratory | WF-006 | Processor, Technician, Admin |
| **SCR-007** | Plating Bench | Laboratory | WF-007, WF-008 | Technician, Sr. Micro |
| **SCR-008** | Cabinet Workspace | Laboratory | WF-009 | Technician, Sr. Micro |
| **SCR-009** | Observation Screen | Laboratory | WF-010, WF-011 | Technician, Sr. Micro, Pathologist |
| **SCR-010** | AST Entry Screen | Laboratory | WF-012 | Technician, Sr. Micro |
| **SCR-011** | QC Dashboard | Validation | WF-013 | Sr. Micro, Admin |
| **SCR-012** | Pathologist Desk | Validation | WF-014, WF-015 | Pathologist |
| **SCR-013** | Report Archive | Reporting | WF-015 | All roles |
| **SCR-014** | Physician Portal | Reporting | WF-017 | Physician (Client) |
| **SCR-015** | Invoicing Desk | Operations | WF-016 | Processor, Admin |
| **SCR-016** | Storage Desk | Operations | WF-018 | Technician, Admin |
| **SCR-017** | QC & CAPA Ledger | Operations | Cross-cutting | Technician, Sr. Micro, Pathologist, Auditor |
| **SCR-018** | Audit Trail Logs | Administration | Cross-cutting | Sr. Micro, Pathologist, Admin, Auditor |
| **SCR-019** | User Management | Administration | Cross-cutting | System Admin |
| **SCR-020** | Tenant Settings | Administration | Cross-cutting | System Admin |
| **SCR-021** | Unauthorized | System | Cross-cutting | All roles (error boundary) |
| **SCR-022** | Not Found (404) | System | Cross-cutting | All roles (error boundary) |

---

#### 3.3 Workspace Model

Rather than treating the application as a collection of isolated screens, the system is organized into **logical workspaces**. A workspace is a coherent grouping of screens that together serve a single primary workflow objective. A user enters a workspace to accomplish a goal and exits it when that goal is complete.

Workspaces align with the 6 navigation domains defined in Section 3.1 but introduce a finer-grained conceptual boundary: a workspace is the sum of the screens and the interaction rules governing a specific stage of laboratory work.

| Workspace | Purpose | Contained Screens | Primary Users | Main Workflow | Navigation Rules |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Patient Workspace** | Manage patient and client profiles, and create specimen orders. | SCR-001, SCR-002, SCR-003, SCR-004 | Specimen Processor, Admin | WF-001 to WF-003 | Linear entry flow. Navigating away from an incomplete order triggers the Unsaved Changes dialog (Section 16). |
| **Specimen Workspace** | Accept, reject, and pre-process incoming specimens; generate barcodes. | SCR-005, SCR-006 | Specimen Processor, Technician, Admin | WF-004 to WF-007 | Barcode printing is a step within the workspace, not a separate destination. Rejection exits the specimen record and returns to the receipt worklist. |
| **Culture Workspace** | Manage culture plating, incubation cabinet assignment, and incubation timer monitoring. | SCR-007, SCR-008 | Laboratory Technician, Sr. Microbiologist | WF-007 to WF-009 | Plating and incubation are sequential steps within the same workspace. Navigating between them does not leave the specimen's context. |
| **Observation Workspace** | Record plate growth reads, perform organism identification. | SCR-009 (phases 1 & 2) | Laboratory Technician, Sr. Microbiologist | WF-010 to WF-011 | Both plate observation and organism identification occur within a single screen using a phase-based step pattern. |
| **AST Workspace** | Enter antibiotic zone diameters and MIC values; review auto-calculated S/I/R output. | SCR-010 | Laboratory Technician, Sr. Microbiologist | WF-012 | Each antibiotic row is a sub-record within the workspace. Navigating away before saving triggers the Unsaved Changes dialog. |
| **Validation Workspace** | Quality review and pathologist medical validation of completed results. | SCR-011, SCR-012 | Sr. Microbiologist, Pathologist | WF-013 to WF-015 | QC review (SCR-011) and pathologist validation (SCR-012) are separate screens within the same workspace domain. The Timeline Panel is always visible in this workspace. |
| **Reporting Workspace** | Access the validated report archive and the external physician portal. | SCR-013, SCR-014 | All roles (read); Pathologist (amend) | WF-015, WF-017 | The physician portal (SCR-014) is a read-only workspace for external users. Amended reports open an inline amendment workflow without leaving the report view. |
| **Operations Workspace** | Manage invoicing, physical specimen storage, and CAPA quality records. | SCR-015, SCR-016, SCR-017 | Processor, Technician, Admin, Auditor | WF-016, WF-018 | Each screen in this workspace is independently accessible; they do not share a linear workflow step sequence. |
| **Administration Workspace** | Manage users, tenant settings, and review audit logs. | SCR-018, SCR-019, SCR-020 | System Admin, Auditor | Cross-cutting | The administration workspace is accessible from any part of the application but is not surfaced in the clinical workflow navigation. |

**Workspace Exit Rules**:
*   Closing or navigating away from a workspace with unsaved changes triggers the Unsaved Changes dialog defined in Section 16.
*   Completing the final step of a workspace's primary task returns the user to the Dashboard worklist (SCR-000) by default.
*   A user can hold multiple specimen records open simultaneously only if the previous record was explicitly saved. The system does not support unsaved multi-record drafts.

---

### 4. Navigation Model

#### 4.1 Primary Navigation Structure

The application uses a **persistent left sidebar** as the primary navigation mechanism. The sidebar structure is:

```
+--------------------------------------------------+
|  [ Lab Logo ]          [ User Avatar / Name ]    | <- Top header bar
+------------+-------------------------------------+
|            |                                     |
|  SIDEBAR   |   MAIN CONTENT AREA                 |
|            |                                     |
|  Home      |   [ Page Title ]                    |
|            |   [ Breadcrumb Trail ]               |
|  Reception |   [ Context Bar: Specimen ID ]      |
|  Laboratory|                                     |
|  Validation|   [ Primary Content ]               |
|  Reports   |                                     |
|  Operations|   [ Action Bar ]                    |
|  Admin     |                                     |
|            |                                     |
+------------+-------------------------------------+
```

#### 4.2 Sidebar Behavior Rules

*   **Collapsed state**: The sidebar collapses to icon-only width (64px max) when explicitly toggled by the user. Labels are hidden; icons remain. Tooltips appear on hover.
*   **Expanded state**: The sidebar shows icons + labels at full width (240px max).
*   **Active state**: The active top-level domain is highlighted with `color.brand.primary` background. The active child screen uses a left-border accent stripe.
*   **Permission filtering**: Navigation items are rendered only for the domains and screens the current user is authorized to access. Items the user cannot access do not appear — they are not shown as locked or greyed.
*   **Grouping**: Domain groups are separated by a thin divider and a group label in `type.body.small` style.

#### 4.3 Secondary Navigation (Within a Domain)

When a user is inside a domain, a secondary **horizontal tab bar** or **vertical sub-menu** appears within the content area to navigate between related screens within that domain (e.g., navigating between Order Directory and Order Placement within Reception).

#### 4.4 Breadcrumb Trail

A breadcrumb trail appears below the page header on all screens except the Dashboard. Format:

```
Home  >  [Domain Name]  >  [Screen Name]  >  [Record Identifier if applicable]
```

Example:
```
Home  >  Laboratory  >  AST Entry Screen  >  SP-2026-001847
```

#### 4.5 Global Search

A persistent global search bar appears in the top header. It is the entry point for all entity lookups across the application. The full specification of searchable entities, fields, result display rules, and permission filtering is defined in Section 20.

#### 4.6 Notification Bell

A persistent notification bell icon in the top header shows a numeric badge for unread system alerts. Clicking it opens a flyout panel listing recent notifications with timestamp, type, and a "Go to" deep-link. Notification types correspond to the Business Event Registry (EVT-001 to EVT-014).

---

#### 4.7 Global Command Palette

The Global Command Palette is a full-screen overlay productivity feature available to all authenticated users on every screen. It provides instant keyboard-driven access to navigation, search, and common commands without requiring the user to reach for the mouse.

**Activation**: `Ctrl + K` (Windows/Linux) or `Cmd + K` (Mac). The same shortcut dismisses the palette.

**Overlay Behavior**:
*   The palette appears as a centered modal overlay with a large search input field at the top.
*   The background content is dimmed using `color.surface.overlay`.
*   The palette is dismissed by pressing `Escape` or clicking outside the overlay.
*   Focus is automatically trapped inside the palette while it is open.
*   The palette is announced to screen readers as a dialog with an accessible name of "Command Palette".

**Palette Sections** (displayed in order, filtered by the user's typed query):

| Section | Contents | Behavior |
| :--- | :--- | :--- |
| **Universal Search** | Real-time results across all searchable entities (see Section 20) | Results appear after 2+ characters are typed. Keyboard arrow keys navigate the list. `Enter` navigates to the selected record. |
| **Quick Navigation** | All screens the current user has permission to access, listed by name | Typing a partial screen name filters the list instantly. Selecting navigates directly to that screen. |
| **Search Patient** | Typeahead patient lookup by name or MRN | Results display: Full Name, MRN, DOB. Selecting opens the patient's active specimen order. |
| **Search Specimen** | Typeahead specimen lookup by Specimen ID or Patient MRN | Results display: Specimen ID, Patient Name, Current Status, Stage. Selecting opens the specimen's current workspace screen. |
| **Search Report** | Typeahead report lookup by Report ID or Patient name | Results display: Report ID, Patient Name, Validation Date, Status. Selecting opens the Report Archive detail view. |
| **Search Order** | Typeahead order lookup by Order number or Patient MRN | Results display: Order number, Patient Name, Test Panels, Status. |
| **Search User** | (Admin only) User lookup by name or email | Results display: Full Name, Role, Status. Selecting opens the User Management record. |
| **Recently Opened** | The last 10 records visited by the current user in this session | Displayed when the palette opens with no typed query. Format: icon + record type + identifier + timestamp. |
| **Frequently Used** | The user's top 5 most-visited screens or records (computed across sessions) | Displayed below Recently Opened when no query is typed. |
| **Quick Commands** | Contextual commands for the current workspace | Examples: "Register New Patient", "Receive Sample", "Print Barcode". Only commands the user has permission to execute are shown. |

**Keyboard Navigation within the Palette**:
*   `Arrow Up / Arrow Down` — moves focus between results.
*   `Enter` — selects the focused result.
*   `Escape` — closes the palette without navigating.
*   Typing any character instantly filters all sections.

**Permission Constraint**: The palette only surfaces screens and records the authenticated user is authorized to access. A Technician cannot see "Search User" in the palette.

---

#### 4.8 Favorites & Recent Items

Every user has a persistent personal layer that improves navigation speed over time. This data is stored per user profile and survives session logout.

**Recent Items**:
*   The system automatically tracks the last **20 records** opened per user, categorized by entity type: Patients, Specimens, Reports.
*   Recent items are displayed in the Command Palette (Section 4.7) and on the Dashboard (SCR-000) in a "Recently Viewed" panel.
*   Items are sorted by most recently accessed (newest first).
*   Each item displays: entity type icon, identifier (in `type.monospace`), primary label (patient name or specimen ID), and relative timestamp (e.g., "2 hours ago").
*   Capacity: 20 items per category. When the capacity is reached, the oldest item is removed automatically.

**Pinned Records**:
*   A user can pin up to **10 records** to their personal favorites list using a "Pin" action (visible on record detail views).
*   Pinned records appear at the top of the relevant entity search results and in the Command Palette under "Frequently Used".
*   Pinning and unpinning is instantaneous and does not require a page reload.
*   Pinned records do not expire and persist across sessions until explicitly unpinned.

**Favorite Screens**:
*   A user can mark up to **5 screens** as favorites using a star icon in the sidebar navigation.
*   Favorited screens appear in a "Favorites" shortcut group at the top of the sidebar above all domain groups.
*   On mobile, favorited screens appear as a horizontal scroll row in the drawer navigation.

**Frequently Used Actions**:
*   The system tracks the top 3 Quick Actions used by each user over the last 30 days.
*   These appear as suggested commands in the Command Palette (Section 4.7) under "Frequently Used" when no query is typed.
*   Tracking is passive and requires no user configuration.

**Display Rules**:
*   Recent items and pinned records are always personal — they are never shared between users.
*   Clinical Auditors' recent items do not include records they reviewed as part of an audit investigation (to avoid audit bias).
*   On the Dashboard (SCR-000), the "Recently Viewed" panel shows the last 5 records as a compact list with a "View All" link.

---

### 5. Role-Based User Journeys

A user journey maps the sequence of screens a user navigates through to complete a primary task. Journeys are defined for the most common daily workflows per role.

#### 5.1 Specimen Processor — Morning Sample Intake Journey

**Goal**: Register a new patient, create a specimen order, and accept a specimen at the lab bench.

```
Login -> Dashboard (SCR-000)
  └─> Patient Registration (SCR-001) [New patient form]
      └─> Order Placement (SCR-003) [Attach test panels]
          └─> Barcode Workspace (SCR-005) [Print label]
              └─> Receipt Bench (SCR-006) [Scan and accept specimen]
                  └─> Dashboard (SCR-000) [Confirm in worklist]
```

**Decision Points**:
*   If patient already exists: skip SCR-001, start at SCR-003.
*   If specimen fails quality check at SCR-006: trigger rejection flow (log reason, notify physician).

---

#### 5.2 Laboratory Technician — Culture Processing Journey

**Goal**: Process an accepted specimen through culture plating, incubation, and observation.

```
Login -> Dashboard (SCR-000) [Pending worklist: "Specimens Awaiting Processing"]
  └─> Plating Bench (SCR-007) [Assign media, streak agar]
      └─> Cabinet Workspace (SCR-008) [Assign to incubator, start timer]
          └─> [48-hour incubation — timer expires, notification triggers]
              └─> Observation Screen (SCR-009) [Record growth, Gram stain, morphology]
                  └─> (If significant growth) Organism ID (SCR-009, phase 2)
                      └─> AST Entry Screen (SCR-010) [Record zones, MIC, review S/I/R]
```

**Decision Points**:
*   If no growth at first read: extend incubation (rollback to SCR-008, reset timer).
*   If growth is contaminated: log contamination event, forward to QC CAPA Ledger (SCR-017).

---

#### 5.3 Senior Microbiologist — Quality Review Journey

**Goal**: Review completed culture results, verify QC, and approve for pathologist validation.

```
Login -> Dashboard (SCR-000) [Pending badge on "Validation" domain]
  └─> QC Dashboard (SCR-011) [Review list: "Awaiting Quality Review"]
      └─> QC Dashboard (SCR-011) [Specimen detail: AST results, QC lot check, growth log]
          ├─> (Approve) -> Status advances to "Medical Validation"
          └─> (Rollback) -> Return to Technician with annotations (AST Entry Screen, SCR-010)
```

---

#### 5.4 Pathologist / Lab Director — Medical Validation Journey

**Goal**: Review final report draft, validate it with digital signature, and release it.

```
Login -> Dashboard (SCR-000) [Pending badge on Pathologist Desk]
  └─> Pathologist Desk (SCR-012) [Queue: "Awaiting Validation"]
      └─> Pathologist Desk (SCR-012) [Report preview: patient, culture, AST, clinical notes]
          ├─> (Validate) -> Enter credentials -> Signature applied -> PDF generated
          ├─> (Rollback) -> Select rollback target + mandatory reason
          └─> (Critical Value) -> "Flag Critical Value" -> Physician notification triggered
```

---

#### 5.5 Client / Ordering Physician — Report Retrieval Journey

**Goal**: View and download the final validated report for their patient.

```
Login -> Physician Portal (SCR-014) [Results inbox — specimens ordered by this physician]
  └─> Select specimen -> Report detail view [Patient info, isolate ID, S/I/R table, PDF]
      └─> Download PDF  or  Print
```

**Constraints**: Physicians see only their own patients' results. They cannot navigate to any other domain.

---

#### 5.6 Clinical Auditor — Audit Trail Journey

**Goal**: Review a specimen's complete audit history for compliance purposes.

```
Login -> Dashboard (SCR-000)
  └─> Audit Trail Logs (SCR-018) [Search by date range, user, action type, specimen ID]
      └─> Audit entry detail view [Full event log, IP address, user ID, action, before/after]
          └─> Export log (CSV/PDF)
```

---

#### 5.7 System Administrator — User Onboarding Journey

**Goal**: Create a new laboratory technician account and assign their role.

```
Login -> Dashboard (SCR-000)
  └─> User Management (SCR-019) [User directory]
      └─> "New User" form [Name, email, role assignment, permission group]
          └─> Credentials dispatched via secure email -> Account active
```

---

### 6. Screen Anatomy (Standard Layout Patterns)

All screens in the application follow one of four standard layout patterns. Only these four patterns are permitted.

#### 6.1 Layout Pattern A — List + Detail (Master-Detail)

**Used for**: Patient Directory, Order Directory, Specimen Queue, Audit Trail, Report Archive.

```
+----------------------------------------------------------+
|  [Page Title]                         [Primary Action]   |
|  [Breadcrumb]                         [Secondary Action] |
+------------------------+---------------------------------+
|                        |                                 |
|  LIST PANEL (left)     |  DETAIL PANEL (right)          |
|  ------------------    |  --------------------------    |
|  Search / Filter bar   |  [Selected record detail]      |
|  ------------------    |                                 |
|  [Item 1] <- active    |  Fields, values, actions       |
|  [Item 2]              |                                 |
|  [Item 3]              |  [Action Buttons]              |
|  ...                   |                                 |
|  [Pagination]          |                                 |
+------------------------+---------------------------------+
```

#### 6.2 Layout Pattern B — Focused Form (Task Screen)

**Used for**: Patient Registration, Order Placement, AST Entry, Receipt Bench.

```
+----------------------------------------------------------+
|  [Page Title]                                            |
|  [Breadcrumb]  [Context Bar: Specimen ID / Stage]        |
+----------------------------------------------------------+
|                                                          |
|  [FORM SECTION 1 — Heading]                              |
|  [Field Label]    [Input Field]                          |
|  [Field Label]    [Input Field]    [Inline Validation]   |
|                                                          |
|  [FORM SECTION 2 — Heading]                              |
|  [Field Label]    [Input Field]                          |
|                                                          |
|  --------------------------------------------------      |
|  [Cancel]              [Save Draft]      [Submit ->]     |
+----------------------------------------------------------+
```

**Rules**:
*   No more than 8 input fields per visual section.
*   Tab order follows visual reading order (top-to-bottom, left-to-right).
*   The primary action button (Submit) is always on the far right of the action bar.
*   A destructive action (Reject, Delete) is always on the far left, separated by a spacer.

#### 6.3 Layout Pattern C — Dashboard / Overview

**Used for**: Dashboard (Home), QC Dashboard, Pathologist Desk worklist.

```
+----------------------------------------------------------+
|  [Page Title]  [Date/Time]           [Quick Actions]     |
+------------------+-------------------+------------------+
|                  |                   |                  |
|  KPI CARD        |  KPI CARD         |  ALERT PANEL     |
|  (metric)        |  (metric)         |  [Critical flags]|
|                  |                   |                  |
+------------------+-------------------+  [Notification   |
|                                      |   feed]          |
|  WORKLIST TABLE                      |                  |
|  (items awaiting user action)        |                  |
|                                      |                  |
+--------------------------------------+------------------+
```

#### 6.4 Layout Pattern D — Reading / Preview

**Used for**: Report Archive detail view, Pathologist's report review, Audit log entry.

```
+----------------------------------------------------------+
|  [Page Title / Report ID]        [Actions: Print/Export] |
|  [Breadcrumb]                                            |
+----------------------------------------------------------+
|                                                          |
|  [Document Header: Patient, Date, Physician, Lab]        |
|  -------------------------------------------------------  |
|  [Section 1: Culture Results]                            |
|  [Section 2: Isolate Identification]                     |
|  [Section 3: AST Susceptibility Table]                   |
|  [Section 4: Pathologist Comments & Signature]           |
|  -------------------------------------------------------  |
|  [Read-only stamp: VALIDATED / AMENDED]                  |
|                                                          |
|  [Action Bar: Validate / Amend / Rollback — if allowed]  |
+----------------------------------------------------------+
```

---

#### 6.5 Standard Screen Lifecycle

Every application screen follows the same 11-stage lifecycle. This standard ensures consistent behavior, predictable error handling, and uniform permission enforcement across all 22 screens. Screen developers must implement each stage explicitly.

| Stage | Purpose | Entry Criteria | Exit Criteria | System Responsibility | User Responsibility |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Screen Initialization** | Prepare the screen's structural scaffold and register it in the navigation history. | Valid authenticated session token exists. Route URL is valid and maps to a permitted screen. | Screen frame is mounted and visible to the user. | Register the route in browser history. Apply the correct layout pattern (A, B, C, or D). Show the breadcrumb trail and page title immediately. | None — system-driven. |
| **2. Permission Validation** | Verify that the current user has the required permission to view and interact with this screen. | Screen is initialized. User identity and role are resolved from the session. | Permission check passes → proceed to Context Loading. Permission denied → redirect to SCR-021 (Unauthorized). | Resolve the user's active role and permission set. Compare against the screen's required permission constant. Fire `ERR-004` if unauthorized. | None — system-driven. |
| **3. Context Loading** | Load any parent record context that scopes the screen (e.g., Specimen ID, Patient MRN). | Permission validated. A context identifier is present in the route (e.g., `/specimens/:id`). | Context record is confirmed to exist. Context Bar is populated (if applicable). | Fetch the parent record from the cache or server. Populate the Context Bar (Section 7). If the context record does not exist, redirect to SCR-022 (Not Found). | None — system-driven. |
| **4. Data Loading** | Fetch the primary data payload for the screen's content. | Context is confirmed. Skeleton screen is displayed. | Data is received and validated. Screen content is ready to render. | Display skeleton loading screens immediately. Fetch data from the appropriate API service. If the request fails, render the Error State (Section 10.3) with the appropriate error code. | None — system-driven. Wait for content. |
| **5. UI Rendering** | Render the full screen content with data. Apply field-level read/write permissions from LIMS-DOC-05. | Data loading is complete. | All interactive elements are visible and operable. ARIA landmarks are declared. Focus is placed on the first interactive element. | Render all fields. Apply read-only attributes to fields the user cannot edit. Omit action buttons the user cannot perform. Place keyboard focus on the first logical interactive element. | None — system-driven. |
| **6. User Interaction** | The user reads data, fills out fields, interacts with controls, or navigates within the screen. | UI rendering is complete. | The user initiates a save action, a navigation action, or a destructive action. | Maintain current state. Apply field-level validation triggers (`onBlur`). Update character counters and autocomplete dropdowns in real time. Surface inline alerts as required. | Enter data, review information, trigger actions. |
| **7. Client Validation** | Validate user input on the client side before submitting to the server. | User triggers a form submission or primary action. | All client-side validation rules pass → proceed to Server Validation. One or more validations fail → highlight invalid fields, set focus on the first invalid field, prevent submission. | Execute all applicable validation rules (required fields, format checks, range constraints, controlled vocabulary checks). Display inline error messages using `color.status.danger`. | Review and correct highlighted fields. |
| **8. Server Validation** | Submit the validated payload to the server for domain-level business rule validation. | Client validation passes. Network request is dispatched. | Server returns a success response → proceed to Save/Update. Server returns a validation error → surface the error inline and return to User Interaction. Server returns a system error → show Error State. | Show loading state on the submit button. Disable all form fields during the request. Map server-side error codes to plain-language user messages. | Wait for server response. |
| **9. Save / Update** | Persist the validated record to the system. Advance the specimen's workflow state if applicable. | Server validation passes. Server commits the record to the database. | Record is saved. Success toast notification is shown. Workflow state is advanced (if applicable). Audit event is logged. | Persist the record. Advance the workflow state machine. Log the audit event (actor, action, timestamp, before/after snapshot). Dismiss the loading state. Show a success toast. | Acknowledge the success notification. |
| **10. Refresh** | Reload the screen data to reflect the latest server state after a successful save or an external update. | Save/Update is complete, or an external event (e.g., EVT-006 Incubation Started) is received via the notification system. | Screen displays the latest committed data. Any pending counts or badges in the sidebar are updated. | Re-fetch the screen's data payload. Update the Context Bar. Refresh worklist counts. | None — system-driven. |
| **11. Exit** | The user navigates away from the screen, either intentionally or through a system-triggered redirect. | User clicks a navigation link, browser back button, or a system redirect is triggered. | If the form is clean (no unsaved changes): navigate immediately. If the form is dirty: show the Unsaved Changes dialog (Section 16) before allowing navigation. | Detect dirty form state. Block navigation and surface the Unsaved Changes dialog if dirty state is present. Clear the screen's local state on confirmed exit. Log any abandoned record drafts to the Audit Trail. | Confirm or cancel navigation through the Unsaved Changes dialog if prompted. |

---

### 7. Context Bar (Persistent Specimen Tracker)

When a user is actively working within a specimen's workflow (SCR-006 to SCR-013), a **Context Bar** appears directly below the breadcrumb trail. It is always visible and non-collapsible in this context.

**Context Bar Contents**:

```
+----------------------------------------------------------------------------+
|  Specimen: SP-2026-001847  |  Patient: John Doe (MRN: PAT-0042)           |
|  Stage: AST Susceptibility |  Status: [*] Identification (Yellow)          |
|  Opened: 2026-07-03 09:14  |  SLA: 14h remaining (On Track)               |
+----------------------------------------------------------------------------+
```

**Rules**:
*   Status color uses `color.status.*` tokens.
*   SLA shows "On Track" (`color.status.success`), "At Risk" (`color.status.warning`), "Overdue" (`color.status.danger`).
*   Specimen ID and Patient MRN are always rendered in `type.monospace`.

#### 7.1 Specimen Timeline Panel

The Specimen Timeline Panel is a reusable visual element that displays the complete specimen lifecycle as a vertical progression. It provides every user with an instant, at-a-glance understanding of where a specimen currently stands in the 18-stage workflow.

**Placement**:
*   The Timeline Panel is rendered as a collapsible right-side panel within the Culture Workspace, Observation Workspace, AST Workspace, and Validation Workspace (SCR-007 to SCR-012).
*   On desktop and wide breakpoints, the panel is visible by default in expanded form.
*   On tablet breakpoints, the panel is collapsed by default and toggled via a "Timeline" button in the screen header.
*   On mobile, the Timeline Panel is not shown inline; it is accessible via a dedicated "View Timeline" screen action.

**Visibility**: The Timeline Panel is visible to all roles who can access the screens listed above. It is read-only for all users — no workflow transitions can be triggered from within the panel itself.

**Stage Display**:

Each stage is displayed as a node in a vertical list with a connecting line between nodes. Each node shows:
*   The stage name (e.g., "Incubation").
*   A status icon and color:
    *   **Completed stage**: Filled circle with a checkmark icon, rendered in `color.status.success`. Connecting line below is solid.
    *   **Current stage**: Filled circle with a pulsing indicator, rendered in `color.brand.primary`. Stage label is displayed in `type.body.default` (bold).
    *   **Future stage**: Hollow circle, rendered in `color.border.default`. Stage label is displayed in `type.text.secondary`.
    *   **Rejected / Exception stage**: Filled circle with an X icon, rendered in `color.status.danger`. The exception reason is shown as a sub-label.
*   For completed stages: the timestamp when the stage was entered, displayed in `type.body.small`.
*   For the current stage: the SLA deadline and elapsed time.

**Interaction**:
*   Clicking on a completed stage node expands a sub-panel showing: responsible user, entry timestamp, exit timestamp, and the audit event ID.
*   Clicking on a future stage node shows its preconditions (from LIMS-DOC-06, Section 6) as a read-only tooltip.
*   The current stage node cannot be clicked.

**Lifecycle Progression** (as displayed in the panel, top to bottom):

```
[1]  Registered
[2]  Collected
[3]  In Transit
[4]  Received
[5]  Accepted
[6]  Processing
[7]  Culture
[8]  Incubation
[9]  Observation
[10] Identification
[11] AST
[12] Quality Review
[13] Medical Validation
[14] Report Generated
[15] Delivered
[16] Archived
```

Rejected and Disposed are rendered as branch nodes off the Received/Accepted node and the Archived node respectively, displayed only when the specimen has entered those states.

---

### 8. Interaction Pattern Standards

#### 8.1 Button Hierarchy

Only one primary action button is permitted per screen:

| Tier | Purpose | Visual Style |
| :--- | :--- | :--- |
| **Primary** | The single most important action on the screen | Filled, `color.brand.primary` background |
| **Secondary** | Alternate workflow actions (Save Draft, Print) | Outlined, `color.brand.primary` border |
| **Tertiary** | Low-importance, reversible actions (Cancel, Back) | Ghost / text-only |
| **Destructive** | Irreversible, high-risk actions (Reject, Delete) | Filled, `color.status.danger` background, confirmation required |

#### 8.2 Form Interaction Rules

*   **Label placement**: All labels are **above** their input fields. Placeholder text is supplemental only and must never replace a label.
*   **Required fields**: Required fields are indicated by a visible asterisk (`*`) beside the label text.
*   **Inline validation**: Validation is triggered `onBlur` (when the user leaves the field). It must not fire while the user is still typing.
*   **Submission validation**: On form submission, all invalid fields are highlighted simultaneously. The first invalid field receives automatic focus.
*   **Character limits**: Any input with a character limit must show a live counter (e.g., "45/500").
*   **Autocomplete lists**: Lookups (organism species, antibiotic names, patient names) must display autocomplete dropdowns filtered from a controlled master list. Free-text entry is not permitted for controlled vocabulary fields.
*   **Numeric fields**: Result-entry fields (zone diameters, MIC values, colony counts) are numeric-only. Mobile keyboards auto-switch to numeric input.

#### 8.3 Table Interaction Rules

*   **Row click**: Clicking a row opens the detail view (Pattern A) or navigates to the record screen.
*   **Bulk selection**: Tables that support bulk actions display a checkbox column. Selecting any row activates a bulk action bar above the table.
*   **Column sorting**: Sortable columns show a sort indicator icon. Click to sort ascending; click again to sort descending.
*   **Sticky header**: Table column headers remain fixed while the body scrolls.
*   **Empty state**: When a table has no results, an empty state illustration and message is shown (see Section 10).

#### 8.4 Confirmations for Destructive Actions

Any irreversible or high-risk action must follow a two-step confirmation flow:

1.  The user clicks the destructive action button.
2.  A confirmation dialog appears stating:
    *   **What will happen** in plain language.
    *   **What will be recorded** in the audit trail.
    *   Two options: **"Confirm [Action Name]"** (destructive) and **"Cancel"** (ghost).

Actions requiring this flow:
*   Reject Specimen
*   Validate Report (final)
*   Amend Validated Report
*   Archive Specimen
*   Delete User Account
*   Break-Glass Emergency Override

#### 8.5 Keyboard Navigation Standards

*   Tab order must follow the visual reading order of the screen (top-to-bottom, left-to-right).
*   All interactive elements must be reachable by Tab key.
*   The active focused element must always display the `color.focus.ring` token (minimum 3px visible ring).
*   Pressing `Enter` on a focused button triggers its primary action.
*   Pressing `Escape` closes any open dropdown, modal, or flyout panel.
*   Form submission must be triggerable via `Enter` on the last field in a section.

---

#### 8.6 Record Locking UX

To prevent data conflicts in a multi-user laboratory environment, the LIMS enforces record locking rules whenever a specimen record, report, or patient record is opened for editing.

**Lock Types**:

| Lock Type | Description | Trigger | User Experience |
| :--- | :--- | :--- | :--- |
| **Read-Only Mode** | The record is inherently non-editable due to its current status (e.g., validated reports). | Specimen status is `Report Generated`, `Delivered`, `Archived`, or `Disposed`. | All input fields are rendered with disabled attributes. Edit and Submit buttons are removed from the viewport. A read-only badge is displayed in the Context Bar. |
| **Soft Lock** | The record is being actively edited by another user. The current user can view but not edit it. | A different authenticated user has the record open in an editable screen. | A non-blocking banner appears below the Context Bar: "Currently being edited by [User Full Name] — viewing in read-only mode." The "Last Modified" information is visible. The user can request to take over editing (which will notify the current editor). |
| **Hard Lock** | The record is locked by the system for a critical operation (e.g., pathologist validation in progress, PDF generation). | A server-side locking operation is active on the record. | All input fields are disabled. A blocking banner reads: "This record is locked by the system. It will become available shortly." No editing or navigation within the record is possible. |

**Current Editor Display**:
*   When a Soft Lock is active, the name and role of the current editor are shown in the lock banner.
*   The time the editor opened the record is shown in `type.body.small` format (e.g., "Opened 14 minutes ago").

**Last Modified Information**:
*   Every editable record displays a "Last modified by [Name] on [Date Time]" line at the bottom of the form, rendered in `type.body.small` and `color.text.secondary`.
*   This line is always visible, regardless of lock state.

**Lock Expiration**:
*   A Soft Lock automatically expires after **15 minutes** of inactivity by the locking editor (aligned with the session inactivity timeout in LIMS-DOC-05, Section 13).
*   When a lock expires, the waiting user's read-only banner updates to: "The previous editor's session has expired. You can now edit this record."
*   Taking over an expired lock is logged in the Audit Trail.

**Conflict Resolution**:
*   If two users attempt to save the same record simultaneously (race condition), the server processes the first successful write. The second user receives an inline error: "This record was updated by [Name] while you were editing. Please review the latest version before saving."
*   The system does not perform automatic merging. The second user must manually reconcile their changes.
*   Both save attempts are logged in the Audit Trail.

---

#### 8.7 Unsaved Changes Strategy

The system enforces a consistent unsaved changes policy across all editable screens to prevent accidental data loss.

**Dirty Form Detection**:
*   A form is considered **dirty** as soon as any field value differs from its last-saved server state.
*   Dirty state is detected automatically whenever the user modifies a field value.
*   The screen displays a visible "Unsaved changes" indicator in the action bar area when dirty state is active (e.g., a subtle dot or label beside the Save button).
*   Dirty state is cleared when the user successfully saves, explicitly discards changes, or exits via the confirmed Discard path.

**When the Unsaved Changes Dialog Appears**:
*   The user clicks a sidebar navigation link to leave the current screen.
*   The user clicks the browser's back or forward button.
*   The user closes the browser tab or window.
*   The user clicks a breadcrumb link that would navigate away.
*   The user selects a result in the Command Palette that navigates to a different screen.
*   The user clicks "Cancel" on a form that has been modified.

**The Dialog**:
The dialog is a blocking modal with an accessible name of "You have unsaved changes":

```
+----------------------------------------------------------+
|  You have unsaved changes                                |
|  -------------------------------------------------------- |
|  You have made changes to this record that have not      |
|  been saved. If you leave now, your changes will be      |
|  lost.                                                   |
|                                                          |
|  [Discard Changes]            [Cancel]   [Save & Leave]  |
+----------------------------------------------------------+
```

**Dialog Options**:

| Option | Action | Visual Style |
| :--- | :--- | :--- |
| **Save & Leave** | Triggers client validation → server validation → save → navigation. If save fails, stays on the current screen and shows the error. | Primary button |
| **Cancel** | Closes the dialog. Returns the user to the dirty form without navigating away. | Tertiary button |
| **Discard Changes** | Reverts the form to its last saved state. Navigates away immediately. Logs a "Draft Discarded" event in the Audit Trail. | Destructive button |

**Rules**:
*   The Unsaved Changes dialog is never shown when the form is clean (no modifications made).
*   Forms that are in read-only mode never trigger the Unsaved Changes dialog.
*   If the user's session times out while a dirty form is open, the session timeout is handled first; the unsaved data is lost and logged as a session-abandoned event in the Audit Trail.

---

#### 8.8 Global Quick Actions

The Quick Actions area provides role-filtered shortcut buttons for the most common laboratory tasks. It surfaces the most frequent entry points without requiring navigation through the sidebar.

**Placement**:
*   On the Dashboard (SCR-000, Layout Pattern C), Quick Actions are rendered as a horizontal row of labeled icon-buttons directly below the page title, above the KPI cards.
*   On all other screens, Quick Actions are accessible via a "+" or "Quick Actions" button in the top header bar (right side), which opens a compact dropdown menu.

**Available Quick Actions by Role**:

| Quick Action | Navigates To | Visible To |
| :--- | :--- | :--- |
| **Register Patient** | SCR-001 (Patient Registration, new form) | Processor, Admin |
| **Create Order** | SCR-003 (Order Placement, new form) | Processor, Admin |
| **Receive Sample** | SCR-006 (Receipt Bench, scan mode active) | Processor, Technician, Admin |
| **Print Barcode** | SCR-005 (Barcode Workspace, queue view) | Processor, Admin |
| **Search Specimen** | Command Palette (Section 4.7) pre-filtered to Specimen search | All roles |
| **Open Pending Worklist** | Dashboard (SCR-000) scrolled to the role's pending items worklist | All roles |
| **Create Invoice** | SCR-015 (Invoicing Desk, new invoice form) | Processor, Admin |
| **Log QC Event** | SCR-017 (QC & CAPA Ledger, new entry form) | Technician, Sr. Micro, Admin |

**Visibility Rules**:
*   Only Quick Actions the current user has permission to execute are rendered. Non-permitted actions are never shown (not greyed out — entirely absent).
*   The Quick Actions list is static per role. Users cannot customize which actions appear.
*   On mobile, Quick Actions are rendered as a floating action button (FAB) in the lower-right corner, expanding into a radial or stacked list on tap.

**UX Guidelines**:
*   Each Quick Action button displays an icon and a short text label (maximum 3 words).
*   Clicking a Quick Action navigates directly to the target screen with the primary action already focused (e.g., "Register Patient" opens the registration form with the first field focused and ready for input).
*   Quick Actions must never require a secondary click before the target screen loads.

---

### 9. Status & Badge System

Every specimen, report, and task item carries a visual status badge. Badges communicate workflow state at a glance.

#### 9.1 Specimen Status Badges

| Status | Color Token | Notes |
| :--- | :--- | :--- |
| Requested | `color.status.pending` | Order created, not yet collected |
| Registered | `color.status.pending` | Patient registered |
| Collected | `color.status.info` | Sample obtained |
| In Transit | `color.status.info` | Moving to lab |
| Received | `color.status.info` | Arrived at lab |
| Accepted | `color.status.success` | Passed quality check |
| Rejected | `color.status.danger` | Failed quality check |
| Processing | `color.status.warning` | Being prepared |
| Culture | `color.status.warning` | Plates streaked |
| Incubation | `color.status.warning` | Active timer running |
| Observation | `color.status.warning` | Technician reading plate |
| Identification | `color.status.warning` | Organism being identified |
| AST | `color.status.warning` | Susceptibility being tested |
| Quality Review | `color.status.info` | Awaiting supervisor sign-off |
| Medical Validation | `color.status.info` | Awaiting pathologist |
| Report Generated | `color.status.success` | PDF compiled |
| Delivered | `color.status.success` | Physician notified |
| Archived | `color.text.secondary` | Record in cold storage |
| Disposed | `color.text.disabled` | Physically discarded |

**Rule**: Status is always communicated by both color **and** text label. Never by color alone (WCAG 1.4.1).

---

### 10. Empty, Loading, and Error States

Every screen that displays data must handle three alternate states gracefully.

#### 10.1 Empty State

**Required elements**:
1.  A contextual illustration related to the feature (not a generic graphic).
2.  A headline: e.g., "No specimens awaiting processing."
3.  Sub-copy: e.g., "When specimens are accepted at the receipt bench, they will appear here."
4.  A primary action button if applicable: e.g., "Register First Patient."

#### 10.2 Loading State

*   Use skeleton screens (placeholder shapes matching the final content layout). Spinner icons alone are not permitted for full-page loads.
*   Skeleton screens must appear immediately on navigation — no blank white screen flash.
*   For inline actions (submitting a form), the triggering button changes to a loading state and is disabled until the response completes.
*   If a load takes longer than 5 seconds, a "Taking longer than expected…" message appears within the skeleton.

#### 10.3 Error State

*   An inline error banner appears at the top of the affected screen section.
*   Error messages use plain language: "We couldn't save the specimen receipt. Please try again."
*   The error code (e.g., `ERR-003`) is shown in a collapsible "Technical details" section — visible to administrators, hidden by default.
*   The user must never see a raw stack trace or JSON error body.
*   All errors are logged to the Audit Trail with severity level `ERROR`.

---

### 11. Notification System

The notification system surfaces business events (EVT-001 to EVT-014) as user-facing alerts.

#### 11.1 Notification Types

| Type | Delivery | Persistence | Examples |
| :--- | :--- | :--- | :--- |
| **Toast (Transient)** | Lower-right corner, auto-dismiss after 5 seconds | Not persisted | "Specimen SP-001 accepted successfully." |
| **Bell Notification** | Notification flyout | Persisted until read | "Quality review pending for SP-001." |
| **Critical Alert Banner** | Full-width red banner at top of screen | Persisted until acknowledged | "Critical value flagged for SP-001. Physician notification required." |
| **Inline Action Alert** | Within active screen context | Dismissed when action is taken | "This media lot expires in 3 days." |

#### 11.2 Toast Notification Rules

*   Toasts appear in the lower-right corner, stacked if multiple (max 3 visible at once).
*   Toast types map to color tokens: Success, Warning, Error, Info.
*   Error toasts do **not** auto-dismiss. The user must close them manually.
*   All toasts are announced to screen readers via ARIA live regions.

---

### 12. Responsive & Adaptive Behavior

#### 12.1 Breakpoint System

| Breakpoint Name | Minimum Width | Primary Use |
| :--- | :--- | :--- |
| **Mobile** | 360px | Clinical audit on mobile, physician portal |
| **Tablet** | 768px | Receipt bench (handheld scanner + tablet) |
| **Desktop** | 1280px | Primary laboratory workstation |
| **Wide** | 1600px | Dual-monitor pathologist/supervisor desk |

#### 12.2 Responsive Rules per Layout Pattern

| Layout Pattern | Mobile | Tablet | Desktop | Wide |
| :--- | :--- | :--- | :--- | :--- |
| **A — List + Detail** | List only; tap to full-screen detail | Side-by-side 40/60 split | Side-by-side 35/65 split | Side-by-side 25/75 split |
| **B — Focused Form** | Single-column, full-width | Single-column, centered | Two-column with summary panel | Two-column with wide labels |
| **C — Dashboard** | Stacked KPI cards, worklist below | 2-column KPI grid + worklist | 3-column KPI + side alert panel | 4-column KPI + wide worklist |
| **D — Reading View** | Scrollable document | Wider margins | Fixed-width centered document | Fixed-width + side annotation panel |

#### 12.3 Mobile-Specific Rules

*   The left sidebar is hidden by default on mobile. It opens as a full-height drawer via a hamburger menu.
*   Table rows collapse to card format on mobile.
*   Touch targets for all interactive elements must be a minimum of **44 × 44px** (WCAG 2.5.5).
*   The physician portal (SCR-014) is the only screen designed mobile-first.

---

### 13. Accessibility Standards (WCAG 2.1 AA)

The system must meet WCAG 2.1 Level AA compliance. The following standards are mandatory:

#### 13.1 Perceivable

| Criterion | Requirement |
| :--- | :--- |
| **1.1.1** | All images, icons, and illustrations must have descriptive `alt` text or `aria-label`. Decorative images use empty `alt=""`. |
| **1.3.1** | All form fields must have programmatically associated labels. Never use placeholder text as the only label. |
| **1.3.3** | Instructions must not rely solely on color, shape, or visual position. Always include text. |
| **1.4.1** | Status information is conveyed by both color and text label. |
| **1.4.3** | Text and interactive elements: 4.5:1 contrast ratio (body), 3:1 (large text and UI components). |
| **1.4.4** | Text must remain readable when scaled to 200% browser zoom without horizontal scrolling. |

#### 13.2 Operable

| Criterion | Requirement |
| :--- | :--- |
| **2.1.1** | Every function achievable by mouse is also achievable by keyboard alone. |
| **2.1.2** | Keyboard focus must never be trapped outside a modal. Inside modals, focus must be trapped until the modal is closed. |
| **2.4.3** | Focus order must follow a logical sequence matching the visual reading order. |
| **2.4.7** | Focus indicators are always visible (minimum 3px ring using `color.focus.ring` token). |
| **2.5.3** | Interactive element accessible names match their visible label text. |

#### 13.3 Understandable

| Criterion | Requirement |
| :--- | :--- |
| **3.1.1** | The language of the application is declared in the HTML `lang` attribute. |
| **3.2.2** | No unexpected context changes occur when a user enters data into a field. |
| **3.3.1** | Error messages identify the specific field with an error and describe what is wrong in plain language. |
| **3.3.2** | All form fields have visible labels before the user starts to interact. |

#### 13.4 Robust

| Criterion | Requirement |
| :--- | :--- |
| **4.1.2** | All custom interactive elements have appropriate ARIA roles, states, and properties. |
| **4.1.3** | Status messages (toasts, alerts, loading states) are announced to assistive technologies via ARIA live regions. |

---

### 14. Motion & Animation Standards

Animations must serve a functional purpose. Purely decorative animations are not permitted in a clinical environment.

| Animation Type | Permitted Use | Duration Range | Easing |
| :--- | :--- | :--- | :--- |
| **Page transition** | Fade-in on route change | 100–150ms | ease-out |
| **Sidebar expand/collapse** | Width transition | 150–200ms | ease-in-out |
| **Dropdown open/close** | Opacity + translate-Y | 100–120ms | ease-out |
| **Toast appear/dismiss** | Slide-in from edge | 200ms | ease-out |
| **Skeleton pulse** | Loading placeholder animation | 1.5s loop | ease-in-out |
| **Modal enter/exit** | Fade + scale | 150ms | ease-out |

**Rules**:
*   All animations must respect the `prefers-reduced-motion` media query. When active, all transitions become instant opacity changes.
*   No animation may delay or block a user action.

---

### 15. Print Behavior

The following screens must produce a clean, print-optimized layout when the browser's native print function is triggered:

| Screen | Print Content |
| :--- | :--- |
| **SCR-012 (Pathologist Desk)** | Full validated report: patient, isolate, AST table, comments, signature |
| **SCR-013 (Report Archive)** | Selected report's validated content |
| **SCR-005 (Barcode Workspace)** | Barcode label(s) sized for adhesive label printer stock |
| **SCR-018 (Audit Trail)** | Filtered audit log as a tabular printout |

**Print rules**:
*   Navigation sidebar, header bar, and action buttons are hidden in print view.
*   Page header shows laboratory name, logo, and report generation timestamp.
*   A "Page X of Y" footer appears on each printed page.

---

## Assumptions
*   The application is accessed primarily on laboratory workstations with a minimum screen width of 1280px.
*   The physician portal (SCR-014) is the only screen accessed routinely from mobile devices by external users.
*   All users can read English; internationalization (i18n) is a post-MVP enhancement.

---

## Future Enhancements
*   Right-to-left (RTL) language layout support.
*   High-contrast dark mode theme as an optional user preference.
*   Voice-assisted navigation mode for specimen receipt and observation entry.
*   Customizable dashboard widget layout per user profile.

---

## Review Checklist
- [x] Defines 10 UX principles grounded in clinical workflow context.
- [x] Lists prohibited anti-patterns explicitly.
- [x] Establishes complete Design Token System (color, typography, spacing, elevation, radius).
- [x] Documents full Information Architecture with 6 domains and 22-screen inventory.
- [x] Defines Workspace Model grouping all 22 screens into 9 logical workspaces.
- [x] Defines Navigation Model (sidebar, breadcrumbs, global search, notification bell).
- [x] Defines Global Command Palette (Ctrl+K) with 10 searchable sections.
- [x] Defines Favorites & Recent Items system (20 recent, 10 pinned, 5 favorite screens).
- [x] Provides role-based user journeys for all 7 system roles with decision points.
- [x] Documents 4 standard screen layout patterns with structural diagrams.
- [x] Documents Standard Screen Lifecycle (11 stages from initialization to exit).
- [x] Defines persistent Context Bar for in-progress specimen work.
- [x] Defines Specimen Timeline Panel with stage visualization rules.
- [x] Specifies button hierarchy, form behavior, table behavior, and confirmation patterns.
- [x] Defines Record Locking UX (Read-Only, Soft Lock, Hard Lock, conflict resolution).
- [x] Defines Unsaved Changes Strategy (dirty detection, dialog, Save/Discard/Cancel).
- [x] Defines Global Quick Actions area with role-based visibility rules.
- [x] Documents complete Specimen Status Badge system for all 19 lifecycle states.
- [x] Covers Empty, Loading, and Error state standards.
- [x] Defines the 4-tier Notification System aligned to Business Events (EVT-001 to EVT-014).
- [x] Specifies 4 breakpoints and responsive rules for each layout pattern.
- [x] Mandates WCAG 2.1 AA compliance with explicit criterion mapping.
- [x] Documents Animation Standards including reduced-motion compliance.
- [x] Documents Print Behavior for the 4 printable screens.
- [x] Defines expanded Keyboard Productivity Standards (12 shortcuts with scope).
- [x] Defines Global Search Specification for 14 entity types with permission rules.
- [x] Document contains NO React component or implementation details (boundary respected).
- [x] Document follows the LIMS-DOC template structure.

---

## Section 16 — Unsaved Changes (Reference)
> *(Defined in Section 8.7 of this document. Referenced here for cross-linking from Section 3.3 Workspace Exit Rules.)*

---

### 17. Keyboard Productivity Standards

This section expands on the baseline keyboard navigation rules in Section 8.5. It defines the full set of application-wide keyboard shortcuts to be supported by every screen, enabling laboratory staff to work at maximum speed without reaching for the mouse.

**Ground Rules**:
*   Shortcuts must never conflict with browser native shortcuts unless the UX benefit is significant and the override is documented.
*   All shortcuts are listed in a discoverable "Keyboard Shortcuts" help panel, accessible via `?` key or a "Shortcuts" link in the user menu.
*   Shortcuts that require a dirty form state to be useful (e.g., `Ctrl + S`) must still respect the permission rules of the current screen.

| Shortcut | Name | When Applicable | Effect |
| :--- | :--- | :--- | :--- |
| `Ctrl + S` | Save | Any editable screen with unsaved changes (dirty form). | Triggers client validation → server validation → save. Equivalent to clicking the primary Submit button. If the form is already clean, no action is taken. |
| `Ctrl + Enter` | Save & Continue | Form screens with a multi-step workflow (e.g., Order Placement, AST Entry). | Saves the current section and advances focus to the next form section or step. If this is the final step, triggers full form submission. |
| `Ctrl + K` | Open Command Palette | All screens, at all times. | Opens the Global Command Palette overlay (Section 4.7). If the palette is already open, pressing again closes it. |
| `Ctrl + P` | Print | Screens with defined print behavior (SCR-005, SCR-012, SCR-013, SCR-018). | Triggers the browser's native print dialog with the print-optimized layout applied. On screens without defined print behavior, this shortcut has no effect. |
| `Alt + N` | New Record | Screens that serve as directory/list views (e.g., Patient Directory, Order Directory). | Opens the "New [Entity]" form for the current list context. Equivalent to clicking the "Register Patient" or "Create Order" primary action button. |
| `Escape` | Dismiss / Cancel | Any open dropdown, modal, tooltip, Command Palette, or flyout panel. | Closes the topmost open overlay. If a dirty form modal (Unsaved Changes dialog) is open, `Escape` is equivalent to clicking "Cancel" — it closes the dialog and returns to the form without navigating away. |
| `Tab` | Advance Focus | All interactive screens. | Moves keyboard focus to the next interactive element in the defined tab order (top-to-bottom, left-to-right). |
| `Shift + Tab` | Reverse Focus | All interactive screens. | Moves keyboard focus to the previous interactive element in the defined tab order. |
| `Arrow Up / Arrow Down` | List Navigation | Open dropdowns, Command Palette results, autocomplete lists, table rows. | Moves focus between items in the active list without closing it. |
| `Enter` | Select / Confirm | Focused button, list item, table row, or autocomplete suggestion. | Triggers the focused element's primary action: clicks a button, selects a list item, opens a table row's detail view. |
| `Space` | Toggle | Focused checkbox, radio button, or toggle switch. | Toggles the focused input control. For buttons, `Space` is equivalent to `Enter`. |
| `?` | Help / Shortcuts | All screens. | Opens the Keyboard Shortcuts help panel as a non-blocking side drawer. The panel lists all available shortcuts organized by category. Pressing `?` again or `Escape` closes the panel. |

---

### 18. Global Quick Actions (Reference)
> *(Defined in Section 8.8 of this document. Referenced here as a numbered section for completeness.)*

---

### 19. Record Locking UX (Reference)
> *(Defined in Section 8.6 of this document. Referenced here as a numbered section for completeness.)*

---

### 20. Global Search Specification

This section expands the Global Search introduction in Section 4.5. It defines every searchable entity in the system, the fields that can be matched, how results are displayed, how navigation occurs after selection, and what permission constraints apply.

**General Search Rules**:
*   Search is triggered after a minimum of 2 characters are entered in the search input.
*   Results are returned as a categorized dropdown grouped by entity type.
*   Results are sorted by relevance (exact matches first, then partial matches).
*   A maximum of 5 results per category are shown in the dropdown. A "View all [N] results" link at the bottom of each category opens a full results screen.
*   The search input field in the global header is always visible. Pressing `/` from any screen focuses the search input (keyboard shortcut).
*   All searches are performed against only the records the current user is authorized to access.

**Searchable Entities**:

| Entity | Searchable Fields | Result Display | Navigation Behavior | Permission Required |
| :--- | :--- | :--- | :--- | :--- |
| **Patients** | Full name (first + last), MRN, date of birth | Full Name, MRN, DOB | Opens the patient's most recent active Order (SCR-003 detail view) | `PATIENT_READ` |
| **Clients** | Organization name, NPI number, contact name | Organization Name, NPI, Contact | Opens the Client Directory record (SCR-002 detail view) | `PATIENT_READ` |
| **Physicians** | Full name, NPI, organization | Full Name, NPI, Organization | Opens the physician's profile within the Client Directory | `PATIENT_READ` |
| **Orders** | Order number, Patient MRN, Patient name | Order Number, Patient Name, Test Panels, Status | Opens the Order detail view (SCR-003 or SCR-004) | `PATIENT_READ` |
| **Specimens** | Specimen ID, Patient MRN, Patient name, current status | Specimen ID, Patient Name, Current Status badge, Stage | Opens the specimen's current active workspace screen | `SPECIMEN_RECEIVE` |
| **Reports** | Report ID, Patient MRN, Patient name, Pathologist name, validation date | Report ID, Patient Name, Validation Date, Status stamp | Opens the Report Archive detail view (SCR-013) | `REPORT_GENERATE` |
| **Organisms** | Species name, genus, common name, ATCC code | Species Name, Genus, Common Name | Opens the organism's entry in the controlled vocabulary reference list | `CULTURE_OBSERVE` |
| **AST Results** | Specimen ID, Patient MRN, Antibiotic name, Organism name | Specimen ID, Antibiotic, S/I/R result | Opens the AST detail within the specimen's AST Entry Screen (SCR-010) | `AST_RECORD` |
| **Audit Logs** | User name, action type, specimen ID, date range, event ID | Event ID, Actor, Action, Timestamp | Opens the Audit Trail Logs screen (SCR-018) filtered to the selected entry | `AUDIT_VIEW` |
| **Users** | Full name, email address, role name | Full Name, Email, Role, Status | Opens the User Management record (SCR-019) | `USER_MANAGE` |
| **Media Lots** | Lot number, media type name, expiry date | Lot Number, Media Type, Expiry Date, Status | Opens the Media Lot entry in the QC & CAPA Ledger (SCR-017) | `QC_LOT_MANAGE` |
| **QC Records** | QC event ID, date, technician name, lot number | QC Event ID, Date, Technician, Result | Opens the QC record in the QC & CAPA Ledger (SCR-017) | `QC_LOT_MANAGE` |
| **CAPA Records** | CAPA ID, issue description, assigned user, status | CAPA ID, Issue Summary, Status | Opens the CAPA entry in the QC & CAPA Ledger (SCR-017) | `CAPA_LOG` |
| **Invoices** | Invoice ID, Client name, Patient MRN, Invoice date, status | Invoice ID, Client Name, Total, Status | Opens the Invoice record in the Invoicing Desk (SCR-015) | `BILLING_VIEW` |

**Result Display Format**:
Each search result is rendered as a two-line list item:
*   **Line 1**: Entity type icon + Primary identifier (rendered in `type.monospace` for IDs) + Primary label.
*   **Line 2**: Secondary context field (e.g., DOB, Status badge, Date) in `type.body.small` and `color.text.secondary`.

**No Results State**: If no results are found for any category, the dropdown shows: "No results for '[query]'" with a suggestion to try a different term or use a broader search.

---

## Revision History

| Version | Date | Author | Change Summary |
| :--- | :--- | :--- | :--- |
| **1.0.0** | 2026-07-03 | Antigravity | Initial approved version. Established design philosophy, design tokens, IA with 6 domains and 22 screens, navigation model, 7 role-based user journeys, 4 layout patterns, Context Bar, interaction standards, status badge system, empty/loading/error states, notification system, responsive behavior, WCAG 2.1 AA mapping, animation standards, and print behavior. |
| **1.0.1** | 2026-07-03 | Antigravity | Added 10 enhancements per user instruction: (E1) Standard Screen Lifecycle — 11 stages with purpose, entry/exit criteria, and responsibilities (Section 6.5). (E2) Workspace Philosophy — 9 named workspaces with screens, users, workflows, and exit rules (Section 3.3). (E3) Global Command Palette — Ctrl+K, 10 sections including universal search, quick navigation, and recently opened (Section 4.7). (E4) Global Quick Actions — role-filtered shortcut buttons on Dashboard and header, 8 defined actions (Section 8.8). (E5) Unsaved Changes Strategy — dirty detection, dialog with Save/Discard/Cancel, all trigger conditions (Section 8.7). (E6) Record Locking UX — Read-Only, Soft Lock, Hard Lock modes, current editor display, lock expiration, and conflict resolution (Section 8.6). (E7) Specimen Timeline Panel — collapsible right panel showing all 16+ lifecycle stages with completed/current/future/exception state visuals (Section 7.1). (E8) Favorites & Recent Items — 20 recent records, 10 pinned, 5 favorite screens, session-persistent tracking (Section 4.8). (E9) Keyboard Productivity Standards — 12 system-wide shortcuts with scope and behavior (Section 17). (E10) Global Search Specification — 14 searchable entity types with fields, result display, navigation behavior, and permission rules (Section 20). Version bumped to 1.0.1. Status set to Approved. |
