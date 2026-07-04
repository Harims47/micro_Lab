import { mockAdapter } from '../../../infrastructure/http/mockAdapter';
import { eventBus } from '../../../services/platform/eventBus';
import type { AuditRecord, ComplianceSummary } from '../models/types';

let auditLogsDb: AuditRecord[] = [];

const seedAudits = () => {
  if (auditLogsDb.length > 0) return;

  const modules = ['Patients', 'Orders', 'Specimens', 'Culture', 'Identification', 'AST', 'Validation', 'Reporting', 'Admin'];
  const actions = [
    'User Login', 'Specimen Registered', 'Media Plate Inoculated', 'Incubation Checked',
    'Organism Identified', 'AST Worksheet Saved', 'Clinical Validation Signed', 'Report Released',
    'Config Parameter Modified',
  ];

  // Seed 85 records
  for (let idx = 0; idx < 85; idx++) {
    const day = String(1 + (idx % 28)).padStart(2, '0');
    const timestamp = `2026-07-${day}T12:00:00Z`;
    const severity = idx % 10 === 0 ? 'Critical' : idx % 6 === 0 ? 'High' : idx % 3 === 0 ? 'Medium' : 'Low';
    const outcome = idx % 12 === 0 ? 'Failure' : 'Success';

    auditLogsDb.push({
      eventId: `AUD-EV-202607-${String(idx + 1).padStart(4, '0')}`,
      timestamp,
      module: modules[idx % modules.length],
      user: ['tech_user', 'supervisor_user', 'dr_chen', 'dr_patel'][idx % 4],
      action: actions[idx % actions.length],
      entityId: `ENT-ID-${idx + 1000}`,
      severity: severity as any,
      outcome: outcome as any,
      details: outcome === 'Failure'
        ? `Operation failed due to compliance validation threshold error: Lot-Ref conflict logged.`
        : `Successfully completed operation trail details mapped for reference ENT-ID-${idx + 1000}.`,
    });
  }
};

export const initializeMockAuditServer = () => {
  seedAudits();

  // Consume event bus signals from previous sprints to automatically append to immutable logs
  eventBus.subscribe('REPORT_RELEASED', (data: any) => {
    auditLogsDb.unshift({
      eventId: `AUD-EV-${Date.now()}`,
      timestamp: new Date().toISOString(),
      module: 'Reporting',
      user: 'supervisor_user',
      action: 'Report Released',
      entityId: data.reportId || 'REP-000',
      severity: 'High',
      outcome: 'Success',
      details: `Report version ${data.version} successfully locked and dispatched to printers.`,
    });
  });

  eventBus.subscribe('QC_FAILED', (data: any) => {
    auditLogsDb.unshift({
      eventId: `AUD-EV-${Date.now()}`,
      timestamp: new Date().toISOString(),
      module: 'Quality Control',
      user: 'tech_user',
      action: 'QC Run Failed',
      entityId: data.sampleId || 'QC-000',
      severity: 'Critical',
      outcome: 'Failure',
      details: `Control strain run failed conformance checks for lot ${data.lotNumber}.`,
    });
  });

  // 1. GET /audit/logs
  mockAdapter.register('GET', '/audit/logs', (qp: any) => {
    const { page = '1', limit = '10', search = '', module = 'All', severity = 'All' } = qp || {};
    let filtered = [...auditLogsDb];

    if (module !== 'All') {
      filtered = filtered.filter((a) => a.module.toLowerCase() === module.toLowerCase());
    }
    if (severity !== 'All') {
      filtered = filtered.filter((a) => a.severity.toLowerCase() === severity.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.eventId.toLowerCase().includes(q) ||
          a.action.toLowerCase().includes(q) ||
          a.user.toLowerCase().includes(q) ||
          a.details.toLowerCase().includes(q)
      );
    }

    const p = parseInt(page, 10);
    const l = parseInt(limit, 10);
    const sliced = filtered.slice((p - 1) * l, (p - 1) * l + l);

    return { records: sliced, total: filtered.length, page: p, limit: l };
  });

  // 2. POST /audit/export
  mockAdapter.register('POST', '/audit/export', () => {
    eventBus.publish('AUDIT_EXPORTED', { timestamp: new Date().toISOString() });
    return { downloadUrl: 'https://lims.micro/exports/audit_export_2026.csv' };
  });

  // 3. GET /audit/compliance
  mockAdapter.register('GET', '/audit/compliance', () => {
    const total = auditLogsDb.length;
    const critical = auditLogsDb.filter((a) => a.severity === 'Critical').length;
    const security = auditLogsDb.filter((a) => a.severity === 'Critical' && a.outcome === 'Failure').length;

    const summary: ComplianceSummary = {
      totalEvents: total,
      criticalEventsCount: critical,
      securityViolationsCount: security,
      lastReviewDate: new Date().toISOString().slice(0, 10),
      complianceScore: Math.max(70, 100 - critical * 2), // basic calculation
    };
    return summary;
  });
};

export default initializeMockAuditServer;
export { auditLogsDb };
