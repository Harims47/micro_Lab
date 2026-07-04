import type { AuditRecord } from '../models/types';

export class AuditValidator {
  /**
   * Enforces immutability check on audit records.
   */
  static validateImmutability(): { isValid: boolean; error?: string } {
    return {
      isValid: false,
      error: 'Regulatory Compliance Lock: Audit trail records are completely immutable and cannot be updated or deleted.',
    };
  }

  /**
   * Validates if required compliance parameters are set.
   */
  static validateComplianceFields(record: Partial<AuditRecord>): { isValid: boolean; error?: string } {
    if (!record.module || !record.user || !record.action || !record.entityId) {
      return {
        isValid: false,
        error: 'Compliance Violation: Audit records require module, user, action, and entity identifiers.',
      };
    }
    return { isValid: true };
  }
}

export default AuditValidator;
