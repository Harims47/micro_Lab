import { mockAdapter } from '../../../infrastructure/http/mockAdapter';
import { eventBus } from '../../../services/platform/eventBus';
import type {
  ValidationRecord,
  ValidationStatus,
  ValidationStage,
  ValidationStageType,
  ValidationDecisionType,
  ValidationSummary,
} from '../models/types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const STAGE_TYPES: ValidationStageType[] = [
  'Technical Validation',
  'Quality Control',
  'Supervisor Review',
  'Clinical Microbiologist',
  'Pathologist',
  'Final Laboratory Authorization',
];

const REVIEWERS = [
  'dr_chen',
  'dr_patel',
  'dr_kim',
  'supervisor_user',
  'lab_director',
  'pathologist_user',
];

const ORGANISMS = [
  'Escherichia coli',
  'Staphylococcus aureus',
  'Pseudomonas aeruginosa',
  'Klebsiella pneumoniae',
  'Enterococcus faecalis',
];

const computeSummary = (stages: ValidationStage[]): ValidationSummary => {
  const total = stages.length;
  const completed = stages.filter((s) => s.status === 'Approved').length;
  const rejected = stages.filter((s) => s.status === 'Rejected').length;
  const pending = total - completed - rejected;
  return {
    totalStages: total,
    completedStages: completed,
    pendingStages: pending,
    rejectedStages: rejected,
    overallProgress: Math.round((completed / total) * 100),
  };
};

const buildStages = (approvedCount: number): ValidationStage[] =>
  STAGE_TYPES.map((type, i) => {
    const isApproved = i < approvedCount;
    const reviewer = REVIEWERS[i % REVIEWERS.length];
    const decision = isApproved
      ? {
          decisionId: `DEC-${type.replace(/\s/g, '')}-${i}`,
          stage: type,
          reviewer,
          reviewerRole: type,
          decision: 'Approved' as ValidationDecisionType,
          comments: 'Reviewed and approved per laboratory SOP.',
          electronicApprovalFlag: true,
          digitalSignaturePlaceholder: `SHA256:${Math.random().toString(36).substring(2, 18).toUpperCase()}`,
          timestamp: new Date().toISOString(),
        }
      : undefined;

    return {
      stageId: `STG-${type.replace(/\s/g, '')}-${i}`,
      type,
      status: isApproved ? ('Approved' as ValidationDecisionType) : ('Pending' as ValidationDecisionType),
      order: i + 1,
      assignment: {
        assignmentId: `ASN-${i}`,
        stage: type,
        assignedTo: reviewer,
        assignedBy: 'lab_manager',
        assignedAt: new Date().toISOString(),
      },
      decision,
    };
  });

let validationsDb: ValidationRecord[] = [];

