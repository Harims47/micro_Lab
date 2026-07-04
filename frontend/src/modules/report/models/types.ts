import type { ApprovedLaboratoryResult } from '../../validation/models/types';

export type ReportStatus =
  | 'Draft'
  | 'Generated'
  | 'Pending Signature'
  | 'Ready For Release'
  | 'Released'
  | 'Amended'
  | 'Archived';

export interface ReportSignature {
  id: string;
  signer: string;
  role: string;
  timestamp: string;
  verified: boolean;
}

export interface DistributionRecord {
  id: string;
  method: 'Print' | 'PDF Export' | 'Email' | 'SMS' | 'Patient Portal' | 'HIS' | 'LIS';
  destination: string;
  status: 'Pending' | 'Success' | 'Failed';
  timestamp: string;
  initiatedBy: string;
}

export interface VerificationQRCode {
  reportId: string;
  verificationToken: string;
  verificationUrl: string;
  timestamp: string;
}

export interface AmendmentRecord {
  id: string;
  previousReportId: string;
  newReportId: string;
  reason: string;
  initiatedBy: string;
  timestamp: string;
}

export interface ReportVersion {
  versionId: string; // e.g. "v1.0 Initial Release", "v1.1 Amendment"
  timestamp: string;
  reason?: string;
  releasedBy?: string;
  isActive: boolean;
}

export interface ReportTemplate {
  templateId: string; // "standard" | "hospital" | "clinic" | "compact"
  name: string;
  showDemographics: boolean;
  showAstGrid: boolean;
  showClinicalInterpretation: boolean;
  showDisclaimer: boolean;
  disclaimerText: string;
}

export interface ReportSection {
  sectionId: string;
  title: string;
  visible: boolean;
  order: number;
}

export interface ReportAuditSummary {
  auditId: string;
  timestamp: string;
  action: string;
  performedBy: string;
  details: string;
}

export interface LaboratoryReport {
  reportId: string; // REP-YYYYMMDD-XXXXXX
  resultId: string;
  status: ReportStatus;
  version: string; // e.g. "v1.0"
  versionHistory: ReportVersion[];
  approvedResult: ApprovedLaboratoryResult;
  signatures: ReportSignature[];
  distributionHistory: DistributionRecord[];
  amendments: AmendmentRecord[];
  qrCode: VerificationQRCode;
  template: ReportTemplate;
  sections: ReportSection[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  releasedAt?: string;
}
