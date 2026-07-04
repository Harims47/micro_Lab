# AI Development Playbook (Enterprise AI Software Engineering Playbook)

## Document Metadata
*   **Document ID**: LIMS-DOC-16A
*   **Version**: 1.0.1
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
*   **Required By**:
    *   All Future Software Development sprints (Frontend, Backend, Database, QA)
*   **Requested By**: engineering Leadership & Chief Architect
*   **Reviewed By**: Solution Architect & Lead Developer
*   **Approved By**: User
*   **Approval Date**: 2026-07-04

> **Scope Boundary**: This document defines the **governance, templates, lifecycles, and verification frameworks for AI-assisted engineering**. It details how human engineers direct and audit AI-generated designs, database schemas, code, and test packages. It does **not** include programming code (such as JavaScript, TypeScript, or SQL syntax), concrete API credentials, API endpoints configurations, or vendor-specific platform keys. All software code resides in functional code repositories.

---

## Purpose

The purpose of this document is to establish the **Standard Operating Procedure (SOP) for artificial intelligence systems** used throughout the Microbiology LIMS software delivery lifecycle. It provides a repeatable, tool-agnostic framework that guarantees clinical safety, compliance, architectural alignment, and traceability for all AI-assisted engineering tasks, ensuring that AI operates safely as an assistant under human engineering oversight.

---

## Scope

This document covers:
*   Goals, limitations, human responsibilities, and AI governance.
*   AI workflow integrations (Requirements to Maintenance).
*   13 reusable prompt templates for standard engineering tasks.
*   The AI Task Classification, Context Management, and Change Impact Analysis frameworks.
*   AI Quality Gates, Verification Checklists, and Production Readiness.
*   AI Failure Handling, Multi-AI Collaboration protocols, and performance metrics.
*   Prompt versioning policies and governance matrices.
*   Mandatory Project Rules for AI engineering.

---

## Main Content

---

### 1. Purpose & Goals

#### 1.1 Why AI is Used
Artificial Intelligence (AI) is deployed in the Microbiology LIMS project to accelerate development timelines, generate standard test suites, verify documentation consistency, and suggest performance optimizations. The goal is to offload repetitive engineering tasks to AI models, allowing human developers to focus on clinical safety reviews, complex domain logic, and system integration.

#### 1.2 Limitations of AI
AI models are statistical pattern-matching systems. They do not possess clinical domain experience, lack systemic awareness of the overall project state unless explicitly provided in context, and are subject to hallucinations (generating plausible but incorrect code, schemas, or requirements).

#### 1.3 Human Responsibilities
*   **Ultimate Ownership**: Sighted human engineers own all repository merges, code reviews, and production releases. AI is an assistant; the human engineer is legally and operationally responsible.
*   **Verification Obligation**: No AI output may be trusted without manual verification. The engineer must trace every line of code or requirement to check for compliance.
*   **Security Accountability**: Human engineers must ensure no proprietary data or sensitive patient identifiers (PHI) are transmitted to external AI systems.

#### 1.4 Approval Rules
AI-generated specifications or code commits are subject to standard PR review limits (LIMS-DOC-16, Section 15). AI commits must be clearly labeled with an `[AI]` tag in the commit header.

---

### 2. AI Governance

AI governance enforces safe boundaries, ensuring that AI-assisted output does not compromise clinical logic or security controls.

```
+-----------------------------------------------------------+
| AI Permitted Activities                                   |
| - Generate boilerplate components from LIMS-DOC-14 specs  |
| - Generate unit test cases with >85% coverage targets     |
| - Draft API schemas matching REST naming rules            |
+-----------------------------------------------------------+
                             │
                             ▼
+-----------------------------------------------------------+
| Prohibited Activities (Human-Only Boundaries)             |
| - Define diagnostic thresholds or S/I/R rules             |
| - Skip or alter security permissions (LIMS-DOC-05)        |
| - Merge code to target branches without human approval     |
+-----------------------------------------------------------+
```

#### 2.1 Security Restrictions
AI tools must not have direct write access to integration or production environments. AI interaction is confined to local workspaces.

#### 2.2 Clinical Safety Restrictions
No AI system is permitted to define, modify, or override clinical decision rules (such as S/I/R susceptibility breakpoints or specimen rejection thresholds). These rules are established by LIMS-DOC-06 and must be coded exactly as written.

