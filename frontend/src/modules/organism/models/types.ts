export interface OrganismMaster {
  organismId: string; // unique ID
  genus: string;
  species: string;
  subspecies?: string;
  gramClassification: 'Gram Positive' | 'Gram Negative' | 'Gram Variable';
  shape: 'Cocci' | 'Bacilli' | 'Coccobacilli' | 'Spirilla' | 'Pleomorphic';
  respiration: 'Aerobic' | 'Anaerobic' | 'Facultative Anaerobe' | 'Microaerophilic';
  commonSpecimenTypes: string[];
  commonCultureMedia: string[];
  recommendedAstPanel: string;
  biosafetyLevel: 'BSL-1' | 'BSL-2' | 'BSL-3';
  clinicalNotes?: string;
  synonyms?: string[];
  taxonomyVersion: string;
}

export interface IdentificationInstrument {
  instrumentId: string;
  vendor: string;
  model: string;
  serialNumber: string;
  calibrationStatus: 'Calibrated' | 'Pending' | 'Out of Calibration';
  lastQcDate: string;
}

export interface IdentificationConfidenceModel {
  instrumentConfidence: number; // match percentage
  technicianConfidence: 'High' | 'Medium' | 'Low';
  supervisorConfidence: 'High' | 'Medium' | 'Low';
  finalConfidence: 'High' | 'Medium' | 'Low' | 'Unconfirmed';
}

export interface IdentificationAttempt {
  attemptId: string;
  colonyId: string;
  attemptNumber: number;
  organismId: string; // References OrganismMaster
  organismName: string;
  method: 'Manual' | 'Biochemical Panel' | 'MALDI-TOF' | 'VITEK 2' | 'PCR' | 'Custom';
  confidence: IdentificationConfidenceModel;
  instrument?: IdentificationInstrument;
  performedBy: string;
  timestamp: string;
  reasonForChange?: string;
  status: 'Pending Verification' | 'Approved' | 'Rejected';
}

export interface GramStain {
  reaction: 'Gram Positive' | 'Gram Negative' | 'Gram Variable' | 'Not Applicable';
  shape: 'Cocci' | 'Bacilli' | 'Coccobacilli' | 'Spirilla' | 'Pleomorphic';
  arrangement: 'Singles' | 'Pairs' | 'Chains' | 'Clusters' | 'Tetrads' | 'Palisades';
  technician: string;
  timestamp: string;
}

export interface BiochemicalResult {
  testName: 'Catalase' | 'Coagulase' | 'Oxidase' | 'Indole' | 'Urease' | 'Citrate' | 'Triple Sugar Iron (TSI)' | 'Custom';
  result: 'Positive' | 'Negative' | 'Weak Positive' | 'Delayed' | 'Not Performed';
  performedBy: string;
  timestamp: string;
  notes?: string;
}

export interface Colony {
  colonyId: string;
  plateId: string;
  plateBarcode: string;
  cultureAccession: string;
  colonyNumber: number;
  status: 'Observed' | 'Selected' | 'Under Identification' | 'Identified' | 'Sent to AST' | 'Completed' | 'Archived';
  qcStatus: 'Pending QC' | 'QC Verified' | 'QC Failed' | 'Repeat Identification';
  morphology: string;
  color: string;
  hemolysis: 'Alpha' | 'Beta' | 'Gamma' | 'None';
  odor?: string;
  texture?: string;
  gramStain?: GramStain;
  biochemicals: BiochemicalResult[];
  attempts: IdentificationAttempt[];
  approvedAttempt?: IdentificationAttempt;

  // Future AST/Validation contracts placeholders
  astRequestId?: string;
  astPanelId?: string;
  micRequestId?: string;
  validationId?: string;
  reportId?: string;
}
