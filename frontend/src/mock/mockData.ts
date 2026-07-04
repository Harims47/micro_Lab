import type { User, Patient, Order, Specimen, CulturePlate, Observation, ASTResult, DiagnosticReport, AuditLog } from '../types';
import { UserRole, SpecimenStatus, ValidationStatus, AstInterpretation, OrderStatus } from '../types';

export const mockUsers: User[] = [
  {
    userId: 'USR-001',
    username: 'registrar_user',
    name: 'Sarah Connor',
    role: UserRole.REGISTRAR,
    email: 's.connor@microlab.org',
    isActive: true
  },
  {
    userId: 'USR-002',
    username: 'tech_user',
    name: 'John Miller',
    role: UserRole.TECHNICIAN,
    email: 'j.miller@microlab.org',
    isActive: true
  },
  {
    userId: 'USR-003',
    username: 'supervisor_user',
    name: 'Elena Rostova',
    role: UserRole.SUPERVISOR,
    email: 'e.rostova@microlab.org',
    isActive: true
  },
  {
    userId: 'USR-004',
    username: 'pathologist_user',
    name: 'Dr. Gregory House',
    role: UserRole.PATHOLOGIST,
    email: 'g.house@microlab.org',
    isActive: true
  },
  {
    userId: 'USR-005',
    username: 'finance_user',
    name: 'Christian Bale',
    role: UserRole.FINANCE,
    email: 'c.bale@microlab.org',
    isActive: true
  },
  {
    userId: 'USR-006',
    username: 'admin_user',
    name: 'Ada Lovelace',
    role: UserRole.ADMIN,
    email: 'a.lovelace@microlab.org',
    isActive: true
  }
];

export const mockPatients: Patient[] = [
  {
    patientId: 'PAT-0000000001',
    mrn: 'MRN-45612398',
    firstName: 'John',
    lastName: 'Doe',
    dob: '1984-05-14',
    gender: 'Male',
    phone: '555-0199',
    email: 'j.doe@example.com',
    createdAt: '2026-07-01T08:00:00Z'
  },
  {
    patientId: 'PAT-0000000002',
    mrn: 'MRN-89012345',
    firstName: 'Jane',
    lastName: 'Smith',
    dob: '1991-11-23',
    gender: 'Female',
    phone: '555-0144',
    email: 'j.smith@example.com',
    createdAt: '2026-07-01T09:30:00Z'
  },
  {
    patientId: 'PAT-0000000003',
    mrn: 'MRN-11223344',
    firstName: 'Robert',
    lastName: 'Johnson',
    dob: '1965-07-04',
    gender: 'Male',
    phone: '555-0188',
    email: 'r.johnson@example.com',
    createdAt: '2026-07-02T10:15:00Z'
  }
];

export const mockOrders: Order[] = [
  {
    orderId: 'ORD-00000123',
    patientId: 'PAT-0000000001',
    patientName: 'John Doe',
    mrn: 'MRN-45612398',
    requisitionDate: '2026-07-03T11:00:00Z',
    physicianName: 'Dr. Alice Carter',
    physicianNpi: '1234567890',
    panelsRequested: ['Blood Culture', 'Gram Stain'],
    billingStatus: 'PAID',
    orderStatus: OrderStatus.PROCESSING,
    createdAt: '2026-07-03T11:05:00Z'
  },
  {
    orderId: 'ORD-00000124',
    patientId: 'PAT-0000000002',
    patientName: 'Jane Smith',
    mrn: 'MRN-89012345',
    requisitionDate: '2026-07-03T14:30:00Z',
    physicianName: 'Dr. Bob Vance',
    physicianNpi: '9876543210',
    panelsRequested: ['Urine Culture & Susceptibility'],
    billingStatus: 'PENDING',
    orderStatus: OrderStatus.PROCESSING,
    createdAt: '2026-07-03T14:35:00Z'
  },
  {
    orderId: 'ORD-00000125',
    patientId: 'PAT-0000000003',
    patientName: 'Robert Johnson',
    mrn: 'MRN-11223344',
    requisitionDate: '2026-07-04T09:00:00Z',
    physicianName: 'Dr. Clara Oswald',
    physicianNpi: '5566778899',
    panelsRequested: ['Wound Culture'],
    billingStatus: 'PAID',
    orderStatus: OrderStatus.PENDING,
    createdAt: '2026-07-04T09:05:00Z'
  }
];