---

### 3. AI Development Workflow

The AI participate-and-audit workflow defines how AI interacts with each engineering stage.

```
Req Analysis ──> Schema/API Draft ──> Code Generation ──> Test Construction
                                                               │
Human Approval <── Security Verification <── Peer Review <── CI/CD Run
```

*   **Requirements**: AI may analyze BRS/SRS text to suggest edge-case scenarios or verify requirement numbering consistency.
*   **Architecture**: AI may suggest modular boundaries or draft ADR templates, which are reviewed by the ARB.
*   **UX Layout**: AI generates layout skeletons based on Layout Patterns A/B/C/D in LIMS-DOC-13.
*   **Database Design**: AI drafts SQL schema structures, foreign key constraints, and migration scripts matching naming rules (LIMS-DOC-16, Section 8).
*   **API Design**: AI drafts API DTO contracts and REST parameters.
*   **Frontend**: AI generates component templates matching LIMS-DOC-14 specs.
*   **Backend**: AI drafts service layers, validators, and repository queries.
*   **Testing**: AI constructs unit test cases and integration mocks.
*   **Documentation**: AI audits markdown tables, updates README linkages, and summarizes code changes.
*   **Deployment**: AI reviews deploy scripts or pipeline manifests for errors.
*   **Maintenance**: AI parses error logs to locate code lines associated with failures.

---

### 4. Prompt Design Standards

To ensure consistent, predictable results, all prompts sent to AI assistants must follow a structured layout.

```
1. SYSTEM CONTEXT (Role, rules, strict implementation boundaries)
   │
2. CONTEXT BINDINGS (Link to LIMS-DOC-04, -06, -13, -13A, -13B, -14, -15, -16)
   │
3. SPECIFIC TASK (Inputs, data parameters, output requirements)
   │
4. CONSTRAINTS (No raw SQL, WCAG AA, technology-agnostic, validation timing)
   │
5. EXPECTED OUTPUT FORMAT (Structured markdown, JSON templates, no conversational fluff)
```

*   **System Context**: Assigns a precise role (e.g. "LIMS Frontend Engineer") and defines the scope boundary rules (e.g. "Do not write framework-specific imports").
*   **Context Bindings**: Explicitly lists the approved dependencies (e.g. Screen IDs, UI States, component rules).
*   **Specific Task**: Clear instruction outlining what to generate or review.
*   **Constraints**: Mandatory rules (e.g. "Must satisfy WCAG 2.1 AA focus trap rules," "No conversational filler text").
*   **Expected Output Format**: Specifies the target template layout.

---

### 5. Standard Prompt Templates

The following templates must be used when prompting AI assistants. They are model-agnostic and focus on structural constraints.

---

#### 5.1 New Feature Prompt Template
```
Role: LIMS Business Analyst
Context:
- BRS ID: [BRS-REQ-XX]
- SRS ID: [SRS-REQ-XX]
- Workflow ID: [WF-XX]
Task: Analyze the requirements for [Feature Name] and generate detailed user stories and acceptance criteria.
Constraints:
- Terminology must match LIMS-DOC-06.
- Do not introduce new specimen states.
- Follow the visual hierarchy principles in LIMS-DOC-15.
Format:
- Story: As a [User Role], I want to [Action], so that [Value].
- Acceptance Criteria: Given [Context], When [Action], Then [Result].
```

---

#### 5.2 Bug Fix Prompt Template
```
Role: LIMS Debugging Assistant
Context:
- Error Code: [ERR-XX]
- Screen ID: [SCR-XX]
- Relevant Code File: [Link/Path]
Task: Identify the cause of the bug where [Describe Symptom] and propose a resolution.
Constraints:
- Resolution must respect the Error Handling Strategy of LIMS-DOC-16, Section 11.
- Do not bypass database referential integrity or tenant partitioning controls.
Format:
- Root Cause Analysis: [Description]
- Proposed Resolution: [Technology-agnostic step-by-step fix]
- Test Verification plan: [Unit test parameters]
```

---

#### 5.3 Refactoring Prompt Template
```
Role: Code Quality Engineer
Context:
- Code File: [Link/Path]
- Target Principle: [e.g. DRY / SOLID Dependency Inversion]
Task: Refactor the provided code block to improve maintainability.
Constraints:
- Do not alter functional business logic.
- Verify that unit test coverage is maintained.
- Do not introduce new external library dependencies.
Format:
- Code Changes: [Diff block]
- Justification: [Explain how SOLID or DRY is improved]
```

