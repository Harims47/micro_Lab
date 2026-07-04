export type AuditSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type AuditOutcome = 'Success' | 'Failure' | 'Pending Review';

export interface AuditRecord {
  eventId: string; // AUD-EV-YYYYMMDD-XXXX
  timestamp: string;
  module: string; // e.g. 'Patients', 'Orders', 'Specimens', 'AST', 'Validation', 'Reporting', 'Admin'
  user: string; // e.g. 'tech_user'
  action: string; // e.g. 'Specimen Registered'
  entityId: string;
  severity: AuditSeverity;
  outcome: AuditOutcome;
  details: string;
}

export interface ComplianceSummary {
  totalEvents: number;
  criticalEventsCount: number;
  securityViolationsCount: number;
  lastReviewDate: string;
  complianceScore: number; // 0-100
}
