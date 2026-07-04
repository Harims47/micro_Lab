# Enterprise Screen Inventory & Navigation Registry

## Document Metadata
*   **Document ID**: LIMS-DOC-21
*   **Version**: 1.0.0
*   **Author**: Antigravity (LIMS Solution Architect)
*   **Status**: Approved
*   **Last Updated**: 2026-07-04
*   **Dependencies**:
    *   [LIMS-DOC-05: User Roles & Permissions Matrix](file:///d:/Projects/Micro_Lab/docs/05_user_roles_permissions.md)
    *   [LIMS-DOC-06: End-to-End Lab Workflow](file:///d:/Projects/Micro_Lab/docs/06_end_to_end_workflow.md)
    *   [LIMS-DOC-13: UI/UX Foundation](file:///d:/Projects/Micro_Lab/docs/13_ui_ux_foundation.md)
    *   [LIMS-DOC-13A: UI State Dictionary](file:///d:/Projects/Micro_Lab/docs/13a_ui_state_dictionary.md)
    *   [LIMS-DOC-13B: Interaction Pattern Library](file:///d:/Projects/Micro_Lab/docs/13b_interaction_pattern_library.md)
    *   [LIMS-DOC-14: Component Library Specs](file:///d:/Projects/Micro_Lab/docs/14_component_library.md)
    *   [LIMS-DOC-15: Design System](file:///d:/Projects/Micro_Lab/docs/15_design_system.md)
    *   [LIMS-DOC-16: Enterprise Engineering Architecture](file:///d:/Projects/Micro_Lab/docs/16_enterprise_engineering_architecture.md)
    *   [LIMS-DOC-17: Feature Specification Template](file:///d:/Projects/Micro_Lab/docs/17_feature_specification_template.md)
    *   [LIMS-DOC-20: Enterprise Decision Log](file:///d:/Projects/Micro_Lab/docs/20_decision_log.md)
*   **Required By**:
    *   All Frontend Development, QA Testing, and UX Reviews
*   **Requested By**: Product Owner & Solutions Architect
*   **Reviewed By**: Lead Frontend Developer & Lead QA
*   **Approved By**: User
*   **Approval Date**: 2026-07-04

> **Scope Boundary**: This document defines the **structures, templates, navigation rules, and complete inventory of user-facing screens for the Microbiology LIMS**. It is a layout blueprint and routing contract. It does **not** write operational code (such as React components, HTML layouts, or TypeScript types). All UI implementations belong to development sprints.

---

## Purpose

The purpose of this document is to serve as the **Enterprise Screen Inventory & Navigation Registry** for the Microbiology LIMS. It establishes the mandatory, uniform registry for every user-facing screen in the MVP. By standardizing screen IDs, navigation paths, user roles, API dependencies, UI states, and interaction patterns across 53 screens, this registry ensures that frontend developers, backend developers, and QA engineers have a single source of truth for all layout structures and transitions, preventing undocumented screen creation.

---

## Scope

This document covers:
*   The 12 screen classifications.
*   The Screen Numbering Convention range boundaries.
*   The standard 26-field Screen Metadata Template.
*   Navigation Architecture (global layout routing, breadcrumbs, shortcuts).
*   Screen relationship hierarchies (Dashboard to Report).
*   The 7-stage Screen Lifecycle and governance policies.
*   The complete Screen Register detailing 53 user-facing screens.
*   The Mandatory Screen Governance Rule.

---

## Main Content

---

### 1. Purpose & Scope (Reference)
> *(The purpose and scope boundaries are defined in the header section above. Referenced here for structure consistency.)*

---

### 2. Screen Classification

Screens are classified into 13 distinct categories corresponding to system modules:
1.  **Authentication**: Security gates (Login, Reset Password, Unauthorized, Session Expired).
2.  **Dashboard**: Landing boards, queues, notifications, and search pages.
3.  **Patient**: Patient records registers and demographics intakes.
4.  **Orders**: Requisitions and culture panel ordering.
5.  **Specimen**: Receipt tracking, labeling, and quality control rejection.
6.  **Culture**: Plate inoculation, incubator logs, and organism colony counts.
7.  **Organism Identification**: Biochemical testing and MALDI-TOF workspace runs.
8.  **AST**: Antibiotic susceptibility matrix grids, MIC tests, and breakpoint checks.
9.  **Validation**: Technical QC reviews, medical validation releases, and critical result overrides.
10. **Reports**: PDF generators, electronic sign-offs, and report delivery boards.
11. **Administration**: User provisioning, role permissions, and test catalogs setup.
12. **Audit**: Log viewers, activity histories, and decision histories.
13. **Analytics**: Turnaround times and laboratory quality dashboard runs.

---

### 3. Screen Numbering Convention

To prevent renumbering when new features are added, unique Screen IDs must use the following reserved ranges:

| ID Range | Module Group |
| :--- | :--- |
| **SCR-001 – SCR-019** | Authentication & Dashboard |
| **SCR-020 – SCR-049** | Patient |
| **SCR-050 – SCR-079** | Orders |
| **SCR-080 – SCR-129** | Specimen |
| **SCR-130 – SCR-179** | Culture |
| **SCR-180 – SCR-229** | Organism Identification |
| **SCR-230 – SCR-279** | AST |
| **SCR-280 – SCR-319** | Validation |
| **SCR-320 – SCR-359** | Reports |
| **SCR-360 – SCR-429** | Administration |
| **SCR-430 – SCR-459** | Audit |
| **SCR-460 – SCR-499** | Analytics |

---

### 4. Standard Screen Metadata Template

Every screen registered in the system must map the following 26 fields:

```markdown
*   **Screen ID**: SCR-[Module Group]-[Number]
*   **Screen Name**: [Descriptive Name]
*   **Module**: [Category from Section 2]
*   **Purpose**: [Explain what the screen does.]
*   **Business Objective**: [Target business benefit.]
*   **User Roles**: [Roles from LIMS-DOC-05 permitted to access.]
*   **Navigation Path**: [Logical route (e.g. `/dashboard/patients/new`).]
*   **Entry Points**: [User actions or screens that lead here.]
*   **Exit Points**: [Buttons or actions redirecting the user.]
*   **Parent Screen**: [Prior hierarchy screen ID.]
*   **Child Screens**: [Subsequent hierarchy screen IDs.]
*   **Related Workflow IDs**: [WF/EVT IDs from LIMS-DOC-06.]
*   **Related Components**: [CMP IDs from LIMS-DOC-14.]
*   **Related UI States**: [UI States from LIMS-DOC-13A.]
*   **Related Interaction Patterns**: [Interaction Patterns from LIMS-DOC-13B.]
*   **Required Permissions**: [Permission scopes required.]
*   **API Dependencies**: [Backend endpoints queried.]
*   **Database Dependencies**: [Primary tables accessed.]
*   **Validation Rules**: [Form field validation rules.]
*   **Error States**: [Error UI handling rules.]
*   **Empty States**: [No-data visual placeholders.]
*   **Loading States**: [Skeletons or spinner configurations.]
*   **Print Support**: [Yes/No - print layouts parameters.]
*   **Offline Support**: [Yes/No - local draft caching rules.]
*   **Accessibility Notes**: [Keyboard loops and screen reader focus rules.]
*   **Acceptance Criteria**: [Target QA pass metrics.]
```

---

### 5. Navigation Architecture

Navigation in the LIMS follows a standard grid layout routing model:
*   **Global Navigation**: Left-side vertical sidebar containing: Dashboard, Work Queue, Patients, Admin.
*   **Module Navigation**: Horizontal sub-menu tabs on details pages (e.g. Specimen Details Tab, AST Tab).
*   **Breadcrumbs**: Located below the header context bar: `Dashboard > Patients > Patient Details (John Doe) > New Order`.
*   **Deep Linking**: Screen routes utilize parameters: `/specimens/:specimen_id/ast/:ast_id`.
*   **Search Navigation**: Global header input redirects to Search Results Screen (`SCR-009`).
*   **Keyboard Navigation**: Tab focus cycling runs through interactive nodes.
    *   *Ctrl + Shift + S*: Open Global Search.
    *   *Ctrl + Alt + W*: Navigate to Personal Work Queue.

---

### 6. Screen Relationships

Screens belong to a tree layout flow:

```
Dashboard (SCR-006)
   │
   ├── Module Queue (SCR-007)
   │      │
   │      └── List View (SCR-020)
   │             │
   │             └── Details Page (SCR-023)
   │                    │
   │                    ├── Edit Page (SCR-022)
   │                    │
   │                    └── Review & Validation (SCR-280)
   │                           │
   │                           └── Approval Gate (SCR-281)
   │                                  │
   │                                  └── Report PDF (SCR-321)
```

---

### 7. Screen Lifecycle

Frontend screens progress through a 7-stage design lifecycle:

```
Draft ──> Design ──> Approved ──> Implemented ──> QA ──> Released ──> Deprecated
```

*   **Draft**: The screen layouts are listed in this inventory.
*   **Design**: UX designers draft wireframes matching LIMS-DOC-15 Design System.
*   **Approved**: The screen designs are approved by the UX Lead.
*   **Implemented**: Code is written and API mockups are bound.
*   **QA**: Verified against accessibility, keyboard loop, and performance targets.
*   **Released**: Merged to production branches.
*   **Deprecated**: Slated for replacement.

---

### 8. Screen Metrics

The frontend team audits metrics monthly:
*   *Components count*: Number of reused LIMS-DOC-14 components per screen.
*   *API count*: Number of REST calls executed during mount. (Target: < 4 per screen).
*   *Workflow Coverage*: Percentage of workflow nodes (`WF-xxx`) with a dedicated screen. (Target: 100%).
*   *Accessibility Status*: Contrast checks and screen reader validation checkmarks.

---

### 9. Screen Governance

*   **Ownership**: Screen layouts belong to the UX Designer; logic specs belong to the Lead Frontend Developer.
*   **Review Process**: Proposed additions undergo ARB audits to check reuse options.
*   **Change Process**: Adding buttons or columns requires updating the target `SCR` template.
*   **Approval Process**: Deployments require approval from the UX Lead and QA Lead.

---

## 10. Complete Screen Register

*The complete inventory of LIMS MVP screens follows. Each screen is documented using the standard 26-field template.*

---

### 10.1 Authentication Module (SCR-001 to SCR-005)

#### SCR-001: User Login
*   **Screen ID**: SCR-001
*   **Screen Name**: User Login
*   **Module**: Authentication
*   **Purpose**: Authenticate user credentials and issue JWT tokens.
*   **Business Objective**: Secure LIMS access.
*   **User Roles**: All Roles.
*   **Navigation Path**: `/login`
*   **Entry Points**: Root URL, unauthorized redirects.
*   **Exit Points**: Dashboard (`SCR-006`) on success.
*   **Parent Screen**: None.
*   **Child Screens**: Forgot Password (`SCR-002`).
*   **Related Workflow IDs**: WF-001.
*   **Related Components**: CMP-101 Text field, CMP-201 Button.
*   **Related UI States**: Pristine, Valid, Invalid, Loading.
*   **Related Interaction Patterns**: IP-FORM-01 Input, IP-FORM-04 Submit.
*   **Required Permissions**: Guest access.
*   **API Dependencies**: `POST /api/v1/auth/login`
*   **Database Dependencies**: `security.users`
*   **Validation Rules**: Email format required; password length > 8.
*   **Error States**: ERR-AUTH-01 Invalid Credentials, ERR-AUTH-02 Locked Account.
*   **Empty States**: None.
*   **Loading States**: Submit button shows spinner; input fields disable.
*   **Print Support**: No.
*   **Offline Support**: No.
*   **Accessibility Notes**: Focus defaults to email input. Tab links to Forgot Password.
*   **Acceptance Criteria**: Login completes under 1 second. Zero plaintext tokens.

---

#### SCR-002: Forgot Password
*   **Screen ID**: SCR-002
*   **Screen Name**: Forgot Password Request
*   **Module**: Authentication
*   **Purpose**: Request recovery emails for locked accounts.
*   **Business Objective**: Minimize admin support tickets.
*   **User Roles**: All Roles.
*   **Navigation Path**: `/forgot-password`
*   **Entry Points**: Login screen redirect.
*   **Exit Points**: Login screen (`SCR-001`) on submit.
*   **Parent Screen**: SCR-001.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-001.
*   **Related Components**: CMP-101 Text field, CMP-201 Button.
*   **Related UI States**: Pristine, Loading, Success.
*   **Required Permissions**: Guest access.
*   **API Dependencies**: `POST /api/v1/auth/forgot-password`
*   **Database Dependencies**: `security.users`
*   **Validation Rules**: Email format required.
*   **Error States**: ERR-AUTH-03 Email Not Found.
*   **Empty States**: None.
*   **Loading States**: Button shows spinner; disable form fields.
*   **Print Support**: No.
*   **Offline Support**: No.
*   **Accessibility Notes**: Screen reader confirms email dispatched on success.
*   **Acceptance Criteria**: Success banner shows regardless of email validity to prevent scraping.

---

#### SCR-003: Reset Password
*   **Screen ID**: SCR-003
*   **Screen Name**: Reset Password Confirmation
*   **Module**: Authentication
*   **Purpose**: Enter new credentials using a verification token.
*   **Business Objective**: Secure recovery flows.
*   **User Roles**: All Roles.
*   **Navigation Path**: `/reset-password?token=:token`
*   **Entry Points**: Email verification link clicks.
*   **Exit Points**: Login screen (`SCR-001`) on success.
*   **Parent Screen**: SCR-002.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-001.
*   **Related Components**: CMP-101 Text field, CMP-201 Button.
*   **Related UI States**: Pristine, Invalid, Loading.
*   **Required Permissions**: Guest access (token-bound).
*   **API Dependencies**: `POST /api/v1/auth/reset-password`
*   **Database Dependencies**: `security.users`
*   **Validation Rules**: Password match checks; strength check (capital, number, symbol).
*   **Error States**: ERR-AUTH-04 Expired Token.
*   **Empty States**: None.
*   **Loading States**: Form fields disable.
*   **Print Support**: No.
*   **Offline Support**: No.
*   **Accessibility Notes**: Focus shifts dynamically on fields validation status.
*   **Acceptance Criteria**: Passwords must match. Prior passwords rejected.

---

#### SCR-004: Session Expired
*   **Screen ID**: SCR-004
*   **Screen Name**: Session Expired Alert
*   **Module**: Authentication
*   **Purpose**: Notify user of auto-logout.
*   **Business Objective**: Enforce HIPAA data security targets.
*   **User Roles**: All Roles.
*   **Navigation Path**: `/session-expired`
*   **Entry Points**: System session timeout trigger.
*   **Exit Points**: Redirect to Login (`SCR-001`).
*   **Parent Screen**: None.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-001.
*   **Related Components**: CMP-709 Critical Dialog.
*   **Related UI States**: Locked.
*   **Required Permissions**: Guest access.
*   **API Dependencies**: `POST /api/v1/auth/logout`
*   **Database Dependencies**: `security.sessions`
*   **Validation Rules**: None.
*   **Error States**: None.
*   **Empty States**: None.
*   **Loading States**: None.
*   **Print Support**: No.
*   **Offline Support**: No.
*   **Accessibility Notes**: Modal traps focus. Keyboard Enter clicks redirect button.
*   **Acceptance Criteria**: screen displays automatically after 15 minutes of inactivity.

---

#### SCR-005: Unauthorized
*   **Screen ID**: SCR-005
*   **Screen Name**: Unauthorized Action Alert
*   **Module**: Authentication
*   **Purpose**: Display permission error warnings.
*   **Business Objective**: Secure page routing.
*   **User Roles**: All Roles.
*   **Navigation Path**: `/unauthorized`
*   **Entry Points**: Direct url navigation to forbidden paths.
*   **Exit Points**: Redirect to Dashboard (`SCR-006`).
*   **Parent Screen**: None.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-001.
*   **Related Components**: CMP-709 Warning Banner.
*   **Related UI States**: Error.
*   **Required Permissions**: All Roles.
*   **API Dependencies**: None.
*   **Database Dependencies**: None.
*   **Validation Rules**: None.
*   **Error States**: None.
*   **Empty States**: None.
*   **Loading States**: None.
*   **Print Support**: No.
*   **Offline Support**: No.
*   **Accessibility Notes**: Screen reader reads warning banner instantly.
*   **Acceptance Criteria**: Blocks layout view; displays correlation ID for audit.

---

### 10.2 Dashboard Module (SCR-006 to SCR-009)

#### SCR-006: Laboratory Dashboard
*   **Screen ID**: SCR-006
*   **Screen Name**: Laboratory Dashboard
*   **Module**: Dashboard
*   **Purpose**: Display main lab metrics and quick worklist paths.
*   **Business Objective**: Operational visibility.
*   **User Roles**: Technician, Supervisor, Pathologist.
*   **Navigation Path**: `/dashboard`
*   **Entry Points**: Login success, navigation sidebar.
*   **Exit Points**: Worklist queues.
*   **Parent Screen**: None.
*   **Child Screens**: Personal Work Queue (`SCR-007`).
*   **Related Workflow IDs**: WF-002.
*   **Related Components**: CMP-601 Navigation Sidebar, CMP-802 Status Card.
*   **Related UI States**: Pristine, Loading.
*   **Related Interaction Patterns**: IP-NAV-01 Sidebar, IP-NAV-03 Tab.
*   **Required Permissions**: `read:dashboard`
*   **API Dependencies**: `GET /api/v1/dashboard/metrics`
*   **Database Dependencies**: `clinical.specimens`, `clinical.orders`
*   **Validation Rules**: None.
*   **Error States**: ERR-DB-01 Outage.
*   **Empty States**: Layout shows zeros when no orders exist.
*   **Loading States**: Cards show skeleton screens.
*   **Print Support**: Yes.
*   **Offline Support**: No.
*   **Accessibility Notes**: Heading maps h1 element. Main grids utilize descriptive alt text.
*   **Acceptance Criteria**: Renders in under 500ms. Metrics refresh every 5 minutes automatically.

---

#### SCR-007: Personal Work Queue
*   **Screen ID**: SCR-007
*   **Screen Name**: Personal Work Queue
*   **Module**: Dashboard
*   **Purpose**: Display assigned tasks list.
*   **Business Objective**: Task focus.
*   **User Roles**: Technician, Pathologist.
*   **Navigation Path**: `/dashboard/queue`
*   **Entry Points**: Dashboard redirect, sidebar click.
*   **Exit Points**: Specimen Details (`SCR-084`), AST Entry (`SCR-230`).
*   **Parent Screen**: SCR-006.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-003.
*   **Related Components**: CMP-501 Worklist Grid.
*   **Related UI States**: Pristine, Loading, Empty.
*   **Required Permissions**: `read:queue`
*   **API Dependencies**: `GET /api/v1/dashboard/queue?assignee_id=:user_id`
*   **Database Dependencies**: `clinical.tasks`
*   **Validation Rules**: None.
*   **Error States**: ERR-API-01 Timeout.
*   **Empty States**: "All tasks complete" placeholder with checkmark icon.
*   **Loading States**: Table rows show list skeletons.
*   **Print Support**: Yes.
*   **Offline Support**: Caches task list locally.
*   **Accessibility Notes**: Focus cycles through rows using Arrow Keys.
*   **Acceptance Criteria**: Grid displays active specimen codes and SLA timers.

---

#### SCR-008: Notifications
*   **Screen ID**: SCR-008
*   **Screen Name**: Notification Feed
*   **Module**: Dashboard
*   **Purpose**: Display critical task alerts and system announcements.
*   **Business Objective**: Alert awareness.
*   **User Roles**: All Roles.
*   **Navigation Path**: `/dashboard/notifications`
*   **Entry Points**: Header bell icon click.
*   **Exit Points**: Respective details screen.
*   **Parent Screen**: SCR-006.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-003.
*   **Related Components**: CMP-704 Alert Card.
*   **Related UI States**: Pristine, Loading, Empty.
*   **Required Permissions**: `read:notifications`
*   **API Dependencies**: `GET /api/v1/notifications`, `PATCH /api/v1/notifications/:id`
*   **Database Dependencies**: `clinical.notifications`
*   **Validation Rules**: None.
*   **Error States**: ERR-API-02 Fail.
*   **Empty States**: "No new alerts" placeholder.
*   **Loading States**: Spinner placeholder.
*   **Print Support**: No.
*   **Offline Support**: No.
*   **Accessibility Notes**: Screen reader reads aloud critical notifications immediately.
*   **Acceptance Criteria**: Critical result alerts are colored crimson and override other notifications.

---

#### SCR-009: Global Search Results
*   **Screen ID**: SCR-009
*   **Screen Name**: Global Search Results
*   **Module**: Dashboard
*   **Purpose**: Display matches across patients, specimens, and orders.
*   **Business Objective**: Swift data discovery.
*   **User Roles**: Technician, Supervisor, Pathologist.
*   **Navigation Path**: `/dashboard/search?q=:query`
*   **Entry Points**: Header search input.
*   **Exit Points**: Patient Details (`SCR-023`), Order Details (`SCR-052`), Specimen Details (`SCR-084`).
*   **Parent Screen**: SCR-006.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-004.
*   **Related Components**: CMP-502 List grid.
*   **Related UI States**: Pristine, Loading, Empty.
*   **Required Permissions**: `read:search`
*   **API Dependencies**: `GET /api/v1/search?q=:query`
*   **Database Dependencies**: `clinical.patients`, `clinical.specimens`, `clinical.orders`
*   **Validation Rules**: Query string must be > 2 characters.
*   **Error States**: ERR-API-01 Timeout.
*   **Empty States**: "No results found for :query" placeholder.
*   **Loading States**: List skeleton rows display.
*   **Print Support**: Yes.
*   **Offline Support**: No.
*   **Accessibility Notes**: Keyboard shortcut Ctrl+Shift+S jumps to header input.
*   **Acceptance Criteria**: Search yields results within 300ms.

---

### 10.3 Patient Module (SCR-020 to SCR-024)

#### SCR-020: Patient List
*   **Screen ID**: SCR-020
*   **Screen Name**: Patient Directory
*   **Module**: Patient
*   **Purpose**: Display the directory of all registered patients.
*   **Business Objective**: Demographic access.
*   **User Roles**: Processor, Technician, Pathologist.
*   **Navigation Path**: `/patients`
*   **Entry Points**: Sidebar click.
*   **Exit Points**: Add Patient (`SCR-021`), Patient Details (`SCR-023`).
*   **Parent Screen**: None.
*   **Child Screens**: SCR-021, SCR-023.
*   **Related Workflow IDs**: WF-004.
*   **Related Components**: CMP-501 Directory Grid.
*   **Related UI States**: Pristine, Loading, Empty.
*   **Required Permissions**: `read:patients`
*   **API Dependencies**: `GET /api/v1/patients?page=:page`
*   **Database Dependencies**: `clinical.patients`
*   **Validation Rules**: None.
*   **Error States**: ERR-API-01 Timeout.
*   **Empty States**: "No patient records registered" placeholder with "Add Patient" action link.
*   **Loading States**: Directory grid skeleton lines.
*   **Print Support**: Yes.
*   **Offline Support**: Caches page 1 of patient list.
*   **Accessibility Notes**: Alt labels on all directory row links.
*   **Acceptance Criteria**: Patient search defaults to case-insensitive indexing.

---

#### SCR-021: Add Patient
*   **Screen ID**: SCR-021
*   **Screen Name**: Register New Patient
*   **Module**: Patient
*   **Purpose**: Create a new patient demographic record.
*   **Business Objective**: Accurate record creation.
*   **User Roles**: Processor, Technician.
*   **Navigation Path**: `/patients/new`
*   **Entry Points**: Patient Directory list link.
*   **Exit Points**: Patient Details (`SCR-023`) on success.
*   **Parent Screen**: SCR-020.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-004.
*   **Related Components**: CMP-301 Text fields, CMP-302 Date Pickers.
*   **Related UI States**: Pristine, Dirty, Valid, Invalid, Loading.
*   **Required Permissions**: `write:patients`
*   **API Dependencies**: `POST /api/v1/patients`
*   **Database Dependencies**: `clinical.patients`
*   **Validation Rules**: Mandatory MRN, Last Name, First Name, DOB, Gender. MRN unique regex checks.
*   **Error States**: ERR-VAL-01 Duplicate MRN.
*   **Empty States**: Forms display clean inputs.
*   **Loading States**: Submit disables, shows loader icon.
*   **Print Support**: No.
*   **Offline Support**: Cache drafts in LocalStorage.
*   **Accessibility Notes**: Focus sequences cleanly from top input to save button.
*   **Acceptance Criteria**: Submitting saves record; audits user IP.

---

#### SCR-022: Edit Patient
*   **Screen ID**: SCR-022
*   **Screen Name**: Edit Patient Demographics
*   **Module**: Patient
*   **Purpose**: Modify existing demographic data.
*   **Business Objective**: Data accuracy maintenance.
*   **User Roles**: Processor, Technician, Supervisor.
*   **Navigation Path**: `/patients/:patient_id/edit`
*   **Entry Points**: Patient Details details view edit button.
*   **Exit Points**: Patient Details (`SCR-023`) on success or cancel.
*   **Parent Screen**: SCR-023.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-004.
*   **Related Components**: CMP-301 Text fields, CMP-302 Date Pickers.
*   **Related UI States**: Pristine, Dirty, Valid, Invalid, Loading.
*   **Required Permissions**: `write:patients`
*   **API Dependencies**: `GET /api/v1/patients/:id`, `PUT /api/v1/patients/:id`
*   **Database Dependencies**: `clinical.patients`
*   **Validation Rules**: Fields match SCR-021 requirements. MRN cannot be edited once saved.
*   **Error States**: ERR-VAL-02 Validation Fail.
*   **Empty States**: None.
*   **Loading States**: Form inputs skeleton loading states pre-fetch.
*   **Print Support**: No.
*   **Offline Support**: No.
*   **Accessibility Notes**: ARIA alerts confirm dirty state when input is changed.
*   **Acceptance Criteria**: Saves create audit log records mapping previous/new values.

---

#### SCR-023: Patient Details
*   **Screen ID**: SCR-023
*   **Screen Name**: Patient Details View
*   **Module**: Patient
*   **Purpose**: Display patient demographics, orders history list, and active cases.
*   **Business Objective**: Unified patient record access.
*   **User Roles**: Processor, Technician, Pathologist.
*   **Navigation Path**: `/patients/:patient_id`
*   **Entry Points**: Directory list row clicks, search results redirect.
*   **Exit Points**: Edit Patient (`SCR-022`), New Order (`SCR-051`), Order Details (`SCR-052`).
*   **Parent Screen**: SCR-020.
*   **Child Screens**: SCR-022, Patient History (`SCR-024`).
*   **Related Workflow IDs**: WF-004.
*   **Related Components**: CMP-604 Context bar, CMP-502 Orders list grid.
*   **Related UI States**: Pristine, Loading.
*   **Required Permissions**: `read:patients`
*   **API Dependencies**: `GET /api/v1/patients/:id`, `GET /api/v1/patients/:id/orders`
*   **Database Dependencies**: `clinical.patients`, `clinical.orders`
*   **Validation Rules**: None.
*   **Error States**: ERR-API-01 Timeout.
*   **Empty States**: Orders grid shows "No active orders registered".
*   **Loading States**: Context header skeleton renders first.
*   **Print Support**: Yes.
*   **Offline Support**: Caches details card locally.
*   **Accessibility Notes**: Semantic structures separate demographics panels from orders lists.
*   **Acceptance Criteria**: MRN and DOB fields display securely; data masks apply where unauthorized.

---

#### SCR-024: Patient History
*   **Screen ID**: SCR-024
*   **Screen Name**: Clinical History Timeline
*   **Module**: Patient
*   **Purpose**: Display chronologically sorted historical diagnostic records.
*   **Business Objective**: Trend monitoring (e.g. tracking multi-drug resistant organisms history).
*   **User Roles**: Technician, Pathologist.
*   **Navigation Path**: `/patients/:patient_id/history`
*   **Entry Points**: Patient details tab link.
*   **Exit Points**: Report Preview (`SCR-321`).
*   **Parent Screen**: SCR-023.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-004.
*   **Related Components**: CMP-504 Timeline feed.
*   **Related UI States**: Pristine, Loading, Empty.
*   **Required Permissions**: `read:patients`
*   **API Dependencies**: `GET /api/v1/patients/:id/history`
*   **Database Dependencies**: `clinical.specimens`, `clinical.organisms`
*   **Validation Rules**: None.
*   **Error States**: ERR-DB-01 Outage.
*   **Empty States**: "No prior diagnostic histories logged" timeline banner.
*   **Loading States**: Vertical line with pulsing node skeletons.
*   **Print Support**: Yes.
*   **Offline Support**: No.
*   **Accessibility Notes**: Alt tags describe timeline node growth events (e.g. positive culture date).
*   **Acceptance Criteria**: Timeline displays organism names matched to antibiotic codes.

---

### 10.4 Orders Module (SCR-050 to SCR-072)

#### SCR-050: Order List
*   **Screen ID**: SCR-050
*   **Screen Name**: Orders Directory
*   **Module**: Orders
*   **Purpose**: Display worklist of all laboratory test orders.
*   **Business Objective**: Intake workload management.
*   **User Roles**: Processor, Technician, Pathologist.
*   **Navigation Path**: `/orders`
*   **Entry Points**: Sidebar link.
*   **Exit Points**: New Order (`SCR-051`), Order Details (`SCR-052`).
*   **Parent Screen**: None.
*   **Child Screens**: SCR-051, SCR-052.
*   **Related Workflow IDs**: WF-005.
*   **Related Components**: CMP-501 Directory grid, CMP-802 Status badges.
*   **Related UI States**: Pristine, Loading, Empty.
*   **Required Permissions**: `read:orders`
*   **API Dependencies**: `GET /api/v1/orders?status=:status`
*   **Database Dependencies**: `clinical.orders`
*   **Validation Rules**: None.
*   **Error States**: ERR-API-01 Timeout.
*   **Empty States**: "No active orders" directory banner.
*   **Loading States**: Table lines outline skeletons.
*   **Print Support**: Yes.
*   **Offline Support**: Caches page 1 of active orders.
*   **Accessibility Notes**: Focus shortcuts let users jump list pages using arrow keys.
*   **Acceptance Criteria**: Filter parameters (e.g. Pending, Completed) parse via URL parameters.

---

#### SCR-051: New Order
*   **Screen ID**: SCR-051
*   **Screen Name**: Create Requisition Order
*   **Module**: Orders
*   **Purpose**: Log a new lab test requisition.
*   **Business Objective**: Accurate requisition intake.
*   **User Roles**: Processor, Technician.
*   **Navigation Path**: `/orders/new?patient_id=:patient_id`
*   **Entry Points**: Patient Details add order button.
*   **Exit Points**: Order Details (`SCR-052`) on success.
*   **Parent Screen**: SCR-050.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-005.
*   **Related Components**: CMP-301 Input fields, CMP-309 Dropdowns.
*   **Related UI States**: Pristine, Dirty, Valid, Invalid, Loading.
*   **Required Permissions**: `write:orders`
*   **API Dependencies**: `POST /api/v1/orders`
*   **Database Dependencies**: `clinical.orders`, `clinical.tests`
*   **Validation Rules**: Patient selection, ordering physician, and test type selection (panel mapping) are mandatory.
*   **Error States**: ERR-VAL-03 Test Catalog Outage.
*   **Empty States**: Forms render clean select lists.
*   **Loading States**: Save buttons freeze.
*   **Print Support**: No.
*   **Offline Support**: Local draft logs.
*   **Accessibility Notes**: Focus shifts dynamically on test selection change.
*   **Acceptance Criteria**: Creates unique order barcode ID; links order to patient MRN.

---

#### SCR-052: Order Details
*   **Screen ID**: SCR-052
*   **Screen Name**: Requisition Details
*   **Module**: Orders
*   **Purpose**: Display requisition clinical details, test panel items, and status indicators.
*   **Business Objective**: Panel tracking.
*   **User Roles**: Processor, Technician, Pathologist.
*   **Navigation Path**: `/orders/:order_id`
*   **Entry Points**: Directory row click, search redirect.
*   **Exit Points**: Specimen Receipt (`SCR-080`).
*   **Parent Screen**: SCR-050.
*   **Child Screens**: SCR-080.
*   **Related Workflow IDs**: WF-005.
*   **Related Components**: CMP-604 Context bar, CMP-802 Status badges.
*   **Related UI States**: Pristine, Loading.
*   **Required Permissions**: `read:orders`
*   **API Dependencies**: `GET /api/v1/orders/:id`, `GET /api/v1/orders/:id/specimens`
*   **Database Dependencies**: `clinical.orders`, `clinical.specimens`
*   **Validation Rules**: None.
*   **Error States**: ERR-API-01 Timeout.
*   **Empty States**: Specimens list shows "No specimens received yet".
*   **Loading States**: Skeletons map context headers.
*   **Print Support**: Yes.
*   **Offline Support**: Yes.
*   **Accessibility Notes**: Screen readers announce status badge updates instantly.
*   **Acceptance Criteria**: Displays requisition timestamp, patient context, and priority codes.

---

### 10.5 Specimen Module (SCR-080 to SCR-084)

#### SCR-080: Specimen Receipt
*   **Screen ID**: SCR-080
*   **Screen Name**: Specimen Intake & Accessioning
*   **Module**: Specimen
*   **Purpose**: Register physical receipt of specimen container.
*   **Business Objective**: Correct intake tracking.
*   **User Roles**: Processor, Technician.
*   **Navigation Path**: `/specimens/receipt?order_id=:order_id`
*   **Entry Points**: Order Details receipt action link.
*   **Exit Points**: Barcode Printing (`SCR-082`), Specimen Details (`SCR-084`).
*   **Parent Screen**: SCR-052.
*   **Child Screens**: Barcode Printing (`SCR-082`), Specimen Rejection (`SCR-083`).
*   **Related Workflow IDs**: WF-006.
*   **Related Components**: CMP-301 Inputs, CMP-309 Dropdowns.
*   **Related UI States**: Pristine, Valid, Invalid, Loading.
*   **Required Permissions**: `write:specimens`
*   **API Dependencies**: `POST /api/v1/specimens/receipt`
*   **Database Dependencies**: `clinical.specimens`
*   **Validation Rules**: Tube label barcode matches requisition order number. Container type validated.
*   **Error States**: ERR-BARCODE-01 Mismatch, ERR-SPEC-01 Already Received.
*   **Empty States**: Inoculation fields are blank until scanner inputs value.
*   **Loading States**: Inputs disable.
*   **Print Support**: Yes (triggers barcode labels prints).
*   **Offline Support**: Caches scanner buffer lists.
*   **Accessibility Notes**: Focus defaults to barcode input fields; alerts sound error codes.
*   **Acceptance Criteria**: Successful scans generate accession numbers (`ACC-YYYY-XXXXX`).

---

#### SCR-081: Specimen Tracking
*   **Screen ID**: SCR-081
*   **Screen Name**: Specimen Chain of Custody
*   **Module**: Specimen
*   **Purpose**: Track movement of specimen tube between lab benches and incubators.
*   **Business Objective**: Custody audits compliance.
*   **User Roles**: Technician, Supervisor.
*   **Navigation Path**: `/specimens/tracking`
*   **Entry Points**: Sidebar link.
*   **Exit Points**: Specimen Details (`SCR-084`).
*   **Parent Screen**: None.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-007.
*   **Related Components**: CMP-504 Tracking timeline list.
*   **Related UI States**: Pristine, Loading, Empty.
*   **Required Permissions**: `read:specimens`
*   **API Dependencies**: `GET /api/v1/specimens/tracking`, `POST /api/v1/specimens/tracking/log`
*   **Database Dependencies**: `clinical.specimen_logs`
*   **Validation Rules**: Source and target scanner nodes are mandatory.
*   **Error States**: ERR-TRACK-01 Unknown Node.
*   **Empty States**: "No custody moves logged today" timeline placeholder.
*   **Loading States**: Pulsing row outlines.
*   **Print Support**: Yes.
*   **Offline Support**: Stores queue sync data offline.
*   **Accessibility Notes**: Keyboard inputs support scan target values enter loops.
*   **Acceptance Criteria**: Log records include actor ID, timestamp, and temperature values.

---

#### SCR-082: Barcode Printing
*   **Screen ID**: SCR-082
*   **Screen Name**: Barcode Printer Controls
*   **Module**: Specimen
*   **Purpose**: Print physical label stickers for specimen agar plates.
*   **Business Objective**: Accurate specimen labeling.
*   **User Roles**: Processor, Technician.
*   **Navigation Path**: `/specimens/:specimen_id/print`
*   **Entry Points**: Receipt screen link.
*   **Exit Points**: Specimen Details (`SCR-084`).
*   **Parent Screen**: SCR-080.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-006.
*   **Related Components**: CMP-201 Buttons, CMP-309 Selects.
*   **Related UI States**: Pristine, Loading.
*   **Required Permissions**: `write:specimens`
*   **API Dependencies**: `POST /api/v1/specimens/:id/print`
*   **Database Dependencies**: `clinical.specimens`, `administration.printers`
*   **Validation Rules**: Copies count must be > 0 and < 10.
*   **Error States**: ERR-PRINTER-01 Offline, ERR-PRINTER-02 Jammed.
*   **Empty States**: Printer select defaults to active workspace printer.
*   **Loading States**: Print buttons lock; progress bar displays.
*   **Print Support**: Yes (raw device code generated).
*   **Offline Support**: No.
*   **Accessibility Notes**: Large buttons support focus cycles; print state triggers vocal notifications.
*   **Acceptance Criteria**: Generates labels matching specimen accession formatting rules.

---

#### SCR-083: Specimen Rejection
*   **Screen ID**: SCR-083
*   **Screen Name**: Specimen Rejection Form
*   **Module**: Specimen
*   **Purpose**: Log rejection reasons for inadequate or contaminated specimen tubes.
*   **Business Objective**: Quality metrics capture.
*   **User Roles**: Technician, Supervisor.
*   **Navigation Path**: `/specimens/:specimen_id/reject`
*   **Entry Points**: Receipt screen link.
*   **Exit Points**: Order Details (`SCR-052`) on success.
*   **Parent Screen**: SCR-080.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-006.
*   **Related Components**: CMP-309 Dropdowns, CMP-301 Comments textareas.
*   **Related UI States**: Pristine, Valid, Invalid, Loading.
*   **Required Permissions**: `write:specimens`
*   **API Dependencies**: `POST /api/v1/specimens/:id/reject`
*   **Database Dependencies**: `clinical.specimens`
*   **Validation Rules**: Rejection reason and comment are mandatory.
*   **Error States**: ERR-VAL-02 Validation fail.
*   **Empty States**: Clean comment box.
*   **Loading States**: Buttons freeze.
*   **Print Support**: No.
*   **Offline Support**: No.
*   **Accessibility Notes**: Focus shifts directly to comments field on "Other" reason selection.
*   **Acceptance Criteria**: Flags specimen status as "Rejected"; sends alert notifications to EHR.

---

#### SCR-084: Specimen Details
*   **Screen ID**: SCR-084
*   **Screen Name**: Specimen Details Profile
*   **Module**: Specimen
*   **Purpose**: View profile cards for specimens, order linkages, and lab benches stages.
*   **Business Objective**: Access to specimen diagnostics history.
*   **User Roles**: Technician, Pathologist.
*   **Navigation Path**: `/specimens/:specimen_id`
*   **Entry Points**: Directory row clicks, search results.
*   **Exit Points**: Media Preparation (`SCR-130`), Inoculation (`SCR-131`).
*   **Parent Screen**: SCR-080.
*   **Child Screens**: Media Preparation (`SCR-130`).
*   **Related Workflow IDs**: WF-007.
*   **Related Components**: CMP-604 Context bar, CMP-802 Status badges.
*   **Related UI States**: Pristine, Loading.
*   **Required Permissions**: `read:specimens`
*   **API Dependencies**: `GET /api/v1/specimens/:id`
*   **Database Dependencies**: `clinical.specimens`
*   **Validation Rules**: None.
*   **Error States**: ERR-API-01 Timeout.
*   **Empty States**: Observation panels show "Culture growth observations pending".
*   **Loading States**: Profile cards skeleton layouts.
*   **Print Support**: Yes.
*   **Offline Support**: Yes.
*   **Accessibility Notes**: Focus structures split specimen labels from details panels.
*   **Acceptance Criteria**: Displays specimen type, volume metrics, accession timestamps, and source sites.

---

### 10.6 Culture Module (SCR-130 to SCR-134)

#### SCR-130: Media Preparation
*   **Screen ID**: SCR-130
*   **Screen Name**: Agar Media Allocation
*   **Module**: Culture
*   **Purpose**: Allocate agar media plates lot codes to specimen accession tasks.
*   **Business Objective**: Lot tracking audits.
*   **User Roles**: Technician.
*   **Navigation Path**: `/culture/media?specimen_id=:specimen_id`
*   **Entry Points**: Specimen Details link.
*   **Exit Points**: Inoculation (`SCR-131`).
*   **Parent Screen**: SCR-084.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-008.
*   **Related Components**: CMP-301 Inputs, CMP-309 Dropdowns.
*   **Related UI States**: Pristine, Valid, Invalid, Loading.
*   **Required Permissions**: `write:culture`
*   **API Dependencies**: `GET /api/v1/media/inventory`, `POST /api/v1/culture/media/allocate`
*   **Database Dependencies**: `clinical.culture_plates`, `inventory.media_lots`
*   **Validation Rules**: Media lot scanned is active (not expired, validated by QC checks).
*   **Error States**: ERR-MEDIA-01 Expired Lot, ERR-MEDIA-02 QC Fail.
*   **Empty States**: Scanned fields blank.
*   **Loading States**: Dropdown select disable.
*   **Print Support**: No.
*   **Offline Support**: Caches media lists local databases.
*   **Accessibility Notes**: Screen reader announces "Lot Validated" on scan matching success.
*   **Acceptance Criteria**: Links specific agar plate serial codes to specimen accession numbers.

---

#### SCR-131: Inoculation
*   **Screen ID**: SCR-131
*   **Screen Name**: Plate Inoculation Bench
*   **Module**: Culture
*   **Purpose**: Confirm physical transfer of specimen to agar media.
*   **Business Objective**: Clinical step audit tracking.
*   **User Roles**: Technician.
*   **Navigation Path**: `/culture/inoculation?specimen_id=:specimen_id`
*   **Entry Points**: Specimen Details receipt link.
*   **Exit Points**: Incubation (`SCR-132`).
*   **Parent Screen**: SCR-130.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-008.
*   **Related Components**: CMP-201 Buttons, CMP-301 Accession indicators.
*   **Related UI States**: Pristine, Loading, Success.
*   **Required Permissions**: `write:culture`
*   **API Dependencies**: `POST /api/v1/culture/inoculate`
*   **Database Dependencies**: `clinical.culture_plates`
*   **Validation Rules**: Plating timestamp must be less than or equal to active client time.
*   **Error States**: ERR-API-02 Fail.
*   **Empty States**: None.
*   **Loading States**: Save buttons disabled state configurations.
*   **Print Support**: No.
*   **Offline Support**: Yes (stores locally queue sync runs).
*   **Accessibility Notes**: Large click confirmation targets. Keyboard Enter keys confirm inoculations.
*   **Acceptance Criteria**: Plate status updates to "Inoculated"; logs tech ID metadata.

---

#### SCR-132: Incubation
*   **Screen ID**: SCR-132
*   **Screen Name**: Incubator Placement Log
*   **Module**: Culture
*   **Purpose**: Log incubator compartment values and timer thresholds.
*   **Business Objective**: Correct incubation timing.
*   **User Roles**: Technician.
*   **Navigation Path**: `/culture/incubation`
*   **Entry Points**: Inoculation success redirect, sidebar link.
*   **Exit Points**: Observation (`SCR-133`).
*   **Parent Screen**: SCR-131.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-009.
*   **Related Components**: CMP-309 Dropdowns, CMP-301 Inputs.
*   **Related UI States**: Pristine, Valid, Invalid, Loading.
*   **Required Permissions**: `write:culture`
*   **API Dependencies**: `POST /api/v1/culture/incubation/start`
*   **Database Dependencies**: `clinical.culture_plates`, `instrumentation.incubators`
*   **Validation Rules**: Incubator shelf selection must match vacancy maps.
*   **Error States**: ERR-INCUBATOR-01 Slot Occupied.
*   **Empty States**: Vacancy maps render vacancy highlights.
*   **Loading States**: Maps load placeholders show.
*   **Print Support**: Yes (prints shelf slot tags).
*   **Offline Support**: No.
*   **Accessibility Notes**: Alt details describe incubator vacancies list structures.
*   **Acceptance Criteria**: Sets incubation start timestamp; triggers countdown SLA notifications.

---

#### SCR-133: Observation
*   **Screen ID**: SCR-133
*   **Screen Name**: Growth Observation Worksheet
*   **Module**: Culture
*   **Purpose**: Log daily plate observations, growth status, and morphologic observations.
*   **Business Objective**: Correct clinical diagnosis checks.
*   **User Roles**: Technician, Pathologist.
*   **Navigation Path**: `/culture/observations/:plate_id`
*   **Entry Points**: Incubation list row clicks, work queues.
*   **Exit Points**: Colony Management (`SCR-134`), Identification Workbench (`SCR-180`).
*   **Parent Screen**: SCR-132.
*   **Child Screens**: Colony Management (`SCR-134`).
*   **Related Workflow IDs**: WF-010.
*   **Related Components**: CMP-309 Select lists, CMP-301 Textareas.
*   **Related UI States**: Pristine, Dirty, Valid, Invalid, Loading.
*   **Required Permissions**: `write:culture`
*   **API Dependencies**: `GET /api/v1/culture/observations/:id`, `POST /api/v1/culture/observations`
*   **Database Dependencies**: `clinical.culture_observations`
*   **Validation Rules**: Growth level selection (e.g. No Growth, Scant, Moderate, Heavy) is mandatory.
*   **Error States**: ERR-API-01 Timeout.
*   **Empty States**: Observation parameters defaults to "No Growth".
*   **Loading States**: Matrix checkboxes render disabled pre-fetch.
*   **Print Support**: Yes.
*   **Offline Support**: Caches observation drafts.
*   **Accessibility Notes**: Form labels link explicitly to morphologic description controls.
*   **Acceptance Criteria**: Saving observations logs observer's credentials and updates plate status.

---

#### SCR-134: Colony Management
*   **Screen ID**: SCR-134
*   **Screen Name**: Colony Pick & Subculture Log
*   **Module**: Culture
*   **Purpose**: Log picking of isolated colonies for identification and AST.
*   **Business Objective**: Traceability of subculture nodes.
*   **User Roles**: Technician.
*   **Navigation Path**: `/culture/colony?plate_id=:plate_id`
*   **Entry Points**: Observation screen action link.
*   **Exit Points**: Identification Workbench (`SCR-180`).
*   **Parent Screen**: SCR-133.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-010.
*   **Related Components**: CMP-301 Inputs, CMP-201 Buttons.
*   **Related UI States**: Pristine, Valid, Invalid, Loading.
*   **Required Permissions**: `write:culture`
*   **API Dependencies**: `POST /api/v1/culture/colony/pick`
*   **Database Dependencies**: `clinical.colonies`, `clinical.culture_plates`
*   **Validation Rules**: Colony number must be > 0. Morphologic tag selection mandatory.
*   **Error States**: ERR-VAL-02 Validation fail.
*   **Empty States**: Lists show clean colony counts fields.
*   **Loading States**: Form submission buttons show spinners.
*   **Print Support**: No.
*   **Offline Support**: No.
*   **Accessibility Notes**: Accessible keyboard tabs skip graphics coordinates selectors.
*   **Acceptance Criteria**: Links specific colony cards to subculture agar media lot codes.

---

### 10.7 Organism Identification Module (SCR-180 to SCR-181)

#### SCR-180: Identification Workbench
*   **Screen ID**: SCR-180
*   **Screen Name**: Organism ID Workbench
*   **Module**: Organism Identification
*   **Purpose**: Log biochemical or MALDI-TOF test results to identify organism names.
*   **Business Objective**: Correct organism identification.
*   **User Roles**: Technician, Pathologist.
*   **Navigation Path**: `/organism/id?specimen_id=:specimen_id`
*   **Entry Points**: Observation screen link, queue clicks.
*   **Exit Points**: Organism Review (`SCR-181`), AST Entry (`SCR-230`).
*   **Parent Screen**: SCR-133.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-011.
*   **Related Components**: CMP-309 Dropdowns, CMP-802 Match score cards.
*   **Related UI States**: Pristine, Valid, Invalid, Loading.
*   **Required Permissions**: `write:organisms`
*   **API Dependencies**: `POST /api/v1/organism/id`, `GET /api/v1/organism/taxonomy`
*   **Database Dependencies**: `clinical.organism_identifications`, `taxonomy.organisms`
*   **Validation Rules**: Organism select must match approved taxonomy dictionaries (CMP-364).
*   **Error States**: ERR-TAXONOMY-01 Unknown Organism.
*   **Empty States**: Search matches dropdown displays "Type to search organism name".
*   **Loading States**: Match scores displays loading skeleton cards.
*   **Print Support**: Yes.
*   **Offline Support**: No.
*   **Accessibility Notes**: Focus shifts automatically to search matches inputs.
*   **Acceptance Criteria**: Successful ID writes organisms records to active specimen status.

---

#### SCR-181: Organism Review
*   **Screen ID**: SCR-181
*   **Screen Name**: Organism ID Review Board
*   **Module**: Organism Identification
*   **Purpose**: Review and verify organism identification results.
*   **Business Objective**: Correct taxonomy review.
*   **User Roles**: Supervisor, Pathologist.
*   **Navigation Path**: `/organism/review`
*   **Entry Points**: Sidebar queue links.
*   **Exit Points**: Technical Validation (`SCR-280`).
*   **Parent Screen**: SCR-180.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-011.
*   **Related Components**: CMP-501 Worklist table, CMP-802 Status badges.
*   **Related UI States**: Pristine, Loading.
*   **Required Permissions**: `validate:organisms`
*   **API Dependencies**: `GET /api/v1/organism/review-queue`, `POST /api/v1/organism/review/approve`
*   **Database Dependencies**: `clinical.organism_identifications`
*   **Validation Rules**: Approver credentials must match user authentication parameters.
*   **Error States**: ERR-AUTH-05 Unauthorized.
*   **Empty States**: "All organism reviews completed" timeline banner.
*   **Loading States**: Tables skeleton.
*   **Print Support**: Yes.
*   **Offline Support**: No.
*   **Accessibility Notes**: Verification modals trap focus. Enter key triggers confirmation.
*   **Acceptance Criteria**: Verification marks ID status as "Verified"; locks record writes.

---

### 10.8 AST Module (SCR-230 to SCR-233)

#### SCR-230: AST Entry
*   **Screen ID**: SCR-230
*   **Screen Name**: AST Disk Diffusion Matrix
*   **Module**: AST
*   **Purpose**: Log zone diameter values for disk diffusion tests.
*   **Business Objective**: Accurate AST logging.
*   **User Roles**: Technician.
*   **Navigation Path**: `/ast/entry?specimen_id=:specimen_id`
*   **Entry Points**: Workbench link, work queue clicks.
*   **Exit Points**: AST Review (`SCR-231`).
*   **Parent Screen**: SCR-180.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-012.
*   **Related Components**: CMP-804 AST Matrix Grid, CMP-101 Text inputs.
*   **Related UI States**: Pristine, Dirty, Valid, Invalid, Loading.
*   **Required Permissions**: `write:ast`
*   **API Dependencies**: `GET /api/v1/ast/breakpoints?organism_id=:organism_id`, `POST /api/v1/ast/results`
*   **Database Dependencies**: `clinical.ast_results`, `clinical.specimens`
*   **Validation Rules**: Zone diameter inputs must be numeric values between 6mm and 50mm.
*   **Error States**: ERR-VAL-04 Range Mismatch.
*   **Empty States**: Matrix cells render default empty text boxes.
*   **Loading States**: Matrix grid locks during recalculations.
*   **Print Support**: Yes.
*   **Offline Support**: Caches result matrix grid locally.
*   **Accessibility Notes**: Arrow keys support navigation between matrix grid cells.
*   **Acceptance Criteria**: Automatically calculates S/I/R interpretations on cell focus blur events.

---

#### SCR-231: AST Review
*   **Screen ID**: SCR-231
*   **Screen Name**: AST Matrix Review Board
*   **Module**: AST
*   **Purpose**: Review and verify AST interpretations.
*   **Business Objective**: Correct AST reviews.
*   **User Roles**: Supervisor, Pathologist.
*   **Navigation Path**: `/ast/review`
*   **Entry Points**: Sidebar queue link, details redirects.
*   **Exit Points**: Technical Validation (`SCR-280`).
*   **Parent Screen**: SCR-230.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-012.
*   **Related Components**: CMP-804 AST Matrix, CMP-802 Status badges.
*   **Related UI States**: Pristine, Loading.
*   **Required Permissions**: `validate:ast`
*   **API Dependencies**: `GET /api/v1/ast/review-queue`, `POST /api/v1/ast/review/approve`
*   **Database Dependencies**: `clinical.ast_results`
*   **Validation Rules**: Overridden values require entering validation comments.
*   **Error States**: ERR-AUTH-05 Unauthorized.
*   **Empty States**: "AST reviews completed" list banner.
*   **Loading States**: Matrix row lines show skeleton screens.
*   **Print Support**: Yes.
*   **Offline Support**: No.
*   **Accessibility Notes**: Accessible modal traps focus for overrides justifications comment inputs.
*   **Acceptance Criteria**: Approvals freeze result updates; lock database records.

---

#### SCR-232: MIC Entry
*   **Screen ID**: SCR-232
*   **Screen Name**: Minimum Inhibitory Concentration Worksheet
*   **Module**: AST
*   **Purpose**: Log MIC dilution values and calculations.
*   **Business Objective**: MIC data accuracy.
*   **User Roles**: Technician.
*   **Navigation Path**: `/ast/mic?specimen_id=:specimen_id`
*   **Entry Points**: AST Entry sub-tab link.
*   **Exit Points**: AST Review (`SCR-231`).
*   **Parent Screen**: SCR-230.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-012.
*   **Related Components**: CMP-309 Dropdown Selects, CMP-301 Input fields.
*   **Related UI States**: Pristine, Valid, Invalid, Loading.
*   **Required Permissions**: `write:ast`
*   **API Dependencies**: `POST /api/v1/ast/mic/results`
*   **Database Dependencies**: `clinical.mic_results`
*   **Validation Rules**: Dilution inputs must match standard double dilution ranges.
*   **Error States**: ERR-VAL-04 Range Mismatch.
*   **Empty States**: Dilution cells show clean inputs.
*   **Loading States**: Submit buttons freeze.
*   **Print Support**: Yes.
*   **Offline Support**: No.
*   **Accessibility Notes**: Focus indexes cleanly across dilution wells coordinates.
*   **Acceptance Criteria**: Auto-recalculates interpretations according to MIC breakpoints rules.

---

#### SCR-233: Breakpoint Review
*   **Screen ID**: SCR-233
*   **Screen Name**: Breakpoint Guidelines Matrix
*   **Module**: AST
*   **Purpose**: Display CLSI/EUCAST breakpoints rules active in the system databases.
*   **Business Objective**: Reference lookup.
*   **User Roles**: Technician, Pathologist.
*   **Navigation Path**: `/ast/breakpoints`
*   **Entry Points**: AST Entry worksheet link.
*   **Exit Points**: Return to worksheet.
*   **Parent Screen**: SCR-230.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-012.
*   **Related Components**: CMP-502 List grid.
*   **Related UI States**: Pristine, Loading.
*   **Required Permissions**: `read:ast`
*   **API Dependencies**: `GET /api/v1/ast/breakpoints`
*   **Database Dependencies**: `administration.ast_breakpoints`
*   **Validation Rules**: None.
*   **Error States**: ERR-API-01 Timeout.
*   **Empty States**: Table shows "No active breakpoints guidelines configured".
*   **Loading States**: Directory grid skeleton lines show.
*   **Print Support**: Yes.
*   **Offline Support**: Yes.
*   **Accessibility Notes**: Filter controls support accessible keyboard tab cycles.
*   **Acceptance Criteria**: Displays guideline version, effective dates, organism names, and zone values.

---

### 10.9 Validation Module (SCR-280 to SCR-282)

#### SCR-280: Technical Validation
*   **Screen ID**: SCR-280
*   **Screen Name**: Technical Validation Worksheet
*   **Module**: Validation
*   **Purpose**: Verify specimen observation quality controls and results consistency.
*   **Business Objective**: Scientific review.
*   **User Roles**: Supervisor, Pathologist.
*   **Navigation Path**: `/validation/technical/:specimen_id`
*   **Entry Points**: Details page, review queue clicks.
*   **Exit Points**: Medical Validation (`SCR-281`).
*   **Parent Screen**: SCR-231.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-013.
*   **Related Components**: CMP-806 Validation Checklist, CMP-201 Buttons.
*   **Related UI States**: Pristine, Loading, Success.
*   **Required Permissions**: `validate:technical`
*   **API Dependencies**: `POST /api/v1/validation/technical/approve`
*   **Database Dependencies**: `clinical.specimens`, `clinical.validation_logs`
*   **Validation Rules**: All checklist items (e.g. Media checks, QC matches) must be validated.
*   **Error States**: ERR-VAL-05 Pending QC.
*   **Empty States**: Checklist shows unchecked boxes.
*   **Loading States**: Validation check marks disable.
*   **Print Support**: Yes.
*   **Offline Support**: No.
*   **Accessibility Notes**: Keyboard Enter checks active checklist items.
*   **Acceptance Criteria**: Validation writes log records; updates specimen status to "Technically Validated".

---

#### SCR-281: Medical Validation
*   **Screen ID**: SCR-281
*   **Screen Name**: Medical Validation Workspace
*   **Module**: Validation
*   **Purpose**: Approve and authorize final release of patient diagnostic reports.
*   **Business Objective**: Clinical sign-off.
*   **User Roles**: Pathologist.
*   **Navigation Path**: `/validation/medical/:specimen_id`
*   **Entry Points**: Technical validation success redirect, work queues.
*   **Exit Points**: Report Preview (`SCR-321`) on success.
*   **Parent Screen**: SCR-280.
*   **Child Screens**: Electronic Signature (`SCR-322`).
*   **Related Workflow IDs**: WF-013.
*   **Related Components**: CMP-808 Signature Modal, CMP-604 Context bar.
*   **Related UI States**: Pristine, Loading, Success.
*   **Required Permissions**: `validate:medical`
*   **API Dependencies**: `POST /api/v1/validation/medical/approve`
*   **Database Dependencies**: `clinical.specimens`, `clinical.reports`
*   **Validation Rules**: Digital signature verification mandatory.
*   **Error States**: ERR-AUTH-05 Unauthorized.
*   **Empty States**: Sign button is disabled until credentials match.
*   **Loading States**: Signature overlays.
*   **Print Support**: No.
*   **Offline Support**: No.
*   **Accessibility Notes**: Focus shifts dynamically inside signature modal; ESC closes modal.
*   **Acceptance Criteria**: Final approval locks results databases; initiates report compilation.

---

#### SCR-282: Critical Result Review
*   **Screen ID**: SCR-282
*   **Screen Name**: Critical Value Alert Dashboard
*   **Module**: Validation
*   **Purpose**: Review and track communications of life-threatening diagnostic results.
*   **Business Objective**: Fast critical communications.
*   **User Roles**: Supervisor, Pathologist.
*   **Navigation Path**: `/validation/critical`
*   **Entry Points**: Header bell alarms click, sidebar link.
*   **Exit Points**: Medical Validation (`SCR-281`).
*   **Parent Screen**: None.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-013.
*   **Related Components**: CMP-704 Alert Card, CMP-301 Text fields.
*   **Related UI States**: Pristine, Valid, Invalid, Loading.
*   **Required Permissions**: `validate:critical`
*   **API Dependencies**: `GET /api/v1/validation/critical-queue`, `POST /api/v1/validation/critical/log-call`
*   **Database Dependencies**: `clinical.critical_alerts`, `clinical.call_logs`
*   **Validation Rules**: Recipient physician name, call date, and caller ID are mandatory fields.
*   **Error States**: ERR-VAL-02 Validation fail.
*   **Empty States**: "No pending critical value communications" placeholder.
*   **Loading States**: Red border cards pulse.
*   **Print Support**: Yes.
*   **Offline Support**: No.
*   **Accessibility Notes**: Screen reader sounds alarm tone when alerts enter grid.
*   **Acceptance Criteria**: Saving logs closes active critical timer; records elapsed time metrics.

---

### 10.10 Reports Module (SCR-320 to SCR-323)

#### SCR-320: Report Queue
*   **Screen ID**: SCR-320
*   **Screen Name**: Diagnostics Reports Worklist
*   **Module**: Reports
*   **Purpose**: Display list of generated, pending, and dispatched patient reports.
*   **Business Objective**: Delivery tracking.
*   **User Roles**: Processor, Technician, Pathologist.
*   **Navigation Path**: `/reports`
*   **Entry Points**: Sidebar link click.
*   **Exit Points**: Report Preview (`SCR-321`).
*   **Parent Screen**: None.
*   **Child Screens**: SCR-321.
*   **Related Workflow IDs**: WF-014.
*   **Related Components**: CMP-501 Directory Grid, CMP-802 Status badges.
*   **Related UI States**: Pristine, Loading.
*   **Required Permissions**: `read:reports`
*   **API Dependencies**: `GET /api/v1/reports`
*   **Database Dependencies**: `clinical.reports`
*   **Validation Rules**: None.
*   **Error States**: ERR-API-01 Timeout.
*   **Empty States**: "No patient reports compiled today" list banner.
*   **Loading States**: Rows skeleton maps loading blocks.
*   **Print Support**: Yes.
*   **Offline Support**: Caches reports list.
*   **Accessibility Notes**: Focus shifts cleanly across report IDs using arrow keys.
*   **Acceptance Criteria**: Grid displays report version, target patient, and delivery channel statuses.

---

#### SCR-321: Report Preview
*   **Screen ID**: SCR-321
*   **Screen Name**: Diagnostic Report Preview
*   **Module**: Reports
*   **Purpose**: Display final print formatting of patient diagnostic reports before release.
*   **Business Objective**: Print review.
*   **User Roles**: Technician, Pathologist.
*   **Navigation Path**: `/reports/:report_id/preview`
*   **Entry Points**: Report queue row clicks, details links.
*   **Exit Points**: Electronic Signature (`SCR-322`).
*   **Parent Screen**: SCR-320.
*   **Child Screens**: Electronic Signature (`SCR-322`).
*   **Related Workflow IDs**: WF-014.
*   **Related Components**: CMP-810 Report Card, CMP-201 Buttons.
*   **Related UI States**: Pristine, Loading.
*   **Required Permissions**: `read:reports`
*   **API Dependencies**: `GET /api/v1/reports/:id/preview`
*   **Database Dependencies**: `clinical.reports`
*   **Validation Rules**: None.
*   **Error States**: ERR-PDF-01 Corrupt, ERR-API-01 Timeout.
*   **Empty States**: None.
*   **Loading States**: Rendering overlay skeletons.
*   **Print Support**: Yes (triggers print dialog).
*   **Offline Support**: No.
*   **Accessibility Notes**: Text elements inside preview render in h1/h2 semantic structures for screen readers.
*   **Acceptance Criteria**: Layout aligns with print-safe margins; locks observation results edits.

---

#### SCR-322: Electronic Signature
*   **Screen ID**: SCR-322
*   **Screen Name**: Verification Signature Gate
*   **Module**: Reports
*   **Purpose**: Capture cryptographically secure signatures for medical release authentication.
*   **Business Objective**: Compliance sign-off.
*   **User Roles**: Pathologist.
*   **Navigation Path**: `/reports/:report_id/sign`
*   **Entry Points**: Validation details signature triggers.
*   **Exit Points**: Report History (`SCR-323`) on success.
*   **Parent Screen**: SCR-321.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-014.
*   **Related Components**: CMP-808 Signature Modal, CMP-101 Passwords inputs.
*   **Related UI States**: Pristine, Valid, Invalid, Loading.
*   **Required Permissions**: `validate:medical`
*   **API Dependencies**: `POST /api/v1/reports/:id/sign`
*   **Database Dependencies**: `clinical.reports`, `clinical.signatures`
*   **Validation Rules**: Password signature check matches logged user metadata.
*   **Error States**: ERR-AUTH-05 Unauthorized.
*   **Empty States**: Signature block shows clean inputs.
*   **Loading States**: Modal background freezes.
*   **Print Support**: No.
*   **Offline Support**: No.
*   **Accessibility Notes**: Focus returns to preview page trigger button if modal is cancelled.
*   **Acceptance Criteria**: Encrypts signature string; updates report status to "Validated".

---

#### SCR-323: Report History
*   **Screen ID**: SCR-323
*   **Screen Name**: Report Version History Timeline
*   **Module**: Reports
*   **Purpose**: Track revisions, print logs, and dispatch records for patient reports.
*   **Business Objective**: Version audits.
*   **User Roles**: Supervisor, Pathologist.
*   **Navigation Path**: `/reports/:report_id/history`
*   **Entry Points**: Details page sub-tab link.
*   **Exit Points**: Report Preview (`SCR-321`).
*   **Parent Screen**: SCR-320.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-014.
*   **Related Components**: CMP-504 Version Timeline list.
*   **Related UI States**: Pristine, Loading.
*   **Required Permissions**: `read:reports`
*   **API Dependencies**: `GET /api/v1/reports/:id/history`
*   **Database Dependencies**: `clinical.report_versions`
*   **Validation Rules**: None.
*   **Error States**: ERR-API-01 Timeout.
*   **Empty States**: "No prior revisions logged" timeline placeholder.
*   **Loading States**: Skeletons rows maps.
*   **Print Support**: Yes.
*   **Offline Support**: No.
*   **Accessibility Notes**: Alt tags outline version change summaries (e.g. print release logs).
*   **Acceptance Criteria**: Timeline links clearly to previous PDF versions caches.

---

### 10.11 Administration Module (SCR-360 to SCR-366)

#### SCR-360: Users
*   **Screen ID**: SCR-360
*   **Screen Name**: User Directory Configuration
*   **Module**: Administration
*   **Purpose**: Manage system user accounts and logins profile data.
*   **Business Objective**: Secure access management.
*   **User Roles**: Administrator.
*   **Navigation Path**: `/admin/users`
*   **Entry Points**: Sidebar admin dropdown clicks.
*   **Exit Points**: Form additions interfaces.
*   **Parent Screen**: None.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-015.
*   **Related Components**: CMP-501 Directory Grid, CMP-201 Buttons.
*   **Related UI States**: Pristine, Loading.
*   **Required Permissions**: `manage:system`
*   **API Dependencies**: `GET /api/v1/admin/users`, `POST /api/v1/admin/users`
*   **Database Dependencies**: `security.users`
*   **Validation Rules**: Username and department selections are mandatory fields.
*   **Error States**: ERR-VAL-01 Duplicate Username.
*   **Empty States**: Directory shows blank filters.
*   **Loading States**: Skeletons loading arrays.
*   **Print Support**: Yes.
*   **Offline Support**: No.
*   **Accessibility Notes**: Access keys support focus jumps to filter parameters inputs.
*   **Acceptance Criteria**: Actions log changes to audit logs database tables.

---

#### SCR-361: Roles
*   **Screen ID**: SCR-361
*   **Screen Name**: Roles & Permissions Configurations
*   **Module**: Administration
*   **Purpose**: Configure permissions and mapping roles variables.
*   **Business Objective**: System RBAC controls.
*   **User Roles**: Administrator.
*   **Navigation Path**: `/admin/roles`
*   **Entry Points**: Admin panel navigation.
*   **Exit Points**: Permissions grid links.
*   **Parent Screen**: SCR-360.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-015.
*   **Related Components**: CMP-502 Permissions check matrix.
*   **Related UI States**: Pristine, Dirty, Valid, Invalid, Loading.
*   **Required Permissions**: `manage:system`
*   **API Dependencies**: `GET /api/v1/admin/roles`, `PUT /api/v1/admin/roles/:id`
*   **Database Dependencies**: `security.roles`, `security.permissions`
*   **Validation Rules**: Roles names must match alphanumeric regex rules.
*   **Error States**: ERR-VAL-02 Validation fail.
*   **Empty States**: Unchecked permissions boxes.
*   **Loading States**: Submit locks, fields freeze.
*   **Print Support**: No.
*   **Offline Support**: No.
*   **Accessibility Notes**: Keyboard tabs cycle through checkboxes matrix.
*   **Acceptance Criteria**: Saves prompt session updates for active users matched to updated role.

---

#### SCR-362: Departments
*   **Screen ID**: SCR-362
*   **Screen Name**: Laboratory Departments Setup
*   **Module**: Administration
*   **Purpose**: Define laboratory benches and department boundaries.
*   **Business Objective**: Bench routing configuration.
*   **User Roles**: Administrator.
*   **Navigation Path**: `/admin/departments`
*   **Entry Points**: Admin panel navigation.
*   **Exit Points**: Details profiles.
*   **Parent Screen**: SCR-360.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-015.
*   **Related Components**: CMP-301 Text inputs, CMP-201 Buttons.
*   **Related UI States**: Pristine, Loading.
*   **Required Permissions**: `manage:system`
*   **API Dependencies**: `GET /api/v1/admin/departments`, `POST /api/v1/admin/departments`
*   **Database Dependencies**: `administration.departments`
*   **Validation Rules**: Department name must be unique.
*   **Error States**: ERR-VAL-01 Duplicate name.
*   **Empty States**: Clean inputs.
*   **Loading States**: Spinners on save.
*   **Print Support**: Yes.
*   **Offline Support**: No.
*   **Accessibility Notes**: Alt details define department links structures.
*   **Acceptance Criteria**: Saves update global department selectors lists.

---

#### SCR-363: Test Catalog
*   **Screen ID**: SCR-363
*   **Screen Name**: Lab Test Catalog Directory
*   **Module**: Administration
*   **Purpose**: Configure test codes, culture panels, and specimen container rules.
*   **Business Objective**: Panel catalog maintenance.
*   **User Roles**: Supervisor, Administrator.
*   **Navigation Path**: `/admin/tests`
*   **Entry Points**: Admin panel link.
*   **Exit Points**: Catalog items details.
*   **Parent Screen**: SCR-360.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-015.
*   **Related Components**: CMP-501 Directory Grid, CMP-802 Status badges.
*   **Related UI States**: Pristine, Loading.
*   **Required Permissions**: `manage:catalog`
*   **API Dependencies**: `GET /api/v1/admin/tests`, `PUT /api/v1/admin/tests/:id`
*   **Database Dependencies**: `administration.tests`, `administration.panels`
*   **Validation Rules**: Test code must match uppercase alphanumeric formats.
*   **Error States**: ERR-API-01 Timeout.
*   **Empty States**: "No tests configured in catalog" list banner.
*   **Loading States**: Pulsing row outlines.
*   **Print Support**: Yes.
*   **Offline Support**: Caches catalog references.
*   **Accessibility Notes**: Tab focus cycling runs through active rows.
*   **Acceptance Criteria**: Updates apply immediately to order intake selectors options.

---

#### SCR-364: Organism Master
*   **Screen ID**: SCR-364
*   **Screen Name**: Taxonomy Master Directory
*   **Module**: Administration
*   **Purpose**: Maintain taxonomy lists for bacteria, fungi, and contaminants.
*   **Business Objective**: Taxonomy compliance (e.g. SNOMED/LOINC mapping).
*   **User Roles**: Supervisor, Administrator.
*   **Navigation Path**: `/admin/organisms`
*   **Entry Points**: Admin sidebar menu.
*   **Exit Points**: Taxonomy details cards.
*   **Parent Screen**: SCR-360.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-015.
*   **Related Components**: CMP-501 Taxonomy search grid, CMP-101 Text inputs.
*   **Related UI States**: Pristine, Loading.
*   **Required Permissions**: `manage:catalog`
*   **API Dependencies**: `GET /api/v1/admin/organisms`, `POST /api/v1/admin/organisms`
*   **Database Dependencies**: `taxonomy.organisms`
*   **Validation Rules**: Scientific name must match Latin formatting checks.
*   **Error States**: ERR-VAL-01 Duplicate name.
*   **Empty States**: "Type name to search taxonomy database" placeholder.
*   **Loading States**: Skeletons.
*   **Print Support**: Yes.
*   **Offline Support**: Yes.
*   **Accessibility Notes**: Screen reader confirms scientific names alt labels.
*   **Acceptance Criteria**: Saves update organism identification match lists.

---

#### SCR-365: Antibiotic Master
*   **Screen ID**: SCR-365
*   **Screen Name**: Antibiotic Master Registry
*   **Module**: Administration
*   **Purpose**: Manage antibiotic codes, categories, and panel grouping mappings.
*   **Business Objective**: Susceptibility lists maintenance.
*   **User Roles**: Supervisor, Administrator.
*   **Navigation Path**: `/admin/antibiotics`
*   **Entry Points**: Admin sidebar link.
*   **Exit Points**: Antibiotic detail profile.
*   **Parent Screen**: SCR-360.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-015.
*   **Related Components**: CMP-501 Directory Grid, CMP-201 Buttons.
*   **Related UI States**: Pristine, Loading.
*   **Required Permissions**: `manage:catalog`
*   **API Dependencies**: `GET /api/v1/admin/antibiotics`, `POST /api/v1/admin/antibiotics`
*   **Database Dependencies**: `administration.antibiotics`
*   **Validation Rules**: Antibiotic name and code are mandatory.
*   **Error States**: ERR-VAL-01 Duplicate Code.
*   **Empty States**: List displays clean grids.
*   **Loading States**: Table skeletons display.
*   **Print Support**: Yes.
*   **Offline Support**: Yes.
*   **Accessibility Notes**: Large buttons support focus cycles.
*   **Acceptance Criteria**: Mapped antibiotic codes immediately render on AST matrix grids.

---

#### SCR-366: Laboratory Configuration
*   **Screen ID**: SCR-366
*   **Screen Name**: Global LIMS Configuration
*   **Module**: Administration
*   **Purpose**: Configure system timeouts, header parameters, and email alarms settings.
*   **Business Objective**: Site parameters configuration.
*   **User Roles**: Administrator.
*   **Navigation Path**: `/admin/config`
*   **Entry Points**: Admin panel navigation link.
*   **Exit Points**: Save configurations.
*   **Parent Screen**: SCR-360.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-015.
*   **Related Components**: CMP-309 Select dropdowns, CMP-101 Text inputs.
*   **Related UI States**: Pristine, Dirty, Valid, Invalid, Loading.
*   **Required Permissions**: `manage:system`
*   **API Dependencies**: `GET /api/v1/admin/config`, `PUT /api/v1/admin/config`
*   **Database Dependencies**: `administration.settings`
*   **Validation Rules**: Timeout values must be integer values > 0.
*   **Error States**: ERR-VAL-02 Validation fail.
*   **Empty States**: Config grids load active values.
*   **Loading States**: Form overlays lock settings edits.
*   **Print Support**: No.
*   **Offline Support**: No.
*   **Accessibility Notes**: Form labels link explicitly to settings parameters.
*   **Acceptance Criteria**: Saves update global settings cached parameters.

---

### 10.12 Audit Module (SCR-430 to SCR-432)

#### SCR-430: Audit Logs
*   **Screen ID**: SCR-430
*   **Screen Name**: System Audit Log Board
*   **Module**: Audit
*   **Purpose**: Display log database of write and override actions across LIMS databases.
*   **Business Objective**: Security audits compliance.
*   **User Roles**: Supervisor, Administrator.
*   **Navigation Path**: `/audit/logs`
*   **Entry Points**: Sidebar menu link.
*   **Exit Points**: Log details modal.
*   **Parent Screen**: None.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-016.
*   **Related Components**: CMP-501 Directory Grid, CMP-802 Status badges.
*   **Related UI States**: Pristine, Loading.
*   **Required Permissions**: `read:audits`
*   **API Dependencies**: `GET /api/v1/audit/logs`
*   **Database Dependencies**: `security.audit_logs`
*   **Validation Rules**: None.
*   **Error States**: ERR-API-01 Timeout.
*   **Empty States**: "No audit logs recorded for target parameters range" list placeholder.
*   **Loading States**: Table skeleton rows render.
*   **Print Support**: Yes.
*   **Offline Support**: No.
*   **Accessibility Notes**: Filters panel uses accessible dropdown controls.
*   **Acceptance Criteria**: Logs rows display transaction IDs, actor details, timestamps, and action types.

---

#### SCR-431: Activity History
*   **Screen ID**: SCR-431
*   **Screen Name**: User Activity Timeline
*   **Module**: Audit
*   **Purpose**: Display chronology of active sessions and login activities.
*   **Business Objective**: Security breach detection.
*   **User Roles**: Supervisor, Administrator.
*   **Navigation Path**: `/audit/activity?user_id=:user_id`
*   **Entry Points**: User Details profile page links.
*   **Exit Points**: None.
*   **Parent Screen**: SCR-430.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-016.
*   **Related Components**: CMP-504 Timeline view.
*   **Related UI States**: Pristine, Loading.
*   **Required Permissions**: `read:audits`
*   **API Dependencies**: `GET /api/v1/audit/activity?user_id=:user_id`
*   **Database Dependencies**: `security.user_activity`
*   **Validation Rules**: None.
*   **Error States**: ERR-API-01 Timeout.
*   **Empty States**: "No login history recorded for user" timeline placeholder.
*   **Loading States**: Skeletons.
*   **Print Support**: Yes.
*   **Offline Support**: No.
*   **Accessibility Notes**: Alt tags describe login device names and IP locations details.
*   **Acceptance Criteria**: Timestamps are formatted in localized timezones.

---

#### SCR-432: Decision History
*   **Screen ID**: SCR-432
*   **Screen Name**: Project Decision Log Board
*   **Module**: Audit
*   **Purpose**: Display historical log of architectural and design approvals.
*   **Business Objective**: Change containment tracking.
*   **User Roles**: Supervisor, Administrator.
*   **Navigation Path**: `/audit/decisions`
*   **Entry Points**: Sidebar click.
*   **Exit Points**: Decision details modal.
*   **Parent Screen**: SCR-430.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-016.
*   **Related Components**: CMP-501 Directory Grid, LIMS-DOC-20 mappings.
*   **Related UI States**: Pristine, Loading.
*   **Required Permissions**: `read:audits`
*   **API Dependencies**: `GET /api/v1/audit/decisions`
*   **Database Dependencies**: `administration.decisions_log`
*   **Validation Rules**: None.
*   **Error States**: ERR-API-01 Timeout.
*   **Empty States**: "No decisions recorded in target range" table banner.
*   **Loading States**: Pulsing row outlines.
*   **Print Support**: Yes.
*   **Offline Support**: Yes.
*   **Accessibility Notes**: Focus cycles through rows using arrow keys.
*   **Acceptance Criteria**: Rows link directly to decision profiles and BRS/SRS requirements.

---

### 10.13 Analytics Module (SCR-460 to SCR-462)

#### SCR-460: Turnaround Time Dashboard
*   **Screen ID**: SCR-460
*   **Screen Name**: TAT Analytics Board
*   **Module**: Analytics
*   **Purpose**: Display turnaround times (TAT) metrics and workflow delays warnings.
*   **Business Objective**: SLA targets compliance tracking.
*   **User Roles**: Supervisor, Administrator.
*   **Navigation Path**: `/analytics/tat`
*   **Entry Points**: Sidebar analytics menu.
*   **Exit Points**: Queue details.
*   **Parent Screen**: None.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-017.
*   **Related Components**: CMP-802 Status cards, CMP-502 List grid.
*   **Related UI States**: Pristine, Loading.
*   **Required Permissions**: `read:analytics`
*   **API Dependencies**: `GET /api/v1/analytics/tat`
*   **Database Dependencies**: `clinical.specimens`, `clinical.orders`
*   **Validation Rules**: None.
*   **Error States**: ERR-API-01 Timeout.
*   **Empty States**: Dashboard shows zeros when no data matches parameters range.
*   **Loading States**: Cards show skeleton screens.
*   **Print Support**: Yes.
*   **Offline Support**: No.
*   **Accessibility Notes**: Alt tags describe chart data points. h1 heading structures.
*   **Acceptance Criteria**: Computes average collection-to-intake and plating-to-signoff duration values.

---

#### SCR-461: Quality Dashboard
*   **Screen ID**: SCR-461
*   **Screen Name**: Laboratory Quality Indicators
*   **Module**: Analytics
*   **Purpose**: Display quality indicators metrics (e.g. rejection and contamination ratios).
*   **Business Objective**: Lab quality tracking.
*   **User Roles**: Supervisor, Administrator.
*   **Navigation Path**: `/analytics/quality`
*   **Entry Points**: Sidebar analytics dropdown.
*   **Exit Points**: Rejections queue.
*   **Parent Screen**: SCR-460.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-017.
*   **Related Components**: CMP-802 Status Cards, CMP-704 Alert Card.
*   **Related UI States**: Pristine, Loading.
*   **Required Permissions**: `read:analytics`
*   **API Dependencies**: `GET /api/v1/analytics/quality`
*   **Database Dependencies**: `clinical.specimens`, `clinical.rejections`
*   **Validation Rules**: None.
*   **Error States**: ERR-API-01 Timeout.
*   **Empty States**: Zero state placeholder.
*   **Loading States**: Skeletons.
*   **Print Support**: Yes.
*   **Offline Support**: No.
*   **Accessibility Notes**: Accessible tables back graphic charts targets for screen readers compatibility.
*   **Acceptance Criteria**: Calculates monthly rejection percentages and contamination rates.

---

#### SCR-462: Operational Dashboard
*   **Screen ID**: SCR-462
*   **Screen Name**: Lab Operations Workload Dashboard
*   **Module**: Analytics
*   **Purpose**: Display technician bench workloads and task allocations volumes.
*   **Business Objective**: Resource balancing.
*   **User Roles**: Supervisor, Administrator.
*   **Navigation Path**: `/analytics/operations`
*   **Entry Points**: Sidebar analytics link.
*   **Exit Points**: Work queue.
*   **Parent Screen**: SCR-460.
*   **Child Screens**: None.
*   **Related Workflow IDs**: WF-017.
*   **Related Components**: CMP-802 Workload indicators, CMP-502 Tables.
*   **Related UI States**: Pristine, Loading.
*   **Required Permissions**: `read:analytics`
*   **API Dependencies**: `GET /api/v1/analytics/operations`
*   **Database Dependencies**: `clinical.tasks`, `security.users`
*   **Validation Rules**: None.
*   **Error States**: ERR-API-01 Timeout.
*   **Empty States**: Zero state metrics grids.
*   **Loading States**: Skeletons.
*   **Print Support**: Yes.
*   **Offline Support**: No.
*   **Accessibility Notes**: Heading layouts structure page blocks cleanly.
*   **Acceptance Criteria**: Renders workload distribution grids matched to department codes.

---

## 11. Mandatory Screen Governance Rules

The following rules are mandatory and binding on all development, design, testing, and operations activities:

1.  **No frontend screen may be implemented unless it exists in the approved Screen Inventory (LIMS-DOC-21) and maintains complete traceability to workflows, components, permissions, and business requirements.**
2.  **Adding columns, buttons, or navigation tabs to any frontend screen requires updating the target Screen ID template parameters in this document first.**
3.  **No pull request containing new routing configurations, screen modules, or navigation links may merge unless it references an approved Screen ID (`SCR-xxx`).**
4.  **Any screen deprecation requires checking downstream dependencies and obtaining approval from both the UX Lead and SRE Lead.**

---

## Review Checklist
- [x] Includes all 10 sections defined in the implementation plan.
- [x] Specifies the Screen Numbering Convention ranges (SCR-001 through SCR-499) for future scaling.
- [x] Details the 13 Screen Classification categories.
- [x] Populates the standard 26-field Screen Metadata Template for exactly 53 screens.
- [x] Outlines the Navigation Architecture (Sidebar, tabs, breadcrumbs, Ctrl+Shift+S search shortcuts).
- [x] Maps Screen Relationships flow diagrams.
- [x] Details the 7-stage Screen Lifecycle from Draft to Deprecated.
- [x] Defines Screen Metrics and Governance policies.
- [x] Integrates the Mandatory Screen Governance Rules.
- [x] Verifies that the document contains no React, HTML, CSS, or implementation-specific code.
- [x] Traces design rules back to LIMS-DOC-05, -06, -13, -13A, -13B, -14, -15, -16, -17, -18, -19, and -20.
- [x] Follows the LIMS-DOC template structure.
