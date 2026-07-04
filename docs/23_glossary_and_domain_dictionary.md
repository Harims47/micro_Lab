# Enterprise Clinical Language Standard (Glossary & Domain Dictionary)

## Document Metadata
*   **Document ID**: LIMS-DOC-23
*   **Version**: 1.0.0
*   **Author**: Antigravity (LIMS Solution Architect)
*   **Status**: Approved
*   **Last Updated**: 2026-07-04
*   **Dependencies**:
    *   [LIMS-DOC-03: Business Requirements Specification (BRS)](file:///d:/Projects/Micro_Lab/docs/03_business_requirements.md)
    *   [LIMS-DOC-04: Software Requirements Specification (SRS)](file:///d:/Projects/Micro_Lab/docs/04_software_requirements.md)
    *   [LIMS-DOC-05: User Roles & Permissions Matrix](file:///d:/Projects/Micro_Lab/docs/05_user_roles_permissions.md)
    *   [LIMS-DOC-06: End-to-End Lab Workflow](file:///d:/Projects/Micro_Lab/docs/06_end_to_end_workflow.md)
    *   [LIMS-DOC-13: UI/UX Foundation](file:///d:/Projects/Micro_Lab/docs/13_ui_ux_foundation.md)
    *   [LIMS-DOC-14: Component Library Specs](file:///d:/Projects/Micro_Lab/docs/14_component_library.md)
    *   [LIMS-DOC-16: Enterprise Engineering Architecture](file:///d:/Projects/Micro_Lab/docs/16_enterprise_engineering_architecture.md)
    *   [LIMS-DOC-17: Feature Specification Template](file:///d:/Projects/Micro_Lab/docs/17_feature_specification_template.md)
    *   [LIMS-DOC-18: Architecture Decisions (ADR) Framework](file:///d:/Projects/Micro_Lab/docs/18_architecture_decisions.md)
    *   [LIMS-DOC-19: Enterprise Risk Register & Risk Management Framework](file:///d:/Projects/Micro_Lab/docs/19_risk_register.md)
    *   [LIMS-DOC-21: Screen Inventory & Navigation Registry](file:///d:/Projects/Micro_Lab/docs/21_screen_inventory.md)
    *   [LIMS-DOC-22: MVP Backlog & Release Planning Framework](file:///d:/Projects/Micro_Lab/docs/22_mvp_backlog.md)
*   **Required By**:
    *   All Requirements, Screen Designs, API Schemas, Database Models, Test Cases, and AI Agents
*   **Requested By**: Laboratory Director & Chief Compliance Officer
*   **Reviewed By**: Solution Architect, Lead Developer, & Lead Pathologist
*   **Approved By**: User
*   **Approval Date**: 2026-07-04

> **Scope Boundary**: This document defines the **clinical glossary, naming rules, controlled vocabularies, code standards, data dictionary guidelines, and localization rules**. It is a semantic and structural contract. It does **not** contain software programming code (such as JavaScript variables, SQL schemas, or HTML localized translations) or config settings. All technical implementations belong to execution sprints.

---

## Purpose

The purpose of this document is to establish the **Enterprise Clinical Language Standard** for the Microbiology LIMS. It serves as the single source of truth for all clinical, laboratory, workflow, regulatory, and technical terminology. By standardizing taxonomies, database naming conventions, API contracts, screen inventories, and test case descriptions, this standard prevents semantic drift, protects patient safety from translation errors, and guides human engineers and AI assistants to produce compliant software.

---

## Scope

This document covers:
*   Standard Naming Conventions (Database, API, Frontend, Reports, Docs, Tests).
*   The Abbreviation Dictionary.
*   The Unified Clinical Glossary mapping definitions, business/clinical meanings, and forbidden terms across 6 categories.
*   Controlled Vocabulary and Clinical Code identifier standards.
*   Data Dictionary and Localization standards.
*   Terminology Governance and Forbidden Terminology registries.
*   The Cross Reference Matrix and AI Language Standards.
*   The Mandatory Terminology Governance Rule.

---

## Main Content

---

### 1. Document Metadata (Reference)
> *(Metadata values and dependencies are defined in the header section above. Referenced here for structure consistency.)*

---

### 2. Purpose & Scope (Reference)
> *(The purpose and scope boundaries are defined in the header section above. Referenced here for structure consistency.)*

---

### 3. Technical Naming Standards

To ensure semantic parity between code and requirements, all engineering artifacts must follow these naming patterns:

*   **Database (snake_case)**:
    - Tables must use plural lowercase nouns grouped by clinical schema (e.g. `clinical.specimens`, `security.users`).
    - Columns must use lowercase singular descriptive nouns (e.g. `accession_id`, `received_at`).
*   **API (kebab-case REST)**:
    - Resource routes must use plural nouns (e.g. `/api/v1/patients`, `/api/v1/specimens/:id/culture-plates`).
    - Query parameters must use snake_case (e.g. `?start_date=2026-07-04`).
*   **Frontend (camelCase & PascalCase)**:
    - React Component files and types must use PascalCase (e.g. `AstMatrixGrid.tsx`, `SpecimenIntakeCard.tsx`).
    - State variables and properties must use camelCase (e.g. `isSpecimenValid`, `selectedOrganism`).
*   **Reports**: PDF files and templates must use UPPERCASE identifiers combined with date stamps (e.g. `PATIENT_DIAGNOSTIC_REPORT_ACC-2026-00045`).
*   **Documentation**: Markdown files must use lowercase snake_case (e.g. `13a_ui_state_dictionary.md`).
*   **Test Cases**: Automated test cases must use module prefixes joined by hyphens (e.g. `TC-AST-005-diffusion`).
*   **Features**: Feature specs must match FSPEC identifiers (e.g. `FEAT-015`).
*   **Requirements**: Requirements must use BRS or SRS codes (e.g. `REQ-SRS-003`).

---

### 4. Abbreviation Dictionary

Every abbreviation used throughout the project is registered below:

| Abbreviation | Expanded Form | System Applicability |
| :--- | :--- | :--- |
| **ADR** | Architecture Decision Record | Technical Governance (LIMS-DOC-18) |
| **API** | Application Programming Interface | Data Transfer Layers (LIMS-DOC-16) |
| **ARB** | Architecture Review Board | Technical Approval Quorum |
| **AST** | Antibiotic Susceptibility Testing | Susceptibility Processing (EPIC-009) |
| **BRS** | Business Requirements Specification | Product Scope (LIMS-DOC-03) |
| **CAP** | College of American Pathologists | Regulatory Compliance (LIMS-DOC-19) |
| **CLIA** | Clinical Laboratory Improvement Amendments | Clinical Licensing standards |
| **CLSI** | Clinical and Laboratory Standards Institute | Breakpoint Definitions |
| **CTO** | Chief Technology Officer | Escalation Authority |
| **DDL** | Data Definition Language | Database Migrations |
| **DoD** | Definition of Done | Sprint Quality checklist |
| **DoR** | Definition of Ready | Sprint Planning checklist |
| **DRB** | Decision Review Board | Project Governance (LIMS-DOC-20) |
| **EHR** | Electronic Health Record | Third-party Integrations |
| **E2E** | End-to-End | QA Testing |
| **FSPEC** | Feature Specification | Delivery Contracts (LIMS-DOC-17) |
| **GDPR** | General Data Protection Regulation | Privacy compliance |
| **HIPAA** | Health Insurance Portability and Accountability Act | Protected Health Information rules |
| **JWT** | JSON Web Token | Stateless Authentication (ADR-004) |
| **KPI** | Key Performance Indicator | System and Delivery Metrics |
| **LIMS** | Laboratory Information Management System | Project Target Platform |
| **MALDI-TOF** | Matrix-Assisted Laser Desorption/Ionization Time-of-Flight | Organism ID Instrumentation |
| **MIC** | Minimum Inhibitory Concentration | AST susceptibility methods |
| **MFA** | Multi-Factor Authentication | Security Gateways |
| **MRN** | Medical Record Number | Patient Demographics |
| **MVP** | Minimum Viable Product | Core Release target |
| **PDF** | Portable Document Format | Reports compilation |
| **PHI** | Protected Health Information | Patient demographic masking |
| **PO** | Product Owner | Backlog authority |
| **PR** | Pull Request | Code integration Review |
| **QA** | Quality Assurance | System Testing |
| **QC** | Quality Control | Media and Reagent validation |
| **RBAC** | Role-Based Access Control | Security Permissions Matrix |
| **RCA** | Root Cause Analysis | Incident Resolution (LIMS-DOC-19) |
| **RPN** | Risk Priority Number | Risk assessment scoring |
| **RPO** | Recovery Point Objective | Business continuity SLA |
| **RTO** | Recovery Time Objective | Business continuity SLA |
| **SaaS** | Software as a Service | Deployment Architecture |
| **S/I/R** | Susceptible, Intermediate, Resistant | Susceptibility interpretations |
| **SLA** | Service Level Agreement | System Performance Targets |
| **SOP** | Standard Operating Procedure | Lab operational guides |
| **SRS** | Software Requirements Specification | System Requirements (LIMS-DOC-04) |
| **TAT** | Turnaround Time | Diagnostic metric |
| **UAT** | User Acceptance Testing | Usability validation |
| **UPS** | Uninterruptible Power Supply | Hardware business continuity |
| **WORM** | Write Once, Read Many | Database Backups (LIMS-DOC-19) |

---

### 5. Unified Clinical Glossary

The clinical glossary defines the official language baseline for all modules:

---

#### 5.1 Laboratory Terms (LAB)

##### Patient
*   **Definition**: The individual receiving clinical diagnostic testing services.
*   **Business Meaning**: The primary record subject in LIMS billing and scheduling.
*   **Clinical Meaning**: The recipient of medical treatment linked to the diagnostic report.
*   **Related Workflow**: WF-004 Patient Intake.
*   **Related Screens**: SCR-020, SCR-021, SCR-023.
*   **Related Features**: FEAT-004, FEAT-005.
*   **Related Components**: CMP-301.
*   **Synonyms**: Case Subject.
*   **Forbidden Terminology**: Client, Customer (when referring to clinical subjects).

##### Specimen
*   **Definition**: Physical biological material collected from a patient for diagnostic analysis.
*   **Business Meaning**: The accessioned asset tracked in chain-of-custody.
*   **Clinical Meaning**: The representative biological sample used to identify pathogens.
*   **Related Workflow**: WF-006 Specimen Receipt.
*   **Related Screens**: SCR-080, SCR-081, SCR-084.
*   **Related Features**: FEAT-007, FEAT-009.
*   **Related Components**: CMP-301.
*   **Synonyms**: Sample Tube.
*   **Forbidden Terminology**: Biological Item.

##### Sample
*   **Definition**: A portion or aliquot derived from a specimen (e.g. subculture isolates).
*   **Business Meaning**: Sub-aliquots mapped to specific test benches.
*   **Clinical Meaning**: The isolate target processed on inoculations agar media.
*   **Related Workflow**: WF-008 Media Allocation.
*   **Related Screens**: SCR-130.
*   **Related Features**: FEAT-010.
*   **Synonyms**: Aliquot, Isolate.
*   **Forbidden Terminology**: Tube (interchangeably with Specimen).

##### Culture
*   **Definition**: The growth of microorganisms on agar media plates or broths.
*   **Business Meaning**: The operational test panel containing growth observation logs.
*   **Clinical Meaning**: Diagnostic method used to isolate viable pathogens.
*   **Related Workflow**: WF-008, WF-009, WF-010.
*   **Related Screens**: SCR-131, SCR-132, SCR-133.
*   **Related Features**: FEAT-011, FEAT-012, FEAT-013.
*   **Synonyms**: Growth run.
*   **Forbidden Terminology**: Planting (to describe the culture object).

##### Media
*   **Definition**: Nutritive substances used to support growth (e.g. Blood Agar).
*   **Business Meaning**: Inventory items tracked by media lot codes.
*   **Clinical Meaning**: Selective or differential growth substrates.
*   **Related Workflow**: WF-008 Media Allocation.
*   **Related Screens**: SCR-130.
*   **Related Features**: FEAT-010.
*   **Synonyms**: Agar.
*   **Forbidden Terminology**: Growth stuff.

##### Plate
*   **Definition**: The specific container of agar media inoculated with a specimen.
*   **Business Meaning**: Barcoded containers tracked inside incubators.
*   **Clinical Meaning**: Inoculated agar dish observed for colony growth.
*   **Related Workflow**: WF-008.
*   **Related Screens**: SCR-131, SCR-133.
*   **Related Features**: FEAT-011.
*   **Synonyms**: Dish.

##### Broth
*   **Definition**: Liquid growth medium used to support bacterial suspension.
*   **Related Workflow**: WF-008.
*   **Related Screens**: SCR-130.
*   **Synonyms**: Liquid medium.

##### Colony
*   **Definition**: A visible cluster of microorganisms grown from a single mother cell.
*   **Clinical Meaning**: Pure isolates used for AST and identification.
*   **Related Workflow**: WF-010.
*   **Related Screens**: SCR-134.
*   **Synonyms**: Clone.

##### Pure Culture
*   **Definition**: A culture containing only a single species of microorganism.
*   **Clinical Meaning**: Requirement before executing AST breakpoints checks.
*   **Related Workflow**: WF-010.
*   **Related Screens**: SCR-134.
*   **Synonyms**: Clean growth.
*   **Forbidden Terminology**: Single bug.

##### Mixed Growth
*   **Definition**: A culture containing multiple distinct species of microorganisms.
*   **Clinical Meaning**: Indicates a polymicrobial specimen or contamination.
*   **Related Workflow**: WF-010.
*   **Related Screens**: SCR-133.
*   **Synonyms**: Polymicrobial.

##### Contamination
*   **Definition**: Accidental introduction of foreign organisms into a culture plate.
*   **Business Meaning**: Operational fail mapped to rejections logs.
*   **Clinical Meaning**: Invalid growth source that must be filtered from final report results.
*   **Related Workflow**: WF-010.
*   **Related Screens**: SCR-133.
*   **Synonyms**: Contaminant.
*   **Forbidden Terminology**: Dirty plate.

##### Incubation
*   **Definition**: Maintaining controlled environmental conditions (temp, atmosphere) to support growth.
*   **Business Meaning**: Timer-controlled storage inside incubator slots.
*   **Clinical Meaning**: Period required to grow pathogens to detectable thresholds.
*   **Related Workflow**: WF-009 Incubation start.
*   **Related Screens**: SCR-132.
*   **Related Features**: FEAT-012.
*   **Synonyms**: Warm storage.

##### Observation
*   **Definition**: Periodic scientific evaluation of culture growth properties.
*   **Business Meaning**: Manual worksheet entry screen.
*   **Clinical Meaning**: morphologic growth logs used to identify clinical pathogens.
*   **Related Workflow**: WF-010.
*   **Related Screens**: SCR-133.
*   **Related Features**: FEAT-013.
*   **Synonyms**: Reading, Plate observation.

##### Subculture
*   **Definition**: Transferring microorganisms from an active plate to fresh media.
*   **Business Meaning**: Creating a child plate barcoded node.
*   **Clinical Meaning**: Method to isolate pure colonies.
*   **Related Workflow**: WF-010.
*   **Related Screens**: SCR-134.
*   **Synonyms**: Re-plating.

##### Identification
*   **Definition**: Determining the specific genus and species name of a pathogen.
*   **Business Meaning**: Workbench entry matched to taxonomy lists.
*   **Clinical Meaning**: Diagnosis indicator that guides target antibiotic select.
*   **Related Workflow**: WF-011.
*   **Related Screens**: SCR-180, SCR-181.
*   **Related Features**: FEAT-014.
*   **Synonyms**: Organism ID.
*   **Forbidden Terminology**: Naming.

##### AST
*   **Definition**: Antibiotic Susceptibility Testing. Measuring pathogen response to antibiotics.
*   **Business Meaning**: Susceptibility matrix grid.
*   **Clinical Meaning**: Guides selection of antibiotics for treatment.
*   **Related Workflow**: WF-012.
*   **Related Screens**: SCR-230, SCR-231.
*   **Related Features**: FEAT-015.
*   **Synonyms**: Sensitivity check.

##### MIC
*   **Definition**: Minimum Inhibitory Concentration. Lowest antibiotic dilution blocking growth.
*   **Clinical Meaning**: Quantitative susceptibilities measure.
*   **Related Workflow**: WF-012.
*   **Related Screens**: SCR-232.
*   **Synonyms**: Dilution limit.

##### Breakpoint
*   **Definition**: CLSI standard zone/MIC value thresholds defining S/I/R categories.
*   **Business Meaning**: Guideline reference database.
*   **Clinical Meaning**: Standard used to translate raw millimeters or dilutions to S/I/R.
*   **Related Workflow**: WF-012.
*   **Related Screens**: SCR-233.
*   **Synonyms**: Range limit.

##### Zone Diameter
*   **Definition**: Millimeters of clear inhibition zone surrounding an antibiotic disk.
*   **Business Meaning**: Cell inputs in AST matrix.
*   **Clinical Meaning**: Measure of organism susceptibility to disk diffusion.
*   **Related Workflow**: WF-012.
*   **Related Screens**: SCR-230.
*   **Related Features**: FEAT-015.
*   **Synonyms**: Millimeters.

##### Quality Control (QC)
*   **Definition**: Running tests on control organisms and media lots to verify accuracy.
*   **Business Meaning**: QC pass/fail logs database.
*   **Clinical Meaning**: Verification step that prevents release of false reports.
*   **Related Workflow**: WF-008.
*   **Related Screens**: SCR-130.
*   **Related Features**: FEAT-010.
*   **Synonyms**: System QC.

##### Reference Strain
*   **Definition**: Standard organism strains with known susceptibility characteristics (e.g. ATCC 25922).
*   **Clinical Meaning**: Quality control benchmark.
*   **Related Workflow**: WF-012.
*   **Related Screens**: SCR-230.
*   **Synonyms**: QC organism.

##### Critical Result
*   **Definition**: A life-threatening diagnostic result requiring immediate physician call-out.
*   **Business Meaning**: Alarm timer and call log sheet.
*   **Clinical Meaning**: Critical alert value (e.g. positive blood culture).
*   **Related Workflow**: WF-013.
*   **Related Screens**: SCR-282.
*   **Synonyms**: Panic value.
*   **Forbidden Terminology**: Urgent result (unmasked).

##### Turnaround Time (TAT)
*   **Definition**: Duration from specimen collection/receipt to final report release.
*   **Business Meaning**: Analytical SLA KPI.
*   **Related Workflow**: WF-017.
*   **Related Screens**: SCR-460.
*   **Synonyms**: Diagnostic delay.

##### Chain of Custody
*   **Definition**: Audited history of specimen transfers.
*   **Business Meaning**: Specimen log history.
*   **Related Workflow**: WF-007.
*   **Related Screens**: SCR-081.
*   **Synonyms**: Transfer history.

---

#### 5.2 Organism Terminology (ORG)

##### Gram Positive
*   **Definition**: Microorganisms retaining crystal violet stain (purple).
*   **Clinical Meaning**: Guide for initial antibiotic selection.
*   **Related Screens**: SCR-133.
*   **Synonyms**: Gram+

##### Gram Negative
*   **Definition**: Microorganisms retaining safranin counterstain (pink).
*   **Related Screens**: SCR-133.
*   **Synonyms**: Gram-

##### Aerobic
*   **Definition**: Microorganisms requiring oxygen to grow.
*   **Related Screens**: SCR-132.
*   **Synonyms**: Oxygen-reliant.

##### Anaerobic
*   **Definition**: Microorganisms that grow only in the absence of oxygen.
*   **Related Screens**: SCR-132.
*   **Synonyms**: Oxygen-intolerant.

##### Facultative
*   **Definition**: Microorganisms capable of growing with or without oxygen.
*   **Related Screens**: SCR-132.

##### Yeast
*   **Definition**: Unicellular fungi.
*   **Related Screens**: SCR-133.

##### Fungus
*   **Definition**: Eukaryotic organisms including yeasts and molds.
*   **Related Screens**: SCR-133.

##### Parasite
*   **Definition**: Organisms living on or in a host.
*   **Related Screens**: SCR-180.

##### Virus
*   **Definition**: Submicroscopic infectious agents.
*   **Related Screens**: SCR-180.

##### Normal Flora
*   **Definition**: Microorganisms normally resident at specific healthy anatomical sites.
*   **Clinical Meaning**: Growth of normal flora indicates no pathogen infection.
*   **Related Screens**: SCR-133.
*   **Synonyms**: Commensal organisms.
*   **Forbidden Terminology**: Germs.

##### Pathogen
*   **Definition**: Microorganisms capable of causing disease.
*   **Clinical Meaning**: Target of AST and identification analysis.
*   **Related Screens**: SCR-180.
*   **Synonyms**: Infectious bug.

##### Opportunistic Pathogen
*   **Definition**: Normal flora that causes disease under immune compromise conditions.
*   **Related Screens**: SCR-180.

---

#### 5.3 Clinical Terms (CLN)

##### Susceptible (S)
*   **Definition**: Pathogen growth is inhibited by normal therapeutic dosages of antibiotic.
*   **Clinical Meaning**: Effective treatment choice option.
*   **Related Screens**: SCR-230.
*   **Synonyms**: Sensitive.

##### Intermediate (I)
*   **Definition**: Pathogen growth is inhibited only by high dosages of antibiotic.
*   **Related Screens**: SCR-230.

##### Resistant (R)
*   **Definition**: Pathogen growth is not inhibited by therapeutic dosages of antibiotic.
*   **Clinical Meaning**: Ineffective treatment choice.
*   **Related Screens**: SCR-230.

##### Confirmed
*   **Definition**: Observation result validated by secondary test runs.
*   **Related Screens**: SCR-181.

##### Rejected
*   **Definition**: Specimen container rejected due to QA fail.
*   **Related Screens**: SCR-083.
*   **Forbidden Terminology**: Binned, Thrown out.

##### Cancelled
*   **Definition**: Order cancelled before plating.
*   **Related Screens**: SCR-052.

##### Released
*   **Definition**: Diagnostic report dispatched to the patient EHR database.
*   **Related Screens**: SCR-320.

##### Validated
*   **Definition**: Report signed off by the medical authority.
*   **Related Screens**: SCR-281.
*   **Forbidden Terminology**: Checked.

##### Verified
*   **Definition**: Technical checks validated by senior technologist.
*   **Related Screens**: SCR-280.

##### Pending
*   **Definition**: Test is actively running.
*   **Related Screens**: SCR-007.

##### Critical
*   **Definition**: Alarm state indicator for positive cultures.
*   **Related Screens**: SCR-282.

---

#### 5.4 Workflow Terms (WF)

##### Order
*   **Definition**: Requisition panel item containing clinical test requests.
*   **Related Screens**: SCR-050.
*   **Forbidden Terminology**: Job.

##### Requisition
*   **Definition**: Requisition document containing clinical data.
*   **Related Screens**: SCR-051.

##### Accession
*   **Definition**: Unique identifier code assigned to specimen containers.
*   **Related Screens**: SCR-080.
*   **Forbidden Terminology**: Specimen tag.

##### Validation
*   **Definition**: Double validation verification loop pre-release.
*   **Related Screens**: SCR-280.

##### Approval
*   **Definition**: Board sign-off on change control assets.
*   **Related Screens**: SCR-432.

##### Release
*   **Definition**: Dispatched report actions.
*   **Related Screens**: SCR-320.

##### Archive
*   **Definition**: Historical log storage state.
*   **Related Screens**: SCR-323.

##### Audit
*   **Definition**: Activity check run.
*   **Related Screens**: SCR-430.

##### Exception
*   **Definition**: Handled operational workflow deviation.
*   **Related Screens**: SCR-083.

##### Incident
*   **Definition**: Realized failure event (e.g. system timeout).
*   **Related Screens**: SCR-430.

##### Deviation
*   **Definition**: Process adjustment logged under approval.
*   **Related Screens**: SCR-432.

##### Correction
*   **Definition**: Typo edit logged in audit trails.
*   **Related Screens**: SCR-323.

---

#### 5.5 Regulatory Terms (REG)

##### ISO 15189
*   **Definition**: Standard governing quality management in medical laboratories.
*   **Related Screens**: SCR-430.

##### CAP
*   **Definition**: College of American Pathologists checklist rules.
*   **Related Screens**: SCR-281.

##### CLIA
*   **Definition**: Clinical Laboratory Improvement Amendments licensing standard.
*   **Related Screens**: SCR-363.

##### HIPAA
*   **Definition**: Health Insurance Portability and Accountability Act.
*   **Related Screens**: SCR-430.

##### GDPR
*   **Definition**: General Data Protection Regulation privacy standard.
*   **Related Screens**: SCR-430.

##### Audit Trail
*   **Definition**: Permanent history logs of database changes.
*   **Related Screens**: SCR-430.

##### Electronic Signature
*   **Definition**: Cryptographic token validating medical approvals.
*   **Related Screens**: SCR-322.
*   **Forbidden Terminology**: Typed name.

##### Retention
*   **Definition**: Mandatory storage duration of clinical records (7 years).
*   **Related Screens**: SCR-323.

---

#### 5.6 System Terms (SYS)

##### Requirement
*   **Definition**: Conceptual business or technical target (LIMS-DOC-03/04).

##### Workflow
*   **Definition**: Action nodes path defined in LIMS-DOC-06.

##### Feature
*   **Definition**: Work package spec defined in LIMS-DOC-17/22.

##### Screen
*   **Definition**: User-facing layout page in LIMS-DOC-21.

##### Component
*   **Definition**: Reusable UI element in LIMS-DOC-14.

##### State
*   **Definition**: Layout variables mapped in LIMS-DOC-13A.

##### Interaction Pattern
*   **Definition**: User interaction rule in LIMS-DOC-13B.

##### API
*   **Definition**: Server connection route in LIMS-DOC-16.

##### Database Entity
*   **Definition**: Database table structures.

##### Event
*   **Definition**: Business messaging broadcast ID.

##### Decision
*   **Definition**: Project choice logged in LIMS-DOC-20.

##### Risk
*   **Definition**: Project threat mapped in LIMS-DOC-19.

##### ADR
*   **Definition**: Architecture pattern record (LIMS-DOC-18).

---

### 6. Controlled Vocabulary Standards

To ensure semantic consistency, the system enforces controlled vocabulary drop-downs on the following fields:

*   **Specimen Types**: `Blood`, `Urine`, `Sputum`, `Wound Swab`, `CSF`, `Stool`, `Synovial Fluid`.
*   **Sample Sources**: `Left arm venous puncture`, `Catheter port`, `Deep cough sputum`, `Lumbar puncture`.
*   **Organism Categories**: `Gram-Positive Bacteria`, `Gram-Negative Bacteria`, `Acid-Fast Bacilli`, `Yeast`, `Mold`, `Parasite`, `Normal Flora`.
*   **Organism Groups**: `Enterobacteriaceae`, `Staphylococci`, `Streptococci`, `Pseudomonads`, `Anaerobes`.
*   **Antibiotic Categories**: `Penicillins`, `Cephalosporins`, `Fluoroquinolones`, `Aminoglycosides`, `Macrolides`, `Carbapenems`.
*   **AST Methods**: `Disk Diffusion`, `MIC Microdilution`, `E-Test Gradient`.
*   **Culture Media**: `Blood Agar`, `Chocolate Agar`, `MacConkey Agar`, `Sabouraud Dextrose Agar`, `Thioglycollate Broth`.
*   **Incubation Conditions**: `Aerobic 35°C`, `Anaerobic 35°C`, `Microaerophilic 35°C`, `CO2 35°C`.
*   **Result Statuses**: `Pristine`, `Growth Logged`, `Identified`, `AST Complete`.
*   **Validation Statuses**: `Technically Validated`, `Medically Approved`.
*   **Report Statuses**: `Compiled`, `EHR Dispatched`, `Corrected`.
*   **Rejection Reasons**: `Inadequate Volume`, `Leaking Container`, `Label Mismatch`, `Improper Transport Temp`.

---

### 7. Clinical Code Standards

All clinical and technical identifiers must follow these formatting syntax rules:

*   **PAT-[Number]**: Patient records: `PAT-` followed by a 10-digit zero-padded integer (e.g. `PAT-0000456123`).
*   **ORD-[Number]**: Requisition orders: `ORD-` followed by an 8-digit zero-padded integer (e.g. `ORD-00054321`).
*   **SPC-[Number]**: Accession specimens: `SPC-` followed by a 4-digit year and a 6-digit incrementing index (e.g. `SPC-2026-000345`).
*   **BAR-[Code]**: Printable barcodes: alphanumeric representation of the accession number (e.g. `BAR-SPC-2026-000345`).
*   **CULT-[Number]**: Culture plate runs: `CULT-` followed by specimen ID and plate index (e.g. `CULT-SPC-2026-000345-01`).
*   **OBS-[Number]**: Observations logs: `OBS-` followed by culture plate ID and date stamp (e.g. `OBS-CULT-2026-000345-01-20260704`).
*   **ORG-[Code]**: Organism identifications: `ORG-` followed by the 4-character genus-species taxonomy code (e.g. `ORG-SAUR` for *Staphylococcus aureus*).
*   **AST-[Code]**: Susceptibility results: `AST-` followed by specimen ID and antibiotic master code (e.g. `AST-SPC-2026-000345-PEN`).
*   **RPT-[Number]**: Diagnostic reports: `RPT-` followed by accession ID and version stamp (e.g. `RPT-SPC-2026-000345-v1`).
*   **QC-[Number]**: Quality control check logs: `QC-` followed by media lot code or reference strain (e.g. `QC-LOT-BA-456`).
*   **AUD-[Number]**: Security audit log rows: `AUD-` followed by a 12-digit incrementing integer.
*   **EVT-[Number]**: Messaging event logs: `EVT-` followed by a 3-digit event category code.
*   **ERR-[Number]**: Error validation codes: `ERR-` followed by a 4-digit numeric code.

---

### 8. Data Dictionary Standards

To maintain database cleanliness, schemas must adhere to these structural naming conventions:
*   **Tables**: Must use plural lowercase nouns grouped by clinical schema (e.g. `clinical.specimens`, `security.users`).
*   **Columns**: Must use lowercase singular descriptive nouns (e.g. `accession_id`, `received_at`).
*   **Primary Keys**: Column name must use the table singular name suffixed with `_id` (e.g. `specimen_id`).
*   **Foreign Keys**: Must match the primary key column name of the source table (e.g. `patient_id` inside `clinical.orders` table).
*   **Enums**: Enums must be defined as distinct database data types named using singular terms (e.g. `specimen_status`).
*   **Status Fields**: Must use singular columns suffixed with `_status` (e.g. `validation_status`).
*   **Audit Columns**: All write tables must include these 4 columns: `created_by`, `created_at`, `updated_by`, `updated_at`.

---

### 9. Localization Standards

Translations must preserve clinical and semantic accuracy:
*   **User-Visible Terminology**: Simplified terminology is permitted only on general dashboards (e.g. using "Pending Tasks" instead of "Unvalidated Specimens").
*   **Internal Terminology**: System code, schemas, and logs must use the exact terms defined in Section 5 (e.g. using `accession_number` inside database parameters).
*   **Medical Terminology**: Clinical result pages must display scientific nomenclatures exactly (e.g. displaying *Escherichia coli*).
*   **Report Terminology**: Printed PDF reports must match international reporting standards. Text must never use slang or shorthand synonyms.
*   **Translation Rule**: Localization files (JSON dictionaries) must map local phrases to the baseline English clinical codes. Direct translations of clinical terms must be verified and signed off by the Laboratory Director to prevent diagnostic translation errors.

---

### 10. Terminology Governance

*   **New Term Request**: Anyone may submit a Terminology Request Form detailing the term, definition, clinical justification, and proposed code mapping.
*   **Review Process**: The ARB weekly audits the request to check for duplicate listings.
*   **Approval Process**: Requires sign-off from the Laboratory Director and Chief Compliance Officer.
*   **Deprecation Process**: Obsolete terms are marked with a "Deprecated" status tag. Deprecated terms remain in database schemas to prevent historical validation failures but are blocked from active user inputs.
*   **Versioning**: Terminology updates increment the major version of this Language Standard (LIMS-DOC-23).

---

### 11. Forbidden Terminology

To prevent diagnostic and processing errors, the following words must never be used in code, forms, logs, or reports:

| Forbidden Term | Preferred Alternative | Justification |
| :--- | :--- | :--- |
| **Urgent** | Critical Result | "Urgent" lacks clinical definition; "Critical Result" triggers standard SLA call limits. |
| **Biological Item** | Specimen | "Biological Item" is ambiguous; "Specimen" defines accession records subjects. |
| **Germs** | Pathogens / Flora | "Germs" is clinically inaccurate and informal. |
| **Dirty Plate** | Contaminated culture | "Dirty" is colloquial; "Contaminated" maps to standard rejection codes. |
| **Binned** | Rejected | "Binned" is slang; "Rejected" triggers HIPAA-compliant disposal logs. |
| **Single bug** | Pure culture | "Single bug" is informal and ambiguous. |
| **Client** | Patient | LIMS subjects are clinical patients, not financial clients. |
| **Checked** | Technically Validated | "Checked" is ambiguous and lacks compliance logging weight. |
| **Typed name** | Electronic Signature | "Typed name" is non-compliant; "Electronic Signature" utilizes crypto tokens. |
| **Job** | Order | "Job" is colloquial; "Order" connects to EHR panel requisitions. |

---

### 12. Cross Reference Matrix

The following matrix maps the terminology domain targets back to requirements, workflows, and screen boundaries:

| Glossary Term | Requirement ID | Workflow ID | Screen ID | Component ID | Feature ID |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Patient** | SRS-005 | WF-004 | SCR-021 | CMP-301 | FEAT-004 |
| **Specimen** | SRS-009 | WF-006 | SCR-080 | CMP-301 | FEAT-007 |
| **Culture** | SRS-012 | WF-008 | SCR-130 | CMP-309 | FEAT-010 |
| **Identification**| SRS-018 | WF-011 | SCR-180 | CMP-309 | FEAT-014 |
| **AST** | SRS-020 | WF-012 | SCR-230 | CMP-804 | FEAT-015 |
| **Validation** | SRS-022 | WF-013 | SCR-280 | CMP-806 | FEAT-016 |
| **Electronic Sign**| SRS-026 | WF-014 | SCR-322 | CMP-808 | FEAT-019 |

---

### 13. AI Language Standards

All AI coding assistants (including Antigravity, Gemini, or Claude developers) must adhere to these language rules:
1.  **AI assistants must never invent new clinical terms, abbreviations, or shorthand code variables that lack validation in this Glossary.**
2.  **AI agents must scan code blocks against Section 11 (Forbidden Terminology) and automatically correct violating names before raising Pull Requests.**
3.  **AI-generated documentation, comments, and test scripts must match the naming standards in Section 3.**

---

## 14. Mandatory Terminology Governance Rules

The following rules are mandatory and binding on all development, design, testing, and operations activities:

1.  **No requirement, feature, workflow, screen, API, database entity, report, test case, documentation, or AI-generated artifact may introduce terminology that is not defined or approved in the Enterprise Clinical Glossary & Domain Dictionary (LIMS-DOC-23).**
2.  **Any technical commit or pull request containing variables, database columns, or routing prefix configurations that do not match the Naming Standards in Section 3 will be rejected at code review.**
3.  **Audit trails and signature modules must utilize the exact terms and formatting codes (e.g. PAT-xxx, SPC-xxx) mapped in Section 7.**

---

## Review Checklist
- [x] Defines Purpose, scope, and objectives of the clinical language standard.
- [x] Includes Abbreviation Dictionary mapping all project acronyms.
- [x] Details the Unified Clinical Glossary mapping definitions, business/clinical meanings, and synonyms across 6 distinct categories.
- [x] Specifies Controlled Vocabulary Standards for specimen types, organism categories, antibiotics, media, and statuses.
- [x] Configures Clinical Code Standards for 13 identifier prefixes.
- [x] Outlines Database, API, Frontend, Reports, and Docs Naming Standards.
- [x] Defines Terminology Governance rules (new term request, review, deprecation).
- [x] Logs 10 Forbidden Terms with preferred alternatives and clinical justifications.
- [x] Establishes the AI Language Standards for automated generators.
- [x] Integrates the Mandatory Terminology Governance Rules.
- [x] Verifies that the document contains no code, SQL, or HTML localized translations.
- [x] Traces design rules back to LIMS-DOC-03, -04, -05, -06, -13, -14, -16, -17, -18, -19, -21, and -22.
- [x] Follows the LIMS-DOC template structure.
