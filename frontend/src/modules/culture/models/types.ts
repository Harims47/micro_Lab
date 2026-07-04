export type CultureStatus =
  | 'Created'
  | 'Media Prepared'
  | 'Inoculated'
  | 'Incubating'
  | 'Observation Pending'
  | 'Growth Detected'
  | 'No Growth'
  | 'Contaminated'
  | 'Repeat Required'
  | 'Completed'
  | 'Cancelled'
  | 'Archived';

export type MediaName =
  | 'Blood Agar'
  | 'MacConkey'
  | 'Chocolate Agar'
  | 'CLED'
  | 'Sabouraud'
  | 'Mueller Hinton'
  | 'Custom';

export interface ColonyItem {
  colonyId: string;
  colonyNumber: number; // e.g. Colony 1
  morphology: string;
  color: string;
  hemolysis: 'Alpha' | 'Beta' | 'Gamma' | 'None';
  odor?: string;
  texture?: string;

  // Sprint 9 Organism identification placeholders
  organismId?: string;
  organismStatus?: 'Pending' | 'Identified' | 'None';
  identificationMethod?: string;
  identificationConfidence?: number;

  // Sprint 10 AST placeholders
  astIds?: string[];
  micIds?: string[];
}

export interface PlateObservation {
  id: string;
  timestamp: string;
  observer: string;
  roundNumber: number; // e.g. Round 1 (18h), Round 2 (24h)
  growthLevel:
    | 'No Growth'
    | 'Scant'
    | 'Light'
    | 'Moderate'
    | 'Heavy'
    | 'Mixed growth'
    | 'Swarming'
    | 'Confluent'
    | 'Isolated colonies'
    | 'No significant growth';
  comments: string;
  attachmentIds: string[]; // Microscope photos
}

export interface CulturePlate {
  plateId: string;
  plateBarcode: string; // PLT-YYYYMMDD-XXXXXX
  mediaName: MediaName;
  mediaLot: string;
  mediaExpiry: string;
  status: 'Created' | 'Inoculated' | 'Incubating' | 'Completed' | 'Contaminated' | 'Archived';
  inoculation: {
    method: string;
    loopSize: string;
    streakPattern: string;
    timestamp: string;
    bench: string;
    technician: string;
  };
  incubation: {
    incubatorId: string;
    chamber: string;
    rack: string;
    shelf: string;
    tempCelsius: number;
    co2Percentage: number;
    humidityPercentage: number;
    startDatetime: string;
    expectedCompletionDatetime: string;
    actualCompletionDatetime?: string;
  };
  observations: PlateObservation[];
  colonies: ColonyItem[];

  // Future downstream references
  organismIds?: string[];
  astIds?: string[];
  micIds?: string[];
  validationIds?: string[];
  reportIds?: string[];
}

export interface Culture {
  cultureId: string;
  cultureAccession: string; // CUL-YYYYMMDD-XXXXXX
  patientId: string;
  patientName: string;
  patientMrn: string;
  orderId: string;
  orderAccession: string;
  specimenId: string;
  specimenBarcode: string;
  status: CultureStatus;
  assignedTech?: string;
  plates: CulturePlate[];
  auditTrail: any[];
}