---

#### 5.4 Documentation Prompt Template
```
Role: LIMS Documentation Specialist
Context:
- Code/Schema Change: [Describe change]
- Affected Document: [LIMS-DOC-XX]
Task: Update the markdown document to reflect the change.
Constraints:
- Follow the standard LIMS-DOC template structure.
- Maintain index links in README.md.
Format:
- Markdown updates: [Diff block]
- Revision History update: [Table row entry]
```

---

#### 5.5 Code Review Prompt Template
```
Role: Senior LIMS Architect Reviewer
Context:
- Pull Request Diff: [Diff block]
- LIMS-DOC-16 (Enterprise Engineering Architecture)
Task: Review the changes for compliance with engineering standards.
Constraints:
- Check for security boundaries, tenant partitioning, and audit fields.
- Check for performance SLA thresholds.
- Verify naming conventions.
Format:
- Compliance Check: [Pass/Fail list]
- Violations: [List of lines and issues]
- Suggestions: [Recommended fixes]
```

---

#### 5.6 Test Generation Prompt Template
```
Role: LIMS QA Automation Engineer
Context:
- Component/Function Spec: [Spec/Code]
- Test Type: [Unit / Integration / E2E]
Task: Construct automated test scenarios for the component.
Constraints:
- Target line coverage > 85%.
- Cover boundary conditions, empty values, and error states.
- Accessibility tests must verify keyboard path cycles.
Format:
- Test Cases: [Test specifications]
- Mock Data: [JSON structures]
```

---

#### 5.7 Database Design Prompt Template
```
Role: LIMS Database Architect
Context:
- Module: [Module Name]
- Business Requirements: [BRS-REQ-XX]
Task: Draft a relational schema design for the module data entities.
Constraints:
- Follow database naming standards (lowercase snake_case).
- Enforce schema separation and multi-tenancy columns.
- Every table must include audit fields and soft-delete columns.
Format:
- Table Definitions: [Columns, types, constraints, indexes]
- Relationships: [Foreign key definitions]
```

---

#### 5.8 API Design Prompt Template
```
Role: LIMS REST API Designer
Context:
- Resource Name: [Resource]
- User Role permissions: [LIMS-DOC-05]
Task: Design REST API endpoints for the resource.
Constraints:
- Use plural kebab-case paths.
- Define request and response JSON schemas.
- Follow the API error model in LIMS-DOC-16, Section 7.
Format:
- Endpoints: [Method + Path]
- Parameters: [Query, Path, Headers]
- Payloads: [Request/Response schemas]
```

---

#### 5.9 UI Screen Prompt Template
```
Role: LIMS Frontend Designer
Context:
- Screen ID: [SCR-XX]
- Layout Pattern: [A / B / C / D]
- Theme Tokens: [LIMS-DOC-15]
Task: Design the visual layout skeleton for the screen.
Constraints:
- Enforce the selected layout density standards (Section 22).
- Place context bar and breadcrumbs correctly.
Format:
- Wireframe layout structure: [Section map]
- Component composition tree: [CMP mappings]
```

---

#### 5.10 Component Prompt Template
```
Role: LIMS Reusable Component Engineer
Context:
- Component ID: [CMP-XX]
- UI States: [LIMS-DOC-13A]
- Interaction Patterns: [LIMS-DOC-13B]
Task: Design the state interface and interaction rules for the component.
Constraints:
- No framework-specific imports.
- Must verify WCAG 2.1 AA keyboard navigation.
Format:
- States Map: [Visual behaviors per state]
- Interaction Map: [Triggers and outputs]
```

---

#### 5.11 Workflow Prompt Template
```
Role: LIMS Clinical Workflow Architect
Context:
- Workflow Stage: [WF-XX]
- Specimen Status: [LIMS-DOC-13A]
Task: Define the state transition rules and validation rules for the workflow stage.
Constraints:
- Map exit and entry criteria.
- Enforce clinical safety rules (Section 28).
Format:
- State Transitions: [From -> To]
- Validations: [Rules and exception codes]
```

---

