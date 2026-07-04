import { mockAdapter } from '../../../infrastructure/http/mockAdapter';
import { eventBus } from '../../../services/platform/eventBus';
import type { ApprovedLaboratoryResult } from '../../validation/models/types';
import type {
  LaboratoryReport,
  ReportStatus,
  ReportSignature,
  DistributionRecord,
  ReportVersion,
  ReportSection,
  ReportTemplate,
} from '../models/types';

// ─────────────────────────────────────────────────────────────────────────────
// Seed Mock Validated Results
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_APPROVED_RESULTS: ApprovedLaboratoryResult[] = [
  {
    resultId: 'RES-20260701-000001',
    validationId: 'VAL-ID-000001',
    patientId: 'PAT-20260701-100',
    patientName: 'John Doe',
    orderId: 'ORD-20260701-100',
    specimenId: 'SPC-20260701-100',
    specimenType: 'Blood',
    collectionDateTime: '2026-07-01T08:00:00Z',
    organismId: 'EC-01',
    organismName: 'Escherichia coli',
    confidenceScore: 98.4,
    astId: 'AST-ID-000001',
    guideline: 'CLSI 2026',
    astResults: [
      { agentId: 'AMX', agentName: 'Amoxicillin', method: 'MIC', value: 4, unit: 'ug/mL', interpretation: 'S' },
      { agentId: 'CIP', agentName: 'Ciprofloxacin', method: 'Disk Diffusion', value: 22, unit: 'mm', interpretation: 'S' },
    ],
    validatedStages: [
      { stage: 'Technical Validation', reviewer: 'dr_chen', timestamp: '2026-07-01T10:00:00Z', signature: 'SIG-CHEN-01' },
      { stage: 'Pathologist', reviewer: 'pathologist_user', timestamp: '2026-07-01T11:00:00Z', signature: 'SIG-PATH-01' },
    ],
    overallProgress: 100,
    releaseEligible: true,
  },
  {
    resultId: 'RES-20260702-000002',
    validationId: 'VAL-ID-000002',
    patientId: 'PAT-20260702-101',
    patientName: 'Jane Smith',
    orderId: 'ORD-20260702-101',
    specimenId: 'SPC-20260702-101',
    specimenType: 'Urine',
    collectionDateTime: '2026-07-02T09:00:00Z',
    organismId: 'SA-02',
    organismName: 'Staphylococcus aureus',
    confidenceScore: 96.2,
    astId: 'AST-ID-000002',
    guideline: 'EUCAST 2026',
    astResults: [
      { agentId: 'PEN', agentName: 'Penicillin', method: 'MIC', value: 8, unit: 'ug/mL', interpretation: 'R' },
      { agentId: 'VAN', agentName: 'Vancomycin', method: 'MIC', value: 1, unit: 'ug/mL', interpretation: 'S' },
    ],
    validatedStages: [
      { stage: 'Technical Validation', reviewer: 'dr_kim', timestamp: '2026-07-02T12:00:00Z', signature: 'SIG-KIM-02' },
    ],
    overallProgress: 100,
    releaseEligible: true,
  },
];

const DEFAULT_SECTIONS: ReportSection[] = [
  { sectionId: 'header', title: 'Laboratory Header', visible: true, order: 1 },
  { sectionId: 'patient', title: 'Patient Demographics', visible: true, order: 2 },
  { sectionId: 'specimen', title: 'Specimen Parameters', visible: true, order: 3 },
  { sectionId: 'results', title: 'Identification & AST results', visible: true, order: 4 },
  { sectionId: 'signatures', title: 'Electronic Signatures', visible: true, order: 5 },
  { sectionId: 'disclaimer', title: 'Footer Disclaimers', visible: true, order: 6 },
];

const DEFAULT_TEMPLATE: ReportTemplate = {
  templateId: 'standard',
  name: 'Standard Microbiology Report',
  showDemographics: true,
  showAstGrid: true,
  showClinicalInterpretation: true,
  showDisclaimer: true,
  disclaimerText: 'This report represents laboratory in-vitro values and must be clinically correlated.',
};

let reportsDb: LaboratoryReport[] = [];

