export type SpecimenStatus =
  | 'Draft'
  | 'Scheduled'
  | 'Collected'
  | 'Collection Failed'
  | 'Awaiting Transport'
  | 'Transported'
  | 'Received'
  | 'Under Quality Check'
  | 'Accepted'
  | 'Rejected'
  | 'Split'
  | 'Aliquoted'
  | 'In Culture'
  | 'In Testing'
  | 'Completed'
  | 'Archived'
  | 'Disposed';

export interface CustodyEvent {
  id: string;
  status: SpecimenStatus;
  timestamp: string;
  performedBy: string;
  role: string;
  department: string;
  location: string;
  action: string;
  comments?: string;
  device?: string;
  workstation?: string;
}

export interface QualityAssessment {
  quantitySufficient: boolean;
  containerCorrect: boolean;
  labelCorrect: boolean;
  leakage: boolean;
  hemolysis: boolean;
  contamination: boolean;
  temperatureAcceptable: boolean;
  transportDelay: boolean;
  decision: 'Accepted' | 'Rejected';
  reviewer: string;
  timestamp: string;
}

export interface BarcodePrintLog {
  id: string;
  timestamp: string;
  performedBy: string;
  workstation: string;
  isReplacement: boolean;
  reason?: string;
}

export interface SpecimenAuditTrail {
  id: string;
  timestamp: string;
  performedBy: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  source: string;
}

export interface Specimen {
  specimenId: string;
  barcode: string; // SPC-YYYYMMDD-XXXXXX
  patientId: string;
  patientMrn: string;
  patientName: string;
  orderId: string;
  orderAccession: string;
  testCode: string;
  testName: string;
  status: SpecimenStatus;
  priority: 'Routine' | 'Urgent' | 'STAT' | 'Emergency';
  containerType: string;
  volume: number; // in mL or swap units
  parentId?: string; // Links aliquot to parent container

  collectionDetails: {
    timestamp: string;
    collector: string;
    location: string;
    method: string;
  };

  transportDetails?: {
    pickupTime?: string;
    courier?: string;
    transportBox?: string;
    temperature?: string;
    arrivalTime?: string;
    durationMinutes?: number;
  };

  qualityAssessment?: QualityAssessment;
  rejectionCategory?: string;
  rejectionReason?: string;

  barcodePrintHistory: BarcodePrintLog[];
  custodyHistory: CustodyEvent[];
  auditTrail: SpecimenAuditTrail[];

  // Integration Placeholders for Sprints 8/9/10
  cultureIds?: string[];
  incubationIds?: string[];
  organismIds?: string[];
  astIds?: string[];
  validationIds?: string[];
  reportIds?: string[];
  attachmentIds?: string[];
  imageIds?: string[];
}

export const REJECTION_CATEGORIES = [
  'Wrong patient',
  'Wrong container',
  'Insufficient volume',
  'Leaking specimen',
  'Expired specimen',
  'Damaged container',
  'Incorrect transport',
  'Missing label',
  'Duplicate specimen'
] as const;
