import { UserRole } from '../../types';

export const Permission = {
  // Specimen operations
  REGISTER_SPECIMEN: 1 << 0,
  RECEIVE_SPECIMEN: 1 << 1,
  REJECT_SPECIMEN: 1 << 2,
  VIEW_SPECIMENS: 1 << 3,

  // Culture & Plate operations
  INOCULATE_PLATE: 1 << 4,
  OBSERVE_GROWTH: 1 << 5,

  // AST operations
  RECORD_AST_RESULT: 1 << 6,

  // Validation & Reporting operations
  VALIDATE_TECHNICAL: 1 << 7,
  VALIDATE_MEDICAL: 1 << 8,
  RELEASE_REPORT: 1 << 9,

  // Administration operations
  MANAGE_USERS: 1 << 10,
  VIEW_AUDIT_LOGS: 1 << 11,

  // Patient operations
  PATIENT_VIEW: 1 << 12,
  PATIENT_CREATE: 1 << 13,
  PATIENT_EDIT: 1 << 14,
  PATIENT_DELETE: 1 << 15,
  PATIENT_EXPORT: 1 << 16,
  PATIENT_MERGE: 1 << 17,

  // Order operations
  ORDER_VIEW: 1 << 18,
  ORDER_CREATE: 1 << 19,
  ORDER_EDIT: 1 << 20,
  ORDER_DELETE: 1 << 21,
  ORDER_CANCEL: 1 << 22,
  ORDER_APPROVE: 1 << 23,
  ORDER_PRINT: 1 << 24,
  ORDER_EXPORT: 1 << 25,
  ORDER_ASSIGN: 1 << 26,
  ORDER_REOPEN: 1 << 27,

  // Platform operations
  ATTACHMENT_UPLOAD: 1 << 28,
  ATTACHMENT_DELETE: 1 << 29,
  BARCODE_PRINT: 1 << 24,
  BARCODE_REPRINT: 1 << 30,
  NOTE_CREATE: 1 << 31,
  NOTE_EDIT: 1 << 14,
  TASK_ASSIGN: 1 << 26,
  TASK_COMPLETE: 1 << 1,
  AUDIT_VIEW: 1 << 11,
} as const;


export type Permission = typeof Permission[keyof typeof Permission];

// Helper to check if a user bitmask has a specific permission
export function hasBit(mask: number, permission: Permission): boolean {
  return (mask & permission) === permission;
}

// Central Role to Permission Mapping
export const ROLE_PERMISSIONS: Record<UserRole, number> = {
  [UserRole.REGISTRAR]:
    Permission.REGISTER_SPECIMEN |
    Permission.VIEW_SPECIMENS |
    Permission.PATIENT_VIEW |
    Permission.PATIENT_CREATE |
    Permission.PATIENT_EDIT |
    Permission.PATIENT_EXPORT |
    Permission.ORDER_VIEW |
    Permission.ORDER_CREATE |
    Permission.ORDER_EDIT |
    Permission.ORDER_PRINT |
    Permission.ORDER_EXPORT |
    Permission.ATTACHMENT_UPLOAD |
    Permission.NOTE_CREATE,

  [UserRole.TECHNICIAN]:
    Permission.RECEIVE_SPECIMEN |
    Permission.REJECT_SPECIMEN |
    Permission.VIEW_SPECIMENS |
    Permission.INOCULATE_PLATE |
    Permission.OBSERVE_GROWTH |
    Permission.RECORD_AST_RESULT |
    Permission.VALIDATE_TECHNICAL |
    Permission.PATIENT_VIEW |
    Permission.ORDER_VIEW |
    Permission.ORDER_PRINT |
    Permission.ATTACHMENT_UPLOAD |
    Permission.BARCODE_REPRINT |
    Permission.NOTE_CREATE,

  [UserRole.SUPERVISOR]:
    Permission.RECEIVE_SPECIMEN |
    Permission.REJECT_SPECIMEN |
    Permission.VIEW_SPECIMENS |
    Permission.INOCULATE_PLATE |
    Permission.OBSERVE_GROWTH |
    Permission.RECORD_AST_RESULT |
    Permission.VALIDATE_TECHNICAL |
    Permission.VALIDATE_MEDICAL |
    Permission.PATIENT_VIEW |
    Permission.PATIENT_EXPORT |
    Permission.PATIENT_MERGE |
    Permission.ORDER_VIEW |
    Permission.ORDER_EDIT |
    Permission.ORDER_CANCEL |
    Permission.ORDER_APPROVE |
    Permission.ORDER_PRINT |
    Permission.ORDER_EXPORT |
    Permission.ORDER_ASSIGN |
    Permission.ORDER_REOPEN |
    Permission.ATTACHMENT_UPLOAD |
    Permission.ATTACHMENT_DELETE |
    Permission.BARCODE_REPRINT |
    Permission.NOTE_CREATE,

  [UserRole.PATHOLOGIST]:
    Permission.VIEW_SPECIMENS |
    Permission.VALIDATE_MEDICAL |
    Permission.RELEASE_REPORT |
    Permission.PATIENT_VIEW |
    Permission.ORDER_VIEW |
    Permission.ORDER_APPROVE |
    Permission.ATTACHMENT_UPLOAD |
    Permission.NOTE_CREATE,

  [UserRole.FINANCE]:
    Permission.VIEW_SPECIMENS |
    Permission.PATIENT_VIEW |
    Permission.ORDER_VIEW,

  [UserRole.ADMIN]:
    Permission.REGISTER_SPECIMEN |
    Permission.RECEIVE_SPECIMEN |
    Permission.REJECT_SPECIMEN |
    Permission.VIEW_SPECIMENS |
    Permission.INOCULATE_PLATE |
    Permission.OBSERVE_GROWTH |
    Permission.RECORD_AST_RESULT |
    Permission.VALIDATE_TECHNICAL |
    Permission.VALIDATE_MEDICAL |
    Permission.RELEASE_REPORT |
    Permission.MANAGE_USERS |
    Permission.VIEW_AUDIT_LOGS |
    Permission.PATIENT_VIEW |
    Permission.PATIENT_CREATE |
    Permission.PATIENT_EDIT |
    Permission.PATIENT_DELETE |
    Permission.PATIENT_EXPORT |
    Permission.PATIENT_MERGE |
    Permission.ORDER_VIEW |
    Permission.ORDER_CREATE |
    Permission.ORDER_EDIT |
    Permission.ORDER_DELETE |
    Permission.ORDER_CANCEL |
    Permission.ORDER_APPROVE |
    Permission.ORDER_PRINT |
    Permission.ORDER_EXPORT |
    Permission.ORDER_ASSIGN |
    Permission.ORDER_REOPEN |
    Permission.ATTACHMENT_UPLOAD |
    Permission.ATTACHMENT_DELETE |
    Permission.BARCODE_REPRINT |
    Permission.NOTE_CREATE,
};
