import type {
  ValidationRecord,
  ValidationStage,
  ValidationDecision,
  ValidationStageType,
} from '../models/types';

// Ordered stage sequence — stages must be completed in order
const STAGE_ORDER: ValidationStageType[] = [
  'Technical Validation',
  'Quality Control',
  'Supervisor Review',
  'Clinical Microbiologist',
  'Pathologist',
  'Final Laboratory Authorization',
];

export class ValidationValidator {

  /** Rule 1: Reviewer cannot validate their own work */
  static validateSegregation(performedBy: string, reviewer: string): { isValid: boolean; error?: string } {
    if (performedBy.trim().toLowerCase() === reviewer.trim().toLowerCase()) {
      return { isValid: false, error: 'Reviewer cannot validate their own work (segregation of duties).' };
    }
    return { isValid: true };
  }

  /** Rule 2: Rejection and return-for-correction require comments */
  static validateDecisionComment(
    decision: 'Approved' | 'Rejected' | 'Returned For Correction',
    comments: string
  ): { isValid: boolean; error?: string } {
    if (decision !== 'Approved' && (!comments || comments.trim().length < 10)) {
      return { isValid: false, error: 'Comments (min 10 chars) are required for Rejection or Return for Correction.' };
    }
    return { isValid: true };
  }

  /** Rule 3: Reviewer must be assigned before a decision can be submitted */
  static validateReviewerAssigned(stage: ValidationStage): { isValid: boolean; error?: string } {
    if (!stage.assignment?.assignedTo) {
      return { isValid: false, error: `Reviewer must be assigned to ${stage.type} before a decision can be submitted.` };
    }
    return { isValid: true };
  }

  /** Rule 4: Stages cannot be skipped — the preceding stage must be Approved */
  static validateStageOrder(record: ValidationRecord, targetStageType: ValidationStageType): { isValid: boolean; error?: string } {
    const targetOrder = STAGE_ORDER.indexOf(targetStageType);
    if (targetOrder <= 0) return { isValid: true }; // First stage, no predecessor needed

    const predecessorType = STAGE_ORDER[targetOrder - 1];
    const predecessor = record.stages.find((s) => s.type === predecessorType);
    if (!predecessor || predecessor.status !== 'Approved') {
      return { isValid: false, error: `${predecessorType} must be completed and approved before ${targetStageType} can begin.` };
    }
    return { isValid: true };
  }

  /** Rule 5: Prevent duplicate approvals on the same stage */
  static validateNotAlreadyApproved(stage: ValidationStage): { isValid: boolean; error?: string } {
    if (stage.status === 'Approved') {
      return { isValid: false, error: `${stage.type} has already been approved.` };
    }
    return { isValid: true };
  }

  /** Rule 6: Prevent editing after final approval */
  static validateNotFinallyApproved(record: ValidationRecord): { isValid: boolean; error?: string } {
    if (record.status === 'Approved' || record.status === 'Released For Reporting') {
      return { isValid: false, error: 'This validation record has been finally approved and cannot be edited.' };
    }
    return { isValid: true };
  }

  /** Rule 7: Electronic approval flag must be set for Approved decisions */
  static validateElectronicApproval(
    decision: ValidationDecision
  ): { isValid: boolean; error?: string } {
    if (decision.decision === 'Approved' && !decision.electronicApprovalFlag) {
      return { isValid: false, error: 'Electronic approval flag must be confirmed before approving.' };
    }
    return { isValid: true };
  }

  /** Rule 8: Validate a full decision submission */
  static validateDecisionSubmission(
    record: ValidationRecord,
    stage: ValidationStage,
    decision: Partial<ValidationDecision>,
    reviewer: string
  ): { isValid: boolean; error?: string } {
    const checks = [
      ValidationValidator.validateNotFinallyApproved(record),
      ValidationValidator.validateNotAlreadyApproved(stage),
      ValidationValidator.validateReviewerAssigned(stage),
      ValidationValidator.validateSegregation(record.stages[0]?.assignment?.assignedBy ?? 'tech_user', reviewer),
      ValidationValidator.validateDecisionComment(decision.decision as any, decision.comments ?? ''),
    ];
    for (const c of checks) {
      if (!c.isValid) return c;
    }
    return { isValid: true };
  }
}

export default ValidationValidator;