const seedDatabase = () => {
  if (reportsDb.length > 0) return;

  const statuses: ReportStatus[] = [
    'Draft',
    'Generated',
    'Pending Signature',
    'Ready For Release',
    'Released',
    'Amended',
  ];

  // Seed 85 records
  for (let idx = 0; idx < 85; idx++) {
    const reportId = `REP-202607-${String(idx + 1).padStart(6, '0')}`;
    const status = statuses[idx % statuses.length];
    const res = MOCK_APPROVED_RESULTS[idx % MOCK_APPROVED_RESULTS.length];
    
    // Customize result per seed item
    const customResult: ApprovedLaboratoryResult = {
      ...res,
      resultId: `RES-202607-${String(idx + 1).padStart(6, '0')}`,
      patientName: `Patient ${String.fromCharCode(65 + (idx % 26))} ${idx + 200}`,
      organismName: ['Pseudomonas aeruginosa', 'Klebsiella pneumoniae', 'Escherichia coli'][idx % 3],
    };

    const initialSignatures: ReportSignature[] = [];
    if (status === 'Ready For Release' || status === 'Released' || status === 'Amended') {
      initialSignatures.push(
        { id: `SIG-TECH-${idx}`, signer: 'tech_user', role: 'Laboratory Technologist', timestamp: '2026-07-02T14:00:00Z', verified: true },
        { id: `SIG-PATH-${idx}`, signer: 'dr_patel', role: 'Pathologist', timestamp: '2026-07-02T15:00:00Z', verified: true }
      );
    }

    const versionHistory: ReportVersion[] = [
      { versionId: 'v1.0 Initial Release', timestamp: '2026-07-02T10:00:00Z', isActive: status !== 'Amended' },
    ];
    if (status === 'Amended') {
      versionHistory[0].isActive = false;
      versionHistory.push({
        versionId: 'v1.1 Amendment',
        timestamp: '2026-07-03T11:00:00Z',
        reason: 'Typo correction in patient name spelling.',
        releasedBy: 'dr_patel',
        isActive: true,
      });
    }

    const distributionHistory: DistributionRecord[] = [];
    if (status === 'Released') {
      distributionHistory.push({
        id: `DIST-${idx}`,
        method: 'Print',
        destination: 'Main Lab Printer',
        status: 'Success',
        timestamp: '2026-07-02T16:00:00Z',
        initiatedBy: 'tech_user',
      });
    }

    reportsDb.push({
      reportId,
      resultId: customResult.resultId,
      status,
      version: status === 'Amended' ? 'v1.1' : 'v1.0',
      versionHistory,
      approvedResult: customResult,
      signatures: initialSignatures,
      distributionHistory,
      amendments: status === 'Amended' ? [{
        id: `AMD-${idx}`,
        previousReportId: reportId,
        newReportId: reportId,
        reason: 'Typo correction in patient name spelling.',
        initiatedBy: 'dr_patel',
        timestamp: '2026-07-03T11:00:00Z',
      }] : [],
      qrCode: {
        reportId,
        verificationToken: `TOK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        verificationUrl: `https://lims.micro/verify/${reportId}`,
        timestamp: new Date().toISOString(),
      },
      template: { ...DEFAULT_TEMPLATE },
      sections: DEFAULT_SECTIONS.map((s) => ({ ...s })),
      createdAt: '2026-07-02T09:00:00Z',
      updatedAt: '2026-07-02T12:00:00Z',
      releasedAt: status === 'Released' ? '2026-07-02T15:30:00Z' : undefined,
    });
  }
};

