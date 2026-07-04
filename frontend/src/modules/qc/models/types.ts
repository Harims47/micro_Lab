export type QCSampleStatus =
  | 'Scheduled'
  | 'Collected'
  | 'Processed'
  | 'Verified'
  | 'Passed'
  | 'Failed';

export type InstrumentQCStatus =
  | 'Calibration Due'
  | 'Calibrated'
  | 'Maintenance Due'
  | 'Maintenance Scheduled'
  | 'Maintenance Completed'
  | 'Offline'
  | 'Passed';

export interface QCSample {
  sampleId: string; // QC-SMP-YYYYMMDD-XXXX
  controlStrain: string; // e.g. ATCC 25922
  targetOrganism: string; // Escherichia coli
  status: QCSampleStatus;
  scheduledDate: string;
  collectedDate?: string;
  processedDate?: string;
  verifiedDate?: string;
  technician?: string;
  lotNumber: string;
  findings?: string;
}

export interface QCInstrument {
  instrumentId: string;
  name: string;
  code: string;
  status: InstrumentQCStatus;
  lastCalibrationDate?: string;
  nextCalibrationDueDate?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDueDate?: string;
  downtimeHours: number;
}

export interface QCReagent {
  reagentId: string;
  name: string;
  lotNumber: string;
  expirationDate: string;
  storageConditions: string;
  qcStatus: 'Passed' | 'Failed' | 'Pending';
  usageCount: number;
}

export interface QCResult {
  resultId: string;
  sampleId: string;
  agentId: string;
  agentName: string;
  expectedMin: number;
  expectedMax: number;
  observedValue: number;
  unit: string;
  interpretation: 'Passed' | 'Failed';
}

export interface QCEvent {
  eventId: string;
  timestamp: string;
  type: 'Calibration' | 'Maintenance' | 'Reagent Lot Expiry' | 'QC Run';
  entityId: string;
  entityName: string;
  performedBy: string;
  comments: string;
}
