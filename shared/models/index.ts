import { UserRole, SpecimenStatus, ValidationStatus, AstInterpretation, OrderStatus } from '../enums';

export interface User {
  userId: string;
  username: string;
  name: string;
  role: UserRole;
  email: string;
  isActive: boolean;
}

export interface Patient {
  patientId: string; // PAT-xxxxxxxxxx
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

export interface Order {
  orderId: string; // ORD-xxxxxxxx
  patientId: string;
  patientName: string;
  mrn: string;
  requisitionDate: string;
  physicianName: string;
  physicianNpi: string;
  panelsRequested: string[];
  billingStatus: string;
  orderStatus: OrderStatus;
  createdAt: string;
}

export interface Specimen {
  specimenId: string; // SPC-YYYY-xxxxxx
  orderId: string;
  accessionNumber: string; // BAR-xxx
  specimenType: string;
  sampleSource: string;
  collectedAt: string;
  receivedAt?: string;
  receivedBy?: string;
  status: SpecimenStatus;
  rejectionReason?: string;
  containerCondition?: string;
  createdAt: string;
}

export interface CulturePlate {
  plateId: string; // CULT-SPC-xxx-xx
  specimenId: string;
  mediaType: string;
  lotNumber: string;
  expiryDate: string;
  inoculatedAt: string;
  inoculatedBy: string;
  incubationStart?: string;
  incubationEnd?: string;
  incubationShelf?: string;
  growthStatus: string;
}

export interface Observation {
  observationId: string; // OBS-CULT-xxx-YYYYMMDD
  plateId: string;
  readAt: string;
  readBy: string;
  colonyCount: string;
  morphology: string;
  gramReaction: 'Gram Positive' | 'Gram Negative' | 'N/A';
  isContaminated: boolean;
  notes?: string;
}

export interface ASTResult {
  astId: string; // AST-SPC-xxx-PEN
  specimenId: string;
  organismName: string;
  antibioticName: string;
  antibioticCode: string;
  method: 'Disk Diffusion' | 'MIC Microdilution' | 'E-Test';
  zoneDiameter?: number; // in mm
  micValue?: number; // in mcg/mL
  interpretation: AstInterpretation;
  determinedAt: string;
}

export interface DiagnosticReport {
  reportId: string; // RPT-SPC-xxx-v1
  specimenId: string;
  patientId: string;
  organismIdentified?: string;
  astResults: ASTResult[];
  validationStatus: ValidationStatus;
  technicallyVerifiedBy?: string;
  technicallyVerifiedAt?: string;
  medicallyApprovedBy?: string;
  medicallyApprovedAt?: string;
  digitalSignature?: string;
  createdAt: string;
}

export interface AuditLog {
  auditId: string; // AUD-xxxxxxxxxxxx
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  module: string;
  entityId: string;
  details: string;
}
