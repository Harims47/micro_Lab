import type { Specimen } from '../models/types';

export interface SpecimenValidationError {
  orderId?: string;
  testCode?: string;
  volume?: string;
  collector?: string;
  location?: string;
  method?: string;
}

export class SpecimenValidator {
  /**
   * Validate specimen registration details.
   */
  static validate(specimen: Partial<Specimen>): { isValid: boolean; errors: SpecimenValidationError } {
    const errors: SpecimenValidationError = {};

    if (!specimen.orderId) {
      errors.orderId = 'Order requisition reference is required.';
    }

    if (!specimen.testCode) {
      errors.testCode = 'Diagnostic investigation selection is required.';
    }

    if (specimen.volume === undefined || specimen.volume <= 0) {
      errors.volume = 'Specimen collection volume must be greater than zero.';
    }

    const details = specimen.collectionDetails;
    if (!details) {
      errors.collector = 'Collection details are missing.';
    } else {
      if (!details.collector || details.collector.trim().length < 3) {
        errors.collector = 'Collector staff name must be at least 3 characters.';
      }
      if (!details.location || details.location.trim().length < 3) {
        errors.location = 'Collection clinic/room location is required.';
      }
      if (!details.method || details.method.trim().length < 3) {
        errors.method = 'Collection extraction method (e.g. Swab, Venipuncture) is required.';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}
