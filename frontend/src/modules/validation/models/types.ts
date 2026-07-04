// ─────────────────────────────────────────────────────────────────────────────
// Sprint 11 — Validation Domain Models
// ─────────────────────────────────────────────────────────────────────────────

export type ValidationStatus =
  | 'Created'
  | 'Pending Technical Validation'
  | 'Technical Validation In Progress'
  | 'Pending Clinical Validation'
  | 'Clinical Validation In Progress'
  | 'Approved'
  | 'Rejected'
  | 'Returned For Correction'
  | 'Released For Reporting';

export type ValidationStageType =
  | 'Technical Validation'
  | 'Quality Control'
  | 'Supervisor Review'
  | 'Clinical Microbiologist'
  | 'Pathologist'
  | 'Final Laboratory Authorization';

export type ValidationDecisionType = 'Approved' | 'Rejected' | 'Returned For Correction' | 'Pending';

export interface ValidationComment {
  commentId: string;
  author: string;
  role: string;
  timestamp: string;
  text: string;
  stage: ValidationStageType;
}

export interface ValidationDecision {
  decisionId: string;
  stage: ValidationStageType;
  reviewer: string;
  reviewerRole: string;
  decision: ValidationDecisionType;
  comments: string;
  findings?: string;
  electronicApprovalFlag: boolean; // mock
  digitalSignaturePlaceholder?: string; // mock — e.g. "SHA256:abc..."
  timestamp: string;
}

export interface ReviewerAssignment {
  assignmentId: string;
  stage: ValidationStageType;
  assignedTo: string;
  assignedBy: string;
  assignedAt: string;
  dueDate?: string;
}

export interface ValidationStage {
  stageId: string;
  type: ValidationStageType;
  status: ValidationDecisionType;
  order: number; // 1..6 — enforces no skipping
  assignment?: ReviewerAssignment;
  decision?: ValidationDecision;
}

export interface ValidationHistory {
  historyId: string;
  validationId: string;
  timestamp: string;
  performedBy: string;
  action: string;
  fromStatus: ValidationStatus;
  toStatus: ValidationStatus;
  stage: ValidationStageType;
  reason?: string;
}

export interface ValidationSummary {
  totalStages: number;
  completedStages: number;
  pendingStages: number;
  rejectedStages: number;
  overallProgress: number; // 0-100
}

export interface ValidationRecord {
  validationId: string; // VAL-YYYYMMDD-XXXXXX
  astId: string;
  colonyId: string;
  patientName?: string;
  specimenType?: string;
  organismName: string;
  status: ValidationStatus;
  priority: 'Routine' | 'Urgent' | 'Stat';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  stages: ValidationStage[];
  comments: ValidationComment[];
  history: ValidationHistory[];
  summary: ValidationSummary;
  releasedForReporting: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sprint 12 Handoff — Approved Laboratory Result Model (Read-Only Data Contract)
// ─────────────────────────────────────────────────────────────────────────────

export interface ApprovedLaboratoryResult {
  readonly resultId: string; // RES-YYYYMMDD-XXXXXX
  readonly validationId: string;
  readonly patientId: string;
  readonly patientName: string;
  readonly orderId: string;
  readonly specimenId: string;
  readonly specimenType: string;
  readonly collectionDateTime: string;
  
  // Final Organism Identification Details
  readonly organismId: string;
  readonly organismName: string;
  readonly confidenceScore: number;
  
  // Final AST Interpretations
  readonly astId: string;
  readonly guideline: 'CLSI 2026' | 'EUCAST 2026';
  readonly astResults: Array<{
    readonly agentId: string;
    readonly agentName: string;
    readonly method: 'Disk Diffusion' | 'MIC' | 'Broth Microdilution' | 'E-test';
    readonly value: number;
    readonly unit: string;
    readonly interpretation: 'S' | 'I' | 'R' | 'Not Tested' | 'Invalid';
    readonly overrideReason?: string;
  }>;
  
  // Validation Metadata
  readonly validatedStages: Array<{
    readonly stage: ValidationStageType;
    readonly reviewer: string;
    readonly timestamp: string;
    readonly signature: string;
  }>;
  
  readonly overallProgress: number;
  readonly releaseEligible: boolean;
  readonly releasedAt?: string;
}