#### 5.12 Security Review Prompt Template
```
Role: Secure Software Auditor
Context:
- PR Diff: [Diff block]
- LIMS-DOC-05 (User Roles & Permissions Matrix)
Task: Review the changes for security vulnerabilities.
Constraints:
- Check for JWT verification bypasses.
- Verify authorization permissions on all entry routes.
- Detect secrets in code.
Format:
- Vulnerability Log: [List of lines and risk levels]
- Mitigation Action: [Remediation instructions]
```

---

#### 5.13 Performance Review Prompt Template
```
Role: LIMS Database Tuning Specialist
Context:
- Query/Function: [Code/Query]
- Performance SLA: [LIMS-DOC-16, Section 13]
Task: Analyze the code/query for performance bottlenecks.
Constraints:
- Enforce pagination limits.
- Check index utilization.
- Detect slow loops or redundant network queries.
Format:
- Bottleneck Log: [List of issues]
- Optimization Proposal: [Recommended structural changes]
```

---

### 6. AI Review Process

Every AI-generated output is treated as unverified. It must undergo 5 distinct peer review gates before merging:

*   **Architecture Review**: Evaluates that the AI-generated design fits into the layered folder structures (LIMS-DOC-16) and does not bypass modular boundaries.
*   **Clinical Review**: Performed by the Senior Microbiologist. Verifies that no clinical rules, susceptibility calculations, or status names are altered.
*   **Security Review**: Checks that role-based permissions are enforced and no data inputs bypass verification guards.
*   **Accessibility Review**: Verifies keyboard focus path cycles and that elements remain WCAG AA compliant.
*   **Performance Review**: Verifies that page loads, queries, and reports fit within the SLA thresholds.

---

### 7. AI Quality Gates

Before an AI-generated PR can be accepted, the engineer must prove that the code satisfies the following criteria:

- [ ] **Requirements Satisfied**: Every SRS requirement is traced to a corresponding validation test case.
- [ ] **Traceability Maintained**: Commit messages and header metadata links reference the correct Requirement, Workflow, and Component IDs.
- [ ] **No Undocumented Behavior**: The code does not introduce new features, database tables, or component styles that lack approved design specifications.
- [ ] **Accessibility Checked**: Visual contrast meets limits and ARIA labels are present.
- [ ] **Security Reviewed**: Token authentication is verified at the routing boundary.
- [ ] **Tests Generated**: Unit test coverage is verified above 85%.
- [ ] **Documentation Updated**: Relevant markdown documents and registry entries are updated in the repository.

---

### 8. AI Verification Checklists

#### 8.1 Documentation Verification Checklist
- [ ] Document ID format matches LIMS-DOC-XX.
- [ ] Dependencies list points to valid file links.
- [ ] Checklists are marked complete.
- [ ] The README file table is updated with current states.

#### 8.2 Frontend Verification Checklist
- [ ] Layout matches the assigned Layout Pattern (A, B, C, D).
- [ ] Touch targets are at least 44x44px.
- [ ] Focus ring is visible.
- [ ] Clean/Dirty form states behave per LIMS-DOC-13A.

#### 8.3 Backend Verification Checklist
- [ ] API endpoints use kebab-case plural naming.
- [ ] Correlation IDs are mapped in all JSON logs.
- [ ] Database access passes through repository interfaces.
- [ ] Error payloads format matches standard schemas.

#### 8.4 Database Verification Checklist
- [ ] Tables use lowercase snake_case plural naming.
- [ ] Audit columns and tenant ID columns are populated.
- [ ] Foreign keys define no cascades.
- [ ] Migrations run cleanly.

#### 8.5 Testing Verification Checklist
- [ ] Unit tests execute with no errors.
- [ ] Edge cases (empty arrays, null fields, error boundaries) are covered.
- [ ] Code coverage is above 85%.
- [ ] Mock structures match the active API payload schemas.

#### 8.6 Bug Fix Verification Checklist
- [ ] The root cause is identified and linked to an error code.
- [ ] Regression testing confirms no existing workflows are broken.
- [ ] Security boundaries are verified.

---

### 9. AI Failure Handling

If an AI assistant generates incorrect output, the human engineer must execute the following recovery protocol:

