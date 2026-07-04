import { eventBus } from './eventBus';

export type EntityWorkflowState = string;

export interface WorkflowTransitionRule {
  from: EntityWorkflowState;
  to: EntityWorkflowState[];
  validate?: (entity: any) => { isValid: boolean; reason?: string };
}

export class WorkflowEngine {
  private static specimenRules: Record<string, string[]> = {
    Draft: ['Scheduled', 'Collected'],
    Scheduled: ['Collected', 'Collection Failed'],
    Collected: ['Awaiting Transport', 'Transported'],
    'Collection Failed': ['Draft', 'Scheduled'],
    'Awaiting Transport': ['Transported', 'Received'],
    Transported: ['Received'],
    Received: ['Under Quality Check', 'Accepted', 'Rejected'],
    'Under Quality Check': ['Accepted', 'Rejected'],
    Accepted: ['Split', 'Aliquoted', 'In Culture', 'In Testing', 'Completed'],
    Rejected: ['Archived', 'Disposed'],
    Split: ['Aliquoted', 'In Culture', 'In Testing'],
    Aliquoted: ['In Culture', 'In Testing'],
    'In Culture': ['In Testing', 'Completed'],
    'In Testing': ['Completed'],
    Completed: ['Archived'],
    Archived: ['Disposed'],
    Disposed: [],
  };

  private static cultureRules: Record<string, string[]> = {
    Created: ['Media Prepared', 'Cancelled'],
    'Media Prepared': ['Inoculated', 'Cancelled'],
    Inoculated: ['Incubating', 'Cancelled'],
    Incubating: ['Observation Pending', 'Contaminated', 'Cancelled'],
    'Observation Pending': ['Growth Detected', 'No Growth', 'Contaminated', 'Cancelled'],
    'Growth Detected': ['Completed', 'Repeat Required', 'Contaminated', 'Cancelled'],
    'No Growth': ['Completed', 'Repeat Required', 'Contaminated', 'Cancelled'],
    Contaminated: ['Repeat Required', 'Completed', 'Cancelled'],
    'Repeat Required': ['Created', 'Cancelled'],
    Completed: ['Archived'],
    Cancelled: ['Archived'],
    Archived: [],
  };

  /**
   * Validates if a transition for culture state is valid.
   */
  static validateCultureTransition(
    current: EntityWorkflowState,
    target: EntityWorkflowState,
    _entity: any
  ): { isValid: boolean; reason?: string } {
    const allowed = this.cultureRules[current];
    if (!allowed || !allowed.includes(target)) {
      return {
        isValid: false,
        reason: `Invalid transition: Cannot move culture from "${current}" to "${target}".`,
      };
    }
    return { isValid: true };
  }


  /**
   * Validates if a transition from current status to target status is valid.
   */
  static validateSpecimenTransition(
    current: EntityWorkflowState,
    target: EntityWorkflowState,
    entity: any
  ): { isValid: boolean; reason?: string } {
    const allowed = this.specimenRules[current];
    if (!allowed || !allowed.includes(target)) {
      return {
        isValid: false,
        reason: `Invalid transition lifecycle: Cannot move status directly from "${current}" to "${target}".`,
      };
    }

    // Custom constraint rules
    if (target === 'Rejected' && !entity.rejectionReason) {
      return {
        isValid: false,
        reason: 'Rejection reason clinical notes are required to reject specimens.',
      };
    }

    if (target === 'Accepted' && entity.volume <= 0) {
      return {
        isValid: false,
        reason: 'Cannot accept specimens with zero volume limits.',
      };
    }

    return { isValid: true };
  }

  /**
   * Executes specimen transition, raises audit log events, and fires Event Bus messages.
   */
  static transitionSpecimen(
    specimen: any,
    target: EntityWorkflowState,
    reason?: string
  ): any {
    const check = this.validateSpecimenTransition(specimen.status, target, {
      ...specimen,
      rejectionReason: reason || specimen.rejectionReason,
    });

    if (!check.isValid) {
      throw new Error(check.reason);
    }

    const previousStatus = specimen.status;
    const updated = {
      ...specimen,
      status: target,
      custodyHistory: [
        ...specimen.custodyHistory,
        {
          id: `CUST-${specimen.specimenId}-${specimen.custodyHistory.length + 1}`,
          status: target,
          timestamp: new Date().toISOString(),
          performedBy: 'tech_user',
          role: 'Technician',
          department: 'Microbiology Lab',
          location: 'Lab Station 1',
          action: `Workflow status transitioned from ${previousStatus} to ${target}.`,
          comments: reason,
        },
      ],
      auditTrail: [
        ...specimen.auditTrail,
        {
          id: `AUD-${specimen.specimenId}-${specimen.auditTrail.length + 1}`,
          timestamp: new Date().toISOString(),
          performedBy: 'tech_user',
          action: 'State Transition',
          field: 'status',
          oldValue: previousStatus,
          newValue: target,
          reason: reason || 'Workflow engine transition.',
          source: 'WorkflowEngine',
        },
      ],
    };

    // Publish platform messages
    if (target === 'Received') {
      eventBus.publish('SPECIMEN_RECEIVED', updated);
    } else if (target === 'Rejected') {
      eventBus.publish('SPECIMEN_REJECTED', updated);
    }

    eventBus.publish('AUDIT_CREATED', {
      specimenId: specimen.specimenId,
      action: 'Workflow Transition',
      previousStatus,
      newStatus: target,
    });

    return updated;
  }
}
