# UI State Dictionary

## Document Metadata
*   **Document ID**: LIMS-DOC-13A
*   **Version**: 1.0.0
*   **Author**: Antigravity (LIMS Solution Architect)
*   **Status**: Approved
*   **Last Updated**: 2026-07-03
*   **Dependencies**:
    *   [LIMS-DOC-05: User Roles & Permissions](file:///d:/Projects/Micro_Lab/docs/05_user_roles_permissions.md)
    *   [LIMS-DOC-06: End-to-End Laboratory Workflow](file:///d:/Projects/Micro_Lab/docs/06_end_to_end_workflow.md)
    *   [LIMS-DOC-13: UI/UX Foundation](file:///d:/Projects/Micro_Lab/docs/13_ui_ux_foundation.md)
*   **Required By**:
    *   [LIMS-DOC-14: Component Library](file:///d:/Projects/Micro_Lab/docs/14_component_library.md)
    *   [LIMS-DOC-15: Design System](file:///d:/Projects/Micro_Lab/docs/15_design_system.md)
*   **Requested By**: Laboratory Director & UX Lead
*   **Reviewed By**: Solution Architect & Senior Microbiologist
*   **Approved By**: User
*   **Approval Date**: 2026-07-03

> **Scope Boundary**: This document defines UX behavior and state semantics only. It does **not** reference React, CSS, Tailwind, HTML, TypeScript, or any frontend framework or implementation pattern. All implementation details belong in LIMS-DOC-14 (Component Library) and LIMS-DOC-15 (Design System).

> **Governance Rule — MANDATORY ARCHITECTURE STANDARD**: No new screen, workflow, component, dialog, table, form, notification, or user interaction may introduce a new UI state unless it is first documented and approved in this UI State Dictionary. This rule is binding on all development, design, and QA activities for the duration of the project.

---

## Purpose

The purpose of this document is to answer **"How does every possible application state look and behave from the user's perspective?"** It establishes a complete, canonical inventory of every UI state used in the Microbiology LIMS, ensuring that every page, workflow, table, form, dialog, notification, and layout behaves consistently and predictably across the entire application.

This document is the **single source of truth for UI state**. When a developer, designer, or QA engineer encounters a state-related question, this document provides the definitive answer.

---

## Scope

This document defines:
*   Global application-level UI states
*   Permission and authorization states
*   Workflow lifecycle states
*   Specimen lifecycle states (aligned to LIMS-DOC-06)
*   Form states
*   Table states
*   Search states
*   Notification states
*   Network connectivity states
*   Record lock states
*   Timeline panel states
*   Print states
*   Accessibility state requirements
*   Valid state transition rules
*   UX consistency rules
*   State usage matrix across all screen types
*   Relationships to other approved documents

---

## Main Content

---

### 1. Terminology Conventions

The following vocabulary is used consistently throughout this document:

| Term | Definition |
| :--- | :--- |
| **State** | A discrete, named condition that a UI element, record, or screen can be in at any given moment. |
| **Transition** | A change from one state to another, triggered by a user action, system event, or time condition. |
| **Visual Behavior** | What the user sees on screen when a given state is active (layout changes, badge colors, icons, messages). |
| **User Interaction Rule** | What the user is and is not permitted to do while a given state is active. |
| **Exit Condition** | The event or action that causes the system to leave the current state. |
| **Color Category** | A reference to the design token semantic role (e.g., `color.status.danger`) as defined in LIMS-DOC-13, Section 2.1. No raw hex values are specified here. |

---

### 2. Global UI States

Global UI states apply at the level of an entire screen or major screen region (e.g., the main content area). Every screen must handle all applicable global states.

---

#### 2.1 Initial

*   **Purpose**: The screen has been mounted for the first time in the current session and no data has yet been loaded.
*   **Visual Behavior**: The structural layout frame is rendered (header, sidebar, breadcrumb, page title). The content area shows the skeleton loading pattern defined in LIMS-DOC-13, Section 10.2.
*   **User Interaction Rules**: All interactive elements within the content area are inactive. Navigation elements (sidebar, breadcrumb) remain functional.
*   **Exit Conditions**: Transitions to **Loading** when a data fetch is initiated. Transitions directly to **Error** if the initial permission check fails.

---

#### 2.2 Loading

*   **Purpose**: The screen is actively fetching data from the server. The user is waiting for content to appear.
*   **Visual Behavior**: Skeleton screens are displayed in place of all content areas. The page title and breadcrumb are visible. No action buttons are rendered. If loading persists beyond 5 seconds, a "Taking longer than expected…" message appears within the skeleton.
*   **User Interaction Rules**: Navigation elements remain functional. The user may navigate away. No data manipulation is possible.
*   **Exit Conditions**: Transitions to **Success** (data received). Transitions to **Empty** (data received but no records exist). Transitions to **Error** (request failed).

---

#### 2.3 Refreshing

*   **Purpose**: The screen already has content loaded and is re-fetching data to display the latest server state — triggered either by a user action (e.g., clicking a refresh button) or a system event (e.g., receiving EVT-004 Specimen Accepted).
*   **Visual Behavior**: Existing content remains visible and interactive during the refresh. A subtle progress indicator appears in the header bar area (not a full skeleton overlay). Individual updated rows or fields may pulse briefly with a highlight animation to indicate what changed.
*   **User Interaction Rules**: All interactions that were previously available remain available during a refresh. The user must not be interrupted.
*   **Exit Conditions**: Transitions back to **Success** when the refresh completes. Transitions to **Error** if the refresh request fails (content from the previous load remains visible with an error banner).

---

#### 2.4 Empty

*   **Purpose**: Data was successfully fetched, but the result set contains zero records matching the current context or filter.
*   **Visual Behavior**: The empty state pattern defined in LIMS-DOC-13, Section 10.1 is displayed: a contextual illustration, a headline, supporting sub-copy, and a primary action button where applicable. No table rows, list items, or cards are rendered.
*   **User Interaction Rules**: Navigation remains functional. The primary action button (if present) is active (e.g., "Register First Patient"). Filters and search fields remain operable.
*   **Exit Conditions**: Transitions to **Success** when at least one record is created or the filter is cleared.

---

#### 2.5 Success

*   **Purpose**: The screen has successfully loaded data and is displaying it in its normal, fully functional state.
*   **Visual Behavior**: All content is rendered. All action buttons permitted by the user's role are visible and enabled. Status badges, Context Bar (if applicable), and worklist counts are all current.
*   **User Interaction Rules**: All permitted interactions are available: form editing, row selection, filtering, sorting, navigation.
*   **Exit Conditions**: Transitions to **Refreshing** when a data refresh is triggered. Transitions to **Loading** when navigating away and returning. Transitions to **Empty** if all records are deleted or filtered out.

---

#### 2.6 Information

*   **Purpose**: A non-critical informational message is displayed alongside the main content, alerting the user to a condition that does not block their work (e.g., a media lot will expire in 7 days — EVT-006 precursor advisory).
*   **Visual Behavior**: An inline information banner appears at the top of the content area, using `color.status.info`. The main content remains fully visible and interactive beneath it. A dismiss button is available.
*   **User Interaction Rules**: The banner can be dismissed. All screen interactions remain available. The alert does not block any action.
*   **Exit Conditions**: Transitions to **Success** when dismissed or when the underlying condition resolves.

---

#### 2.7 Warning

*   **Purpose**: A condition requires the user's attention but does not prevent them from proceeding (e.g., SLA approaching its deadline, a QC lot nearing its expiry date).
*   **Visual Behavior**: An inline warning banner appears using `color.status.warning`. Relevant records in the worklist or table may display a warning badge. The main content remains accessible.
*   **User Interaction Rules**: All screen interactions remain available. The user may choose to address the warning or proceed. The warning persists until the underlying condition resolves.
*   **Exit Conditions**: Transitions to **Success** when the underlying condition is resolved (e.g., SLA deadline extended, new QC lot registered). Transitions to **Critical** if the warning condition escalates (e.g., SLA becomes overdue).

---

#### 2.8 Error

*   **Purpose**: An operation has failed or an unexpected system error has occurred. The user must be informed and offered a recovery path.
*   **Visual Behavior**: An inline error banner appears at the top of the content area using `color.status.danger`. The error message uses plain language (no raw error codes shown by default). A collapsible "Technical details" section shows the error code (e.g., `ERR-003`) for administrators. The triggering action's button returns to its enabled state. Previously loaded content remains visible.
*   **User Interaction Rules**: All screen interactions that were previously available remain available. The user may retry the failed operation or navigate away. Destructive actions are blocked until the error is dismissed.
*   **Exit Conditions**: Transitions to **Success** on successful retry. Transitions to **Offline** if the error is a network failure.

---

#### 2.9 Critical

*   **Purpose**: A clinically significant or security-significant condition has been detected that requires immediate attention and may restrict the user's ability to proceed (e.g., critical value flagged per EVT-010, break-glass override activated).
*   **Visual Behavior**: A full-width red alert banner appears at the very top of the screen, above the header bar, using `color.status.danger`. It persists until explicitly acknowledged by the user. A badge is shown on the notification bell. A persistent red indicator is shown in the Context Bar if a specimen record is involved.
*   **User Interaction Rules**: The critical banner must be acknowledged before the user can dismiss it. For clinical critical values (EVT-010), the user must confirm that the physician notification was completed before the banner clears. No other UI elements are blocked — work may continue in parallel.
*   **Exit Conditions**: Transitions to **Success** or **Warning** only after explicit user acknowledgement and, for critical clinical values, after the notification confirmation is logged in the Audit Trail.

---

#### 2.10 Maintenance

*   **Purpose**: The system is temporarily unavailable due to scheduled maintenance. The user is informed of the outage and its expected duration.
*   **Visual Behavior**: A full-screen maintenance page replaces the application content. It displays the laboratory logo, a maintenance message, the expected time of restoration, and a contact reference. The sidebar and navigation are hidden.
*   **User Interaction Rules**: No application interactions are available. Read-only cached content is not shown during maintenance (to prevent stale clinical data from being acted upon).
*   **Exit Conditions**: Transitions to **Initial** when the maintenance window ends and the application becomes reachable again.

---

#### 2.11 Offline

*   **Purpose**: The user's device has lost its network connection and cannot reach the application server.
*   **Visual Behavior**: A persistent banner at the top of the screen reads: "You are offline. Some features are unavailable." The banner uses `color.status.danger` background. All data-mutating actions (form submissions, status transitions) are disabled. Previously loaded read-only content may remain visible if it was cached during the current session.
*   **User Interaction Rules**: The user may read previously loaded content. No saves, submissions, or workflow transitions are permitted. Navigation between screens that require fresh data is blocked.
*   **Exit Conditions**: Transitions to **Reconnecting** when a network signal is detected. Transitions to **Success** when the server confirms availability.

---

### 3. Permission States

Permission states govern how individual screen elements, fields, and actions are rendered based on the authenticated user's role and permissions (as defined in LIMS-DOC-05).

**Governing Principle**: The UI must reflect permissions transparently. A user must never encounter a permission-denied error after being shown a control that suggests the action is available.

---

#### 3.1 Hidden

*   **When Used**: The user's role does not have `READ` access to this element, screen, or action.
*   **Visual Behavior**: The element is entirely absent from the viewport. It is not rendered, not occupying layout space, and not discoverable via keyboard navigation.
*   **Examples**: The "Validate Report" button is hidden for Laboratory Technicians. The "User Management" sidebar link is hidden for all roles except System Admin.
*   **Rule**: Hidden is the default state for all elements the user is not permitted to see. Greying out or locking is reserved for Disabled and Read-Only states respectively.

---

#### 3.2 Disabled

*   **When Used**: The element is visible because the user's role permits reading it, but it cannot be interacted with due to a contextual condition (e.g., an action is not applicable in the current workflow state, not a permanent permission restriction).
*   **Visual Behavior**: The element is rendered in a visually subdued style using `color.text.disabled`. It is not focusable by keyboard and not clickable. A tooltip explaining why it is disabled must be provided (e.g., "Cannot approve: AST results are not yet complete").
*   **Examples**: The "Approve" button on the QC Dashboard is disabled if the AST results have not been saved. The "Print Barcode" button is disabled if the printer is offline.
*   **Rule**: Disabled is used for temporary, contextual unavailability — not for permanent permission restrictions (use Hidden for those).

---

#### 3.3 Read Only

*   **When Used**: The user has `READ` access to the data but not `UPDATE` access. The field or form is displayed for informational purposes only.
*   **Visual Behavior**: Form fields are rendered without input affordances (no text cursor, no border highlight). Their values are displayed in `color.text.primary` but within a visually flat container. A "Read-only" label or lock icon may appear in the field or at the form level to make the state discoverable.
*   **Examples**: A Pathologist viewing the Gram stain entry fields on the Observation Screen. A Specimen Processor viewing the AST S/I/R computed outputs.
*   **Rule**: Read-Only fields are always included in the keyboard tab order to allow screen reader users to navigate them, but they do not accept input.

---

#### 3.4 Unauthorized

*   **When Used**: The user attempts to access a screen or resource URL for which they have no permission.
*   **Visual Behavior**: The application navigates to SCR-021 (Unauthorized). The page displays a clear message: "You don't have permission to access this page." with the user's name and role displayed for clarity. A "Go to Dashboard" button is provided.
*   **Error Code**: `ERR-004` is fired and logged in the Audit Trail.
*   **Rule**: Direct URL access to unauthorized screens must be caught and redirected to SCR-021. The application must never render partial content of a screen the user is not authorized to see.

---

#### 3.5 Forbidden

*   **When Used**: The user's session token is valid but the attempted server-side action is explicitly denied by the business rule engine (e.g., a Technician attempting to call `REPORT_APPROVE` directly via API).
*   **Visual Behavior**: The action fails. An error toast appears: "You are not permitted to perform this action." The session is logged in the Audit Trail at severity `SECURITY`. If the attempt is detected as a bypass (e.g., direct API call), the session is immediately invalidated.
*   **Error Code**: `ERR-004` is fired.
*   **Rule**: Forbidden is a server-enforced state. The UI should prevent the user from ever reaching this state by correctly applying the Hidden and Disabled states on the frontend.

---

#### 3.6 Restricted

*   **When Used**: A field or action is available to the user's role in general, but is restricted in the current record context due to a business rule (e.g., an S/I/R override field requires `AST_OVERRIDE` permission and a mandatory justification note; a delegation is active that limits scope).
*   **Visual Behavior**: The field or action is visible but marked with a lock icon and a contextual note explaining the restriction (e.g., "Override requires justification. Enter reason to unlock."). The field becomes editable only after the pre-condition (justification entry) is satisfied.
*   **Rule**: Restricted is distinct from Disabled. A Disabled element cannot be activated at all in the current context. A Restricted element can be activated after the user satisfies the stated pre-condition.

---

### 4. Workflow States

Workflow states describe the progression status of a business process unit (e.g., a specimen order, a culture plate, a report). These are distinct from specimen lifecycle states (Section 5) and apply to discrete task items in worklists and dashboards.

| State | Meaning | Color Category | Allowed User Actions | Transition Rules |
| :--- | :--- | :--- | :--- | :--- |
| **Pending** | The task has been created and is waiting for the first user action. | `color.status.pending` | View detail, assign to self, begin work. | Transitions to **In Progress** when a user opens and begins interacting with the record. |
| **Queued** | The task is awaiting an external trigger (e.g., incubation timer, scheduled batch run) before it can proceed. | `color.status.pending` | View detail only. No editing until the trigger fires. | Transitions to **Pending** when the external trigger completes (e.g., EVT-006 Incubation Started timer expires). |
| **In Progress** | A user is actively working on the task. | `color.status.warning` | Edit, save draft, submit, rollback. | Transitions to **Waiting** if a dependency is unresolved. Transitions to **Completed** on successful submission. Transitions to **Rejected** if the task fails a validation gate. |
| **Waiting** | The task is paused awaiting input or sign-off from another role (e.g., awaiting pathologist validation). | `color.status.info` | View detail, add comments. No status changes by the waiting role. | Transitions to **In Progress** when the blocking dependency (other role's action) is resolved. Transitions to **Rejected** if the blocking role rejects. |
| **Completed** | The task has been fully executed and all required outputs have been produced. | `color.status.success` | View detail, export, print. No editing. | Terminal state within the current workflow stage. The specimen lifecycle advances to the next WF stage. |
| **Rejected** | The task has been explicitly rejected by a user with the appropriate authority (e.g., Specimen Processor rejects specimen at WF-006). | `color.status.danger` | View detail and rejection reason. Create a new order (if applicable). No editing of the rejected record. | Terminal state. For specimens, transitions to Archived (locked). |
| **Cancelled** | The task was withdrawn by an authorized user before completion (e.g., an order was cancelled by the ordering physician before collection). | `color.text.secondary` | View detail and cancellation reason only. | Terminal state. Audit event logged. |
| **Archived** | The task record has been moved to long-term storage following retention policy completion (WF-018). | `color.text.secondary` | View detail (read-only) and export. No modifications. | Transitions to **Disposed** after the retention period expires. |
| **Expired** | The task has exceeded its maximum SLA deadline without completion. | `color.status.danger` | View detail. Supervisor can reassign. A CAPA log entry may be required. | Transitions to **In Progress** if the SLA is extended and the task is reassigned. |

---

### 5. Specimen States

These states represent the complete lifecycle of a specimen as it travels through the 18 workflow stages defined in LIMS-DOC-06. Every state is directly derived from the approved workflow specification and must use the terminology exactly as defined there.

| State | Workflow Stage | Description | Color Category | Icon Recommendation | Allowed Actions | Next Possible States |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Requested** | WF-003 | Specimen order created by the ordering physician or Specimen Processor. Physical collection has not yet occurred. | `color.status.pending` | Clock / Hourglass | View order detail. Print collection instructions. | Registered, Cancelled |
| **Registered** | WF-001 | Patient and order are registered in the system. Awaiting physical specimen collection. | `color.status.pending` | Clipboard | Edit patient demographics (if Processor). Generate collection request. | Collected, Rejected |
| **Collected** | WF-004 | Physical specimen has been collected from the patient. It is en route to the laboratory. | `color.status.info` | Syringe / Vial | Log collection details. Generate transport manifest. | In Transit, Rejected |
| **In Transit** | WF-004 | The specimen is in transit from the collection site to the laboratory. | `color.status.info` | Delivery truck | Log courier handoff. Confirm dispatch timestamp. | Received, Rejected |
| **Received** | WF-006 | The laboratory has physically received the specimen container at the receiving bench. Quality check in progress. | `color.status.info` | Inbox tray | Accept or Reject specimen (Processor). Log quality observations. | Accepted, Rejected |
| **Accepted** | WF-006 | The specimen has passed the quality check at the receiving bench (EVT-004). It is ready for laboratory processing. | `color.status.success` | Checkmark circle | Begin processing (Technician). Print or reprint barcode (Processor). | Processing |
| **Rejected** | WF-006 | The specimen has failed the quality check (EVT-005). It cannot be processed. Ordering physician has been notified. | `color.status.danger` | X circle | View rejection reason and code. Create new order request (Processor). Log CAPA event. | Archived (locked) |
| **Processing** | WF-007 | The specimen is being prepared for culture by a Laboratory Technician (aliquoting, labelling, centrifugation). | `color.status.warning` | Beaker / Flask | Log processing steps. Assign to media. Advance to plating. | Culture |
| **Culture** | WF-008 | The specimen has been inoculated onto agar media plates. Plates are streaked and awaiting incubation. | `color.status.warning` | Petri dish | Log media lot numbers. Confirm streaking technique. Assign to incubator. | Incubation |
| **Incubation** | WF-009 | Culture plates are inside the incubation cabinet. Incubation timer is running (EVT-006). | `color.status.warning` | Thermometer / Timer | View incubation timer and cabinet assignment. Log cabinet transfer (EXC-003). Extend incubation period (Technician). | Observation |
| **Observation** | WF-010 | The incubation period has elapsed. A Laboratory Technician is performing the plate growth read. | `color.status.warning` | Microscope | Record Gram stain reaction, colony morphology, colony count. Extend incubation (rollback to Incubation). Declare contamination. | Identification, Incubation (rollback), Quality Review (if no growth) |
| **Identification** | WF-011 | Significant growth has been detected. The organism is being identified to species level (EVT-008). | `color.status.warning` | DNA helix / Magnifying glass | Select organism species from controlled vocabulary. Assign confirmed isolate ID. Advance to AST. | AST, Quality Review |
| **AST** | WF-012 | Antibiotic Susceptibility Testing is in progress. Zone diameters or MIC values are being recorded (EVT-009). | `color.status.warning` | Grid / Chart | Enter zone diameters and MIC values. Review auto-calculated S/I/R output. Override with justification (if `AST_OVERRIDE`). | Quality Review |
| **Quality Review** | WF-013 | All laboratory results are complete. Senior Microbiologist is performing the quality review before medical validation (EVT-011). | `color.status.info` | Shield / Checkmark | Approve to advance to Medical Validation. Rollback to AST or Observation. Flag CAPA event. | Medical Validation, AST (rollback), Observation (rollback) |
| **Medical Validation** | WF-014 | Results are with the Pathologist / Lab Director for final clinical sign-off (EVT-012). | `color.status.info` | Stethoscope / Doctor | Validate (apply cryptographic signature). Rollback to Quality Review. Flag Critical Value (EVT-010). | Report Generated, Quality Review (rollback) |
| **Report Generated** | WF-015 | The validated report has been compiled as a signed PDF. The report is locked and read-only. | `color.status.success` | Document / File | View report. Print report. Amend report (`REPORT_AMEND` only). Forward to billing. | Delivered, Report Amended (amendment workflow) |
| **Delivered** | WF-017 | The validated report has been delivered to the ordering physician via the secure notification channel (EVT-013). | `color.status.success` | Send / Envelope sent | View delivery receipt. Download report. | Archived |
| **Archived** | WF-018 | The specimen record and report have been moved to long-term cold storage following the retention schedule (EVT-014). | `color.text.secondary` | Archive box | View record (read-only). Export to compliance system. | Disposed |
| **Disposed** | WF-018 | The physical specimen material and associated records have been disposed of in accordance with regulatory retention requirements. | `color.text.disabled` | Trash / Shredder | View disposal log (read-only). No further actions. | Terminal state |

---

### 6. Form States

Form states describe the condition of a data entry form from the moment it is opened until it is closed.

#### 6.1 State Definitions

| State | Meaning | Visual Rules | User Feedback | Transition Rules |
| :--- | :--- | :--- | :--- | :--- |
| **Pristine** | The form has been opened but no field has been modified. All values are at their loaded or default state. | No indicators. Standard form appearance. | None. | Transitions to **Dirty** the moment any field value is changed from its loaded state. |
| **Dirty** | At least one field has been modified from its loaded value. Unsaved changes exist. | A visible "Unsaved changes" indicator appears in the action bar (e.g., a dot or subtle label). The primary action button is active. | The Unsaved Changes dialog (LIMS-DOC-13, Section 8.7) is triggered if the user attempts to navigate away. | Transitions to **Saving** when the user submits. Transitions to **Pristine** if all changes are reverted. Transitions to **Locked** if another user takes the lock. |
| **Valid** | All field values in the form pass client-side validation rules. | No error indicators. Standard appearance. | Submit/Save button is active. | Transitions to **Saving** when submitted. |
| **Invalid** | One or more field values fail client-side validation rules. | Invalid fields are highlighted with `color.status.danger` border and an inline error message below the field. | The first invalid field receives keyboard focus. The error message describes the specific violation in plain language. | Transitions to **Valid** when all highlighted fields are corrected. Form submission is blocked. |
| **Validation Failed** | The server has rejected the submitted payload due to a domain-level business rule violation. | An inline error banner appears at the top of the form. Individual field-level errors are mapped and displayed inline. The form returns to an editable state. | The error banner displays a plain-language explanation. The submit button returns to its normal state. | Transitions to **Dirty** when the user begins correcting the fields. |
| **Saving** | The form has been submitted and the server request is in flight. | The submit button shows a loading indicator and is disabled. All form fields are disabled. An overlay shimmer may appear over the form. | No other interactions are available until the save completes. | Transitions to **Saved** on success. Transitions to **Validation Failed** on server rejection. Transitions to **Error** on server failure. |
| **Saved** | The form data has been successfully persisted to the server. | A success toast notification appears ("Record saved successfully."). The form returns to its pristine state with the newly saved values. The Dirty indicator is cleared. | Toast notification confirms the action. The audit event is logged. | Transitions to **Pristine** with the new server state loaded. For workflow-advancing saves, the Specimen State also advances. |
| **Auto Saved** | The system has automatically saved a draft of the form data without explicit user action (applicable to long-form data entry screens such as AST Entry). | A subtle "Auto-saved [timestamp]" label appears near the action bar. This is less prominent than a full success toast. | No interruption to the user's workflow. Auto-save uses a different visual style than a user-initiated save. | Transitions back to **Dirty** if the user continues editing after auto-save. The auto-saved draft is clearly labeled as a draft, not a committed record. |
| **Locked** | The form has been locked by a Record Lock (Soft or Hard) as defined in LIMS-DOC-13, Section 8.6. | All input fields are rendered in a non-editable state. A lock banner appears. See Section 11 (Record Lock States) for full details. | The lock banner explains who has the lock and when it expires (Soft Lock) or that the system holds the lock (Hard Lock). | Transitions to **Pristine** when the lock is released and the user re-opens the record for editing. |

---

### 7. Table States

Table states describe the condition of a data table or list view on any screen following Layout Pattern A (List + Detail).

| State | Trigger | Visual Behavior | User Interaction Rules |
| :--- | :--- | :--- | :--- |
| **Loading** | Initial data fetch or full table refresh in progress. | Skeleton rows (matching the expected column layout) replace table content. Table header is visible but inactive. Pagination is hidden. | Column headers are not clickable. Filters and search inputs are disabled. |
| **Empty** | Data fetch succeeded but returned zero records with no active filters applied. | Empty state illustration, headline, and sub-copy are displayed (per LIMS-DOC-13, Section 10.1). No skeleton rows. Table header is hidden. | Primary action button (if applicable) is active. Filters may be available if pre-populated data could exist. |
| **Filtered Empty** | Data fetch succeeded but returned zero records because of an active filter or search query. | A "No results" message is displayed: "No [entity type] match your current filters." A "Clear Filters" action is always provided. No empty state illustration is shown (distinguished from Empty). | "Clear Filters" button is active. Editing the filter fields is available. |
| **Grouped** | Rows are organized into labeled groups based on a field value (e.g., grouped by Status, grouped by Assigned Role). | Group header rows appear above their member rows. Each group header shows the group name and the count of members. Group headers are non-selectable. | Rows within groups are interactable normally. Groups can be collapsed or expanded (see Collapsed / Expanded states). |
| **Expanded** | A grouped table section or a row with sub-content has been expanded to show its children. | The group's child rows are visible. An expand/collapse toggle icon shows the expanded state. | Individual child rows are selectable and interactive. The toggle icon collapses the group. |
| **Collapsed** | A grouped table section or expandable row has been collapsed to hide its children. | Only the group header or parent row is visible. An expand/collapse toggle icon shows the collapsed state. A count badge on the header shows how many children are hidden. | Clicking the toggle expands the group. The collapsed row's count badge is visible. |
| **Row Selected** | A single row has been selected by the user (click or keyboard). | The selected row is highlighted with a `color.brand.primary` left border and a background tint. The Detail Panel (Pattern A) opens or updates to show the selected record. | The Detail Panel becomes active. The selected row may have row-level action buttons revealed on hover. |
| **Multi Selected** | Multiple rows have been selected via checkbox interaction. | Each selected row displays a filled checkbox. A bulk action bar appears above the table, showing the count of selected rows and available bulk actions (e.g., "Print 3 Barcodes", "Archive 5 Records"). | Bulk action buttons are active. Individual row actions are hidden while in multi-select mode. "Deselect All" is always available. |
| **Read Only** | The table is visible to the user but no rows can be edited or transitions can be triggered. Caused by permission state or record lock. | The table renders normally but edit icons, action buttons on rows, and checkboxes are absent. Rows are clickable only if a read-only detail view is available. | Sorting and filtering remain available. No data modification is possible. |

---

### 8. Search States

Search states describe the behavior of the Global Search bar (Section 4.5 / Section 20 of LIMS-DOC-13) and the Command Palette (LIMS-DOC-13, Section 4.7) at each stage of a search interaction.

| State | Trigger | Visual Behavior | User Interaction Rules |
| :--- | :--- | :--- | :--- |
| **Idle** | The search input is present but has not been activated. | The search bar is rendered in its default un-focused visual style. No dropdown is visible. | Clicking or pressing `/` focuses the input and transitions to **Focused**. |
| **Focused** | The user has clicked or tabbed into the search input. No characters have been typed yet. | The input border highlights using `color.focus.ring`. The **Recent Searches** and **Frequently Used** suggestions panel opens. | The user may type a query (transitions to **Searching**) or press `Escape` (transitions to **Idle**). |
| **Searching** | The user has typed 2 or more characters. A debounced request is in flight. | A loading indicator appears inside the dropdown while results are being fetched. Previously loaded suggestions are dimmed (not cleared) during the request. | The user may continue typing. Results update continuously as the query changes. |
| **Suggestions** | Results have been returned and are displayed in the categorized dropdown. | Up to 5 results per entity category are shown, grouped with category headers. Each result shows a two-line display (identifier + context). | Arrow keys navigate the list. `Enter` selects. `Escape` clears and returns to Focused. Clicking outside transitions to Idle. |
| **Recent Searches** | The search input is focused with no characters typed, and the user has previous search history. | The dropdown shows the user's last 10 search queries as a list under a "Recent Searches" header. Each item shows the query text and entity type icon. | Selecting a recent search re-executes that query (transitions to Searching). A "Clear history" action is available. |
| **Search History** | The user explicitly opens a full search history view (e.g., from the "View all" link in Recent Searches). | A full results screen or expanded flyout shows the complete history (up to 50 entries), with timestamps, query text, and result count. | All history entries are re-executable. Individual entries can be deleted. The full history can be cleared. |
| **No Results** | The search returned zero matches for the typed query across all entity categories. | The dropdown shows: "No results for '[query]'. Try a different term or check spelling." No suggestion rows are displayed. | The user may modify the query. `Escape` transitions to Idle. |
| **Loading More** | The user has clicked "View all [N] results" for a category, and the full results page is loading. | The full results screen enters its **Loading** state (skeleton rows). | Navigation to the full results page is in progress. |
| **Advanced Search** | The user has opened the Advanced Search panel (available in tables and directories). | A filter panel expands below the search bar or slides in as a side panel, exposing all filterable fields for the entity type. Active filters display as dismissible tags below the search bar. | Each filter field is independently editable. The "Apply Filters" button submits. "Clear All" removes all active filters. |

---

### 9. Notification States

Notification states define the severity levels, delivery rules, and lifecycle of every system notification. Notification types are defined in LIMS-DOC-13, Section 11. This section defines the state properties of each type.

| Notification Level | Priority | Color Category | Display Duration | Dismiss Rule | User Action Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Information** | Low | `color.status.info` | Auto-dismisses after 5 seconds | User may dismiss manually. Auto-dismisses if no action is taken. | None. The notification is purely informational. |
| **Success** | Low | `color.status.success` | Auto-dismisses after 5 seconds | User may dismiss manually. Auto-dismisses if no action is taken. | None. Confirms a completed action. |
| **Warning** | Medium | `color.status.warning` | Persists until dismissed | User must explicitly click the dismiss button. Does not auto-dismiss. | Optional. User may click a "Review" deep-link to inspect the warning source. |
| **Error** | High | `color.status.danger` | Persists until dismissed | User must explicitly click the dismiss button. Never auto-dismisses. | Required. User must acknowledge the error. A "Retry" action is available where applicable. |
| **Critical** | Highest | `color.status.danger` (full-width banner) | Persists until acknowledged | The user must click an explicit "Acknowledge" button. Clicking outside the banner or pressing `Escape` does NOT dismiss it. | Required. For clinical critical values (EVT-010), the user must confirm that the physician was notified before acknowledgement is accepted. |

**Stacking Rules**:
*   A maximum of 3 toast notifications (Information + Success + Warning + Error) may be visible simultaneously, stacked in the lower-right corner.
*   If a 4th notification arrives while 3 are displayed, the oldest notification is dismissed to make room.
*   Critical banner notifications do not stack — only one critical banner is displayed at a time. If a second critical event occurs while a banner is active, it is added to a critical queue and displayed after the first is acknowledged.
*   A Critical banner always appears above all toast notifications.

**Screen Reader Announcement Rules**:
*   Information and Success toasts are announced at `aria-live="polite"` (does not interrupt ongoing announcements).
*   Warning and Error toasts are announced at `aria-live="assertive"` (interrupts to announce immediately).
*   Critical banners are announced at `role="alert"` with `aria-live="assertive"`.

---

### 10. Network States

Network states define the user experience when the application's connection to the server is degraded or lost.

| State | Trigger | Visual Behavior | User Interaction Rules |
| :--- | :--- | :--- | :--- |
| **Online** | Normal connectivity confirmed. | No indicator shown. Application operates normally. | All features are available. |
| **Slow Connection** | Server response times exceed 8 seconds for data requests. | A persistent subtle amber banner appears below the header: "Your connection is slow. Some features may take longer than usual." | All features remain available. Long-running operations show extended loading states. Destructive actions warn the user that they may take additional time. |
| **Offline** | The device's network interface reports no connectivity. | As defined in Section 2.11 (Global UI State: Offline). A prominent banner blocks data-mutating actions. | Read access to previously cached session content only. No writes permitted. |
| **Reconnecting** | Network connectivity has been restored after an Offline period. | The Offline banner transitions to: "Reconnecting… Please wait." with a subtle loading indicator. | All data-mutating interactions remain blocked until server confirmation is received. |
| **Server Unavailable** | The device has network connectivity but the LIMS application server cannot be reached (e.g., server-side outage, DNS failure). | A full-page error screen is displayed: "The laboratory system is temporarily unavailable. Please try again in a few minutes." The error code `ERR-008` is displayed in a collapsible "Technical details" section. | No application interactions are available. A "Retry" button is provided. No data from the previous session is displayed to prevent acting on stale clinical information. |

---

### 11. Record Lock States

Record lock states define the user experience when a specimen record, patient record, or report is in a locked condition. Full lock behavior rules are defined in LIMS-DOC-13, Section 8.6. This section defines the state taxonomy.

| State | Trigger | Visual Behavior | User Interaction Rules |
| :--- | :--- | :--- | :--- |
| **Available** | No lock is active on the record. The current user has edit permission. | Standard editable form or detail view. No lock indicators visible. | All permitted editing and workflow actions are available. |
| **Being Edited** | The current user has the record open in an editable screen. | From the current user's perspective: standard editable state. From any other user attempting to open the same record: **Soft Lock** state is shown. | Current editor has full editing rights. Other users see the Soft Lock state. |
| **Soft Lock** | Another user has the record open in an editable screen. | A non-blocking banner below the Context Bar: "Currently being edited by [Full Name, Role] — viewing in read-only mode. Opened [N] minutes ago." A "Request Edit Access" action is available (sends a notification to the current editor). | All form fields are read-only. Read-only detail viewing is permitted. The "Request Edit Access" notification alerts the current editor that another user is waiting. |
| **Hard Lock** | The system has locked the record during a critical server-side operation (e.g., PDF generation during WF-015, pathologist signature write during WF-014). | A blocking banner: "This record is locked by the system for processing. It will become available shortly." No editing controls are visible. | All editing and workflow actions are blocked. Read-only view of the pre-lock state is shown. The lock resolves automatically when the operation completes. |
| **Read Only** | The specimen's status has reached a terminal read-only state (`Report Generated`, `Delivered`, `Archived`, `Disposed`) per the specimen lifecycle rules. | All form fields are rendered without input affordances. A "Read-Only" stamp or badge appears in the Context Bar. The Amend Report workflow is the only permitted modification path, and only for authorized roles (`REPORT_AMEND`). | No standard editing. Print and export actions are available. |
| **Recently Updated** | Another user saved the record within the last 60 seconds while the current user was also viewing it. | A non-critical banner appears: "This record was updated by [Name] [N] seconds ago." A "Refresh" action is provided to load the latest version. | The current user may refresh to see the latest data or continue viewing their cached version. If they attempt to save a stale version, a conflict resolution message is shown (see LIMS-DOC-13, Section 8.6). |

---

### 12. Timeline States

Timeline states define the visual meaning and interaction behavior of each stage node in the Specimen Timeline Panel defined in LIMS-DOC-13, Section 7.1.

| State | Meaning | Color Category | Icon Style | Interaction |
| :--- | :--- | :--- | :--- | :--- |
| **Future** | This workflow stage has not yet been reached by the specimen. | `color.border.default` (hollow circle) | Hollow, unfilled circle | Clicking a future stage node shows its Preconditions (from LIMS-DOC-06, Section 6) as a read-only tooltip. No actions are available from future nodes. |
| **Current** | This is the active stage where the specimen currently resides. | `color.brand.primary` (pulsing filled circle) | Filled circle with a subtle pulse animation | The current stage node is not clickable. Its label is displayed in bold. The SLA deadline and elapsed time are shown as sub-labels. |
| **Completed** | This stage was successfully completed. The specimen has moved forward. | `color.status.success` (filled circle + checkmark) | Filled circle with a checkmark icon; connecting line below is solid | Clicking a completed stage node expands a sub-panel showing: responsible user, entry timestamp, exit timestamp, and the audit event ID (e.g., EVT-004). |
| **Exception** | An exception path was triggered at this stage (e.g., EXC-001 Barcode Unreadable, EXC-003 Incubator Failure). The specimen eventually continued but via a deviation. | `color.status.warning` (filled circle + warning icon) | Filled circle with an exclamation icon | Clicking an exception node shows the exception code (EXC-001 to EXC-004), the deviation log, the resolution action, and the user who resolved it. |
| **Failed** | The stage was attempted but could not be completed due to a critical error (e.g., contaminated culture, lab equipment failure). | `color.status.danger` (filled circle + X icon) | Filled circle with an X icon | Clicking a failed node shows the failure reason, the error code, and the corrective action taken. The specimen may have been rolled back to a previous stage from here. |
| **Cancelled** | The workflow was deliberately terminated at this stage (e.g., order cancelled, specimen archived due to rejection at WF-006). | `color.text.secondary` (hollow circle + dash icon) | Hollow circle with a horizontal dash | Clicking a cancelled node shows who cancelled the workflow, the reason, the timestamp, and the Audit Event ID. No further stage progression is shown below this node. |

---

### 13. Print States

Print states define the user experience during the print preparation and execution process for the four printable screens identified in LIMS-DOC-13, Section 15: SCR-005 (Barcode Workspace), SCR-012 (Pathologist Desk), SCR-013 (Report Archive), and SCR-018 (Audit Trail).

| State | Trigger | Visual Behavior | User Interaction Rules |
| :--- | :--- | :--- | :--- |
| **Preparing** | The user has triggered the print action (`Ctrl + P` or the Print button). The system is preparing the print-optimized layout. | A brief loading indicator appears on the Print button. The main content area applies the `@print` layout rules (sidebar hidden, action buttons hidden, page headers and footers applied). | The user may cancel the preparation by pressing `Escape` before the print dialog opens. |
| **Preview** | For reports (SCR-012, SCR-013): a print preview modal is shown before the native print dialog is invoked. | A full-screen preview modal displays the report exactly as it will be printed, including pagination. Page count is shown. "Print" and "Cancel" buttons are available within the preview modal. | The user reviews the preview and either proceeds ("Print") or cancels ("Cancel"). For SCR-005 barcode labels, preview shows the label layout before printing. |
| **Printing** | The native browser print dialog has been opened. | The application UI behind the dialog is dimmed. The print dialog is a native OS component and is not styled by the application. | The user interacts with the native print dialog to select printer, paper size, and copies. Clicking Cancel in the native dialog transitions to **Cancelled** state. |
| **Success** | The user confirmed the print job in the native print dialog. | The print dialog closes. A success toast notification appears: "Print job sent to [Printer Name]." For validated reports (SCR-012, SCR-013), the print event is logged in the Audit Trail. | Normal screen state resumes. No further action required. |
| **Failure** | The print job was rejected by the printer or the print service (e.g., printer offline, paper jam). | An error toast notification appears: "Print job failed. Please check your printer and try again." The Audit Trail logs the failure event. | The user may retry the print action. The screen returns to its normal state. |
| **Cancelled** | The user cancelled the native print dialog without sending the job. | The print dialog closes. No notification is shown. The Audit Trail does not log a cancelled print attempt. | Normal screen state resumes immediately. |

---

### 14. Accessibility States

Every UI state defined in this document must satisfy WCAG 2.1 Level AA accessibility requirements. This section defines the accessibility expectations that apply specifically to state transitions and state-conveying elements.

#### 14.1 Screen Reader Behavior

*   Every state change that a sighted user would notice visually must be announced to screen reader users via the appropriate ARIA mechanism.
*   **Transient state changes** (loading, saving, success, error) are announced via ARIA live regions:
    *   Non-urgent updates (success, information): `aria-live="polite"`.
    *   Urgent updates (error, warning, critical): `aria-live="assertive"` or `role="alert"`.
*   **Modal state changes** (dialogs opening, drawers sliding in): Keyboard focus must be transferred to the first focusable element inside the modal. The triggering element receives focus on close.
*   **Status badges**: Every status badge must have an accessible text label. The color alone must not carry meaning. Example: A "Rejected" badge must have both the red color and the text "Rejected" — not just a red circle.

#### 14.2 Keyboard Navigation During State Transitions

| State | Keyboard Behavior |
| :--- | :--- |
| **Loading / Saving** | All interactive elements within the loading region must receive `aria-disabled="true"`. Tab order skips them. |
| **Error State (form)** | Focus automatically moves to the first invalid field after a failed submission attempt. |
| **Modal opened (Unsaved Changes / Confirmation)** | Focus is trapped within the modal. `Tab` cycles only through the modal's interactive elements. `Escape` closes the modal (equivalent to "Cancel"). |
| **Offline** | The Offline banner must receive focus when it first appears, so screen reader users are informed. |
| **Critical Alert Banner** | The banner must receive focus immediately on appearance and must be announced as `role="alert"`. Focus does not leave the banner until the user explicitly acknowledges it. |
| **Record Soft Lock** | The lock banner must be announced when it appears. Focus is not forced to the banner; it is announced politely. |

#### 14.3 Focus Management Rules

*   When a state change removes an element the user had focused (e.g., a row is deleted, a modal closes), focus must be moved to a logical adjacent element — never dropped to the body or `document.body`.
*   When a screen transitions from **Loading** to **Success**, focus is placed on the first interactive element in the content area.
*   When an error toast appears, the toast is announced but focus is NOT moved to it (to avoid interrupting the user's workflow). For Error-level and higher, the toast is announced with `aria-live="assertive"`.

#### 14.4 Color Independence

In every state defined in this document, color is supplemented by at least one of the following:
*   A visible text label (e.g., "Rejected", "Saved", "Locked").
*   An icon with an accessible label (e.g., a checkmark icon labeled "Completed").
*   A change in layout or affordance (e.g., fields are flat and non-interactive in Read-Only state).

No state may be communicated by color alone (WCAG 1.4.1).

#### 14.5 Contrast Requirements

*   All text content associated with state indicators must meet a minimum 4.5:1 contrast ratio against its background.
*   Status badge text (e.g., "Accepted", "Rejected") must meet 4.5:1 contrast when rendered against the badge's background color.
*   Focus indicators (`color.focus.ring`) must meet 3:1 contrast ratio against adjacent colors and must have a minimum 3px visible offset.

---

### 15. State Transition Rules

This section documents the valid, invalid, and conditional state transitions for the primary state categories. Transitions not listed here are not permitted without prior approval and documentation in this registry.

#### 15.1 Global UI State Transitions

```
Initial
  └─> Loading (data fetch initiated)
  └─> Error (permission check fails immediately)

Loading
  └─> Success (data received)
  └─> Empty (data received, zero records)
  └─> Error (request failed)

Success
  └─> Refreshing (refresh triggered)
  └─> Warning (warning condition detected)
  └─> Information (advisory condition detected)
  └─> Error (subsequent operation fails)

Refreshing
  └─> Success (refresh complete)
  └─> Error (refresh request failed; previous content remains)

Warning
  └─> Success (condition resolved)
  └─> Critical (condition escalates, e.g., SLA becomes overdue)

Error
  └─> Loading (user retries)
  └─> Offline (error was a network failure)

Offline
  └─> Reconnecting (network signal restored)

Reconnecting
  └─> Online / Success (server confirmed)
  └─> Offline (reconnection failed)

Critical
  └─> Success or Warning (after explicit user acknowledgement)
```

#### 15.2 Form State Transitions

```
Pristine
  └─> Dirty (any field modified)

Dirty
  └─> Pristine (all changes reverted by user)
  └─> Valid (all client-side rules pass)
  └─> Invalid (client-side validation fires and fails)
  └─> Locked (a Record Lock is applied while editing)

Valid
  └─> Saving (user submits)
  └─> Dirty (user continues modifying)

Invalid
  └─> Valid (all errors corrected)
  └─> Dirty (user modifies fields without correcting all errors)

Saving
  └─> Saved (server confirms success)
  └─> Validation Failed (server rejects payload)
  └─> Error (server failure / network timeout)

Saved
  └─> Pristine (form reloads with saved state)

Validation Failed
  └─> Dirty (user begins correcting fields)
```

#### 15.3 Specimen State Transitions

Specimen state transitions are fully governed by LIMS-DOC-06, Section 2 (Rollback & Transition Rules) and Section 6 (Workflow Preconditions & Exit Criteria). The following principles apply to all transitions:

*   **Forward transitions** require the exit criteria of the current state to be met before proceeding.
*   **Backward transitions (rollbacks)** are only permitted for the paths explicitly defined in LIMS-DOC-06, Section 2.
*   **Forbidden transitions** are enforced by both the UI (hiding the transition action) and the server (rejecting unauthorized transition requests).
*   **Terminal states** (`Rejected`, `Disposed`) have no valid forward transitions.

#### 15.4 Notification State Transitions

```
[Event fires e.g. EVT-004]
  └─> Notification created in severity category (Information / Success / Warning / Error / Critical)

[Notification created]
  └─> Displayed to user (toast, bell notification, or critical banner per priority)

[Information / Success Toast]
  └─> Auto-dismissed after 5 seconds
  └─> User-dismissed at any time

[Warning / Error Toast]
  └─> Persists until user dismisses manually
  └─> Never auto-dismissed

[Critical Banner]
  └─> Persists until explicit user acknowledgement
  └─> (For EVT-010 Critical Value) Persists until physician notification is confirmed
```

---

### 16. UX Consistency Rules

The following rules are mandatory and apply to every screen, component, dialog, form, and workflow interaction in the application. Violations of these rules constitute a UX defect and must be corrected before any screen is considered production-ready.

| Rule ID | Rule | Rationale |
| :--- | :--- | :--- |
| **UXR-001** | Never show multiple loading indicators for the same operation simultaneously. | Multiple spinners or skeletons for a single fetch create confusion about what is being loaded. |
| **UXR-002** | Never display conflicting status badges on the same record. A record can have exactly one active status badge at a time. | Conflicting badges make workflow state ambiguous, which is clinically dangerous. |
| **UXR-003** | Never allow destructive actions while the form is in a **Saving** state. | A save in flight must complete before a delete, reject, or archive action can be triggered. |
| **UXR-004** | Always provide visible user feedback after every operation. Successful saves, failed saves, and cancelled actions all require a response. | Silent operations create uncertainty and can lead to duplicate submissions. |
| **UXR-005** | Use consistent terminology across all screens. Specimen status names, role names, workflow stage names, and error messages must exactly match the approved terminology in LIMS-DOC-06 and LIMS-DOC-05. | Inconsistent vocabulary confuses staff and can cause clinical errors. |
| **UXR-006** | Never place a **Primary** button next to a **Destructive** button without a spacer or visual separator. | Proximity of destructive and primary actions leads to accidental irreversible operations. |
| **UXR-007** | A screen must never display a submit button that is visually enabled but server-side unauthorized. | If the server will reject an action, the button must be Hidden or Disabled before it is clicked. |
| **UXR-008** | Every error message must include a plain-language description of what went wrong and what the user can do next. Error codes are supplemental, never the primary message. | Clinical users are not software engineers. Error codes alone are not actionable. |
| **UXR-009** | Critical Alert Banners must never be auto-dismissed. Only explicit user acknowledgement clears them. | EVT-010 (Critical Value) acknowledgements are clinical safety events and must be intentional. |
| **UXR-010** | All state changes that modify the Specimen status must be immediately reflected in the Context Bar and the Timeline Panel without requiring a full page reload. | Stale status in the Context Bar during active work is a clinical accuracy risk. |
| **UXR-011** | A user must never be navigated away from their current screen without either their explicit action or a visible system announcement. | Unexpected redirects interrupt clinical work and can cause data loss. |
| **UXR-012** | Forms in **Locked** state must display a visible, plain-language explanation of why they are locked and when (or under what condition) the lock will release. | Invisible locks leave users confused and unable to plan their workflow. |

---

### 17. State Usage Matrix

This matrix documents which state categories apply to each type of UI surface in the application.

| State Category | Dashboard | Forms | Tables | Reports | Workflow Screens | Dialogs | Drawers | Wizards | Search | Timeline | Notifications |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Global UI States** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | — |
| **Permission States** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | — |
| **Workflow States** | ✅ | — | ✅ | ✅ | ✅ | — | — | — | ✅ | — | ✅ |
| **Specimen States** | ✅ | ✅ | ✅ | ✅ | ✅ | — | — | — | ✅ | ✅ | ✅ |
| **Form States** | — | ✅ | — | — | ✅ | ✅ | ✅ | ✅ | — | — | — |
| **Table States** | ✅ | — | ✅ | ✅ | ✅ | — | ✅ | — | — | — | — |
| **Search States** | ✅ | — | ✅ | — | ✅ | — | — | — | ✅ | — | — |
| **Notification States** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| **Network States** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| **Record Lock States** | — | ✅ | — | ✅ | ✅ | — | — | — | — | — | ✅ |
| **Timeline States** | — | — | — | — | ✅ | — | — | — | — | ✅ | — |
| **Print States** | — | — | — | ✅ | ✅ | — | — | — | — | — | ✅ |

*Legend: ✅ = Applicable, — = Not applicable to this surface type.*

---

### 18. Relationship to Other Documents

This section defines the precise relationship between the UI State Dictionary and each dependent document in the LIMS documentation suite.

| Document | Relationship | How This Document Is Used |
| :--- | :--- | :--- |
| **LIMS-DOC-06: End-to-End Laboratory Workflow** | **Source** | LIMS-DOC-06 is the authoritative source for all 19 Specimen States (Section 5 of this document). Specimen state names, workflow stage IDs (WF-001 to WF-018), business event IDs (EVT-001 to EVT-014), and exception paths (EXC-001 to EXC-004) are referenced from LIMS-DOC-06 without modification. |
| **LIMS-DOC-13: UI/UX Foundation** | **Peer / Parent** | LIMS-DOC-13 defines the design token vocabulary (`color.status.*`, `color.brand.*`, etc.), screen layout patterns, notification system types, record locking behavior, and timeline panel structure. This document (LIMS-DOC-13A) operationalizes those concepts by specifying the exact state conditions, transition rules, and accessibility requirements for each. Neither document duplicates the other. |
| **LIMS-DOC-14: Component Library** | **Consumer** | LIMS-DOC-14 uses this document as its authoritative input for the state prop specifications of every UI component. Before defining a component's state props, LIMS-DOC-14 must reference the corresponding state in this document. No component may implement a state that is not registered here. |
| **LIMS-DOC-15: Design System** | **Consumer** | LIMS-DOC-15 uses this document to determine which design token values (colors, shadows, borders) map to which semantic states. For example, the `color.status.danger` token is applied to all states categorized as danger-level in this document. LIMS-DOC-15 provides the visual values; this document provides the behavioral semantics. |

---

## Assumptions
*   All specimen state transitions are enforced on the server side as well as the client side. UI-side state enforcement is a convenience layer; the server is the authority.
*   The terminology used in this document (status names, workflow IDs, event IDs, permission constants) is locked to the approved versions of LIMS-DOC-05 and LIMS-DOC-06. Any change to those documents requires a corresponding update to this document.
*   Auto-save (Form State: Auto Saved) is applicable only to screens where data entry is expected to take more than 5 minutes in a single session (e.g., AST Entry Screen, SCR-010).

---

## Future Enhancements
*   Addition of an **Optimistic Update** state for high-frequency interactions (e.g., incubation timer acknowledgements) where the UI updates immediately before server confirmation.
*   Addition of **Delegated Edit** state: when a task delegation (per LIMS-DOC-05, Section 12) is active, the form displays a "Editing as delegate of [Name]" indicator.
*   Offline draft caching state: in a future version, dirty form data may be cached locally during **Offline** state and resubmitted automatically when **Reconnecting** completes.

---

## Governance Rule — Mandatory Architecture Standard

> **The following rule is a mandatory, binding architectural governance standard for the Microbiology LIMS project:**
>
> **No new screen, workflow, component, dialog, table, form, notification, or user interaction may introduce a new UI state unless it is first documented and approved in this UI State Dictionary (LIMS-DOC-13A).**
>
> This rule applies to all development phases, all team members, and all future versions of the application. Any proposed new state must be submitted as a change request to this document, reviewed by the Solution Architect and UX Lead, and approved before it may be referenced in LIMS-DOC-14, LIMS-DOC-15, or any implementation code.
>
> Violations of this rule will be treated as architecture defects and must be resolved before the affected screen or component is eligible for QA review.

---

## Review Checklist
- [x] Defines 11 Global UI States with purpose, visual behavior, interaction rules, and exit conditions.
- [x] Defines 6 Permission States (Hidden, Disabled, Read Only, Unauthorized, Forbidden, Restricted).
- [x] Defines 9 Workflow States with color categories, allowed actions, and transition rules.
- [x] Defines all 19 Specimen Lifecycle States aligned to LIMS-DOC-06 (WF-001 to WF-018).
- [x] Defines 9 Form States with visual rules, user feedback, and transition rules.
- [x] Defines 9 Table States.
- [x] Defines 8 Search States.
- [x] Defines 5 Notification severity levels with priority, duration, and dismiss rules.
- [x] Defines 5 Network States.
- [x] Defines 6 Record Lock States aligned to LIMS-DOC-13, Section 8.6.
- [x] Defines 6 Timeline States aligned to LIMS-DOC-13, Section 7.1.
- [x] Defines 6 Print States for the 4 printable screens.
- [x] Defines Accessibility State requirements (screen reader, keyboard, focus, color independence, WCAG 2.1 AA).
- [x] Documents all valid State Transition Rules for Global UI, Form, Specimen, and Notification states.
- [x] Establishes 12 UX Consistency Rules (UXR-001 to UXR-012).
- [x] Provides a complete State Usage Matrix across 11 surface types.
- [x] Documents the relationship to LIMS-DOC-06, LIMS-DOC-13, LIMS-DOC-14, and LIMS-DOC-15.
- [x] Contains the mandatory architectural Governance Rule.
- [x] Document contains NO React, CSS, Tailwind, HTML, TypeScript, or implementation details.
- [x] Document follows the LIMS-DOC template structure.