*   **Hallucinations (Fictional rules/code)**: Reject the code block immediately. Re-prompt the AI by pasting the approved source document (e.g. LIMS-DOC-06) and directing it to stick to the text.
*   **Conflicting Requirements**: If the AI introduces requirements that deviate from BRS/SRS files, delete the changes. Re-prompt with: "Your suggestion conflicts with [LIMS-DOC-XX, Section YY]. Revert to the approved specification."
*   **Insecure Code (RBAC bypass)**: Reject the PR. Log the security breach in the technical debt registry. Re-prompt specifying the authorization rules in LIMS-DOC-05.
*   **Duplicate Components**: If the AI attempts to write a custom component that matches an existing one in LIMS-DOC-14, delete the code. Force the AI to reference the existing component by ID (e.g. "Use CMP-408 status badge").
*   **Architecure Breakage**: If the AI places data access code in the presentation layer, delete the code. Re-prompt with the Layered Architecture definitions (LIMS-DOC-16, Section 5).

---

### 10. AI Traceability Rules

Every prompt and generated code block must carry metadata linking it back to the approved project IDs:

*   **Prompts**: Must include the context bindings list.
*   **Code Headers**: Every AI-generated file must begin with a metadata comment header block:
    ```
    /**
     * [AI-GENERATED]
     * Traced Requirements: SRS-REQ-XX, WF-XX, SCR-XX, CMP-XX
     * Verification Checklists: IP-FORM-XX, LIMS-DOC-13A
     */
    ```
*   **Commit Messages**: Commits containing AI-generated artifacts must use the `[AI]` tag in the header.

---

### 11. Prompt Versioning

Prompt templates are version-controlled assets stored in the `docs/templates/` folder:

*   **Draft**: Prompt is being designed and tested locally.
*   **Approved**: Prompt has passed verification and is approved for team-wide use.
*   **Deprecated**: Prompt is marked for removal due to changes in architecture or tooling.
*   **Archived**: Prompt is retired and moved to long-term storage.

---

### 12. AI Security & Safety Rules

Prohibited AI behaviors that must be caught during human audit:
*   **No Fictional Rules**: AI must never invent business rules.
*   **No Gate Bypassing**: AI must not skip approval or review checks.
*   **No Architecture Bypassing**: AI must not bypass layered boundaries or modular partitions.
*   **No Code Injection**: AI must not import undocumented third-party libraries.
*   **No Clinical Decision Changes**: AI must not modify AST calculations, MIC classifications, or organism nomenclature.

---

### 13. Multi-AI Collaboration

To ensure consistency when utilizing multiple AI models:

```
[Primary Developer AI] (Generates design, code, or test suite)
        │
        ▼
[Secondary Auditor AI] (Checks outputs against LIMS-DOC-16 standards)
        │
        ▼
[Human Reviewer] (Performs manual audit, signs off, executes tests)
```

*   **Primary AI**: Used for generation tasks (code, tests, schemas).
*   **Secondary AI**: Used for verification and audit checks (security, accessibility, style checks).
*   **Human Reviewer**: Resolves conflicts between AI outputs and issues final approvals.
*   **Conflict Resolution**: In case of disagreements between AI suggestions, the text of the approved LIMS documentation is the tie-breaker. Human decision is final.

---

### 14. Continuous Improvement

Prompts and checklists are refined based on system retrospectives:
*   **Production Defects**: Every bug is analyzed. If the bug was caused by an AI-generated file, the prompt template is updated to add checks to prevent the issue.
*   **Retrospectives**: The engineering team reviews prompt success metrics monthly to optimize template structures.

---

### 15. Mandatory AI Governance Rule (Reference)
> *(The mandatory governance rule is defined in Section 25 of this document. Referenced here for structure consistency.)*

---

### 16. AI Task Classification Framework

Every AI request must be classified into one of 14 categories before execution:

