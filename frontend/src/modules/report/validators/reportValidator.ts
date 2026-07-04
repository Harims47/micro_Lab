import type { LaboratoryReport } from '../models/types';

export class ReportValidator {
  /**
   * Validates if a report can transition to 'Released' status.
   */
  static validateRelease(report: LaboratoryReport): { isValid: boolean; error?: string } {
    if (!report.approvedResult) {
      return { isValid: false, error: 'Approved Laboratory Result is required.' };
    }

    if (report.status === 'Draft') {
      return { isValid: false, error: 'Cannot release a report in Draft state. Generate it first.' };
    }

    if (report.status === 'Released' || report.status === 'Archived') {
      return { isValid: false, error: 'Report is already released or archived.' };
    }

    // Verify signatures: we require at least one supervisor or clinical signature before release
    const hasClinicalSignature = report.signatures.some(
      (sig) => (sig.role === 'Clinical Microbiologist' || sig.role === 'Pathologist' || sig.role === 'Supervisor') && sig.verified
    );

    if (!hasClinicalSignature) {
      return {
        isValid: false,
        error: 'Reports require at least one supervisor or clinical validation signature before they can be released.',
      };
    }

    return { isValid: true };
  }

  /**
   * Validates if a report can be edited (e.g. template changes, section visibility).
   */
  static validateEdit(report: LaboratoryReport): { isValid: boolean; error?: string } {
    if (report.status === 'Released' || report.status === 'Archived') {
      return { isValid: false, error: 'Released or Archived reports are read-only and cannot be modified.' };
    }
    return { isValid: true };
  }

  /**
   * Validates amendment inputs.
   */
  static validateAmendment(reason: string): { isValid: boolean; error?: string } {
    if (!reason || reason.trim().length < 5) {
      return { isValid: false, error: 'A justification reason (minimum 5 characters) is required for report amendments.' };
    }
    return { isValid: true };
  }
}

export default ReportValidator;
