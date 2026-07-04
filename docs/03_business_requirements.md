# Business Requirements Specification (BRS)

## Document Metadata
*   **Document ID**: LIMS-DOC-03
*   **Version**: 1.0.0
*   **Author**: Antigravity (LIMS Solution Architect)
*   **Status**: Approved
*   **Last Updated**: 2026-07-03
*   **Dependencies**: [LIMS-DOC-02](file:///d:/Projects/Micro_Lab/docs/02_mvp_scope.md)
*   **Requested By**: Laboratory Directors & Clinical Stakeholders
*   **Reviewed By**: Quality Assurance Manager & Lead Microbiologist
*   **Approved By**: User
*   **Approval Date**: 2026-07-03

---

## Purpose
The purpose of this document is to answer **"How does the laboratory operate?"** by defining the operational rules, regulatory accreditations, exception handling, and workflows governing microbiology laboratory routines. This BRS acts as the operational standard that all downstream software requirements must fulfill.

---

## Scope
This document details the business and clinical lifecycle of specimens within clinical diagnostic, public health, and reference microbiology labs. It covers regulatory frameworks, sample acceptance parameters, disease-driven protocols, laboratory calendars, and chain of custody rules.

---

## Main Content

### 1. Regulatory & Compliance Context
Microbiology laboratories operate under clinical and federal accreditations. The LIMS must enforce operational compliance guidelines:
*   **CLIA**: Governs laboratory certification, personnel qualifications, and test verification standards.
*   **CAP / ISO 15189**: Mandates documented quality control logs, media lot approvals, equipment calibration checks, and proficiency testing records.
*   **HIPAA / GDPR**: Requires administrative and technical controls to secure Patient Health Information (PHI) in all workspaces.
*   **21 CFR Part 11**: Electronically stored laboratory records must possess unalterable, non-repudiable audit trails.

For glossary definitions of clinical abbreviations used throughout this document (e.g., AST, MIC, CLSI, EUCAST, CRE, MRSA, QC), see [LIMS-DOC-22: Glossary & Domain Dictionary](file:///d:/Projects/Micro_Lab/docs/22_glossary_and_domain_dictionary.md).

---

### 2. Complete Sample Lifecycle & Workflow Engine
Every specimen processed in the laboratory must progress through a formalized set of status transitions. The table below represents the business transition logic:

| Status State | Entry Criteria | Exit Criteria | Responsible Role | Allowed Actions | Next States |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Requested** | Order created by physician portal or HL7 import. | Order printed or collected. | Ordering Physician | Edit order details, print request form. | Registered, Collected |
| **Registered** | Order checked in at clinic or collection center. | Collection container labeled. | Specimen Processor | Print barcode labels, verify patient demographics. | Collected |
| **Collected** | Specimen obtained from patient; vial labeled. | Specimen dispatched to courier. | Phlebotomist / Nurse | Log collection timestamp, volume, site, and collector ID. | In Transit |
| **In Transit** | Courier logs receipt of specimen box. | Specimen box arrives at laboratory. | Courier | Scan shipping box barcode, log box temperature. | Received |
| **Received** | Specimen physically unpacked at laboratory. | Quality check completed. | Specimen Processor | Scan specimen barcode, inspect container integrity. | Accepted, Rejected |
| **Accepted** | Quality check passed (label correct, volume sufficient). | Media plates inoculated. | Specimen Processor | Assign specimen processing workstation. | Processing |
| **Rejected** | Quality check failed (leaking, incorrect container, QNS). | Physician notified; order locked. | Specimen Processor | Log rejection code, notify physician, lock record. | Archived |
| **Processing** | Media plates prepared and verified. | Inoculated plates moved to incubator. | Laboratory Technician | Select media lots, streak agar plates, print plate barcodes. | Culture |
| **Culture** | Inoculation logged and plates ready. | Plates placed in incubator. | Laboratory Technician | Verify plating checklist, match incubator ID. | Incubation |
| **Incubation** | Plates placed inside incubator cabinet. | Incubation timer reached. | Laboratory Technician | Log cabinet ID, shelf, temperature, start time. | Observation |
| **Observation** | Incubation cycle complete (e.g., 24h read). | colony morphology entered. | Laboratory Technician | Log Gram stain, colony count, describe growth. | Identification, Incubation |
| **Identification**| Observation shows colony growth. | Genus & species pathogen declared. | Laboratory Technician | Log catalase/oxidase tests, confirm species via taxonomy. | AST, Quality Review |
| **AST** | Pathogen species identified and isolated. | Disc zone (mm) or MIC values logged. | Laboratory Technician | Record zone diameters, review SIR classification. | Quality Review |
| **Quality Review**| Result inputs complete. | Supervisor sign-off. | Senior Microbiologist | Verify QC lot validation, cross-check expert rules. | Medical Validation |
| **Medical Validation** | Quality review signed off by Supervisor. | Pathologist approves report. | Pathologist / Director | Review clinical diagnostic data, apply electronic sign-off. | Report Generated |
| **Report Generated** | Digital approval signature locked. | PDF report generated. | Pathologist / Director | Lock diagnostic values, compile final report PDF. | Delivered |
| **Delivered** | PDF report compiled and saved. | Physician opens portal alert. | System Engine | Secure email dispatch, portal notification release. | Archived |
| **Archived** | Delivery completed or specimen rejected. | Disposal timer expired. | System Administrator | Move records to cold storage index, log vial freezer box. | Disposed |
| **Disposed** | Retention period expired (e.g., urine 7 days). | Specimen autoclaved/discarded. | Laboratory Technician | Log waste container ID, timestamp, disposal agent name. | None |

---

### 3. Business Process Matrix

This operational process matrix outlines triggers, inputs, and outputs across laboratory tasks:

| Process Name | Trigger Event | Input Elements | Output Elements | Active Actor | Next Process |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Register Sample** | New physician order request | Patient MRN + Test panels ordered | Registered order profile | Specimen Processor | Collect Specimen |
| **Collect Specimen**| Patient checks in for order | Sterile container + Barcode label | Collected Specimen | Phlebotomist / Nurse | Receive Sample |
| **Receive Sample** | Specimen delivery box arrives | Physical container + Scan barcode | Accepted or Rejected Status | Specimen Processor | Process Sample |
| **Process Sample** | Specimen acceptance logged | Specimen container + Culture media | Streaked media agar plates | Laboratory Technician | Incubate Plates |
| **Incubate Plates**| Agar plates streaked | Streaked plates + Incubator shelf | Active incubator logs | Laboratory Technician | Observe Plate Growth|
| **Observe Plates** | Incubation duration alerts | Plated culture growth observations| Gram stain + Morphology logs | Laboratory Technician | Pathogen Species ID |
| **Identify Species**| Significant colony growth | Biochemical screens + Taxonomy | Confirmed isolate profile | Laboratory Technician | Susceptibility Test |
| **AST Susceptibility**| Confirmed pathogen isolated | Isolate + Susceptibility panels | Disk zone / MIC measurements | Laboratory Technician | Review Quality |
| **Review Quality** | Results entries complete | Clinical reports draft + QC data | Supervisor approved report | Senior Microbiologist | Medically Validate |
| **Medically Validate**| Supervisor approval completed | Approved report + Signature key | Final validated PDF report | Pathologist / Director | Deliver Report |
| **Deliver Report** | Report validation locked | Validated report + Portal link | Physician read-receipt log | System Engine | Archive & Dispose |

---

### 4. Turnaround Time (TAT) Rules
Laboratory efficiency is tracked using expected Turnaround Time SLAs (Service Level Agreements):

| Specimen Group | Test / Culture Panel | SLA Target (Receipt to Validate) | Clinical Warning Alert |
| :--- | :--- | :--- | :--- |
| **Urgent** | Spinal Fluid (CSF) Gram Stain | 2 Hours | Immediate pager alert if $> 1.5$ Hours |
| **Routine** | Urine Culture | 24 - 48 Hours | Yellow dashboard indicator at $> 36$ Hours |
| **Routine** | Sputum / Sepsis Blood Culture | 5 Days (Up to 120 Hours) | Out of compliance flag at $> 120$ Hours |
| **Specialized** | Fungal Culture | 4 Weeks (28 Days) | Progress report update to client at 14 Days |
| **Specialized** | Mycobacterial (TB) Culture | 6 Weeks (42 Days) | Progress report update to client at 21 Days |

---

### 5. Disease-Based Workflow Protocols
Microbiology paths branch dynamically based on suspected clinical indicators. The LIMS enforces distinct paths:

*   **UTI (Urinary Tract Infection)**:
    Urine Specimen $\rightarrow$ Quantitative loop plate $\rightarrow$ Blood Agar & MacConkey Agar plating $\rightarrow$ 24h Incubation $\rightarrow$ colony count calculation (CFU/mL) $\rightarrow$ Organism ID if $\ge 10^5$ CFU/mL $\rightarrow$ AST panel $\rightarrow$ Final Report.
*   **Pneumonia (Respiratory Infection)**:
    Sputum Specimen $\rightarrow$ Sputum washing quality evaluation (WBC/SEC ratio check) $\rightarrow$ Blood Agar, Chocolate Agar, MacConkey Agar plating $\rightarrow$ 48h Incubation $\rightarrow$ Pathogen determination (ruling out normal flora) $\rightarrow$ AST susceptibility $\rightarrow$ Pathologist Review $\rightarrow$ Report.
*   **Meningitis (Central Nervous System)**:
    CSF Specimen $\rightarrow$ Urgent centrifuge $\rightarrow$ Instant Gram Stain reporting (Preliminary) $\rightarrow$ Chocolate & Blood agar plating with Anaerobic enrichment $\rightarrow$ Daily 24h reads up to 72h $\rightarrow$ Species verification $\rightarrow$ Etest susceptibility $\rightarrow$ Urgent Pathologist signoff.
*   **Sepsis (Bloodstream Infection)**:
    Blood vials $\rightarrow$ Automated cabinet continuous monitoring $\rightarrow$ Growth detected flag $\rightarrow$ Urgent Gram stain logged $\rightarrow$ Sub-culturing (Blood, MacConkey, Chocolate) $\rightarrow$ Rapid ID panel $\rightarrow$ Direct Susceptibility $\rightarrow$ Critical notification logged.
*   **Wound Infection (Soft Tissue)**:
    Swab/Pus Specimen $\rightarrow$ Gram stain mapping $\rightarrow$ Blood, Chocolate, MacConkey, Anaerobic agar plating $\rightarrow$ 48-72h Incubation $\rightarrow$ Anaerobic colony isolate checks $\rightarrow$ AST validation $\rightarrow$ Report.
*   **Tuberculosis (Mycobacterial)**:
    Acid-Fast Sputum $\rightarrow$ Decontamination processing $\rightarrow$ Lowenstein-Jensen (LJ) slant media plating $\rightarrow$ 6-Week Incubation $\rightarrow$ Weekly check-ins $\rightarrow$ AFB positive stain verify $\rightarrow$ Direct referral log.

---

### 6. Laboratory Quality Control (QC) Workflows
Quality control check paths must run independently of patient processing:
*   **Media QC**: New agar plate lots must be tested against reference strains (ATCC strains) for growth performance. The LIMS blocks patient plating on unapproved lots.
*   **Antibiotic Disc QC**: Disc lots for disc diffusion AST must be verified weekly using quality control reference parameters.
*   **Equipment Calibration**: Standard check registries for incubator temperatures, autoclaves, and hoods.
*   **Daily Temperature Logs**: Automated or technician-validated cabinet temperature registries (target: $35^\circ\text{C} \pm 2^\circ\text{C}$).
*   **CAPA (Corrective and Preventive Actions)**: Incident reporting log documenting equipment calibration failures, media defects, or contamination events with supervisor corrective sign-offs.

---

### 7. Laboratory Chain of Custody & Security
To comply with medical-legal audits, every specimen must record:
*   **Current Location**: Workspace coordinate mapping (e.g., Room 102, Incubator A, Rack 3, Slide Tray B).
*   **Current Owner**: User ID of the technician currently holding or processing the sample.
*   **Transfer History**: Log of transfers containing: *Source Location $\rightarrow$ Destination Location $\rightarrow$ Transferring User ID $\rightarrow$ Timestamp $\rightarrow$ Reason for Transfer*.

---

### 8. Exception Handling Protocols
If laboratory issues arise, technicians must use the following standard corrective actions:

*   **Barcode Unreadable**: Specimen is set to "Hold" status. The processor must perform manual database search by patient name/DOB, verify order details, and print a replacement barcode label.
*   **Sample Lost**: Order is set to "Lost" status. The ordering clinic is immediately notified, and a recollect request order is automatically generated.
*   **Duplicate Barcode**: System raises a collision alert. Technicians check the physical specimen labels, lock conflicting processing, and route the duplicates for administrative triage.
*   **Wrong Patient**: The specimen record is set to "Canceled" status. A correction ticket is logged in the CAPA dashboard, and clinical management is notified.
*   **Contaminated Culture**: If plate observations show significant mixed growth (e.g., $>3$ distinct organisms in a routine urine culture), the culture status is updated to "Contaminated Growth", and a recollect request is logged.
*   **Equipment Failure**: If an incubator temperature drops out of range, all active plates are routed to an alternative incubator ID, and an incident ticket is logged in the CAPA system.
*   **AST Repeated**: If susceptibility controls fail or results are atypical, technicians log a repeat indicator, document the reason, and set up a new susceptibility panel.
*   **Report Amended**: If errors are discovered post-validation, the Pathologist must unlock the case via the Amended workflow. The old PDF is marked "Superseded," and the new report is compiled with a clear change log section.

---

### 9. Laboratory Calendar & Operational Context
System SLA timelines must adjust to lab shift parameters:
*   **Working Hours**: 24/7/365 operational status for blood cultures and urgent spinal fluids.
*   **Routine Shifts**: Day shift (07:00–15:00) handles receipt, processing, and validation. Evening shift (15:00–23:00) records daily plate readings. Night shift (23:00–07:00) handles critical blood flags.
*   **Holidays & Weekends**: Urgent orders are processed under standard SLAs; routine cultures extend their expected observation read deadlines by 24 hours.

---

### 10. Business Performance KPIs
The laboratory operations dashboard tracks clinical metrics:
*   **Specimen Volume**: Total samples processed per day.
*   **Positive Culture Rate**: Percentage of cultures yielding significant pathogens.
*   **Contamination Rate**: Target: $<3\%$ of total cultures.
*   **Specimen Rejection Rate**: Target: $<1.5\%$ of total submissions.
*   **Average TAT**: Calculated real-time against expected SLAs.
*   **Critical Alerts Timeline**: Average minutes from positive flag to physician notification (target: $<15$ minutes).
*   **Audit Review Volatility**: Volume of amended reports per week.

---

### 11. Core Business Constraints
1.  Only validated reports can be released to the physician portal.
2.  A rejected specimen cannot undergo plating, incubation, or results processing.
3.  An AST panel cannot be logged unless a pathogen species isolate has been identified and declared.
4.  A finalized report is locked from further updates unless unlocked via an amended report workflow.
5.  Every manual override of an AST interpretation, quality review check, or critical flag protocol requires logging a text reason.

---

## Assumptions
*   All laboratory staff are trained and qualified in biosafety protocols.
*   Incubator temperature readings are checked and verified daily.

---

## Future Enhancements
*   Automated text message notification workflows direct to clinical supervisors.
*   Direct connection with municipal outbreak dashboards.

---

## Review Checklist
- [x] Specifies the 19 lifecycle states (Requested to Disposed) with entry/exit rules.
- [x] Includes a detailed Business Process Matrix mapping inputs and actors.
- [x] Documents the Expected TAT SLA rules.
- [x] Includes disease-driven workflow sequences (UTI, Sepsis, Meningitis).
- [x] Details Media QC, Disc QC, and CAPA operational parameters.
- [x] Outlines standard exception handling workflows.
- [x] Restricts final edits to pathologists and enforces audit tracking.
- [x] Document follows the LIMS-DOC template structure.