| Task Category | Expected Inputs | Expected Outputs | Required Documentation | Mandatory Reviewers |
| :--- | :--- | :--- | :--- | :--- |
| **Architecture** | BRS, SRS, LIMS-DOC-16, User Story | Architectural design sketch, ADR drafts | LIMS-DOC-16 | Solution Architect |
| **Documentation** | Code files, schema diffs, system logs | Markdown document updates, index links | LIMS-DOC-11 | Tech Writer / Architect |
| **UI Design** | Screen ID, layout pattern, design tokens | Wireframe coordinates, component trees | LIMS-DOC-13, LIMS-DOC-15 | UX Lead |
| **UX Review** | Mocks, user journeys, interaction patterns | UX audit log, compliance score, fixes | LIMS-DOC-13, LIMS-DOC-13B | UX Lead |
| **Frontend Dev** | Component specs (CMP ID), UI states | Component presentation templates | LIMS-DOC-13A, LIMS-DOC-14 | Lead Frontend dev |
| **Backend Dev** | API DTO, service contracts, query rules | Service classes, database adapters | LIMS-DOC-16 | Lead Backend dev |
| **Database Design** | Entity attributes, relationship rules | Relational schema tables definitions | LIMS-DOC-16 | Database Admin |
| **API Design** | Resource description, REST parameters | Swagger/JSON REST payloads schemas | LIMS-DOC-16 | Lead Backend dev |
| **Testing** | Function specs, testing boundaries | Unit/Integration test cases, mocks | LIMS-DOC-10 | QA Lead |
| **Bug Fix** | Log files, error codes (ERR ID) | Code diff blocks, RCA description | LIMS-DOC-16 | Lead Developer |
| **Refactoring** | Code file, quality target (SOLID/DRY) | Refactored code files, change logs | LIMS-DOC-16 | Lead Developer |
| **Performance** | Code snippets, SLA limits, query trace | Optimization proposals, benchmark logs | LIMS-DOC-16 | Database Admin / SRE |
| **Security** | PR diff files, authorization requirements | Vulnerability report, fix instructions | LIMS-DOC-05 | Security Auditor |
| **DevOps** | Infrastructure context, pipeline description | CI/CD scripts, deployment files | LIMS-DOC-12 | SRE Lead |

---

### 17. AI Context Management

To prevent AI from generating incorrect assumptions, the prompt must include the following context bindings:

*   **Requirement IDs**: Traced BRS/SRS requirements.
*   **Workflow IDs**: Traced workflow stages and business events.
*   **Screen IDs**: Target screen identifiers.
*   **Component IDs**: Reusable components involved.
*   **UI States**: Active UI states.
*   **Interaction Patterns**: User gestures and system responses involved.
*   **Architecture References**: Related layered architecture parameters.
*   **Dependencies**: Intersecting modules and database tables.

---

### 18. AI Confidence & Verification Model

Every AI-generated artifact must include the following metadata section at the top of its file to support human verification:

*   **Confidence Level**: High / Medium / Low (with explanation of why).
*   **Assumptions**: Mapped assumptions made during generation.
*   **Known Limitations**: Scenarios not covered.
*   **Open Questions**: Outstanding questions requiring human input.
*   **Required Manual Verification**: Step-by-step verification instructions.

---

### 19. AI Change Impact Analysis

Before merging AI-generated modifications, the engineer must document the impact on:
*   **Requirements**: Do the changes alter BRS/SRS compliance?
*   **Workflows**: Do the changes affect specimen status transitions?
*   **Screens**: Are screen layouts or navigation links altered?
*   **Components**: Are component properties or compositions modified?
*   **APIs**: Are request/response payloads or REST parameters changed?
*   **Database**: Are schema tables, column types, or indexes modified?
*   **Testing**: Do existing automated tests require updates?
*   **Documentation**: Which documents in `docs/` require updates?

---

### 20. AI Production Readiness Checklist

Before AI-assisted work is signed off, the following must be verified:
- [ ] **Documentation Updated**: Version control files are synchronized.
- [ ] **Traceability Maintained**: Mapped connections in commit logs.
- [ ] **Architecture Respected**: Layered boundaries are intact.
- [ ] **Security Reviewed**: Authentications and validations are verified.
- [ ] **Accessibility Verified**: Keyboard cycles and focus traps are intact.
- [ ] **Tests Prepared**: Test coverage is verified above 85%.
- [ ] **Performance Considered**: SLA targets are checked.
- [ ] **Audit Implications Reviewed**: Updates are logged in audit tables.

---

### 21. AI Knowledge Boundaries

#### 21.1 AI May:
*   **Generate**: Boilerplate code, unit test cases, initial schema drafts, basic document templates.
*   **Review**: Code files for naming violations, security flaws, and performance bottlenecks.
*   **Suggest**: Refactoring optimizations, index additions, and regression test cases.
*   **Refactor**: Clean code structures, extract functions, and apply DRY/SOLID design patterns.
*   **Document**: Summarize code changes and update documentation indices.

