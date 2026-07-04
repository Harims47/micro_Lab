# Interaction Pattern Library

## Document Metadata
*   **Document ID**: LIMS-DOC-13B
*   **Version**: 1.0.0
*   **Author**: Antigravity (LIMS Solution Architect)
*   **Status**: Approved
*   **Last Updated**: 2026-07-03
*   **Dependencies**:
    *   [LIMS-DOC-05: User Roles & Permissions](file:///d:/Projects/Micro_Lab/docs/05_user_roles_permissions.md)
    *   [LIMS-DOC-06: End-to-End Laboratory Workflow](file:///d:/Projects/Micro_Lab/docs/06_end_to_end_workflow.md)
    *   [LIMS-DOC-13: UI/UX Foundation](file:///d:/Projects/Micro_Lab/docs/13_ui_ux_foundation.md)
    *   [LIMS-DOC-13A: UI State Dictionary](file:///d:/Projects/Micro_Lab/docs/13a_ui_state_dictionary.md)
*   **Required By**:
    *   [LIMS-DOC-14: Component Library](file:///d:/Projects/Micro_Lab/docs/14_component_library.md)
    *   [LIMS-DOC-15: Design System](file:///d:/Projects/Micro_Lab/docs/15_design_system.md)
*   **Requested By**: Laboratory Director & UX Lead
*   **Reviewed By**: Solution Architect & Senior Microbiologist
*   **Approved By**: User
*   **Approval Date**: 2026-07-03

> **Scope Boundary**: This document defines **user interaction behavior only**. It does not define visual appearance (that is LIMS-DOC-15), UI state semantics (that is LIMS-DOC-13A), screen layout or information architecture (that is LIMS-DOC-13), or component implementation (that is LIMS-DOC-14). It does not reference React, HTML, CSS, Tailwind, TypeScript, APIs, or any frontend framework.

> **Governance Rule — MANDATORY ARCHITECTURE STANDARD**: No reusable component, page, workflow, dialog, table, form, notification, or screen may invent its own interaction behavior. Every interaction must reference an approved Interaction Pattern defined in this document. Any new interaction requires a formal documentation update and architectural approval before implementation.

---

## Purpose

The purpose of this document is to answer **"How should users interact with every part of the application?"** It establishes the complete, canonical library of interaction behaviors that govern every user action in the Microbiology LIMS — from clicking a navigation link to completing a workflow transition to searching for a specimen.

This document is the **single source of truth for interaction behavior**. When a developer, designer, or QA engineer asks how a specific interaction should work, this document provides the definitive answer.

---

## Scope

This document defines:
*   Interaction design principles governing all behavior decisions
*   Navigation interaction patterns (sidebar, breadcrumb, workspace, tab, deep, back, home, search)
*   Form interaction patterns (create, edit, view, save, cancel, reset, delete, archive, duplicate, validation, multi-step)
*   Table interaction patterns (sorting, filtering, pagination, grouping, selection, bulk actions, export, print)
*   Search interaction patterns (instant, global, advanced, history, command palette)
*   Workflow interaction patterns (approve, reject, rollback, delegate, escalate, reassign, pause, resume, complete, archive)
*   Dialog interaction patterns (information, confirmation, warning, critical, delete, wizard)
*   Drawer interaction patterns (view, edit, audit, preview)
*   File interaction patterns (upload, download, preview, replace, delete, version history, barcode printing, PDF viewing)
*   Notification interaction patterns (toast, banner, critical alert, inline, notification center)
*   Timeline interaction patterns
*   Dashboard interaction patterns
*   Mobile interaction patterns
*   Keyboard interaction standards
*   Accessibility interaction standards
*   Interaction matrix across all surface types
*   Relationships to other approved documents

---

## Main Content

---

### 1. Terminology Conventions

| Term | Definition |
| :--- | :--- |
| **Interaction Pattern** | A named, reusable behavioral specification describing how a user performs a specific action and how the system responds. |
| **Trigger** | The user gesture that initiates an interaction (e.g., click, keyboard shortcut, focus, hover). |
| **Response** | The system's immediate, visible reaction to a user trigger. |
| **Confirmation** | A mandatory intermediate step that asks the user to verify an irreversible or high-risk action before it is executed. |
| **Precondition** | A condition that must be true before a user is permitted to initiate an interaction. |
| **Exit Behavior** | What happens to the user's position and focus after an interaction completes or is cancelled. |
| **Pattern Reference** | An identifier in the format `IP-[Category]-[Number]` used to uniquely identify every interaction pattern defined in this document (e.g., `IP-FORM-03`). |

---

### 2. Interaction Design Principles

The following principles govern every interaction decision in the system. When a design or implementation choice conflicts with any principle, the principle takes precedence.

| # | Principle | Definition | Application in LIMS |
| :--- | :--- | :--- | :--- |
| **IDP-01** | **Consistency** | Every similar action must behave identically across all screens and contexts. The user should never have to re-learn a behavior. | The "Save" action always validates client-side first, then submits, then shows a toast. This sequence is identical on every form in the system. |
| **IDP-02** | **Predictability** | The outcome of every interaction must match the user's reasonable expectation. There are no surprises. | Clicking a table row always opens its detail view. Pressing `Escape` always closes the topmost open overlay. These behaviors never deviate. |
| **IDP-03** | **Minimal Clicks** | The most common task for each role must be reachable in the fewest possible user actions. | A Specimen Processor's most common action (register a patient) is available as a Quick Action from the Dashboard in a single click. |
| **IDP-04** | **Keyboard First** | Every interaction achievable by mouse must also be achievable by keyboard. No interaction is mouse-exclusive. | All forms, tables, dialogs, and navigation menus have complete keyboard support. Mouse is optional — keyboard is required. |
| **IDP-05** | **Accessibility First** | Accessibility is not a feature added after design. It is a constraint that shapes every interaction from the start. | Every focus state, every announcement, every confirmation dialog is designed for screen reader and keyboard users before it is designed for mouse users. |
| **IDP-06** | **Error Prevention** | The system must make it impossible or very difficult to commit a mistake in the first place. Warnings before errors. Confirmations before irreversible actions. Validation before submission. | Required fields are clearly marked. Dangerous actions (Reject, Validate, Archive) require a two-step confirmation dialog. Expired media lot selections are blocked before plating. |
| **IDP-07** | **Progressive Disclosure** | Show only the information and controls that are relevant to the user's current task. Additional detail is accessible on demand, not pushed by default. | The Timeline Panel is collapsed by default on tablet. Advanced search fields are hidden behind an "Advanced" toggle. S/I/R override fields are only revealed after the standard entry is complete. |
| **IDP-08** | **User Feedback** | Every action the user takes must produce a visible, immediate response. Silent operations are prohibited. | Every form submission produces a loading state on the button. Every completed save produces a success toast. Every failed request produces an error message. |
| **IDP-09** | **Safety Before Speed** | In a clinical environment, accuracy is more important than speed. When speed and safety conflict, the interaction must err on the side of safety. | The pathologist validation dialog always requires the user to explicitly click "Validate" — it cannot be triggered by pressing `Enter` alone on the report view page. |
| **IDP-10** | **Clinical Accuracy** | Interaction patterns must prevent ambiguity in clinical data entry. Controlled vocabulary fields enforce selection from approved lists. Freeform text is minimized. | Organism species selection uses a typeahead from the approved controlled vocabulary. Zone diameter fields accept only numeric input within a valid range. S/I/R is always calculated, never freeform-typed. |

---

### 3. Navigation Patterns

#### IP-NAV-01 — Sidebar Navigation

*   **Purpose**: Primary navigation between the six application domains.
*   **Trigger**: Mouse click on a sidebar item, or keyboard `Tab` to the item followed by `Enter`.
*   **Behavior**:
    1.  The clicked domain item receives the active highlight state.
    2.  If the domain has child screens, the sub-menu expands inline (accordion behavior — only one domain group is expanded at a time).
    3.  The first child screen of the domain is selected by default on first visit.
    4.  On subsequent visits within the same session, the last visited child screen within the domain is re-selected.
    5.  Navigation executes immediately. No intermediate loading screen is shown before the skeleton appears.
*   **User Expectations**: The active domain is always visually distinguishable. The selected child screen is clearly highlighted.
*   **Restrictions**: Only domains and screens the current user has permission to access are rendered. No domain is shown as locked or greyed. Attempting to access a hidden screen via direct URL redirects to SCR-021.

---

#### IP-NAV-02 — Breadcrumb Navigation

*   **Purpose**: Allow the user to navigate upward through the current screen's hierarchy.
*   **Trigger**: Mouse click on any non-terminal breadcrumb segment, or keyboard focus + `Enter`.
*   **Behavior**:
    1.  Clicking an ancestor breadcrumb segment navigates to that level.
    2.  If the current screen has unsaved changes (Dirty form state per LIMS-DOC-13A, Section 6), the Unsaved Changes dialog (IP-DIALOG-02) is displayed before navigation proceeds.
    3.  The breadcrumb trail updates immediately when the destination screen loads.
*   **Restrictions**: The terminal (rightmost) breadcrumb segment representing the current screen is not a link and is not interactive. It is rendered as plain text.

---

#### IP-NAV-03 — Workspace Navigation

*   **Purpose**: Move between screens within the same workspace without losing the active specimen or patient context.
*   **Trigger**: Clicking a secondary tab or sub-menu item within the active domain.
*   **Behavior**:
    1.  The context (Specimen ID, Patient MRN, current stage) is preserved in the Context Bar across all screens within the workspace.
    2.  Navigation between workspace screens does not re-trigger Permission Validation (Stage 2 of the Screen Lifecycle). Permission is validated once on workspace entry.
    3.  If the user navigates away from a screen with a Dirty form within the workspace, the Unsaved Changes dialog is displayed.
*   **User Expectations**: The user retains their place in the specimen's workflow. The Context Bar shows the same specimen throughout the workspace session.

---

#### IP-NAV-04 — Tab Navigation

*   **Purpose**: Switch between logical sub-sections within a single screen (e.g., switching between "Patient Demographics" and "Specimen Orders" within the Patient Workspace).
*   **Trigger**: Mouse click on a tab label, or keyboard `Arrow Left / Right` when focus is on the tab list.
*   **Behavior**:
    1.  Clicking a tab immediately shows its associated content panel.
    2.  The previously active tab's content is hidden (not destroyed — its data is retained in memory within the session).
    3.  If the user navigates away from a tab with an unsaved dirty form, the Unsaved Changes dialog is displayed.
    4.  The active tab receives a visual active indicator (left-border or underline accent).
*   **Restrictions**: Tab switching does not trigger a new data fetch if the tab's data was already loaded during the current session, unless the tab content is time-sensitive (e.g., incubation timers).

---

#### IP-NAV-05 — Deep Navigation (Record Drill-Down)

*   **Purpose**: Navigate from a list or summary view directly into a specific record's detail.
*   **Trigger**: Mouse click on a table row or list item, or keyboard `Enter` when a row is focused.
*   **Behavior**:
    1.  In Layout Pattern A (List + Detail), clicking a row opens the detail panel on the right without navigating away from the list.
    2.  In Layout Pattern C (Dashboard), clicking a worklist item navigates to the record's primary workspace screen.
    3.  The breadcrumb trail is updated to reflect the depth.
    4.  The Context Bar is populated with the selected record's identifiers.
*   **User Expectations**: The user can always return to the list by clicking the list panel or the breadcrumb parent.

---

#### IP-NAV-06 — Back Navigation

*   **Purpose**: Return to the previously visited screen.
*   **Trigger**: Browser back button, `Alt + Left Arrow` keyboard shortcut.
*   **Behavior**:
    1.  If the current screen has a Dirty form, the Unsaved Changes dialog (IP-DIALOG-02) is displayed before navigation proceeds.
    2.  If the form is clean, navigation proceeds immediately.
    3.  The browser's native history stack is used. The application does not intercept or replace native back behavior.
*   **Restrictions**: Back navigation must not bypass the Unsaved Changes check.

---

#### IP-NAV-07 — Home Navigation

*   **Purpose**: Return to the Dashboard (SCR-000) from anywhere in the application.
*   **Trigger**: Click on the laboratory logo in the top header, or click the "Home" item in the sidebar.
*   **Behavior**: Identical to IP-NAV-06 except the destination is always SCR-000. Unsaved Changes dialog applies.

---

#### IP-NAV-08 — Quick Navigation (Command Palette)

*   **Purpose**: Navigate to any permitted screen in the application without using the sidebar.
*   **Trigger**: `Ctrl + K` (per LIMS-DOC-13, Section 4.7).
*   **Behavior**:
    1.  The Command Palette opens as a full-screen overlay (see IP-DIALOG-06 for dialog behavior).
    2.  The user types a partial screen name; the results filter in real time.
    3.  Arrow keys move through results. `Enter` navigates to the selected screen. `Escape` closes the palette without navigating.
    4.  If the current screen has a Dirty form, the Unsaved Changes dialog is shown after palette selection and before navigation executes.

---

#### IP-NAV-09 — Global Search Navigation

*   **Purpose**: Navigate directly to a specific record by searching for it by name or identifier.
*   **Trigger**: Click on the global search bar in the header, or press `/` from any screen.
*   **Behavior**:
    1.  The search bar receives focus. The search state transitions to **Focused** (per LIMS-DOC-13A, Section 8).
    2.  Typing 2+ characters triggers the **Searching** state.
    3.  Selecting a result navigates to the record's primary screen (e.g., selecting a Specimen navigates to its current workspace screen).
    4.  Unsaved Changes dialog applies if a Dirty form is active.
*   **Restrictions**: Only records the current user has permission to access appear in results. Results are never cached across sessions.

---

### 4. Form Interaction Patterns

#### IP-FORM-01 — Create

*   **Purpose**: Enter a new record into the system.
*   **Entry**: User arrives at a blank form (all fields in default/empty state, form in **Pristine** state per LIMS-DOC-13A, Section 6). Focus is placed on the first required field automatically.
*   **Behavior**:
    1.  The user fills in fields in tab order.
    2.  Client-side validation fires `onBlur` (when the user leaves a field), not while typing.
    3.  Required fields not yet filled are not flagged as errors until the user attempts to submit.
    4.  Controlled vocabulary fields (organism species, antibiotic names, patient names) use typeahead dropdowns — freeform input is not accepted.
*   **Save**: See IP-FORM-04.
*   **Exit**: If the form is Dirty and the user navigates away, the Unsaved Changes dialog (IP-DIALOG-02) is shown.
*   **Confirmation**: No confirmation dialog is shown for creates (only for destructive actions).

---

#### IP-FORM-02 — Edit

*   **Purpose**: Modify an existing record.
*   **Entry**: User arrives at a pre-populated form (fields show current saved values, form in **Pristine** state). Focus is placed on the first editable field.
*   **Behavior**:
    1.  Editing any field transitions the form to **Dirty** state.
    2.  Read-only fields are visible but not focusable for input.
    3.  A "Last modified by [Name] on [Date]" label is visible at the bottom of the form.
    4.  Record Lock rules apply: if another user holds the lock, the form enters **Soft Lock** state (LIMS-DOC-13A, Section 11).
*   **Save**: See IP-FORM-04.
*   **Exit**: Unsaved Changes dialog applies.

---

#### IP-FORM-03 — View (Read-Only)

*   **Purpose**: Display a record's data to a user who has Read access but not Write access for the current record or role.
*   **Entry**: Form renders in **Read-Only** state (LIMS-DOC-13A, Section 6.1.9). No edit affordances are shown.
*   **Behavior**: The user may read all visible fields, copy text, and use keyboard navigation to move through fields. No editing, submission, or deletion is possible. Print and export actions may still be available based on role permissions.
*   **Exit**: Navigation away from a View form never triggers the Unsaved Changes dialog (the form cannot be Dirty).

---

#### IP-FORM-04 — Save

*   **Purpose**: Persist current form data to the system.
*   **Trigger**: Click the primary Submit button, or `Ctrl + S` keyboard shortcut.
*   **Behavior Sequence**:
    1.  **Client Validation**: All fields are validated simultaneously. If any fail, invalid fields are highlighted, the first invalid field receives focus, and submission is blocked. Form transitions to **Invalid** state.
    2.  **Saving State**: If validation passes, the Submit button enters its loading state, all form fields are disabled. Form transitions to **Saving** state.
    3.  **Server Response (Success)**: Form transitions to **Saved** state. A success toast notification appears. The form reloads with the new server state (**Pristine**). If the save advances a workflow stage (e.g., WF-006 Specimen Accept), the Context Bar and Timeline Panel update immediately.
    4.  **Server Response (Validation Failure)**: Form transitions to **Validation Failed** state. Server-side field errors are mapped to their respective fields and displayed inline. Submit button returns to enabled state.
    5.  **Server Response (Error)**: Form transitions to **Error** state. Error banner appears with plain-language message and error code in collapsible details.
*   **Exit Behavior**: After a successful save, focus returns to the first interactive element on the form (or navigates to the next logical screen if the save was a final workflow step).

---

#### IP-FORM-05 — Auto Save

*   **Purpose**: Automatically save a draft of long-form data entry screens to prevent data loss without requiring explicit user action.
*   **Applicable Screens**: AST Entry Screen (SCR-010) and other screens where data entry is expected to span more than 5 minutes.
*   **Trigger**: Automatically fires 30 seconds after the last user input, while the form is in **Dirty** state.
*   **Behavior**:
    1.  Auto-save does not perform client-side validation. It saves whatever the current field values are as a draft.
    2.  The form transitions to **Auto Saved** state (per LIMS-DOC-13A, Section 6.1.7). A subtle timestamp label updates: "Draft auto-saved at [time]."
    3.  Auto-saved drafts are clearly labeled as drafts in the worklist and in the form header. They are not treated as committed records.
    4.  The user's next explicit Save action commits the draft as a proper record (triggering full validation).
*   **Restrictions**: Auto-save is never triggered during a **Saving** state. Auto-save is suspended while a Record Lock is active.

---

#### IP-FORM-06 — Cancel

*   **Purpose**: Abandon the current form session and return to the previous screen or the list view.
*   **Trigger**: Click the "Cancel" tertiary button in the action bar, or press `Escape` if the form is a dialog.
*   **Behavior**:
    1.  If the form is **Pristine**: Navigate away immediately. No dialog shown.
    2.  If the form is **Dirty**: Display the Unsaved Changes dialog (IP-DIALOG-02). The user selects "Discard Changes" to proceed or "Cancel" to return to the form.
*   **Exit Behavior**: Returns the user to the referring list or dashboard screen. Focus is placed on the list item or table row that was previously active, if applicable.

---

#### IP-FORM-07 — Reset

*   **Purpose**: Revert all field values to their last saved server state without navigating away.
*   **Trigger**: Click a "Reset" or "Revert Changes" secondary button (where provided). This action is only available on Edit forms, not Create forms.
*   **Behavior**:
    1.  A brief inline confirmation: "Reset form? All unsaved changes will be lost." with "Confirm Reset" and "Cancel" buttons.
    2.  On confirmation: all fields revert to their last saved values. Form transitions from **Dirty** to **Pristine**.
    3.  On cancel: the dialog closes and the form remains in its Dirty state.
*   **Restrictions**: Reset is not available when the form is in **Saving**, **Locked**, or **Read-Only** state.

---

#### IP-FORM-08 — Delete

*   **Purpose**: Permanently remove a record from the system.
*   **Trigger**: Click the "Delete" destructive button (available only to roles with `DELETE` permission for the entity).
*   **Behavior**:
    1.  The Delete Confirmation dialog (IP-DIALOG-05) is displayed.
    2.  The dialog explicitly states what will be deleted and confirms it will be logged in the Audit Trail.
    3.  On confirmation: the record is deleted. The user is navigated to the parent list view. A success toast confirms deletion.
    4.  On cancel: the dialog closes. No change occurs.
*   **Restrictions**: Delete is never available for specimen records that have advanced beyond "Received" status. Validated reports cannot be deleted — they can only be Archived or Amended. Delete actions are always logged in the Audit Trail.

---

#### IP-FORM-09 — Archive

*   **Purpose**: Move a record to long-term read-only storage without permanently deleting it.
*   **Trigger**: Click the "Archive" action button (available only to roles with `ARCHIVE` permission).
*   **Behavior**: Identical flow to IP-FORM-08 (Delete) except the confirmation dialog states "Archive" instead of "Delete" and describes the retention period. The record transitions to **Archived** state and becomes read-only.

---

#### IP-FORM-10 — Duplicate

*   **Purpose**: Create a new record pre-populated with the values of an existing record, to accelerate repetitive data entry.
*   **Trigger**: Click a "Duplicate" or "Copy" secondary action button on a record detail view.
*   **Behavior**:
    1.  A new Create form (IP-FORM-01) opens pre-populated with all duplicatable field values from the source record.
    2.  System-generated fields (MRN, Specimen ID, timestamps, audit fields) are cleared and will be auto-generated on save.
    3.  The form header reads "New [Entity] — Copied from [Source ID]" to make the origin clear.
    4.  The user modifies the necessary fields and saves as normal. The duplicate is a fully independent new record.

---

#### IP-FORM-11 — Validation

Validation is the process of checking field values against defined rules. All validation in the system follows these timing rules:

| Validation Type | When Triggered | Scope |
| :--- | :--- | :--- |
| **Field-level (onBlur)** | When the user moves focus away from an input field | Single field only |
| **Form-level (onSubmit)** | When the user triggers Save (`Ctrl+S` or Submit button) | All fields simultaneously |
| **Server-level** | After client validation passes and the payload reaches the server | Domain business rules |
| **Real-time (controlled fields)** | Continuously as the user types in controlled vocabulary fields | Typeahead filtering only |

*   **Error display**: Inline, directly below the field that failed. Error text uses plain language (never "Invalid input" alone — always "Patient date of birth must be in the past").
*   **Error recovery**: Errors clear automatically when the field value is corrected and focus moves away (`onBlur`).
*   **Multiple errors**: All errors from a form-level validation fire are shown simultaneously. The first invalid field receives focus.

---

#### IP-FORM-12 — Multi-Step Forms

*   **Purpose**: Guide the user through a logically sequenced, multi-section data entry process where later sections depend on earlier ones.
*   **Applicable Screens**: Order Placement (SCR-003), AST Entry (SCR-010).
*   **Behavior**:
    1.  Steps are displayed as a numbered progress indicator at the top of the form.
    2.  The user may only advance to the next step if the current step passes validation.
    3.  The user may navigate backward to any previously completed step without losing data.
    4.  Skipping steps is not permitted.
    5.  `Ctrl + Enter` advances to the next step (equivalent to clicking "Next").
    6.  On the final step, the primary action is "Submit" (not "Next").
    7.  The Unsaved Changes dialog applies if the user navigates away mid-flow.

---

### 5. Table Interaction Patterns

#### IP-TABLE-01 — Sorting

*   **Trigger**: Mouse click on a column header, or keyboard `Enter` when a column header is focused.
*   **Behavior**: First click sorts ascending. Second click sorts descending. Third click removes the sort and returns to default order. Only one sort may be active at a time.
*   **Indicator**: An arrow icon appears in the sorted column header. Ascending = arrow up. Descending = arrow down.
*   **Persistence**: Sort preference persists for the duration of the session. On page reload, sort resets to default.

---

#### IP-TABLE-02 — Filtering

*   **Trigger**: Interacting with filter controls above or beside the table (dropdown selectors, date pickers, status checkboxes).
*   **Behavior**: Filters apply immediately on change (no "Apply" button required for simple filters). Active filters are displayed as dismissible tags below the filter bar. Multiple filters combine with AND logic.
*   **Filter Empty State**: When active filters yield zero results, the **Filtered Empty** state (LIMS-DOC-13A, Section 7) is shown with a "Clear Filters" action.
*   **Persistence**: Filter state persists for the duration of the screen session. Navigating away and returning resets filters to default.

---

#### IP-TABLE-03 — Inline Search

*   **Trigger**: Typing in the table-level search input (distinct from the global search bar).
*   **Behavior**: Results filter in real time after 2 characters are entered, debounced by 300ms. Matching text in results is visually highlighted. No results transitions to **Filtered Empty** state.

---

#### IP-TABLE-04 — Pagination

*   **Trigger**: Click "Previous" or "Next" pagination controls, or click a specific page number.
*   **Behavior**: The table content updates to the selected page. The "Showing X–Y of Z results" counter updates. Scroll position resets to the top of the table on page change.
*   **Rules**: Tables always display a result count. The user can select page size from a defined set of options (e.g., 10, 25, 50 rows per page). Pagination controls are hidden when all results fit on a single page.

---

#### IP-TABLE-05 — Infinite Scroll

*   **Applicable**: Read-heavy lists where pagination would interrupt the browsing flow (e.g., Audit Trail log, Notification History).
*   **Trigger**: The user scrolls to within 200px of the bottom of the table.
*   **Behavior**: Additional results are loaded and appended below the existing rows. A loading indicator appears at the bottom during the fetch. A "All results loaded" message appears when no further rows are available.
*   **Restriction**: Infinite scroll is not used on screens where the user needs to act on specific rows (e.g., Receipt Bench worklist). Pagination is preferred for action-oriented tables.

---

#### IP-TABLE-06 — Grouping

*   **Trigger**: User selects a "Group by" option from a table control menu.
*   **Behavior**: Rows are reorganized into labeled group sections. Each group header shows the group value and the count of rows in the group. Grouping can be combined with sorting (rows are sorted within each group).

---

#### IP-TABLE-07 — Expand / Collapse Row

*   **Trigger**: Click the expand toggle on a row (chevron icon), or keyboard `Enter` / `Space` when the toggle is focused.
*   **Behavior**: The row expands to reveal sub-content (e.g., a specimen's culture plates within an order row). The toggle icon rotates to indicate the expanded state. Clicking again collapses.
*   **Rules**: Only one expandable row level is permitted. Nested expansion beyond one level is not supported in tables (use a Drawer for deep hierarchy).

---

#### IP-TABLE-08 — Row Selection

*   **Trigger**: Mouse click anywhere on the row body (not on an action button), or keyboard `Enter` when the row is focused.
*   **Behavior**: The row enters **Row Selected** state. In Layout Pattern A, the detail panel updates. In other layouts, the selected row may reveal row-level action buttons.
*   **Keyboard**: Arrow keys navigate between rows. `Enter` selects the focused row.

---

#### IP-TABLE-09 — Multi-Row Selection

*   **Trigger**: Clicking the checkbox column on two or more rows. `Shift + Click` selects all rows between the first and last clicked rows. The header checkbox selects or deselects all currently visible rows.
*   **Behavior**: The bulk action bar appears above the table, showing the count of selected rows and the available bulk actions. Individual row-level action buttons are hidden while multi-select is active.
*   **Exit**: Clicking "Deselect All" or performing a bulk action clears the selection.

---

#### IP-TABLE-10 — Bulk Actions

*   **Trigger**: With 2+ rows selected (IP-TABLE-09), the user clicks a bulk action button in the bulk action bar.
*   **Behavior**: For non-destructive bulk actions (e.g., "Print Barcodes for 3 Selected"): the action executes immediately and a success toast confirms. For destructive bulk actions (e.g., "Archive 5 Records"): a Confirmation Dialog (IP-DIALOG-02) is shown first, listing the count of affected records.
*   **Restrictions**: Bulk actions only execute on records the user has permission to modify. If some selected rows are not actionable (e.g., already archived), the system processes only the eligible rows and informs the user of skipped records in the confirmation or result toast.

---

#### IP-TABLE-11 — Export

*   **Trigger**: Click the "Export" button above the table or in the table's action menu.
*   **Behavior**:
    1.  A brief format selection prompt appears (CSV, PDF — options vary by screen).
    2.  The export includes all rows matching the current filter and sort state (not just the current page).
    3.  A success toast appears when the export file is ready for download: "Export ready. Download will begin shortly."
    4.  Export events are logged in the Audit Trail for reportable entities (specimens, reports, audit logs).
*   **Restrictions**: Export permission is role-dependent (per LIMS-DOC-05, Section 4, Screen-Level Rendering Matrix).

---

#### IP-TABLE-12 — Print Table

*   **Trigger**: `Ctrl + P` or the "Print" action button on tables with defined print behavior.
*   **Behavior**: See Section 13 (Print States) of LIMS-DOC-13A. The print-optimized layout is applied to the current filtered/sorted table state.

---

### 6. Search Interaction Patterns

#### IP-SEARCH-01 — Instant Search (Table-Level)

*   **Purpose**: Filter the visible table rows in real time as the user types.
*   **Trigger**: Typing in the table's inline search input.
*   **Behavior**: Results update after 300ms debounce. Minimum 2 characters required before filtering activates. Matching text is highlighted in the result rows. Clearing the input restores all rows.

---

#### IP-SEARCH-02 — Global Search

*   **Purpose**: Search across all entity types in the system from the persistent header search bar.
*   **Full specification**: Defined in LIMS-DOC-13, Section 20. Behavior follows the Search States defined in LIMS-DOC-13A, Section 8.
*   **Key behaviors**: Categorized dropdown results (up to 5 per entity). Selecting a result navigates to the record. Unsaved Changes dialog applies before navigation.

---

#### IP-SEARCH-03 — Advanced Search

*   **Purpose**: Apply multiple structured criteria to find specific records.
*   **Trigger**: Click the "Advanced Search" or "Filters" toggle on a directory or list screen.
*   **Behavior**:
    1.  An Advanced Search panel expands (below the search bar or as a slide-in drawer).
    2.  Each filterable field for the entity type is exposed as a structured input (date range pickers, multi-select dropdowns, numeric range inputs).
    3.  The user configures the desired criteria and clicks "Apply Filters."
    4.  Active filters are displayed as dismissible tags below the search bar.
    5.  Removing a tag re-runs the search without that criterion.
*   **Restrictions**: A maximum of 8 active filter criteria may be applied simultaneously.

---

#### IP-SEARCH-04 — Search Suggestions

*   **Purpose**: Present likely matching records to the user before they finish typing.
*   **Trigger**: Appears automatically after 2 characters are entered in any search input.
*   **Behavior**: Suggestions are drawn from the current entity's indexed searchable fields. Suggestions update with each additional character typed. Pressing `Arrow Down` moves focus into the suggestion list without clearing the input.

---

#### IP-SEARCH-05 — Search History

*   **Purpose**: Allow the user to re-execute a previous search query.
*   **Trigger**: Appears when the global search bar enters **Focused** state with no characters typed, showing the user's last 10 queries.
*   **Behavior**: Clicking or pressing `Enter` on a history item re-executes that query. Individual history items can be dismissed with a delete icon. "Clear all history" removes all entries.

---

#### IP-SEARCH-06 — Saved Search

*   **Purpose**: Allow the user to save a configured Advanced Search as a named preset for reuse.
*   **Trigger**: Click "Save This Search" while an Advanced Search filter set is active.
*   **Behavior**: A name input prompt appears. On save, the named search appears in a "Saved Searches" list accessible from the Advanced Search panel. Applying a saved search instantly restores all filter criteria.

---

#### IP-SEARCH-07 — Command Palette Search

*   **Purpose**: Provide a single unified search entry point that covers navigation, records, and commands.
*   **Full specification**: Defined in LIMS-DOC-13, Section 4.7.
*   **Behavior**: `Ctrl + K` opens the palette. Typing filters all sections simultaneously. Results are grouped by category. `Enter` on a record result navigates; `Enter` on a command result executes the command.

---

#### IP-SEARCH-08 — Keyboard Search

*   **Purpose**: Allow users to initiate a search without reaching for the mouse.
*   **Trigger**: Pressing `/` on any screen focuses the global search bar. Pressing `Ctrl + K` opens the Command Palette.
*   **Behavior**: After pressing `/`, the cursor is placed in the global search bar and the input is ready for typing. If the user is on a screen with an inline table search, `/` focuses that inline search input instead.

---

### 7. Workflow Interaction Patterns

All workflow interactions involve specimen state transitions (as defined in LIMS-DOC-06) and must be logged in the Audit Trail. Every workflow interaction that advances a specimen status generates the corresponding Business Event (EVT-001 to EVT-014).

#### IP-WF-01 — Approve

*   **Applicable Stages**: WF-013 (Quality Review → Medical Validation, performed by Senior Microbiologist), WF-014 (Medical Validation → Report Generated, performed by Pathologist).
*   **Preconditions**: All required data for the current stage must be saved. The user must hold the required permission (`REPORT_APPROVE` for WF-014).
*   **Trigger**: Click the "Approve" or "Validate" primary action button.
*   **Behavior**:
    1.  A Confirmation Dialog (IP-DIALOG-02) appears: "Approve and advance to [Next Stage]? This will be recorded in the audit log."
    2.  For WF-014 (Medical Validation): the user must enter their credentials (username + password) as part of the confirmation step — this constitutes the cryptographic signature.
    3.  On confirmation: the specimen status advances. The corresponding Business Event fires (EVT-011 or EVT-012). The screen refreshes to reflect the new status.
    4.  A success toast confirms: "Report approved and forwarded to [next responsible role]."
*   **Audit**: Actor, action ("APPROVED"), specimen ID, timestamp, and before/after status are logged.
*   **Exit Behavior**: On approval, the current record becomes read-only at this stage. The user is returned to the worklist.

---

#### IP-WF-02 — Reject

*   **Applicable Stages**: WF-006 (Specimen Receipt, performed by Specimen Processor).
*   **Preconditions**: User holds `SPECIMEN_REJECT` permission. Specimen is in **Received** status.
*   **Trigger**: Click the "Reject" destructive action button.
*   **Behavior**:
    1.  A Critical Dialog (IP-DIALOG-04) appears with a mandatory rejection reason code selection (dropdown from approved rejection codes) and an optional free-text notes field.
    2.  On confirmation: specimen status transitions to **Rejected**. EVT-005 fires. Physician notification is triggered automatically.
    3.  The specimen record becomes read-only. A new duplicate order template may optionally be generated (EXC-002 path).
*   **Audit**: Rejection code, reason notes, actor, timestamp, and specimen ID are logged.
*   **Restrictions**: Rejection is irreversible from the UI. A new specimen order must be created for re-submission.

---

#### IP-WF-03 — Rollback

*   **Applicable Stages**: WF-014 → WF-013, WF-013 → WF-012, WF-010 → WF-009 (per LIMS-DOC-06, Section 2).
*   **Preconditions**: Rollback is only permitted for the paths explicitly defined in LIMS-DOC-06. The user must hold the permission for the target stage.
*   **Trigger**: Click the "Rollback" or "Return for Revision" secondary action button.
*   **Behavior**:
    1.  A Warning Dialog (IP-DIALOG-03) appears with a mandatory annotation field: "Please describe why this record is being returned." The annotation is a required field.
    2.  A dropdown or list shows the allowed rollback target stages (pre-filtered from LIMS-DOC-06).
    3.  On confirmation: the specimen status transitions backward. The annotation is attached to the record. The responsible user for the rollback target stage receives a notification.
*   **Audit**: Rollback target, annotation, actor, timestamp are logged.
*   **Restrictions**: Rollback from **Report Generated** or later states is forbidden. Those modifications must use the Amend Report workflow.

---

#### IP-WF-04 — Delegate

*   **Applicable to**: Pathologist and Senior Microbiologist roles delegating validation authority during leave (per LIMS-DOC-05, Section 12).
*   **Trigger**: Click "Create Delegation" in the user's profile settings.
*   **Behavior**:
    1.  A form collects: Delegate user (searchable by name), Start Date, End Date, and Allowed Permission Scopes (from a defined list).
    2.  On save: a Confirmation Dialog confirms the delegation will be audit-logged and a notification will be sent to the delegate.
    3.  The delegation is active from the Start Date at 00:00 and expires at 23:59:59 on the End Date automatically.
*   **Audit**: Delegator, delegate, scopes, start date, end date are logged at creation and expiration.

---

#### IP-WF-05 — Escalate

*   **Purpose**: Raise a specimen or quality event to a higher authority when the assigned user cannot resolve it within the current workflow stage.
*   **Trigger**: Click "Escalate" in the specimen's action menu (available when the SLA is at-risk or overdue).
*   **Behavior**:
    1.  A form collects: the reason for escalation and the target recipient (filtered to roles with authority over the current stage).
    2.  On save: a Critical Alert notification is sent to the recipient. The escalation is logged. A CAPA event may be auto-generated.

---

#### IP-WF-06 — Reassign

*   **Purpose**: Transfer ownership of an in-progress task from one user to another within the same role group.
*   **Trigger**: Click "Reassign" in the specimen's or task's action menu (available to Supervisors and Admins).
*   **Behavior**:
    1.  A user selection input appears (filtered to users in the same or higher role group who have the required permission).
    2.  On save: the assignee receives a notification. The audit trail logs the reassignment.

---

#### IP-WF-07 — Pause (Incubation Extension)

*   **Purpose**: Extend the incubation period for a culture plate when further incubation is required (WF-009 rollback path).
*   **Trigger**: Click "Extend Incubation" on the Observation Screen (SCR-009) during WF-010.
*   **Behavior**:
    1.  A form collects: Extension Duration (hours, from a defined set: 24h, 48h, 72h) and Reason.
    2.  On save: the incubation timer is reset. The plate's status returns to **Incubation**. EVT-006 fires again for the new timer. A notification is sent to the supervising technician.

---

#### IP-WF-08 — Resume

*   **Purpose**: Continue an in-progress task that was paused or placed in **Waiting** state.
*   **Trigger**: Click the task in the pending worklist on the Dashboard, or open the record and click "Resume."
*   **Behavior**: The relevant workspace screen opens at the current stage. The form is pre-populated with any previously saved draft data.

---

#### IP-WF-09 — Complete

*   **Purpose**: Mark a workflow stage as finished and advance the specimen to the next state.
*   **Trigger**: Embedded in the Save action (IP-FORM-04) at workflow-advancing screens. The Submit button label explicitly states the transition: "Save & Accept Specimen," "Save & Submit for Review," etc.
*   **Behavior**: Identical to IP-FORM-04 Save, with the additional step of advancing the specimen status state machine and firing the corresponding Business Event.

---

#### IP-WF-10 — Archive Workflow

*   **Purpose**: Formally archive a completed specimen record and report following the retention policy (WF-018).
*   **Trigger**: Available on the Storage Desk (SCR-016) for records that have been Delivered and have met their retention trigger criteria.
*   **Behavior**: See IP-FORM-09 (Archive). Additional archival-specific behavior: the physical storage location (cabinet, shelf, bin) is logged as part of the archival record.

---

### 8. Dialog Patterns

All dialogs share the following base behaviors:
*   Opening: Dialog appears with a fade + scale animation (100–150ms, per LIMS-DOC-13, Section 14).
*   Focus: On open, focus is transferred to the first interactive element inside the dialog. On close, focus returns to the triggering element.
*   Focus Trap: Keyboard focus must be trapped inside the dialog while it is open (`Tab` cycles within the dialog only).
*   `Escape` key: Closes the dialog as equivalent to clicking the "Cancel" or "Close" button, **except** for Critical Dialogs (IP-DIALOG-04) where `Escape` does not close.
*   Overlay: Clicking outside the dialog closes Information Dialogs only. Confirmation, Warning, and Critical dialogs are not closable by clicking outside.

---

#### IP-DIALOG-01 — Information Dialog

*   **Purpose**: Present non-critical information to the user that requires acknowledgement (e.g., a summary of what was just saved, a tip about a new feature).
*   **Controls**: A single "OK" or "Close" button.
*   **Closing**: User clicks "OK", presses `Enter` on the focused button, or presses `Escape`.

---

#### IP-DIALOG-02 — Confirmation Dialog

*   **Purpose**: Require the user to explicitly confirm an action before it executes (used for all workflow transitions and the Unsaved Changes pattern).
*   **Controls**: A primary action button ("Confirm [Action Name]") and a "Cancel" ghost button.
*   **Closing**: "Cancel" or `Escape` closes without action. "Confirm" executes the action.
*   **Rule**: The "Confirm" button must be labeled with the specific action name — never a generic "Yes" or "OK."

---

#### IP-DIALOG-03 — Warning Dialog

*   **Purpose**: Inform the user of a potentially significant consequence before they proceed. Used for rollbacks and actions with downstream impact.
*   **Controls**: A warning-styled primary action button and a "Cancel" ghost button. A required annotation or reason field is included.
*   **Closing**: "Cancel" or `Escape`. Clicking the primary button is only enabled after the required annotation field is completed.

---

#### IP-DIALOG-04 — Critical Dialog

*   **Purpose**: Handle the highest-risk clinical or security actions (Report Validation with digital signature, Break-Glass Emergency Override, Critical Value acknowledgement per EVT-010).
*   **Controls**: Includes credential re-entry field (for signature workflows), a mandatory reason/justification field, and an explicit "I Confirm" button. A "Cancel" button is always provided.
*   **Closing**: `Escape` does **not** close this dialog. Only clicking "Cancel" or completing the confirmation flow closes it. The overlay backdrop click is also non-dismissible.
*   **Audit**: Every interaction with a Critical Dialog (open, cancel, confirm, field entry) is logged.

---

#### IP-DIALOG-05 — Delete Confirmation

*   **Purpose**: Confirm permanent deletion of a record.
*   **Controls**: A danger-styled "Delete [Entity Name]" button and a "Cancel" ghost button. The dialog body lists exactly what will be deleted and states it cannot be undone.
*   **Closing**: "Cancel" or `Escape`. Clicking outside the dialog does not close it.

---

#### IP-DIALOG-06 — Wizard Dialog

*   **Purpose**: Guide the user through a complex multi-step operation inside a dialog (e.g., the Patient Merge workflow, bulk batch processing setup).
*   **Controls**: A step progress indicator, "Back" and "Next" navigation buttons, and "Cancel."
*   **Step validation**: Each step is validated before "Next" advances. "Back" returns without re-validating the current step.
*   **Closing**: "Cancel" at any step triggers the Unsaved Changes dialog (IP-DIALOG-02) if any data has been entered.
*   **Completion**: On the final step, "Next" is replaced by "Finish" or "Submit."

---

### 9. Drawer Patterns

A Drawer is a side panel that slides in from the right edge of the screen, layering over (not replacing) the current content. Drawers are used for supplementary information that does not require full screen navigation.

**Base Drawer Behaviors (all drawer types)**:
*   Opening: The drawer slides in from the right with a 150–200ms ease-in-out animation.
*   Closing: Pressing `Escape`, clicking the "Close" button within the drawer, or clicking the overlay backdrop closes the drawer.
*   Focus: On open, focus moves to the first interactive element inside the drawer. On close, focus returns to the triggering element.
*   Overlay: A partial-opacity overlay covers the main content behind the drawer, indicating it is inactive but still visible for context.
*   Width: Drawers occupy 35–40% of screen width on desktop and 100% on mobile (full-screen drawer).

---

#### IP-DRAWER-01 — View Drawer

*   **Purpose**: Display supplementary read-only detail about a record without leaving the current screen (e.g., viewing a patient's full history while on the Receipt Bench).
*   **Behavior**: Opens with read-only field display. No editing controls. Export and print actions may be available.

---

#### IP-DRAWER-02 — Edit Drawer

*   **Purpose**: Allow inline editing of a record without navigating to a dedicated form screen (used for quick field updates on less complex records).
*   **Behavior**: Opens with an editable form. Save, Cancel, and Reset controls are present within the drawer footer. The Unsaved Changes dialog applies if the drawer is closed with a Dirty form.
*   **Restriction**: Edit Drawers are used only for simple, non-workflow-advancing edits. Workflow transitions always use full screen forms.

---

#### IP-DRAWER-03 — Audit Drawer

*   **Purpose**: Display the audit history of a specific record inline (e.g., who last modified this specimen, what changes were made).
*   **Behavior**: Opens with a read-only chronological list of audit events for the record. Events are sorted newest-first. Each event shows: actor, action, timestamp, and changed fields (before/after).
*   **Trigger**: Click a "View History" or "Audit Trail" icon on a record detail view.

---

#### IP-DRAWER-04 — Preview Drawer

*   **Purpose**: Display a preview of a linked document or report without opening it fully (e.g., previewing a validated PDF before printing).
*   **Behavior**: Opens with an embedded document preview viewport. "Open Full View" and "Print" / "Download" actions are available in the drawer header.

---

#### Nested Drawers

Nested drawers (a second drawer opening over a first) are permitted to a maximum depth of one level (i.e., a View Drawer can open an Audit Drawer on top of it). More than two levels of nesting is prohibited. Each nested drawer has its own focus trap and its own "Close" button. Closing a nested drawer returns focus to the underlying drawer.

---

### 10. File Interaction Patterns

#### IP-FILE-01 — Upload

*   **Trigger**: Click a file upload target area or drag-and-drop a file onto the designated drop zone.
*   **Behavior**:
    1.  The drop zone is clearly labeled with accepted file types and maximum file size.
    2.  On file selection: the file name is displayed with a progress indicator. Upload begins immediately.
    3.  On success: the file is attached to the record. A thumbnail or file name badge appears in the form.
    4.  On failure: an error message specifies the reason (wrong file type, file too large, upload failed).
*   **Restrictions**: Only permitted file types and sizes are accepted. Validation occurs before upload begins.

---

#### IP-FILE-02 — Download

*   **Trigger**: Click a "Download" button on a record that has an attached file (e.g., validated report PDF).
*   **Behavior**: The file download begins immediately via the browser's native download mechanism. A success toast confirms: "Download started." The download event is logged in the Audit Trail for regulated documents.

---

#### IP-FILE-03 — Preview

*   **Trigger**: Click a "Preview" button or the file thumbnail attached to a record.
*   **Behavior**: A Preview Drawer (IP-DRAWER-04) opens with the document rendered inline. For PDF reports, the full document is paginated within the preview viewport. "Download" and "Print" actions are available in the drawer header.

---

#### IP-FILE-04 — Replace

*   **Trigger**: Click a "Replace" button on an uploaded file attachment.
*   **Behavior**: A Confirmation Dialog (IP-DIALOG-02) confirms: "Replace the current file? The previous version will be archived." On confirmation, the upload flow (IP-FILE-01) is triggered. The previous file version is retained in the version history (IP-FILE-06).

---

#### IP-FILE-05 — Delete (Attachment)

*   **Trigger**: Click the delete icon on a file attachment badge.
*   **Behavior**: A Delete Confirmation dialog (IP-DIALOG-05) is shown. On confirmation: the file is removed from the record. The deletion is logged in the Audit Trail.
*   **Restrictions**: Attached files on validated or archived records cannot be deleted.

---

#### IP-FILE-06 — Version History

*   **Trigger**: Click a "Version History" link on a file attachment or report record.
*   **Behavior**: A View Drawer (IP-DRAWER-01) opens, listing all previous versions of the file with: version number, upload timestamp, uploader name, and "Download" / "Preview" actions for each version. Only the current version is marked as active.

---

#### IP-FILE-07 — Barcode Printing

*   **Trigger**: Click "Print Barcode" on the Barcode Workspace (SCR-005), or via the Quick Action.
*   **Behavior**:
    1.  The system prepares the barcode label layout for the configured label printer stock.
    2.  A print preview is shown (barcode image, specimen ID text, patient name, date).
    3.  On confirmation: the print job is sent to the designated label printer. A success toast confirms.
    4.  The barcode print event is logged in the Audit Trail (barcode string, template type, printer ID, user ID).

---

#### IP-FILE-08 — PDF Viewing (Validated Reports)

*   **Trigger**: Click "View Report" on the Report Archive (SCR-013) or Pathologist Desk (SCR-012).
*   **Behavior**: The validated report PDF opens in a Preview Drawer (IP-DRAWER-04) or full Layout Pattern D screen, depending on the context. A "VALIDATED" or "AMENDED" watermark is overlaid on the document view. Print, Download, and (if permitted) Amend actions are available.

---

### 11. Notification Interaction Patterns

#### IP-NOTIF-01 — Toast Notification

*   **Opening**: Slides in from the lower-right corner. Appears immediately after the triggering event.
*   **Dismiss**: Information/Success toasts auto-dismiss after 5 seconds. Warning/Error toasts require the user to click the close (×) icon.
*   **Action Buttons**: A toast may include one optional "View" or "Retry" action button.
*   **Stacking**: Up to 3 toasts stack vertically. A new toast arriving when 3 are visible pushes the oldest off the stack.
*   **Keyboard**: The close button on each toast is keyboard-focusable. `Escape` closes the most recently appeared toast only.

---

#### IP-NOTIF-02 — Banner Notification

*   **Opening**: Appears as a full-width bar directly below the top header bar. Pushes page content down (does not overlay).
*   **Dismiss**: User clicks the close (×) icon in the banner.
*   **Persistence**: Persists across page navigations within the same session until dismissed, for Warning-level and above.
*   **Action Buttons**: A banner may include one "Review" deep-link action button that navigates to the relevant screen.

---

#### IP-NOTIF-03 — Critical Alert Banner

*   **Opening**: Replaces the top header bar area with a full-width, high-contrast danger banner. Receives focus immediately on appearance.
*   **Dismiss**: Only via the explicit "Acknowledge" button. For EVT-010 (Critical Value), the "Acknowledge" button is locked until the "Physician Notified" confirmation checkbox is checked.
*   **`Escape` key**: Does not dismiss the Critical Alert Banner.

---

#### IP-NOTIF-04 — Inline Notification

*   **Opening**: Appears embedded within the relevant screen section (e.g., inside a form, below a table) as a context-aware alert.
*   **Dismiss**: User clicks the dismiss icon within the inline notification, or the underlying condition resolves.
*   **Purpose**: Used for contextual, screen-specific alerts that do not require the user to leave the current screen (e.g., "Media lot EXP-2026-001 expires in 3 days. Review QC records before use.").

---

#### IP-NOTIF-05 — Notification Center

*   **Opening**: User clicks the notification bell icon in the top header. A flyout panel slides in from the top-right with `elevation.2` shadow.
*   **Content**: All unread and recent notifications, sorted newest-first. Each item shows: type icon, message text, timestamp, and a "Go to" deep-link.
*   **Dismiss individual**: Each notification has a dismiss (×) icon.
*   **Mark all as read**: A "Mark all as read" action appears at the top of the panel.
*   **Closing**: Clicking outside the panel, pressing `Escape`, or clicking the bell icon again closes the panel.
*   **Keyboard**: Arrow keys navigate between notification items. `Enter` on a notification activates its "Go to" deep-link.

---

### 12. Timeline Interaction Patterns

The Specimen Timeline Panel (defined in LIMS-DOC-13, Section 7.1) follows these interaction rules:

#### IP-TIMELINE-01 — Expand / Collapse Panel

*   **Trigger**: Click the "Timeline" toggle button in the screen header (on tablet) or the panel's collapse handle (on desktop).
*   **Behavior**: The panel slides in or out from the right side of the screen. Content reflows to accommodate the changed panel width.

---

#### IP-TIMELINE-02 — View Completed Stage Detail

*   **Trigger**: Click a **Completed** stage node in the timeline.
*   **Behavior**: The node expands inline (accordion) to show: responsible user, entry timestamp, exit timestamp, SLA performance (on time / overdue), and the Audit Event ID (e.g., EVT-004). Clicking again collapses the sub-panel.

---

#### IP-TIMELINE-03 — View Future Stage Preconditions

*   **Trigger**: Click or hover over a **Future** stage node.
*   **Behavior**: A read-only tooltip or popover appears listing the preconditions for that stage (sourced from LIMS-DOC-06, Section 6). No action can be taken from a future stage node.

---

#### IP-TIMELINE-04 — View Exception Detail

*   **Trigger**: Click an **Exception** stage node (where EXC-001 to EXC-004 was triggered).
*   **Behavior**: The node expands to show: the exception code (EXC-001 to EXC-004), the deviation description, the resolution action taken, and the user who resolved it.

---

#### IP-TIMELINE-05 — Rollback Navigation

*   **Trigger**: Click a **Completed** stage node that is an allowed rollback target (per LIMS-DOC-06, Section 2). A "Rollback to this stage" action appears in the expanded node's sub-panel.
*   **Behavior**: Clicking "Rollback to this stage" initiates the Rollback workflow interaction (IP-WF-03), which requires a Warning Dialog confirmation with mandatory annotation.
*   **Restrictions**: Only allowed rollback target stages (as defined in LIMS-DOC-06) show the rollback action. Post-validation stages never show this action.

---

#### IP-TIMELINE-06 — Jump to Current Stage Screen

*   **Trigger**: The **Current** stage node has a "Go to [Stage Screen]" button.
*   **Behavior**: Clicking navigates to the appropriate workspace screen for the current stage (e.g., if Current Stage is AST, clicking navigates to SCR-010 — AST Entry Screen).

---

### 13. Dashboard Interaction Patterns

#### IP-DASH-01 — KPI Card Drill-Down

*   **Trigger**: Click a KPI card (e.g., "Sample Rejection Rate: 1.2%").
*   **Behavior**: Navigates to the underlying data that feeds the metric. For "Sample Rejection Rate," this navigates to the Report Archive (SCR-013) filtered to rejected specimens in the current period.

---

#### IP-DASH-02 — Worklist Item

*   **Trigger**: Click a row in the Dashboard worklist.
*   **Behavior**: Navigates directly to the appropriate workspace screen for the selected specimen/task at its current stage (IP-NAV-05 Deep Navigation).

---

#### IP-DASH-03 — Quick Actions

*   **Trigger**: Click a Quick Action button on the Dashboard header row.
*   **Behavior**: See IP-FORM-01 (Create) or the specific workflow interaction pattern for the action. The target screen opens with the primary action pre-focused (e.g., "Register Patient" → SCR-001 with first name field focused).

---

#### IP-DASH-04 — Dashboard Refresh

*   **Trigger**: Click a "Refresh" icon on the Dashboard, or the dashboard auto-refreshes every 60 seconds while the user is on the page.
*   **Behavior**: KPI values, worklist counts, and notification badges update to reflect the latest server state. The auto-refresh is silent (no loading overlay). The last-refresh timestamp updates.

---

#### IP-DASH-05 — Recently Viewed Panel

*   **Trigger**: Click any item in the "Recently Viewed" panel on the Dashboard.
*   **Behavior**: Navigates to the record's primary screen. Equivalent to selecting it from search results.

---

### 14. Mobile Interaction Patterns

#### IP-MOB-01 — Touch Targets

*   All interactive elements must have a minimum touch target size of **44 × 44px** (WCAG 2.5.5).
*   Buttons, links, table rows, and toggle controls must all meet this minimum.
*   Adjacent touch targets must have a minimum gap of 8px to prevent accidental activation.

---

#### IP-MOB-02 — Swipe Actions (Table Rows)

*   **Applicable**: Receipt Bench worklist (SCR-006), Pending Worklist on Dashboard.
*   **Trigger**: Swipe left on a table row.
*   **Behavior**: Reveals a set of contextual row actions (e.g., "Accept", "Reject") as slide-out buttons behind the row. Swiping right on the same row hides the actions.
*   **Restrictions**: Only non-destructive quick actions are available via swipe. Destructive actions (Reject) via swipe still trigger their Confirmation Dialog before executing.

---

#### IP-MOB-03 — Floating Action Button (FAB)

*   **Applicable**: All screens on mobile where Quick Actions are relevant.
*   **Trigger**: Tap the FAB in the lower-right corner.
*   **Behavior**: The FAB expands into a stacked list of Quick Action items (up to 5, role-filtered). Tapping an action navigates to the target. Tapping outside the expanded list collapses it.

---

#### IP-MOB-04 — Responsive Sidebar (Drawer Navigation)

*   **Trigger**: Tap the hamburger menu icon in the top header.
*   **Behavior**: The sidebar opens as a full-height drawer overlay from the left edge. Tapping a navigation item closes the drawer and navigates. Tapping outside the drawer or pressing `Escape` closes it without navigating.

---

#### IP-MOB-05 — Mobile Search

*   **Trigger**: Tap the search icon in the mobile header.
*   **Behavior**: The search bar expands to full width, pushing other header elements off-screen. The keyboard appears automatically. All standard search behaviors (IP-SEARCH-01 through IP-SEARCH-08) apply. Pressing `Escape` or tapping "Cancel" collapses the search bar.

---

#### IP-MOB-06 — Mobile Tables (Card Format)

*   **Behavior**: On mobile breakpoints, table rows collapse to individual cards. Each card shows the 2–3 most important fields. Tapping a card navigates to the record detail (equivalent to IP-TABLE-08 Row Selection).

---

### 15. Keyboard Interaction Standards

This section defines the complete keyboard interaction map for every surface type in the application.

#### 15.1 Navigation

| Key | Action |
| :--- | :--- |
| `Tab` | Move focus forward through interactive elements (sidebar items, breadcrumb links, header controls) |
| `Shift + Tab` | Move focus backward |
| `Enter` | Activate a focused link or button |
| `/` | Focus the global search bar |
| `Ctrl + K` | Open Command Palette |
| `Alt + Left Arrow` | Navigate back (browser back) |

---

#### 15.2 Forms

| Key | Action |
| :--- | :--- |
| `Tab` | Advance to the next field |
| `Shift + Tab` | Return to the previous field |
| `Enter` (last field) | Submit the form (equivalent to clicking Submit button) |
| `Ctrl + S` | Save the current form |
| `Ctrl + Enter` | Save current section and advance to next step (multi-step forms) |
| `Escape` | Cancel the form (triggers Unsaved Changes dialog if Dirty) |
| `Space` | Toggle checkbox, radio button, or switch |
| `Arrow Up / Down` | Navigate options in a select dropdown or autocomplete list |

---

#### 15.3 Tables

| Key | Action |
| :--- | :--- |
| `Tab` | Move focus to the table, then through interactive column headers |
| `Arrow Up / Down` | Move focus between rows |
| `Enter` | Select the focused row (equivalent to clicking it) |
| `Space` | Toggle the checkbox of the focused row (multi-select) |
| `Shift + Click` | Select a range of rows (multi-select) |
| `Ctrl + A` | Select all rows on the current page |
| `Escape` | Clear all row selections |

---

#### 15.4 Dialogs

| Key | Action |
| :--- | :--- |
| `Tab` | Cycle through interactive elements within the dialog (focus trapped) |
| `Shift + Tab` | Reverse cycle within the dialog |
| `Enter` | Activate the focused button |
| `Escape` | Close the dialog (equivalent to "Cancel") — except Critical Dialogs |
| `Space` | Activate focused toggle controls within the dialog |

---

#### 15.5 Search

| Key | Action |
| :--- | :--- |
| `/` | Focus global search bar |
| `Ctrl + K` | Open Command Palette |
| `Arrow Down` | Move focus into the results list from the input |
| `Arrow Up / Down` | Navigate between results |
| `Enter` | Select the focused result |
| `Escape` | Clear the input and close the results dropdown |

---

#### 15.6 Timeline

| Key | Action |
| :--- | :--- |
| `Tab` | Move focus through timeline stage nodes |
| `Enter` / `Space` | Expand/collapse the focused stage node detail |
| `Escape` | Collapse all expanded nodes |

---

#### 15.7 Dashboard

| Key | Action |
| :--- | :--- |
| `Tab` | Move through KPI cards, Quick Actions, and worklist rows |
| `Enter` | Activate a focused KPI card (drill-down) or Quick Action |
| `Arrow Down` | Move to the next worklist row |
| `?` | Open the Keyboard Shortcuts help panel |

---

### 16. Accessibility Interaction Standards

#### 16.1 Screen Reader Users

*   Every interactive element has a descriptive accessible name that matches its visible label text (WCAG 2.5.3).
*   All dynamic content changes (workflow state advances, toast notifications, form errors) are announced via ARIA live regions (see LIMS-DOC-13A, Section 14 for ARIA level assignments per notification type).
*   Tables have proper header associations so screen readers can announce column headers when navigating cells.
*   The Command Palette is announced as a dialog with the accessible name "Command Palette."
*   Drawers are announced as complementary regions or dialogs with appropriate accessible names.

---

#### 16.2 Keyboard Users

*   Every interaction that can be performed with a mouse must be fully achievable with keyboard alone (IDP-04).
*   All custom interactive elements (typeahead dropdowns, custom date pickers, status badges with actions, the Timeline Panel) must be reachable via `Tab` and activatable via `Enter` / `Space`.
*   Focus must never be lost or dropped to the body element during state transitions.

---

#### 16.3 Focus Management

| Scenario | Focus Behavior |
| :--- | :--- |
| Dialog opens | Focus moves to the first interactive element inside the dialog |
| Dialog closes | Focus returns to the element that triggered the dialog |
| Drawer opens | Focus moves to the first interactive element inside the drawer |
| Drawer closes | Focus returns to the triggering element |
| Toast appears | Focus does NOT move to the toast (announced via live region only) |
| Critical Alert appears | Focus DOES move to the Critical Alert Banner immediately |
| Form saves successfully | Focus remains on (or returns to) the first field of the refreshed form |
| Row deleted from table | Focus moves to the next row, or to the table header if the deleted row was last |

---

#### 16.4 Reduced Motion

*   All animations respect the operating system's `prefers-reduced-motion` preference (per LIMS-DOC-13, Section 14).
*   When reduced motion is active, all animated transitions are replaced with instant opacity changes. No movement or sliding occurs.
*   The skeleton loading pulse animation is replaced with a static placeholder.

---

#### 16.5 High Contrast

*   All interactive elements must remain operable and distinguishable at Windows High Contrast mode or equivalent operating system high contrast settings.
*   Focus indicators must remain visible in high contrast mode (the 3px ring must use a color that appears in high contrast palettes).

---

#### 16.6 Error Announcements

*   Form validation errors are announced to screen readers when they appear (at `aria-live="assertive"` level).
*   The number of errors is announced first: "3 errors were found in this form."
*   Each field error is announced as the user tabs to the invalid field: "[Field Label]: [Error Message]."
*   Toast error notifications are announced at `aria-live="assertive"`.

---

### 17. Interaction Matrix

This matrix maps interaction pattern support across all application surface types.

| Interaction Category | Dashboard | Forms | Tables | Reports | Workflow Screens | Dialogs | Drawers | Wizards | Timeline | Search | Notifications |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Navigation Patterns** | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — | — | ✅ | — |
| **Form Interactions** | — | ✅ | — | — | ✅ | ✅ | ✅ | ✅ | — | — | — |
| **Table Interactions** | ✅ | — | ✅ | ✅ | ✅ | — | ✅ | — | — | — | — |
| **Search Interactions** | ✅ | ✅ | ✅ | — | ✅ | — | — | — | — | ✅ | — |
| **Workflow Interactions** | ✅ | — | — | ✅ | ✅ | ✅ | — | — | ✅ | — | ✅ |
| **Dialog Interactions** | — | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — |
| **Drawer Interactions** | — | — | ✅ | ✅ | ✅ | — | ✅ | — | — | — | — |
| **File Interactions** | — | ✅ | — | ✅ | ✅ | — | ✅ | — | — | — | — |
| **Notification Interactions** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | ✅ |
| **Timeline Interactions** | — | — | — | — | ✅ | — | — | — | ✅ | — | — |
| **Dashboard Interactions** | ✅ | — | ✅ | — | — | — | — | — | — | — | ✅ |
| **Mobile Interactions** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Keyboard Standards** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Accessibility Standards** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

*Legend: ✅ = Applicable. — = Not applicable to this surface type.*

---

### 18. Relationship with Other Documents

| Document | Relationship | How This Document Is Used |
| :--- | :--- | :--- |
| **LIMS-DOC-06: End-to-End Laboratory Workflow** | **Source** | LIMS-DOC-06 provides the workflow stage IDs (WF-001 to WF-018), business event IDs (EVT-001 to EVT-014), exception paths (EXC-001 to EXC-004), and rollback rules that define the preconditions and exit behaviors for all Workflow Interaction Patterns (Section 7 of this document). Workflow interactions must not deviate from LIMS-DOC-06's defined transition rules. |
| **LIMS-DOC-13: UI/UX Foundation** | **Peer / Parent** | LIMS-DOC-13 defines the information architecture, navigation model, screen inventory, layout patterns, and design tokens. This document operationalizes those structures by specifying the exact behavioral rules governing every user action within them. LIMS-DOC-13 defines *where* interactions happen; this document defines *how* they happen. |
| **LIMS-DOC-13A: UI State Dictionary** | **Peer** | LIMS-DOC-13A defines every UI state and their valid transitions. This document defines the user interactions that *cause* those transitions. The two documents complement each other: a state change in LIMS-DOC-13A always corresponds to an interaction pattern defined here. |
| **LIMS-DOC-14: Component Library** | **Consumer** | LIMS-DOC-14 defines the reusable building blocks of the UI. Every component in LIMS-DOC-14 must cite the interaction pattern from this document that governs its behavior. A Button component cites IP-FORM-04 (Save) or IP-WF-01 (Approve). A Table component cites IP-TABLE-01 through IP-TABLE-12. No component may define its own interaction rules. |
| **LIMS-DOC-15: Design System** | **Consumer** | LIMS-DOC-15 defines the visual values (colors, typography, spacing, animation timing). For animations and transitions defined in this document (e.g., drawer slide-in, dialog fade+scale), LIMS-DOC-15 provides the exact token values. This document defines *that* an animation occurs and its purpose; LIMS-DOC-15 defines its exact visual parameters. |

---

## Assumptions
*   All interaction patterns defined in this document apply to both mouse/pointer users and keyboard users equally, unless a pattern is explicitly marked as touch-only (mobile) or keyboard-only.
*   Interaction patterns assume a logged-in, authenticated user. Pre-authentication screens (login, password reset) follow simplified patterns and are not governed by this document.
*   Hover states are supplementary — they enhance usability for pointer users but never carry interaction affordances exclusively (per IDP-04, Keyboard First).

---

## Future Enhancements
*   Definition of a **Voice Command Interaction Pattern** for specimen receipt and observation entry (post-MVP).
*   Definition of **Gesture-Based Interactions** for dedicated laboratory tablet applications.
*   Definition of **Optimistic Interaction Patterns** for high-frequency updates (e.g., incubation timer acknowledgements).

---

## Governance Rule — Mandatory Architecture Standard

> **The following rule is a mandatory, binding architectural governance standard for the Microbiology LIMS project:**
>
> **No reusable component, page, workflow, dialog, table, form, notification, or screen may invent its own interaction behavior. Every interaction must reference an approved Interaction Pattern defined in this document (LIMS-DOC-13B).**
>
> **Any new interaction pattern requires a formal documentation update to LIMS-DOC-13B, reviewed by the Solution Architect and UX Lead, and approved before it may be referenced in LIMS-DOC-14, LIMS-DOC-15, or any implementation code.**
>
> This rule is binding on all development phases, all team members, and all future versions of the application. Violations of this rule will be treated as architecture defects and must be resolved before the affected component or screen is eligible for QA review.

---

## Review Checklist
- [x] Defines 10 Interaction Design Principles (IDP-01 to IDP-10).
- [x] Defines 9 Navigation Interaction Patterns (IP-NAV-01 to IP-NAV-09).
- [x] Defines 12 Form Interaction Patterns (IP-FORM-01 to IP-FORM-12) including create, edit, view, save, auto-save, cancel, reset, delete, archive, duplicate, validation, and multi-step.
- [x] Defines 12 Table Interaction Patterns (IP-TABLE-01 to IP-TABLE-12).
- [x] Defines 8 Search Interaction Patterns (IP-SEARCH-01 to IP-SEARCH-08).
- [x] Defines 10 Workflow Interaction Patterns (IP-WF-01 to IP-WF-10) aligned to LIMS-DOC-06 workflow stages and business events.
- [x] Defines 6 Dialog Interaction Patterns (IP-DIALOG-01 to IP-DIALOG-06) with base behaviors, focus, and keyboard rules.
- [x] Defines 4 Drawer Interaction Patterns (IP-DRAWER-01 to IP-DRAWER-04) including nested drawer rules.
- [x] Defines 8 File Interaction Patterns (IP-FILE-01 to IP-FILE-08) including barcode printing and PDF viewing.
- [x] Defines 5 Notification Interaction Patterns (IP-NOTIF-01 to IP-NOTIF-05).
- [x] Defines 6 Timeline Interaction Patterns (IP-TIMELINE-01 to IP-TIMELINE-06).
- [x] Defines 5 Dashboard Interaction Patterns (IP-DASH-01 to IP-DASH-05).
- [x] Defines 6 Mobile Interaction Patterns (IP-MOB-01 to IP-MOB-06).
- [x] Defines Keyboard Interaction Standards for 7 surface types.
- [x] Defines Accessibility Interaction Standards for 6 categories (screen readers, keyboard, focus, reduced motion, high contrast, error announcements).
- [x] Provides a complete Interaction Matrix across 14 categories × 11 surface types.
- [x] Documents relationships to LIMS-DOC-06, LIMS-DOC-13, LIMS-DOC-13A, LIMS-DOC-14, and LIMS-DOC-15.
- [x] Contains the mandatory architectural Governance Rule.
- [x] Document contains NO React, HTML, CSS, Tailwind, TypeScript, API, or implementation details.
- [x] Document does not duplicate content from LIMS-DOC-13 or LIMS-DOC-13A.
- [x] Document follows the LIMS-DOC template structure.
