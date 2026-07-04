export type OrderPriority = 'Routine' | 'Urgent' | 'STAT' | 'Emergency';

export type OrderStatus =
  | 'Draft'
  | 'Pending'
  | 'Submitted'
  | 'Accepted'
  | 'Specimen Awaiting'
  | 'Specimen Received'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export interface OrderTimelineEvent {
  id: string;
  status: OrderStatus;
  timestamp: string;
  performedBy: string;
  notes?: string;
}

export interface OrderAuditLog {
  id: string;
  timestamp: string;
  performedBy: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
}

export interface Order {
  orderId: string;
  accessionNumber: string; // ORD-YYYYMMDD-XXXXXX
  patientId: string;
  patientMrn: string;
  patientName: string;
  physicianName: string;
  clinicalInfo: string;
  priority: OrderPriority;
  status: OrderStatus;
  requestedTests: string[]; // List of catalog test codes
  createdAt: string;
  submittedAt?: string;

  // Future integration placeholders (Sprint 7/8/9)
  specimenIds?: string[];
  collectionStatus?: 'Pending' | 'Collected' | 'Rejected';
  cultureIds?: string[];
  astIds?: string[];
  validationIds?: string[];
  reportIds?: string[];

  // Logs & History
  timeline: OrderTimelineEvent[];
  auditTrail: OrderAuditLog[];
}

export interface TestCatalogItem {
  code: string;
  name: string;
  department: string;
  requiredSpecimen: string;
  container: string;
  volume: string;
  transport: string;
  storage: string;
  collectionNotes: string;
}

// Global Static Test Catalog Database
export const TEST_CATALOG: TestCatalogItem[] = [
  {
    code: 'MC-001',
    name: 'Urine Culture',
    department: 'Microbiology',
    requiredSpecimen: 'Mid-stream Urine',
    container: 'Sterile Cup',
    volume: '10mL',
    transport: 'Ambient / Ice if delayed',
    storage: 'Refrigerate (2-8°C)',
    collectionNotes: 'Collect mid-stream cleanly. Avoid contact with inner container wall.'
  },
  {
    code: 'MC-002',
    name: 'Blood Culture',
    department: 'Microbiology',
    requiredSpecimen: 'Whole Blood',
    container: 'Aerobic Bottle (Blue)',
    volume: '8mL',
    transport: 'Immediate Ambient transport',
    storage: 'Ambient (20-25°C)',
    collectionNotes: 'Disinfect skin thoroughly. Obtain two sets from distinct sites if possible.'
  },
  {
    code: 'MC-003',
    name: 'CSF Culture',
    department: 'Microbiology',
    requiredSpecimen: 'Cerebrospinal Fluid',
    container: 'Sterile Tube #2',
    volume: '2mL',
    transport: 'Stat Room Temp delivery',
    storage: 'Ambient (Never refrigerate)',
    collectionNotes: 'Collect aseptically via lumbar puncture. Deliver to lab immediately.'
  },
  {
    code: 'MC-004',
    name: 'Gram Stain',
    department: 'Microbiology',
    requiredSpecimen: 'Swab',
    container: 'Amies Gel Swab',
    volume: '1 Swab',
    transport: 'Ambient within 24h',
    storage: 'Ambient (20-25°C)',
    collectionNotes: 'Roll swab firmly across clean margins of active lesion.'
  },
  {
    code: 'MC-005',
    name: 'Wound Culture',
    department: 'Microbiology',
    requiredSpecimen: 'Pus Swab',
    container: 'Sterile Transport Swab',
    volume: '1 Swab',
    transport: 'Ambient within 24h',
    storage: 'Ambient (20-25°C)',
    collectionNotes: 'Debride superficial necrotic material before obtaining specimen.'
  }
];