export const initializeMockReportServer = () => {
  seedDatabase();

  // Consume Validation Completed Event
  eventBus.subscribe('LAB_RESULT_READY_FOR_RELEASE', (valRecord: any) => {
    const reportId = `REP-${Date.now()}`;
    const approvedResult: ApprovedLaboratoryResult = {
      resultId: `RES-${valRecord.validationId}`,
      validationId: valRecord.validationId,
      patientId: `PAT-${Date.now()}`,
      patientName: valRecord.patientName || 'Anonymous',
      orderId: valRecord.orderId || 'ORD-000',
      specimenId: valRecord.specimenId || 'SPC-000',
      specimenType: valRecord.specimenType || 'Wound',
      collectionDateTime: new Date().toISOString(),
      organismId: 'GEN-01',
      organismName: valRecord.organismName,
      confidenceScore: 99.1,
      astId: valRecord.astId,
      guideline: 'CLSI 2026',
      astResults: [],
      validatedStages: [],
      overallProgress: 100,
      releaseEligible: true,
    };

    const newReport: LaboratoryReport = {
      reportId,
      resultId: approvedResult.resultId,
      status: 'Generated',
      version: 'v1.0',
      versionHistory: [{ versionId: 'v1.0 Initial Release', timestamp: new Date().toISOString(), isActive: true }],
      approvedResult,
      signatures: [],
      distributionHistory: [],
      amendments: [],
      qrCode: {
        reportId,
        verificationToken: `TOK-NEW-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        verificationUrl: `https://lims.micro/verify/${reportId}`,
        timestamp: new Date().toISOString(),
      },
      template: { ...DEFAULT_TEMPLATE },
      sections: DEFAULT_SECTIONS.map((s) => ({ ...s })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    reportsDb.unshift(newReport);
    eventBus.publish('REPORT_GENERATED', newReport);
  });

  // 1. GET /reports
  mockAdapter.register('GET', '/reports', (qp: any) => {
    const { page = '1', limit = '10', search = '', status = 'All' } = qp || {};
    let filtered = [...reportsDb];

    if (status !== 'All') {
      filtered = filtered.filter((r) => r.status.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.reportId.toLowerCase().includes(q) ||
          r.approvedResult.organismName.toLowerCase().includes(q) ||
          r.approvedResult.patientName.toLowerCase().includes(q)
      );
    }

    const p = parseInt(page, 10);
    const l = parseInt(limit, 10);
    const sliced = filtered.slice((p - 1) * l, (p - 1) * l + l);

    return { reports: sliced, total: filtered.length, page: p, limit: l };
  });

  // 2. GET /reports/:id
  mockAdapter.register('GET', '^/reports/[a-zA-Z0-9\\-]+$', (_: any, url?: string) => {
    const id = url?.split('/').pop();
    const report = reportsDb.find((r) => r.reportId === id);
    if (!report) throw { status: 404, message: 'Report record not found.' };
    return report;
  });

  // 3. POST /reports/:id/sign
  mockAdapter.register('POST', '^/reports/[a-zA-Z0-9\\-]+/sign$', (body: any, url?: string) => {
    const parts = url?.split('/');
    const id = parts?.[2];
    const idx = reportsDb.findIndex((r) => r.reportId === id);
    if (idx === -1) throw { status: 404, message: 'Report not found.' };

    const report = { ...reportsDb[idx] };
    if (report.status === 'Released' || report.status === 'Archived') {
      throw { status: 400, message: 'Cannot sign a released or archived report.' };
    }

    const newSig: ReportSignature = {
      id: `SIG-${Date.now()}`,
      signer: body.signer || 'tech_user',
      role: body.role || 'Laboratory Technologist',
      timestamp: new Date().toISOString(),
      verified: true,
    };

    // Prevent duplicate role signature
    report.signatures = report.signatures.filter((s) => s.role !== newSig.role);
    report.signatures.push(newSig);

    if (report.status === 'Draft' || report.status === 'Generated') {
      report.status = 'Pending Signature';
    }

    // Auto-escalation state check: if we have a clinical/pathologist and tech signature, move to Ready For Release
    const hasTech = report.signatures.some((s) => s.role === 'Laboratory Technologist');
    const hasClin = report.signatures.some((s) => s.role === 'Clinical Microbiologist' || s.role === 'Pathologist' || s.role === 'Supervisor');
    if (hasTech && hasClin) {
      report.status = 'Ready For Release';
      eventBus.publish('REPORT_READY_FOR_RELEASE', report);
    }

    report.updatedAt = new Date().toISOString();
    eventBus.publish('REPORT_SIGNATURE_COMPLETED', report);
    reportsDb[idx] = report;
    return report;
  });

  // 4. POST /reports/:id/unsign
  mockAdapter.register('POST', '^/reports/[a-zA-Z0-9\\-]+/unsign$', (body: any, url?: string) => {
    const parts = url?.split('/');
    const id = parts?.[2];
    const idx = reportsDb.findIndex((r) => r.reportId === id);
    if (idx === -1) throw { status: 404, message: 'Report not found.' };

    const report = { ...reportsDb[idx] };
    if (report.status === 'Released' || report.status === 'Archived') {
      throw { status: 400, message: 'Cannot modify signatures on a released report.' };
    }

    report.signatures = report.signatures.filter((s) => s.id !== body.signatureId);
    report.status = report.signatures.length > 0 ? 'Pending Signature' : 'Generated';
    report.updatedAt = new Date().toISOString();
    reportsDb[idx] = report;
    return report;
  });

  // 5. POST /reports/:id/release
  mockAdapter.register('POST', '^/reports/[a-zA-Z0-9\\-]+/release$', (body: any, url?: string) => {
    const parts = url?.split('/');
    const id = parts?.[2];
    const idx = reportsDb.findIndex((r) => r.reportId === id);
    if (idx === -1) throw { status: 404, message: 'Report not found.' };

    const report = { ...reportsDb[idx] };
    if (report.status === 'Released') {
      throw { status: 400, message: 'Report is already released.' };
    }

    report.status = 'Released';
    report.releasedAt = new Date().toISOString();
    report.updatedAt = new Date().toISOString();

    // Update active semantic version to released
    report.versionHistory = report.versionHistory.map((v) =>
      v.isActive ? { ...v, releasedBy: 'supervisor_user', timestamp: new Date().toISOString() } : v
    );

    // Initial distribution log
    if (body.distributionMethods && body.distributionMethods.length > 0) {
      body.distributionMethods.forEach((m: string) => {
        report.distributionHistory.push({
          id: `DIST-${Date.now()}-${m}`,
          method: m as any,
          destination: m === 'Print' ? 'Main Laboratory Printer' : 'clinical-inbox@hospital.org',
          status: 'Success',
          timestamp: new Date().toISOString(),
          initiatedBy: 'supervisor_user',
        });
      });
    }

    eventBus.publish('REPORT_RELEASED', report);
    reportsDb[idx] = report;
    return report;
  });

  // 6. POST /reports/:id/amend
  mockAdapter.register('POST', '^/reports/[a-zA-Z0-9\\-]+/amend$', (body: any, url?: string) => {
    const parts = url?.split('/');
    const id = parts?.[2];
    const idx = reportsDb.findIndex((r) => r.reportId === id);
    if (idx === -1) throw { status: 404, message: 'Report not found.' };

    const report = { ...reportsDb[idx] };

    // Mark previous versions inactive
    report.versionHistory = report.versionHistory.map((v) => ({ ...v, isActive: false }));

    // Parse version float and increment
    const currentVerFloat = parseFloat(report.version.replace('v', ''));
    const nextVer = `v${(currentVerFloat + 0.1).toFixed(1)}`;

    const newVerRecord: ReportVersion = {
      versionId: `${nextVer} Amendment`,
      timestamp: new Date().toISOString(),
      reason: body.reason,
      isActive: true,
    };

    report.version = nextVer;
    report.versionHistory.push(newVerRecord);
    report.status = 'Amended';
    report.signatures = []; // Reset signatures on amendment to require fresh approval signs
    
    report.amendments.push({
      id: `AMD-${Date.now()}`,
      previousReportId: report.reportId,
      newReportId: report.reportId,
      reason: body.reason,
      initiatedBy: 'supervisor_user',
      timestamp: new Date().toISOString(),
    });

    report.updatedAt = new Date().toISOString();
    eventBus.publish('REPORT_AMENDED', report);
    reportsDb[idx] = report;
    return report;
  });

  // 7. POST /reports/:id/distribute
  mockAdapter.register('POST', '^/reports/[a-zA-Z0-9\\-]+/distribute$', (body: any, url?: string) => {
    const parts = url?.split('/');
    const id = parts?.[2];
    const idx = reportsDb.findIndex((r) => r.reportId === id);
    if (idx === -1) throw { status: 404, message: 'Report not found.' };

    const report = { ...reportsDb[idx] };
    const distRecord: DistributionRecord = {
      id: `DIST-${Date.now()}`,
      method: body.method,
      destination: body.destination,
      status: 'Success',
      timestamp: new Date().toISOString(),
      initiatedBy: 'tech_user',
    };

    report.distributionHistory.push(distRecord);
    reportsDb[idx] = report;

    // Publish specific distribution events
    if (body.method === 'Print') {
      eventBus.publish('REPORT_PRINTED', report);
    } else if (body.method === 'PDF Export') {
      eventBus.publish('REPORT_EXPORTED', report);
    } else {
      eventBus.publish('REPORT_DISTRIBUTED', report);
    }

    return report;
  });

  // 8. POST /reports/:id/archive
  mockAdapter.register('POST', '^/reports/[a-zA-Z0-9\\-]+/archive$', (_: any, url?: string) => {
    const parts = url?.split('/');
    const id = parts?.[2];
    const idx = reportsDb.findIndex((r) => r.reportId === id);
    if (idx === -1) throw { status: 404, message: 'Report not found.' };

    const report = { ...reportsDb[idx] };
    report.status = 'Archived';
    report.updatedAt = new Date().toISOString();

    eventBus.publish('REPORT_ARCHIVED', report);
    reportsDb[idx] = report;
    return report;
  });
};

export default initializeMockReportServer;