const seedDatabase = () => {
  if (validationsDb.length > 0) return;

  // Distribution: 15 Created, 15 Pending Tech, 15 Tech In Progress, 15 Pending Clinical, 10 Approved, 10 Rejected
  const statusDistribution: { status: ValidationStatus; approvedStages: number }[] = [
    ...Array(15).fill({ status: 'Created' as ValidationStatus, approvedStages: 0 }),
    ...Array(15).fill({ status: 'Pending Technical Validation' as ValidationStatus, approvedStages: 0 }),
    ...Array(15).fill({ status: 'Technical Validation In Progress' as ValidationStatus, approvedStages: 1 }),
    ...Array(15).fill({ status: 'Pending Clinical Validation' as ValidationStatus, approvedStages: 3 }),
    ...Array(10).fill({ status: 'Approved' as ValidationStatus, approvedStages: 6 }),
    ...Array(10).fill({ status: 'Rejected' as ValidationStatus, approvedStages: 1 }),
  ];

  statusDistribution.forEach(({ status, approvedStages }, idx) => {
    const validationId = `VAL-ID-${String(idx + 1).padStart(6, '0')}`;
    const day = String(1 + (idx % 28)).padStart(2, '0');
    const dateStr = `2026-07-${day}`;
    const astId = `AST-ID-${String(idx + 1).padStart(6, '0')}`;
    const colonyId = `COL-ID-${String(idx + 1).padStart(6, '0')}`;
    const organism = ORGANISMS[idx % ORGANISMS.length];
    const priority = idx % 3 === 0 ? 'Stat' : idx % 3 === 1 ? 'Urgent' : 'Routine';

    const stages = buildStages(approvedStages);
    const summary = computeSummary(stages);

    const history = approvedStages > 0
      ? [{
          historyId: `HIS-${validationId}-1`,
          validationId,
          timestamp: `${dateStr}T10:00:00Z`,
          performedBy: REVIEWERS[0],
          action: 'Technical Validation Approved',
          fromStatus: 'Technical Validation In Progress' as ValidationStatus,
          toStatus: 'Pending Clinical Validation' as ValidationStatus,
          stage: 'Technical Validation' as ValidationStageType,
        }]
      : [];

    validationsDb.push({
      validationId,
      astId,
      colonyId,
      patientName: `Patient ${String.fromCharCode(65 + (idx % 26))} ${String(idx + 100)}`,
      specimenType: ['Blood', 'Urine', 'Wound', 'Sputum'][idx % 4],
      organismName: organism,
      status,
      priority: priority as any,
      createdAt: `${dateStr}T08:00:00Z`,
      updatedAt: `${dateStr}T12:00:00Z`,
      completedAt: status === 'Approved' ? `${dateStr}T16:00:00Z` : undefined,
      stages,
      comments: [],
      history,
      summary,
      releasedForReporting: status === 'Released For Reporting',
    });
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock Adapter Registration
// ─────────────────────────────────────────────────────────────────────────────

export const initializeMockValidationServer = () => {
  seedDatabase();

  // 1. GET /validations
  mockAdapter.register('GET', '/validations', (qp: any) => {
    const { page = '1', limit = '10', search = '', status = 'All', priority = 'All' } = qp || {};
    let filtered = [...validationsDb];

    if (status !== 'All') {
      filtered = filtered.filter((r) => r.status.toLowerCase() === status.toLowerCase());
    }
    if (priority !== 'All') {
      filtered = filtered.filter((r) => r.priority.toLowerCase() === priority.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.validationId.toLowerCase().includes(q) ||
          r.astId.toLowerCase().includes(q) ||
          r.organismName.toLowerCase().includes(q) ||
          (r.patientName ?? '').toLowerCase().includes(q)
      );
    }

    const p = parseInt(page, 10);
    const l = parseInt(limit, 10);
    const sliced = filtered.slice((p - 1) * l, (p - 1) * l + l);
    return { records: sliced, total: filtered.length, page: p, limit: l };
  });

  // 2. GET /validations/:id
  mockAdapter.register('GET', '^/validations/[a-zA-Z0-9\\-]+$', (_: any, url?: string) => {
    const id = url?.split('/').pop();
    const record = validationsDb.find((r) => r.validationId === id);
    if (!record) throw { status: 404, message: 'Validation record not found.' };
    return record;
  });

  // 3. POST /validations/:id/stages/:stageId/decision
  mockAdapter.register(
    'POST',
    '^/validations/[a-zA-Z0-9\\-]+/stages/[a-zA-Z0-9\\-]+/decision$',
    (body: any, url?: string) => {
      const parts = url?.split('/');
      const valId = parts?.[2];
      const stageId = parts?.[4];

      const idx = validationsDb.findIndex((r) => r.validationId === valId);
      if (idx === -1) throw { status: 404, message: 'Validation not found.' };

      const record = { ...validationsDb[idx] };
      const stageIdx = record.stages.findIndex((s) => s.stageId === stageId);
      if (stageIdx === -1) throw { status: 404, message: 'Stage not found.' };

      const stage = { ...record.stages[stageIdx] };
      const decisionType: ValidationDecisionType = body.decision;

      stage.status = decisionType;
      stage.decision = {
        decisionId: `DEC-${Date.now()}`,
        stage: stage.type,
        reviewer: body.reviewer || 'supervisor_user',
        reviewerRole: stage.type,
        decision: decisionType,
        comments: body.comments || '',
        findings: body.findings,
        electronicApprovalFlag: body.electronicApprovalFlag ?? false,
        digitalSignaturePlaceholder: body.electronicApprovalFlag
          ? `SHA256:${Math.random().toString(36).substring(2, 18).toUpperCase()}`
          : undefined,
        timestamp: new Date().toISOString(),
      };

      const updatedStages = [...record.stages];
      updatedStages[stageIdx] = stage;
      record.stages = updatedStages;
      record.summary = computeSummary(updatedStages);
      record.updatedAt = new Date().toISOString();

      // Add history entry
      const prevStatus = record.status;
      let nextStatus: ValidationStatus = record.status;

      if (decisionType === 'Approved') {
        const nextStageIdx = stageIdx + 1;
        if (nextStageIdx >= updatedStages.length) {
          nextStatus = 'Approved';
          record.completedAt = new Date().toISOString();
          eventBus.publish('TECHNICAL_VALIDATION_COMPLETED', record);
          eventBus.publish('CLINICAL_VALIDATION_COMPLETED', record);
          eventBus.publish('PATHOLOGIST_APPROVED', record);
        } else {
          const nextType = updatedStages[nextStageIdx].type;
          if (nextType === 'Clinical Microbiologist' || nextType === 'Pathologist') {
            nextStatus = 'Pending Clinical Validation';
          } else {
            nextStatus = 'Technical Validation In Progress';
          }
          if (stage.type === 'Technical Validation') {
            eventBus.publish('TECHNICAL_VALIDATION_COMPLETED', record);
          } else if (stage.type === 'Quality Control') {
            eventBus.publish('QC_VALIDATION_COMPLETED', record);
          } else if (stage.type === 'Clinical Microbiologist') {
            eventBus.publish('CLINICAL_VALIDATION_COMPLETED', record);
          }
        }
      } else if (decisionType === 'Rejected') {
        nextStatus = 'Rejected';
        eventBus.publish('VALIDATION_REJECTED', record);
      } else {
        nextStatus = 'Returned For Correction';
        eventBus.publish('RETURNED_FOR_CORRECTION', record);
      }

      record.status = nextStatus;
      record.history = [
        ...record.history,
        {
          historyId: `HIS-${Date.now()}`,
          validationId: valId ?? '',
          timestamp: new Date().toISOString(),
          performedBy: body.reviewer || 'supervisor_user',
          action: `${stage.type}: ${decisionType}`,
          fromStatus: prevStatus,
          toStatus: nextStatus,
          stage: stage.type,
          reason: body.comments,
        },
      ];

      validationsDb[idx] = record;
      return record;
    }
  );

  // 4. POST /validations/:id/stages/:stageId/assign
  mockAdapter.register(
    'POST',
    '^/validations/[a-zA-Z0-9\\-]+/stages/[a-zA-Z0-9\\-]+/assign$',
    (body: any, url?: string) => {
      const parts = url?.split('/');
      const valId = parts?.[2];
      const stageId = parts?.[4];

      const idx = validationsDb.findIndex((r) => r.validationId === valId);
      if (idx === -1) throw { status: 404, message: 'Validation not found.' };

      const record = { ...validationsDb[idx] };
      const stageIdx = record.stages.findIndex((s) => s.stageId === stageId);
      if (stageIdx === -1) throw { status: 404, message: 'Stage not found.' };

      const updatedStages = [...record.stages];
      updatedStages[stageIdx] = {
        ...updatedStages[stageIdx],
        assignment: {
          assignmentId: `ASN-${Date.now()}`,
          stage: updatedStages[stageIdx].type,
          assignedTo: body.assignedTo,
          assignedBy: body.assignedBy || 'lab_manager',
          assignedAt: new Date().toISOString(),
          dueDate: body.dueDate,
        },
      };

      record.stages = updatedStages;
      record.updatedAt = new Date().toISOString();
      validationsDb[idx] = record;
      return record;
    }
  );

  // 5. POST /validations/:id/release
  mockAdapter.register('POST', '^/validations/[a-zA-Z0-9\\-]+/release$', (_: any, url?: string) => {
    const id = url?.split('/')?.[2];
    const idx = validationsDb.findIndex((r) => r.validationId === id);
    if (idx === -1) throw { status: 404, message: 'Validation not found.' };

    const record = validationsDb[idx];
    if (record.status !== 'Approved') {
      throw { status: 400, message: 'Only fully approved records can be released for reporting.' };
    }

    record.status = 'Released For Reporting';
    record.releasedForReporting = true;
    record.updatedAt = new Date().toISOString();

    eventBus.publish('LAB_RESULT_READY_FOR_RELEASE', record);
    validationsDb[idx] = { ...record };
    return record;
  });
};

export default initializeMockValidationServer;
