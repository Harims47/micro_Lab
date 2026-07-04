import type { QCSample, QCReagent, QCInstrument } from '../models/types';

export class QcValidator {
  /**
   * Checks if a reagent lot is expired before executing QC tasks.
   */
  static validateReagentUsage(reagent: QCReagent): { isValid: boolean; error?: string } {
    const today = new Date().toISOString().slice(0, 10);
    if (reagent.expirationDate < today) {
      return { isValid: false, error: `Reagent lot ${reagent.lotNumber} is expired (Expiry: ${reagent.expirationDate}).` };
    }
    return { isValid: true };
  }

  /**
   * Validates if a QC schedule request conflicts with scheduled instrument maintenance.
   */
  static validateInstrumentConflict(
    instrument: QCInstrument,
    scheduledDate: string
  ): { isValid: boolean; error?: string } {
    if (instrument.status === 'Offline') {
      return { isValid: false, error: `${instrument.name} is currently offline and unavailable for QC runs.` };
    }

    if (
      instrument.status === 'Maintenance Scheduled' &&
      instrument.nextMaintenanceDueDate &&
      instrument.nextMaintenanceDueDate.startsWith(scheduledDate)
    ) {
      return {
        isValid: false,
        error: `Conflict: Scheduled QC date matches scheduled maintenance downtime for ${instrument.name}.`,
      };
    }

    return { isValid: true };
  }

  /**
   * Checks if sample scheduler fields are filled.
   */
  static validateSampleSchedule(sample: Partial<QCSample>): { isValid: boolean; error?: string } {
    if (!sample.controlStrain || sample.controlStrain.trim().length === 0) {
      return { isValid: false, error: 'Control strain registration tag is required.' };
    }
    if (!sample.scheduledDate || sample.scheduledDate.trim().length === 0) {
      return { isValid: false, error: 'Scheduled run date is required.' };
    }
    return { isValid: true };
  }
}

export default QcValidator;
