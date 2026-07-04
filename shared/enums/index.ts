export const UserRole = {
  REGISTRAR: 'REGISTRAR',
  TECHNICIAN: 'TECHNICIAN',
  SUPERVISOR: 'SUPERVISOR',
  PATHOLOGIST: 'PATHOLOGIST',
  FINANCE: 'FINANCE',
  ADMIN: 'ADMIN'
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const SpecimenStatus = {
  REQUESTED: 'REQUESTED',
  REGISTERED: 'REGISTERED',
  COLLECTED: 'COLLECTED',
  IN_TRANSIT: 'IN_TRANSIT',
  RECEIVED: 'RECEIVED',
  QUALITY_REVIEW: 'QUALITY_REVIEW',
  ACCEPTED: 'ACCEPTED',
  PROCESSING: 'PROCESSING',
  CULTURE: 'CULTURE',
  INCUBATION: 'INCUBATION',
  OBSERVATION: 'OBSERVATION',
  IDENTIFICATION: 'IDENTIFICATION',
  AST: 'AST',
  VALIDATION: 'VALIDATION',
  REPORT_GENERATED: 'REPORT_GENERATED',
  DELIVERED: 'DELIVERED',
  REJECTED: 'REJECTED',
  ARCHIVED: 'ARCHIVED',
  DISPOSED: 'DISPOSED'
} as const;
export type SpecimenStatus = typeof SpecimenStatus[keyof typeof SpecimenStatus];

export const ValidationStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  APPROVED: 'APPROVED',
  RELEASED: 'RELEASED'
} as const;
export type ValidationStatus = typeof ValidationStatus[keyof typeof ValidationStatus];

export const AstInterpretation = {
  S: 'S', // Susceptible
  I: 'I', // Intermediate
  R: 'R'  // Resistant
} as const;
export type AstInterpretation = typeof AstInterpretation[keyof typeof AstInterpretation];

export const OrderStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];
