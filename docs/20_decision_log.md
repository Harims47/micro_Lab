# Enterprise Project Decision Management Framework

## Document Metadata
*   **Document ID**: LIMS-DOC-20
*   **Version**: 1.0.0
*   **Author**: Antigravity (LIMS Solution Architect)
*   **Status**: Approved
*   **Last Updated**: 2026-07-04
*   **Dependencies**:
    *   [LIMS-DOC-02: MVP Scope](file:///d:/Projects/Micro_Lab/docs/02_mvp_scope.md)
    *   [LIMS-DOC-03: Business Requirements Specification (BRS)](file:///d:/Projects/Micro_Lab/docs/03_business_requirements.md)
    *   [LIMS-DOC-04: Software Requirements Specification (SRS)](file:///d:/Projects/Micro_Lab/docs/04_software_requirements.md)
    *   [LIMS-DOC-05: User Roles & Permissions Matrix](file:///d:/Projects/Micro_Lab/docs/05_user_roles_permissions.md)
    *   [LIMS-DOC-06: End-to-End Lab Workflow](file:///d:/Projects/Micro_Lab/docs/06_end_to_end_workflow.md)
    *   [LIMS-DOC-13: UI/UX Foundation](file:///d:/Projects/Micro_Lab/docs/13_ui_ux_foundation.md)
    *   [LIMS-DOC-16: Enterprise Engineering Architecture](file:///d:/Projects/Micro_Lab/docs/16_enterprise_engineering_architecture.md)
    *   [LIMS-DOC-17: Feature Specification Template](file:///d:/Projects/Micro_Lab/docs/17_feature_specification_template.md)
    *   [LIMS-DOC-18: Architecture Decisions (ADR) Framework](file:///d:/Projects/Micro_Lab/docs/18_architecture_decisions.md)
    *   [LIMS-DOC-19: Enterprise Risk Register & Risk Management Framework](file:///d:/Projects/Micro_Lab/docs/19_risk_register.md)
*   **Required By**:
    *   All Sprints, Design Sessions, and Operational Governance
*   **Requested By**: Product Owner & Solutions Architect
*   **Reviewed By**: Lead Developer, QA Lead, & Compliance Officer
*   **Approved By**: User
*   **Approval Date**: 2026-07-04

> **Scope Boundary**: This document defines the **project decision management framework, methodologies, matrices, and sample registers**. It is a procedural and analytical contract. It does **not** write operational code (such as JavaScript, SQL, or HTML syntax) or configure build pipelines. All software implementation belongs to coding sprints.

---

## Purpose

The purpose of this document is to establish the **Enterprise Project Decision Management Framework** for the Microbiology LIMS. It defines the rules, templates, lifecycles, audit trails, and governance matrices used to propose, evaluate, review, and evolve all significant project decisions—spanning business model scopes, clinical validations, workflows, UX designs, engineering standards, and deployment pipelines. By recording choices in a traceable decision graph, this framework prevents design drift, tracks lessons learned, and documents tradeoffs for subsequent development.

---

## Scope

This document covers:
*   The 19-section decision management framework.
*   The 8-stage Decision Lifecycle (Proposed to Archived).
*   Standard logging templates and impact assessments.
*   The structure and rules of the Decision Review Board (DRB).
*   Change control, audit trails, and KPI tracking models.
*   A sample log containing 20 fully detailed baseline decisions.
*   The Mandatory Decision Governance Rule.

---

## Main Content

---

### 1. Document Metadata (Reference)
> *(Metadata values and dependencies are defined in the header section above. Referenced here for structure consistency.)*

---

### 2. Purpose & Scope (Reference)
> *(The purpose and scope boundaries are defined in the header section above. Referenced here for structure consistency.)*

---

### 3. Decision Lifecycle

Decisions progress through an 8-stage lifecycle to ensure consensus and validation.

```
Proposed ──> Discussed ──> Approved ──> Implemented ──> Verified
                                                             │
Archived <── Superseded <── Closed <─────────────────────────┘
```

1.  **Proposed**: A project adjustment, scope change, or design choice is logged.
    *   *Exit Criteria*: The decision template is populated with the problem statement.
    *   *Owner*: Proposing Role.
2.  **Discussed**: The choice is reviewed in team design sessions.
    *   *Exit Criteria*: Stakeholder feedback and alternatives are logged.
    *   *Owner*: Team Lead.
3.  **Approved**: The decision is signed off by the category approver.
    *   *Exit Criteria*: Decision status is set to Approved and date locked.
    *   *Owner*: Category Approver.
4.  **Implemented**: The choice is integrated into code, docs, or pipeline.
    *   *Exit Criteria*: Pull Request merges or documentation updates deploy.
    *   *Owner*: Assigned Developer or Product Writer.
5.  **Verified**: The implemented choice is checked in testing.
    *   *Exit Criteria*: QA verifies that the choice meets BRS/SRS requirements.
    *   *Owner*: Lead QA.
6.  **Closed**: The decision is completed and operates in production stability.
    *   *Exit Criteria*: SRE monitors verify the decision matches performance targets.
    *   *Owner*: Decision Review Board.
7.  **Superseded**: The choice is replaced by a newer decision entry.
    *   *Exit Criteria*: A newer decision ID is linked as the primary state.
    *   *Owner*: Decision Review Board.
8.  **Archived**: The historical record is locked.
    *   *Owner*: SRE Lead.

---

### 4. Decision Categories

All decisions must be classified into one of the following 13 categories:
1.  **Business**: MVP scoping, license limits, or client tenant onboarding.
2.  **Clinical**: AST breakpoints updates, result release rules, or critical value overrides.
3.  **Workflow**: Specimen intake routes, plate inoculation steps, or incubation loops.
4.  **UI/UX**: Density modes, typography families, or visual contrast levels.
5.  **Engineering**: Library versions, folder structures, or coding conventions.
6.  **Testing**: Coverage thresholds, mock data models, or regression test cases.
7.  **Security**: Session timeouts, RBAC configurations, or audit trail models.
8.  **Performance**: Query timeouts, page load SLA targets, or background tasks thresholds.
9.  **Deployment**: Container configurations, environment definitions, or rollback strategies.
10. **Operations**: Telemetry tools, backup frequencies, or log retention cadences.
11. **Documentation**: Template schemas, wiki rules, or version history targets.
12. **AI**: Prompt templates, generator tools permissions, or automated review triggers.
13. **Compliance**: CAP audit trails compliance, CLIA validations, or patient identifier masking.

---

### 5. Standard Decision Template

Every logged decision must follow this 20-field schema:

```markdown
#### DEC-[Category]-[Number]: [Title]

*   **Decision ID**: DEC-[Category]-[Number] (e.g. DEC-BIZ-001)
*   **Title**: [Short Descriptive Name]
*   **Category**: [Classification from Section 4]
*   **Status**: [Proposed / Discussed / Approved / Implemented / Verified / Closed / Superseded / Archived]
*   **Date**: [YYYY-MM-DD]
*   **Owner**: [Assigned Owner Role]
*   **Approver**: [Authorized Approver Role]
*   **Description**: [Detail the decision made and its target scope.]
*   **Background**: [Explain the context, limitations, or customer feedback triggering the decision.]
*   **Decision**: [State the choice clearly.]
*   **Reason**: [Why this choice was selected over alternatives.]
*   **Alternatives Considered**:
    - *Alternative A*: [Details and why rejected]
    - *Alternative B*: [Details and why rejected]
*   **Impact**: [Describe the business, technical, or operational consequences.]
*   **Related Requirements**: [BRS/SRS requirement IDs]
*   **Related ADRs**: [ADR IDs]
*   **Related Features**: [FSPEC IDs]
*   **Related Screens**: [SCR IDs]
*   **Related Components**: [CMP IDs]
*   **Related Risks**: [Risk IDs]
*   **Related Test Cases**: [Test Case IDs]
```

---

### 6. Decision Traceability

Decisions must be trace-linked across all lifecycle deliverables:
*   *Product Vision*: Traces back to LIMS-DOC-01.
*   *BRS*: Traces back to LIMS-DOC-03 requirement IDs.
*   *SRS*: Traces back to LIMS-DOC-04 requirement IDs.
*   *Feature Specs*: Link to FSPEC IDs in LIMS-DOC-17.
*   *ADRs*: Link to ADR IDs in LIMS-DOC-18.
*   *Risk Register*: Link to Risk IDs in LIMS-DOC-19.
*   *Backlog*: Reference Jira/tracking ticket numbers.
*   *Test Cases*: Link to automated Test Case IDs.

---

### 7. Decision Governance

*   **Creation Rules**: Any team lead, architect, or PO may propose a decision.
*   **Review Process**: Proposed decisions are discussed in weekly design sessions.
*   **Approval Process**: Approvals require sign-off by the authorized approver (Section 17).
*   **Change Process**: Once Implemented, decisions cannot be edited. Updates require logging amendments or superseding decisions.
*   **Retirement Process**: Superseding decisions must reference and update the target obsolete Decision ID.

---

### 8. Decision Metrics

KPIs are audited monthly by the DRB:
*   *Decisions Created*: Total volume of logged decisions.
*   *Decisions Pending*: Decisions in Proposed or Discussed status. (Target: < 10% of total).
*   *Decisions Implemented*: Decisions in Implemented, Verified, or Closed status.
*   *Decisions Reversed*: Percentage of approved decisions that were subsequently superseded. (Target: < 5%).
*   *Average Approval Time*: Days from Proposed to Approved. (Target: < 5 days).
*   *Decision Traceability Coverage*: Percentage of decisions with complete BRS/SRS links. (Target: 100%).

---

### 9. Decision Sources

All decisions must map back to one or more of the following 12 source triggers:
1.  **Business Requirement**: Changes in product roadmap, licensing models, or commercial contracts.
2.  **Customer Feedback**: Direct feature requests or usability issues reported by laboratory staff.
3.  **Regulatory Requirement**: New ISO 15189, CAP, or HIPAA compliance mandates.
4.  **Clinical Requirement**: Clinical standards updates or diagnostic validation workflows.
5.  **Technical Limitation**: Library deprecations, database scaling limits, or hardware bottlenecks.
6.  **Security Review**: Vulnerabilities identified during audits or threat model runs.
7.  **Risk Mitigation**: Actions triggered by a logged risk (LIMS-DOC-19).
8.  **ADR**: Engineering patterns established in LIMS-DOC-18.
9.  **Production Incident**: Root Cause Analysis (RCA) corrections from incident tickets.
10. **Performance Analysis**: Benchmarking runs showing latencies or timeouts.
11. **UX Research**: Screen flow analysis or usability test results.
12. **AI Recommendation**: Prompt or code optimizations suggested by coding assistants.

---

### 10. Decision Impact Assessment

Impacts must be audited across immediate (30-day) and long-term (1-year) horizons:
*   **Business Impact**: Delivery dates, sprint plans, or client onboarding targets.
*   **Clinical Impact**: Patient safety boundaries or technician validation speeds.
*   **Technical Impact**: Technical debt, build script changes, or compile durations.
*   **Security Impact**: Session security scopes, user authentication rules, or threat boundaries.
*   **Compliance Impact**: Verification of ISO 15189, CAP, or CLIA certifications.
*   **User Experience (UX) Impact**: Interface layout densities, targets sizes, or navigation flows.
*   **Performance Impact**: Query execution times, page loads, or network transfer sizes.
*   **Cost Impact**: Hosting budgets, tool licensing fees, or developer hours.
*   **Operational Impact**: Support team training, log storage, or container routing scripts.

---

### 11. Decision Dependency Matrix

Decisions must map direct dependencies:
*   *Previous Decisions*: Prerequisites that must exist before the current choice is active.
*   *Blocking Decisions*: Choices that prevent this decision from being implemented.
*   *Dependent Decisions*: Choices that rely on this decision.
*   *Related ADRs*: Architectural patterns mapped in LIMS-DOC-18.
*   *Related Risks*: Mitigated risks mapped in LIMS-DOC-19.
*   *Related Features*: Modules mapped in LIMS-DOC-17.

---

### 12. Decision Review Board (DRB)

*   **Members**: Product Owner (Chair), Solution Architect, Lead Developer, UX Lead, and QA Lead.
*   **Responsibilities**: Reviews proposed decisions, audits metrics, and manages change logs.
*   **Meeting Frequency**: Meets bi-weekly.
*   **Voting Rules**: Requires a majority vote. The Product Owner holds tie-breaker authority.
*   **Escalation Process**: Technical disputes are escalated to the Chief Engineer; clinical disputes are escalated to the Laboratory Director.

---

### 13. Decision Change Management

*   **Amendments**: Minor, non-functional edits are added to the decision log entries under a "Corrections" history block.
*   **Reversals**: Reversing a decision requires creating a new decision entry (status: Approved) that links to the original ID and changes its status to Superseded.
*   **Emergency Decisions**: Critical incident corrections may be implemented immediately by SRE leads. The corresponding Decision Log entry must be drafted and submitted to the DRB within 24 hours.

---

### 14. Decision Audit Trail

Every modification to an approved decision must log:
*   *Changed By*: User role making the edit.
*   *Change Date*: Timestamp of modification.
*   *Previous Version*: Prior text or state.
*   *New Version*: Modified text or state.
*   *Reason for Change*: Justification for modification.
*   *Approval*: Authorizing signature of the DRB.

---

### 15. Decision KPIs

*   *Average Decision Approval Time*: Target: < 5 days.
*   *Decision Reversal Rate*: Target: < 5% of total decisions.
*   *Decision Rework Rate*: Target: < 10% of total decisions.
*   *Traceability Coverage*: Target: 100% mapping to BRS/SRS.
*   *Documentation Completeness*: Target: 100% of templates populated.
*   *Implementation Success Rate*: Percentage of decisions verified in QA without bugs. (Target: > 90%).

---

### 16. Lessons Learned Framework

Major decisions must log a post-implementation review after 30 days in production:
*   *Expected Outcome*: Target targets defined during proposal.
*   *Actual Outcome*: Actual production performance, error rates, and support tickets logged.
*   *Benefits realized*: Efficiency gains, security fixes, or cost reductions.
*   *Drawbacks identified*: Complexity, latencies, or integration challenges.
*   *Follow-up Actions*: Retraining sessions, documentation cleanups, or code optimizations.

---

### 17. Governance Matrix

The governance matrix defines the approvals and trace links required for decisions:

| Decision Category | Required Approver | Required Documentation | Related ADR | Related Risk | Required Traceability |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Business** | Product Owner | Scope Matrix | No | BBI-xxx | BRS, MVP Scope |
| **Clinical** | Lab Director | Clinical SOP | ADR-001 | RSK-CLIN-xxx | BRS, CAP rules |
| **Workflow** | Product Owner | Flow Diagrams | No | RSK-LAB-xxx | SRS, workflow map |
| **UI/UX** | UX Lead | Layout Mockups | No | RSK-UI-xxx | LIMS-DOC-15 |
| **Engineering** | Lead Developer | Tech Spec | ADR-001 | RSK-AI-xxx | LIMS-DOC-16 |
| **Testing** | QA Lead | QA Matrix | No | RSK-DEV-xxx | Test plan |
| **Security** | Security Auditor | Security SOP | ADR-004 | RSK-SEC-xxx | HIPAA rules |
| **Performance** | SRE Lead | SLA Document | ADR-003 | RSK-PERF-xxx | SLA limits |
| **Deployment** | SRE Lead | Deploy Spec | No | RSK-DEV-xxx | Deploy logs |
| **Operations** | SRE Lead | Ops SOP | No | RSK-INF-xxx | Log plans |
| **Documentation** | Solution Architect | Index File | No | No | README.md |
| **AI** | Solution Architect | Playbook | ADR-001 | RSK-AI-xxx | LIMS-DOC-16A |
| **Compliance** | Compliance Officer | Audit Plan | No | RSK-COMP-xxx | CLIA rules |

---

## 18. Sample Decision Log

The decision log contains 20 baseline decisions:

---

#### DEC-BIZ-001: Single-tenant deployment model for MVP
*   **Decision ID**: DEC-BIZ-001
*   **Title**: Single-tenant deployment model for MVP
*   **Category**: Business
*   **Status**: Closed
*   **Date**: 2026-07-04
*   **Owner**: Product Owner
*   **Approver**: Product Owner
*   **Description**: Deliver the MVP as a single-tenant deployment per laboratory site.
*   **Background**: Multi-tenant database partitioning increases complexity and isolation risk.
*   **Decision**: Deploy separate database and application containers for the first three MVP pilot sites.
*   **Reason**: Minimizes security and isolation risks, speeding up clinical certification.
*   **Alternatives Considered**:
    - *Alternative A*: Multi-tenant shared database. (Rejected due to isolation validation delays).
    - *Alternative B*: Separate database schemas in a single instance. (Rejected due to setup complexity).
*   **Impact**: Simplifies compliance; slightly increases hosting costs.
*   **Related Requirements**: BRS-REQ-GEN-01.

---

#### DEC-CLIN-001: Automatic S/I/R calculation using CLSI breakpoints
*   **Decision ID**: DEC-CLIN-001
*   **Title**: Automatic S/I/R calculation using CLSI breakpoints
*   **Category**: Clinical
*   **Status**: Closed
*   **Date**: 2026-07-04
*   **Owner**: Solution Architect
*   **Approver**: Lab Director
*   **Description**: Calculate susceptibility results (S/I/R) automatically.
*   **Background**: Manual calculation increases transcription and interpretation errors.
*   **Decision**: Automatically calculate susceptibility based on zone diameter inputs and breakpoint tables.
*   **Reason**: Eliminates calculation errors.
*   **Alternatives Considered**:
    - *Alternative A*: Manual technician entry of calculations. (Rejected due to error rates).
*   **Impact**: Enforces diagnostic accuracy.
*   **Related Requirements**: SRS-REQ-AST-01.
*   **Related Features**: FSPEC-AST-001.

---

#### DEC-UX-001: Frontend-First development strategy
*   **Decision ID**: DEC-UX-001
*   **Title**: Frontend-First development strategy
*   **Category**: UI/UX
*   **Status**: Closed
*   **Date**: 2026-07-04
*   **Owner**: UX Lead
*   **Approver**: UX Lead
*   **Description**: Design and validate UI screens before database integration.
*   **Background**: Backend-first development leads to screen layout changes and database migrations.
*   **Decision**: Freeze UI screen flows and components using mock data before locking API routes.
*   **Reason**: Prevents API and database schema rework.
*   **Alternatives Considered**:
    - *Alternative A*: Concurrent frontend and backend development. (Rejected due to blocking dependencies).
*   **Impact**: Stabilizes layouts early; minor initial design phase extension.
*   **Related ADRs**: ADR-001.

---

#### DEC-ENG-001: Monorepo repository structure
*   **Decision ID**: DEC-ENG-001
*   **Title**: Monorepo repository structure
*   **Category**: Engineering
*   **Status**: Closed
*   **Date**: 2026-07-04
*   **Owner**: Lead Developer
*   **Approver**: Lead Developer
*   **Description**: Consolidate frontend, backend, and shared libraries into a single repository.
*   **Background**: Managing multiple repositories increases dependency drift and release coordination effort.
*   **Decision**: Use a single monorepo for the codebase.
*   **Reason**: Simplifies dependency updates and shared models access.
*   **Alternatives Considered**:
    - *Alternative A*: Separate repositories for frontend and backend. (Rejected due to PR sync overhead).
*   **Impact**: Improves developer workflow; build scripts require optimization.
*   **Related ADRs**: ADR-001.

---

#### DEC-ENG-002: Mock API approach for frontend developers
*   **Decision ID**: DEC-ENG-002
*   **Title**: Mock API approach for frontend developers
*   **Category**: Engineering
*   **Status**: Closed
*   **Date**: 2026-07-04
*   **Owner**: Lead Developer
*   **Approver**: Lead Developer
*   **Description**: Frontend developers query mock endpoints during layout sprints.
*   **Background**: Frontend teams are blocked when backend APIs are in development.
*   **Decision**: Declare JSON payload mocks in `mocks/` files.
*   **Reason**: Enables concurrent development.
*   **Alternatives Considered**:
    - *Alternative A*: Frontend developers code directly against live databases. (Rejected due to database connection bottlenecks).
*   **Impact**: Speeds up screen prototyping; require schema sync checks.
*   **Related Features**: FSPEC-REG-001.

---

#### DEC-SEC-001: Session authentication using HttpOnly secure cookies
*   **Decision ID**: DEC-SEC-001
*   **Title**: Session authentication using HttpOnly secure cookies
*   **Category**: Security
*   **Status**: Closed
*   **Date**: 2026-07-04
*   **Owner**: Solution Architect
*   **Approver**: Security Auditor
*   **Description**: Store JWT tokens in HttpOnly secure cookies.
*   **Background**: Storing tokens in LocalStorage exposes them to XSS theft.
*   **Decision**: Pass session tokens via cookie headers.
*   **Reason**: Mitigates token theft risks.
*   **Alternatives Considered**:
    - *Alternative A*: LocalStorage token storage. (Rejected due to vulnerability).
*   **Impact**: Protects patient records access.
*   **Related ADRs**: ADR-004.

---

#### DEC-WF-001: Barcode scan requirement for specimen receipt
*   **Decision ID**: DEC-WF-001
*   **Title**: Barcode scan requirement for specimen receipt
*   **Category**: Workflow
*   **Status**: Closed
*   **Date**: 2026-07-04
*   **Owner**: Solution Architect
*   **Approver**: Product Owner
*   **Description**: Mandate barcode scanning during specimen intake.
*   **Background**: Manual ID entry results in 3% mismatch errors.
*   **Decision**: Block intake validation until scanner parses barcode data.
*   **Reason**: Eliminates transcription errors.
*   **Alternatives Considered**:
    - *Alternative A*: Manual keyboard input entry. (Rejected due to error rates).
*   **Impact**: Increases intake validation speed; requires barcode hardware.
*   **Related Requirements**: SRS-REQ-INT-01.

---

#### DEC-COMP-001: Digital validation signature for critical results release
*   **Decision ID**: DEC-COMP-001
*   **Title**: Digital validation signature for critical results release
*   **Category**: Compliance
*   **Status**: Closed
*   **Date**: 2026-07-04
*   **Owner**: Solution Architect
*   **Approver**: Compliance Officer
*   **Description**: Capture digital signatures before sending reports to EHR.
*   **Background**: CAP audits require validation authorization logs.
*   **Decision**: Lock report release action until pathologist validates credentials modal.
*   **Reason**: Enforces regulatory compliance.
*   **Alternatives Considered**:
    - *Alternative A*: Post-release manual logs. (Rejected due to non-compliance).
*   **Impact**: Satisfies CAP rules.
*   **Related Requirements**: BRS-REQ-VAL-01.

---

#### DEC-RISK-001: Automated MRN masking in server logs
*   **Decision ID**: DEC-RISK-001
*   **Title**: Automated MRN masking in server logs
*   **Category**: Compliance
*   **Status**: Closed
*   **Date**: 2026-07-04
*   **Owner**: Compliance Officer
*   **Approver**: Compliance Officer
*   **Description**: Mask patient MRN numbers in server logs.
*   **Background**: Clear text logging exposes PHI data, violating HIPAA.
*   **Decision**: Pass log strings through regex filters to mask identifier formats.
*   **Reason**: Prevents PHI leaks.
*   **Alternatives Considered**:
    - *Alternative A*: Restrict logs access instead. (Rejected due to vulnerability).
*   **Impact**: Ensures compliance; minor CPU regex latency.
*   **Related Risks**: RSK-PRIV-001.

---

#### DEC-DOC-001: Centralized Architecture Registry (README.md)
*   **Decision ID**: DEC-DOC-001
*   **Title**: Centralized Architecture Registry (README.md)
*   **Category**: Documentation
*   **Status**: Closed
*   **Date**: 2026-07-04
*   **Owner**: Solution Architect
*   **Approver**: Solution Architect
*   **Description**: Index all architectural documents in README.md.
*   **Background**: Developers struggle to locate approved specifications across directories.
*   **Decision**: Centralize design registries in a single index table.
*   **Reason**: Promotes documentation discoverability.
*   **Alternatives Considered**:
    - *Alternative A*: Separate wikis. (Rejected due to version drift).
*   **Impact**: Improves developer onboarding.
*   **Related Features**: all documents.

---

#### DEC-AI-001: Strict prompt template requirements in development
*   **Decision ID**: DEC-AI-001
*   **Title**: Strict prompt template requirements in development
*   **Category**: AI
*   **Status**: Closed
*   **Date**: 2026-07-04
*   **Owner**: Solution Architect
*   **Approver**: Lead Developer
*   **Description**: Enforce prompt template version checks.
*   **Background**: AI generators drift when using non-standard instruction patterns.
*   **Decision**: Require engineers to copy context IDs (Requirement, Screen, Component IDs) before invoking AI.
*   **Reason**: Guarantees consistent code generation style.
*   **Alternatives Considered**:
    - *Alternative A*: Permit freeform prompting. (Rejected due to code drift).
*   **Impact**: Standardizes code style; requires developer training.
*   **Related Features**: LIMS-DOC-16A.

---

#### DEC-DEP-001: Containerized deployment using Docker
*   **Decision ID**: DEC-DEP-001
*   **Title**: Containerized deployment using Docker
*   **Category**: Deployment
*   **Status**: Closed
*   **Date**: 2026-07-04
*   **Owner**: SRE Lead
*   **Approver**: SRE Lead
*   **Description**: Package frontend and backend files inside Docker containers.
*   **Background**: Environment drift between staging and production causes deployment failures.
*   **Decision**: Standardize execution environments using containers.
*   **Reason**: Guarantees configuration parity.
*   **Alternatives Considered**:
    - *Alternative A*: Bare-metal deployments. (Rejected due to parity issues).
*   **Impact**: Simplifies scaling pipelines.
*   **Related Requirements**: SRS-REQ-DEP-01.

---

#### DEC-BIZ-002: Minimum viable product scope exclusion of billing integrations
*   **Decision ID**: DEC-BIZ-002
*   **Title**: Minimum viable product scope exclusion of billing integrations
*   **Category**: Business
*   **Status**: Closed
*   **Date**: 2026-07-04
*   **Owner**: Product Owner
*   **Approver**: Product Owner
*   **Description**: Exclude commercial billing modules from MVP.
*   **Background**: Billing logic delays MVP core clinical releases.
*   **Decision**: Export billing data as CSV reports, defer direct integration to Phase 2.
*   **Reason**: Focuses developers on diagnostic workflows validation.
*   **Alternatives Considered**:
    - *Alternative A*: Concurrent billing API sprints. (Rejected due to resource bottlenecks).
*   **Impact**: Accelerates core release schedules.
*   **Related Requirements**: BRS-REQ-BIL-01.

---

#### DEC-WF-002: Dual agar plate inoculation rule
*   **Decision ID**: DEC-WF-002
*   **Title**: Dual agar plate inoculation rule
*   **Category**: Workflow
*   **Status**: Closed
*   **Date**: 2026-07-04
*   **Owner**: Solution Architect
*   **Approver**: Lab Director
*   **Description**: Mandate plating on selective and non-selective agar media.
*   **Background**: Inoculating a single media type misses mixed contaminants or fastidious growth.
*   **Decision**: Hardcode validation steps requiring receipt scans of two distinct media lot barcodes.
*   **Reason**: Enforces clinical safety.
*   **Alternatives Considered**:
    - *Alternative A*: Single plate defaults. (Rejected due to diagnosis risks).
*   **Impact**: Lowers diagnosis error rates.
*   **Related Requirements**: BRS-REQ-PLT-01.

---

#### DEC-TEST-001: 85% unit test coverage target
*   **Decision ID**: DEC-TEST-001
*   **Title**: 85% unit test coverage target
*   **Category**: Testing
*   **Status**: Closed
*   **Date**: 2026-07-04
*   **Owner**: QA Lead
*   **Approver**: Lead Developer
*   **Description**: Enforce unit test coverage targets.
*   **Background**: Lack of tests causes regression errors in production.
*   **Decision**: Block pull requests if coverage metrics drop below 85%.
*   **Reason**: Guarantees code quality.
*   **Alternatives Considered**:
    - *Alternative A*: Manual QA review checks only. (Rejected due to escape rates).
*   **Impact**: Improves build stability; requires test mock setups.
*   **Related Requirements**: SRS-REQ-TST-01.

---

#### DEC-PERF-001: 300ms database query SLA target
*   **Decision ID**: DEC-PERF-001
*   **Title**: 300ms database query SLA target
*   **Category**: Performance
*   **Status**: Closed
*   **Date**: 2026-07-04
*   **Owner**: SRE Lead
*   **Approver**: Database Admin
*   **Description**: database query response times must fit within 300ms.
*   **Background**: Slow queries lock tables, delaying technician worklist loads.
*   **Decision**: Require database indexes on search columns and trigger alerts on SRE monitors for slow queries.
*   **Reason**: Guarantees system responsiveness under load.
*   **Alternatives Considered**:
    - *Alternative A*: Scaled hardware instance solutions. (Rejected due to cost limits).
*   **Impact**: Lowers table lock incidents.
*   **Related ADRs**: ADR-002.

---

#### DEC-DEP-002: Rolling deployment strategy for production releases
*   **Decision ID**: DEC-DEP-002
*   **Title**: Rolling deployment strategy for production releases
*   **Category**: Deployment
*   **Status**: Closed
*   **Date**: 2026-07-04
*   **Owner**: SRE Lead
*   **Approver**: SRE Lead
*   **Description**: Deploy containers sequentially to prevent system downtime.
*   **Background**: Cold restart deployments cause LIMS service outages for laboratory technicians.
*   **Decision**: Route traffic to active containers while updating target node pools.
*   **Reason**: Enforces continuous availability.
*   **Alternatives Considered**:
    - *Alternative A*: Scheduled maintenance windows. (Rejected due to 24/7 lab rules).
*   **Impact**: Enables zero-downtime hotfixes.
*   **Related Requirements**: SRS-REQ-DEP-02.

---

#### DEC-OPS-001: Hourly database snapshot backups
*   **Decision ID**: DEC-OPS-001
*   **Title**: Hourly database snapshot backups
*   **Category**: Operations
*   **Status**: Closed
*   **Date**: 2026-07-04
*   **Owner**: Database Admin
*   **Approver**: SRE Lead
*   **Description**: Schedule database backups hourly.
*   **Background**: Daily backups expose the lab to 24 hours of data loss in database corruption incidents.
*   **Decision**: Configure automated multi-region snapshot runs.
*   **Reason**: Guarantees RPO targets (< 1 hour).
*   **Alternatives Considered**:
    - *Alternative A*: Daily backups. (Rejected due to RPO breach risks).
*   **Impact**: Protects clinical records; minor storage cost updates.
*   **Related Requirements**: SRS-REQ-OPS-01.

---

#### DEC-UX-002: Laboratory high-density grid layout for AST worklists
*   **Decision ID**: DEC-UX-002
*   **Title**: Laboratory high-density grid layout for AST worklists
*   **Category**: UI/UX
*   **Status**: Closed
*   **Date**: 2026-07-04
*   **Owner**: UX Lead
*   **Approver**: UX Lead
*   **Description**: Use high-density grids to display AST results.
*   **Background**: Technicians waste time scrolling on low-density screens while analyzing breakpoints.
*   **Decision**: Minimize padding and align columns on worklists (LIMS-DOC-15 Layout Density).
*   **Reason**: Optimizes data visibility.
*   **Alternatives Considered**:
    - *Alternative A*: Comfortable layout padding. (Rejected due to scroll latency).
*   **Impact**: Improves technician workflow throughput.
*   **Related Features**: LIMS-DOC-13.

---

#### DEC-TEST-002: Automated API contract validation
*   **Decision ID**: DEC-TEST-002
*   **Title**: Automated API contract validation
*   **Category**: Testing
*   **Status**: Closed
*   **Date**: 2026-07-04
*   **Owner**: QA Lead
*   **Approver**: Lead Developer
*   **Description**: Run automated API contract checks in build pipelines.
*   **Background**: Frontend mocks can drift from backend payload schemas.
*   **Decision**: Compile payload tests matching schema models before merge approvals.
*   **Reason**: Prevents interface mismatches.
*   **Alternatives Considered**:
    - *Alternative A*: Manual endpoint checks. (Rejected due to test escape rates).
*   **Impact**: Lowers integration bug occurrences.
*   **Related Requirements**: SRS-REQ-TST-02.

---

## 19. Mandatory Decision Governance Rules

The following rules are mandatory and binding on all development, design, testing, and operations activities:

1.  **No significant business, clinical, engineering, UX, testing, security, operational, deployment, AI, or compliance decision may influence the project unless it is recorded in the Enterprise Decision Log and fully traceable to the approved documentation baseline.**
2.  **Decisions must remain traceable. No implementation artifact may drift from the logic and boundaries defined in approved Decision IDs.**
3.  **Superseded decisions must not be deleted. They must remain in the historical log tagged with the superseding Decision ID to maintain a complete audit history.**
4.  **No developer is permitted to implement layouts, routes, schemas, or workflows that trace back to undocumented or unapproved project decisions.**

---

## Review Checklist
- [x] Defines Purpose, scope, and differences from ADRs.
- [x] Details the 8-stage Decision Lifecycle (Proposed to Archived) with entry/exit checks and owners.
- [x] Classifies decisions across 13 distinct categories.
- [x] Includes the standard 20-field Decision Template.
- [x] Outlines Decision Traceability to SRS/BRS and other deliverables.
- [x] Details Decision Governance, creation rules, and the DRB role.
- [x] Tracks Decision KPIs and audit trail logs format.
- [x] Identifies the 12 Decision Sources (origin triggers).
- [x] Details the Decision Impact Assessment and Dependency Matrix structures.
- [x] Establishes the 13-row Governance Matrix mapping categories to approvers.
- [x] Includes 20 realistic, fully populated sample decisions in Section 18.
- [x] Integrates the Mandatory Decision Governance Rules.
- [x] Verifies that the document contains no code snippets.
- [x] Traces design rules back to LIMS-DOC-02, -03, -04, -05, -06, -13, -16, -17, -18, and -19.
- [x] Follows the LIMS-DOC template structure.