#### 21.2 AI May NOT:
*   **Invent Business Rules**: Modify diagnostic parameters or clinical thresholds.
*   **Skip Approvals**: Merge code without review gates.
*   **Ignore Architecture**: Bypass layered folder partitions or dependency rules.
*   **Remove Traceability**: Strip IDs from commit logs or files.
*   **Override Clinical Decisions**: Alter specimen status mappings.
*   **Introduce Undocumented Workflows**: Add features without design sign-off.

---

### 22. AI Collaboration Protocol

When multiple AI models are used:
1.  **Primary AI**: Generates code or designs based on templates.
2.  **Secondary AI**: Reviews generated code for compliance with LIMS-DOC-16.
3.  **Human Reviewer**: Audits both outputs.
4.  **Conflict Resolution**: In case of disagreements, the human engineer decides.
5.  **Final Approval**: The PR requires human approval to merge.

---

### 23. AI Metrics & Continuous Improvement

The engineering team measures AI assistance efficiency monthly using these metrics:
*   **Prompt Success Rate**: Percentage of AI queries that return correct results on the first attempt.
*   **First-Pass Acceptance Rate**: Percentage of AI-generated PRs merged without modifications.
*   **Review Rework Rate**: Percentage of AI code returned for edits during code review.
*   **Defect Escape Rate**: Bugs traced to AI-generated files.
*   **Documentation Accuracy**: Outdated markdown links in AI pull requests.
*   **Time Saved**: Developer-hours saved using AI code generation tools.
*   **Production Defect Correlation**: Correlation between system bugs and AI commits.

---

### 24. AI Governance Matrix

The governance matrix defines the roles, permissions, and requirements for AI-assisted engineering:

| Task Type | Allowed AI Activities | Required Human Review | Required Documentation | Approval Authority |
| :--- | :--- | :--- | :--- | :--- |
| **Architecture** | Suggest layouts, draft ADRs | 100% review | ADR entry | Solution Architect |
| **Requirements** | Suggest scenarios, formatting | 100% review | BRS/SRS update | Product Owner |
| **Database Design**| Draft schema tables | 100% review | Schema document | Database Admin |
| **API Design** | Draft REST models | 100% review | Swagger/JSON spec | Lead Backend dev |
| **UX/UI Layout** | Draft skeletons | 100% review | Layout mockup | UX Lead |
| **Frontend Dev** | Generate components | Code review | LIMS-DOC-14 mapping | Lead Frontend dev |
| **Backend Dev** | Draft logic services | Code review | Integration test case| Lead Backend dev |
| **Testing** | Generate test cases | Test review | Coverage report | QA Lead |
| **Bug Fix** | RCA, suggest fixes | Code review | Bug log entry | Lead Developer |
| **Refactoring** | Clean code structures | Code review | PR description | Lead Developer |
| **DevOps** | Check deploy files | 100% review | Deploy scripts log | SRE Lead |

---

### 25. Mandatory AI Governance Rules

The following rules are mandatory and binding on all development, design, and operations activities:

1.  **Every AI-generated requirement, architecture, workflow, screen, component, API, database object, or implementation must be traceable to approved project documentation, reviewed by a human before acceptance, and verified against architecture, security, quality, and business requirements. AI is an engineering assistant, not the final authority.**
2.  **AI assistants must never be allowed to modify, bypass, or define clinical decision rules, susceptibility calculations, or patient demographic validation constraints. These are human-only domains.**
3.  **All AI-generated code, schemas, and test cases must be checked against the LIMS-DOC-16 Enterprise Engineering Architecture and LIMS-DOC-15 Design System for compliance before merging.**
4.  **No AI tool is permitted to commit code directly to target branches or bypass the two-approver code review requirement.**
5.  **Every AI-generated commit must carry the `[AI]` prefix in the commit header and reference the traced Requirement, Screen, and Component IDs in the metadata comment block.**

---

### 26. AI Deliverable Catalog

The deliverable catalog defines the mandatory technology-agnostic engineering outputs that must be generated for each development activity.

