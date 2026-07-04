# MVP Scope Document

## Document Metadata
*   **Document ID**: LIMS-DOC-02
*   **Version**: 1.0.0
*   **Author**: Antigravity (LIMS Solution Architect)
*   **Status**: Approved
*   **Last Updated**: 2026-07-03
*   **Dependencies**: [LIMS-DOC-01](file:///d:/Projects/Micro_Lab/docs/01_product_vision.md)
*   **Requested By**: Product Management & Lab Stakeholders
*   **Reviewed By**: Technical Architect & QA Lead
*   **Approved By**: User
*   **Approval Date**: 2026-07-03

---

## Purpose
The purpose of this document is to answer **"Why are we building this?"** by defining the boundaries of the MVP (Minimum Viable Product). It details what features are explicitly included, what is excluded, the priorities of features, the non-functional scope, and the exit criteria necessary to transition from development to a production-ready release.

---

## Scope
This document covers the functional, non-functional, and technical scope of the LIMS MVP. It establishes the success criteria, definition of "production-ready," release gates, and lists items explicitly excluded from the MVP.

---

## Main Content

### 1. MVP Philosophy & Technical Strategy
The LIMS MVP is designed to be fully deployable in production. The architectural guidelines follow a frontend-first development approach, setting up the entire user interface and user flows using mocked server interfaces before database/server APIs are built.

*   **Frontend Scope (MVP)**: Full Single Page Application (SPA), state management, client validation, routing, responsive templates, accessibility tags, and a mock service worker engine.
*   **Backend Scope (Deferred)**: Scaffolding, database schema setups, security protocols, API controllers, and lot validation seeds are deferred to Milestone 5.
*   **Multi-tenancy Model**: The architecture shall be multi-tenant ready from day one. The initial deployment and validation will use a single tenant.

---

### 2. Feature Priority Definitions
All potential product features are categorized using the following priority matrix:
*   **P0**: Mandatory for MVP. Core clinical workflows and compliance triggers without which the lab cannot operate digitally.
*   **P1**: Important. High-value enhancements for operational speed (e.g. quick keyboard shortcuts, customized print queues).
*   **P2**: Nice to have. Useful features that can be manually bypassed (e.g. template customization tools, standard print preview templates).
*   **Future**: Post-MVP. Deferred systems (e.g. hardware integrations, AI imaging models).

---

### 3. Detailed Workflow Scope & Priority Inventory

This section details the functional P0/P1/P2 elements and deferred components across the 18 laboratory workflow steps:

| Step | Included Features (P0 / P1 / P2 Scope) | Excluded / Future Features |
| :--- | :--- | :--- |
| **1. Patient Registration** | - **[P0]** MRN generation & demographics entry.<br>- **[P0]** Dynamic search & duplicate patient validation.<br>- **[P1]** Multi-identifier matching (passport, local ID). | - **[Future]** Direct HL7 MPI integration.<br>- **[Future]** OCR scanning of patient IDs. |
| **2. Client Registration** | - **[P0]** Clinic & physician entry (NPI, email, phone).<br>- **[P0]** Report delivery preferences configuration. | - **[Future]** Client billing contracts auto-calculator. |
| **3. Test Request** | - **[P0]** Digital order form (Specimen source, panels).<br>- **[P0]** Order status tracking (Ordered, Received, etc.).<br>- **[P1]** Clinical diagnosis code validation (ICD-10). | - **[Future]** Auto-order matching from external EHR APIs. |
| **4. Sample Collection** | - **[P0]** Specimen type selection & collector log.<br>- **[P0]** Collection site and container checklist.<br>- **[P1]** Collection location logging (Ward, Clinic). | - **[Future]** GPS courier tracking.<br>- **[Future]** Mobile collection queue sync. |
| **5. Barcode Generation** | - **[P0]** Standard 1D/2D Barcode generation on order.<br>- **[P0]** Specimen ID, patient details, and test panels layout.<br>- **[P1]** Multi-plate print templates setup. | - **[Future]** 96-well microplate barcode automation. |
| **6. Sample Receipt** | - **[P0]** Barcode scan receipt check-in.<br>- **[P0]** Rejection reason registration (Volume, leaks).<br>- **[P2]** Automated alert notification to ordering clinic. | - **[Future]** Robotic sorter integrations. |
| **7. Sample Processing** | - **[P0]** Agar media lot and type mapping.<br>- **[P0]** Primary plating layout assignments. | - **[Future]** Inoculator robot telemetry output. |
| **8. Culture** | - **[P0]** Plating technician & media verification check.<br>- **[P0]** Culture class routing (Aerobic vs Anaerobic). | - **[Future]** Automatic media shelf routing logs. |
| **9. Incubation** | - **[P0]** Incubator ID and shelf assignment.<br>- **[P0]** Timers for 24h/48h read alerts. | - **[Future]** Automated IoT incubator monitor sensors. |
| **10. Observation** | - **[P0]** Gram stain result logs (Morphology, shape, counts).<br>- **[P0]** Plate observations records (Colony morphology).<br>- **[P1]** Rapid biochemical entry templates. | - **[Future]** Automated growth image recognition. |
| **11. Organism ID** | - **[P0]** CLSI-mapped organism taxonomy database autocomplete.<br>- **[P0]** Biochemical key test recording (Catalase, Oxidase).<br>- **[P1]** Multi-organism growth ratio logs. | - **[Future]** Mass Spec (MALDI-TOF) direct exports. |
| **12. AST Susceptibility** | - **[P0]** Disc diffusion (mm) & MIC ($\mu g/mL$) entry.<br>- **[P0]** Automated SIR classification mapped to CLSI guidelines.<br>- **[P1]** Manual interpretation override with justification logs. | - **[Future]** Analyzer direct drivers (VITEK, Phoenix). |
| **13. Quality Review** | - **[P0]** Quality checklist for media lot validity.<br>- **[P0]** Critical results flagging (e.g., CSF growth). | - **[Future]** Levey-Jennings QC chart generation. |
| **14. Medical Validation** | - **[P0]** Clinical review dashboard comparing Gram/Growth/AST.<br>- **[P0]** Pathology digital validation signature. | - **[Future]** Diagnostic treatment recommendations engine. |
| **15. Report Generation** | - **[P0]** Standardized final PDF reports.<br>- **[P0]** Preliminary report updates with time markers.<br>- **[P2]** Structured AST grid with color interpretations. | - **[Future]** Admin reporting template custom builder. |
| **16. Billing** | - **[P0]** Direct client invoice creation & direct payments logging.<br>- **[P1]** CPT & ICD-10 standard code attachments. | - **[Future]** Insurance clearinghouse portals integration. |
| **17. Report Delivery** | - **[P0]** Secure Doctor Portal results inbox.<br>- **[P0]** Secure email PDF notification link. | - **[Future]** Legacy clinic fax server pipelines. |
| **18. Archival** | - **[P0]** Read-only data lock for final reports.<br>- **[P0]** Specimen storage cabinet location coordinates log.<br>- **[P1]** Audit change logs print exporter. | - **[Future]** Chemical/biohazard waste tracking integrations. |

---

### 4. MVP Non-Functional Scope
To ensure enterprise-grade stability, the MVP must meet the following metrics:
*   **Performance**: Core page transitions under 100ms; report rendering under 2s; search database filters return under 300ms.
*   **Security**: Encryption of all Patient Health Information (PHI) at rest (AES-256) and in transit (TLS 1.3); strict session timeouts (15 mins); MFA ready.
*   **Accessibility**: Full WCAG 2.1 AA keyboard navigation, contrast settings, and screen-reader support.
*   **Availability**: Deployment architecture targets 99.9% uptime.
*   **Auditability**: Complete audit trail tracking "User, Timestamp, Field, Old Value, New Value, Reason for Change" (21 CFR Part 11 compliant).
*   **Logging**: Standard Winston error logs, security audits, and application telemetry, outputting to console and storage folders.
*   **Backup**: Automated daily database backups with 30-day retention policies; verified cold restore procedures.
*   **Monitoring**: Setup health-check endpoints, database connection telemetry, and immediate alert thresholds for memory limits.
*   **Responsiveness**: Mobile responsive layouts targeting desktop laboratory monitors and diagnostic tablets.

---

### 5. Explicitly Not Part of MVP (Out of Scope)
The following modules are explicitly excluded from the MVP scope to prevent scope creep:
*   **AI Diagnosis**: No automated machine learning diagnosis, prescription checks, or image growth interpretations.
*   **Offline Mode**: The MVP is cloud-dependent. Work offline is buffered in active UI state, but full database offline sync is excluded.
*   **Mobile App**: No native iOS/Android binary packages. The system runs strictly inside responsive web browsers.
*   **Hospital ERP**: No patient room tracking, clinic staff scheduling, or emergency triage modules.
*   **Financial ERP**: No general ledgers, corporate payroll, or tax calculators.
*   **Full Inventory ERP**: No automated warehouse reorder logs or procurement portal pipelines.
*   **Laboratory Analytics Platform**: No advanced business intelligence dashboards or epidemiological trends databases.
*   **Multi-language Support**: English only for MVP. Framework hooks must exist to support localization key files later.
*   **IoT Integration**: No automated refrigerator, incubator, or scale telemetry drivers.
*   **Voice Recognition**: No voice-activated dictation templates for plate observations.

---

### 6. Definition of Production-Ready
The MVP is considered production-ready only when it includes:
1.  **Logging**: Winston-based log collectors writing errors and audits to persistent files.
2.  **Audit Trail**: Read-only tables logging all clinical status changes and result edits.
3.  **Monitoring**: Real-time server diagnostics (CPU, database connection pool, API latency).
4.  **Error Handling**: Global React error boundaries, API try-catch middleware, and client notification toasts.
5.  **Role Security**: Cryptographic JSON Web Tokens (JWT) mapping user permissions dynamically.
6.  **Backup/Restore**: Automatic daily database backups and a documented script for rapid database recovery.
7.  **Deployment Automation**: Dockerfiles, Kubernetes templates, and GitHub Action pipelines.
8.  **Complete Documentation**: 22 approved architecture plans, API schemas, and deployment guides.
9.  **Complete Testing**: Unit, Integration, and Playwright E2E coverage $>80\%$.

---

### 7. MVP Success Criteria
The MVP is considered complete and successful when:
*   ✓ The laboratory can process the complete microbiology workflow (steps 1–18) digitally without physical paper records.
*   ✓ Zero paper registers or spreadsheets are required for tracking cultures and AST results.
*   ✓ Every specimen is traceable from collection through receipts, plate observation readings, and final archival storage.
*   ✓ Reports are generated digitally in PDF format with accurate CLSI/EUCAST AST interpretations.
*   ✓ A complete audit trail exists, capturing all user logins, edits, and validation timestamps.
*   ✓ Role-based permissions are enforced (e.g., Technicians cannot validate reports; Processors cannot enter results).
*   ✓ Automated deployment configurations (Docker) build without error on the deployment target.
*   ✓ All P0 workflows pass UAT (User Acceptance Testing) validation checks.
*   ✓ No Critical or High severity defects remain open before release.

---

### 8. Release Exit Criteria
The MVP cannot be released to production unless the following gate metrics are met:
*   ✓ **Documentation Gate**: All 22 foundation documents are approved.
*   ✓ **UAT Sign-off**: Formal User Acceptance Testing sign-off is completed.
*   ✓ **Security Audit**: Penetration testing and OWASP scans return zero critical vulnerabilities.
*   ✓ **Performance Verified**: API response times under load match SLA benchmarks.
*   ✓ **Backup Verified**: A clean recovery test from backup is executed and validated.
*   ✓ **Monitoring Configured**: Telemetry alert rules are active.
*   ✓ **Defect Gate**: Zero blocker, critical, or high-severity bugs are open in the issue tracker.
*   ✓ **Deployment Guide Complete**: Installation and migration scripts are complete.

---

## Assumptions
*   Clinical validation is restricted to pathologists and laboratory directors.
*   Laboratory hardware assets (printers, barcode readers) use standard keyboard wedge inputs and generic network connections.

---

## Future Enhancements
*   Adding direct integration to VITEK automated AST cabinets.
*   Setting up native HL7 FHIR pipelines for clinical hospital connections.

---

## Review Checklist
- [x] Scope boundary matrix aligns with LIMS product vision.
- [x] Feature priorities P0/P1/P2 are detailed across the 18 steps.
- [x] Non-functional scope metrics are quantitatively specified.
- [x] Release exit gates and success criteria are listed.
- [x] Document follows the LIMS-DOC template structure.