export const mockSpecimens: Specimen[] = [
  {
    specimenId: 'SPC-2026-000101',
    orderId: 'ORD-00000123',
    accessionNumber: 'BAR-SPC-2026-000101',
    specimenType: 'Blood',
    sampleSource: 'Peripheral vein blood draw',
    collectedAt: '2026-07-03T11:15:00Z',
    receivedAt: '2026-07-03T12:00:00Z',
    receivedBy: 'Sarah Connor',
    status: SpecimenStatus.INCUBATION,
    containerCondition: 'Good - No leakage',
    createdAt: '2026-07-03T12:05:00Z'
  },
  {
    specimenId: 'SPC-2026-000102',
    orderId: 'ORD-00000124',
    accessionNumber: 'BAR-SPC-2026-000102',
    specimenType: 'Urine',
    sampleSource: 'Clean catch midstream urine',
    collectedAt: '2026-07-03T14:45:00Z',
    receivedAt: '2026-07-03T15:30:00Z',
    receivedBy: 'Sarah Connor',
    status: SpecimenStatus.QUALITY_REVIEW,
    containerCondition: 'Good - Cap sealed',
    createdAt: '2026-07-03T15:35:00Z'
  },
  {
    specimenId: 'SPC-2026-000103',
    orderId: 'ORD-00000125',
    accessionNumber: 'BAR-SPC-2026-000103',
    specimenType: 'Sputum',
    sampleSource: 'Deep cough saliva sample',
    collectedAt: '2026-07-04T09:15:00Z',
    receivedAt: '2026-07-04T09:45:00Z',
    receivedBy: 'Sarah Connor',
    status: SpecimenStatus.REJECTED,
    rejectionReason: 'Label Mismatch',
    containerCondition: 'Compromised - Mismatched patient label print',
    createdAt: '2026-07-04T09:50:00Z'
  }
];

export const mockPlates: CulturePlate[] = [
  {
    plateId: 'CULT-SPC-2026-000101-01',
    specimenId: 'SPC-2026-000101',
    mediaType: 'Blood Agar',
    lotNumber: 'BA-20260601',
    expiryDate: '2026-08-30',
    inoculatedAt: '2026-07-03T12:30:00Z',
    inoculatedBy: 'John Miller',
    incubationStart: '2026-07-03T13:00:00Z',
    incubationShelf: 'Incubator A - Shelf 2',
    growthStatus: 'Growth Observed'
  }
];

export const mockObservations: Observation[] = [
  {
    observationId: 'OBS-CULT-2026-000101-01-20260704',
    plateId: 'CULT-SPC-2026-000101-01',
    readAt: '2026-07-04T08:00:00Z',
    readBy: 'John Miller',
    colonyCount: 'Large confluent growth',
    morphology: 'Beta-hemolytic circular gold colonies',
    gramReaction: 'Gram Positive',
    isContaminated: false,
    notes: 'Suspected Staphylococcus aureus'
  }
];

export const mockASTResults: ASTResult[] = [
  {
    astId: 'AST-SPC-2026-000101-PEN',
    specimenId: 'SPC-2026-000101',
    organismName: 'Staphylococcus aureus',
    antibioticName: 'Penicillin G',
    antibioticCode: 'PEN',
    method: 'Disk Diffusion',
    zoneDiameter: 12,
    interpretation: AstInterpretation.R,
    determinedAt: '2026-07-04T09:15:00Z'
  },
  {
    astId: 'AST-SPC-2026-000101-OXA',
    specimenId: 'SPC-2026-000101',
    organismName: 'Staphylococcus aureus',
    antibioticName: 'Oxacillin',
    antibioticCode: 'OXA',
    method: 'Disk Diffusion',
    zoneDiameter: 22,
    interpretation: AstInterpretation.S,
    determinedAt: '2026-07-04T09:15:00Z'
  }
];

export const mockReports: DiagnosticReport[] = [
  {
    reportId: 'RPT-SPC-2026-000101-v1',
    specimenId: 'SPC-2026-000101',
    patientId: 'PAT-0000000001',
    organismIdentified: 'Staphylococcus aureus',
    astResults: mockASTResults,
    validationStatus: ValidationStatus.PENDING,
    createdAt: '2026-07-04T09:30:00Z'
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    auditId: 'AUD-000000000001',
    timestamp: '2026-07-03T12:00:00Z',
    userId: 'USR-001',
    userName: 'Sarah Connor',
    role: UserRole.REGISTRAR,
    action: 'Accession Specimen',
    module: 'Specimen',
    entityId: 'SPC-2026-000101',
    details: 'Accessioned Blood specimen from Order ORD-00000123'
  },
  {
    auditId: 'AUD-000000000002',
    timestamp: '2026-07-03T12:30:00Z',
    userId: 'USR-002',
    userName: 'John Miller',
    role: UserRole.TECHNICIAN,
    action: 'Plate Inoculation',
    module: 'Culture',
    entityId: 'CULT-SPC-2026-000101-01',
    details: 'Inoculated Blood Agar plate from specimen SPC-2026-000101'
  }
];