| Activity | Required Deliverables |
| :--- | :--- |
| **Requirement Analysis** | User Stories, Acceptance Criteria, Traceability Matrix |
| **UI Design** | Wireframe, Screen Specification, Component Mapping |
| **Component Development** | Component Spec, State Mapping, Accessibility Checklist |
| **Backend API** | API Contract, Error Contract, Sequence Diagram |
| **Database** | ER Diagram, Migration Plan, Data Dictionary |
| **Testing** | Test Cases, Mock Data, Coverage Report |
| **Bug Fix** | Root Cause Analysis, Fix Plan, Regression Checklist |
| **Release** | Release Notes, Deployment Checklist, Rollback Plan |

---

### 27. AI Prompt Catalog

To maintain prompts as version-controlled engineering assets, all approved prompt templates are registered in this catalog:

| Prompt ID | Purpose | Owner | Version | Status |
| :--- | :--- | :--- | :--- | :--- |
| **AI-P-001** | New Feature Generation | Product / Architecture | 1.0 | Approved |
| **AI-P-002** | Bug Fix & Root Cause Analysis | Engineering / Support | 1.0 | Approved |
| **AI-P-003** | Code Refactoring | Engineering | 1.0 | Approved |
| **AI-P-004** | Document Updates | Product / Architecture | 1.0 | Approved |
| **AI-P-005** | Code Review & Audit | Architecture | 1.0 | Approved |
| **AI-P-006** | Test Cases Construction | Quality Assurance | 1.0 | Approved |
| **AI-P-007** | Database Schema Drafting | Database Admin | 1.0 | Approved |
| **AI-P-008** | REST API Contract Drafting | Backend Engineering | 1.0 | Approved |
| **AI-P-009** | UI Screen Layout Skeleton | Frontend Engineering | 1.0 | Approved |
| **AI-P-010** | Reusable Component Specs | Frontend Engineering | 1.0 | Approved |
| **AI-P-011** | Workflow State Transition Logic | Architecture | 1.0 | Approved |
| **AI-P-012** | Security Vulnerability Review | Security Auditor | 1.0 | Approved |
| **AI-P-013** | Performance & SLA Analysis | SRE / Database Admin | 1.0 | Approved |

---

---

## Review Checklist
- [x] Defines Purpose, goals, limitations, and human responsibilities for AI use.
- [x] Establishes AI Governance, allowed/prohibited domains, and security/safety limits.
- [x] Details AI Workflow integrations across all engineering stages.
- [x] Defines Prompt Design Standards (structure, context, outputs).
- [x] Includes 13 Standard Prompt Templates covering common development tasks.
- [x] Details the AI Review Process and Quality Gates.
- [x] Provides 6 AI Verification Checklists (Docs, Frontend, Backend, DB, Tests, Bug Fixes).
- [x] Defines AI Failure Handling procedures.
- [x] Establishes AI Traceability metadata header standards.
- [x] Outlines Prompt Versioning policies.
- [x] Integrates Multi-AI Collaboration protocols and conflict resolution rules.
- [x] Details the AI Task Classification Framework for 14 categories.
- [x] Specifies AI Context Management and the Confidence Verification model.
- [x] Details AI Change Impact Analysis and Production Readiness checks.
- [x] Establishes AI Knowledge Boundaries (what AI may and may not do).
- [x] Outlines AI Metrics and continuous improvement rules.
- [x] Provides the AI Governance Matrix mapping task permissions.
- [x] Integrates the Mandatory AI Governance Rules.
- [x] Verifies that the document contains no code, SDK scripts, or credentials.
- [x] Traces design rules back to LIMS-DOC-05, -06, -13, -13A, -13B, -14, -15, and -16.
- [x] Follows the LIMS-DOC template structure.
- [x] Defines mandatory deliverables per development activity in the AI Deliverable Catalog (Section 26).
- [x] Registers and versions the 13 prompt templates in the AI Prompt Catalog (Section 27).

---

## Revision History

| Version | Date | Author | Change Summary |
| :--- | :--- | :--- | :--- |
| **1.0.0** | 2026-07-04 | Antigravity | Initial draft of the complete Enterprise AI Software Engineering Playbook containing 25 governance, workflow, and safety sections. |
| **1.0.1** | 2026-07-04 | Antigravity | Added two new sections per review comments: (Section 26) AI Deliverable Catalog mapping mandatory outputs; (Section 27) AI Prompt Catalog registering prompt templates as versioned assets. Version bumped to 1.0.1 and marked Approved. |
