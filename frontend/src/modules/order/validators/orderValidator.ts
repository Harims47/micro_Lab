import type { Order } from '../models/types';

export interface OrderValidationError {
  patientId?: string;
  physicianName?: string;
  priority?: string;
  requestedTests?: string;
  clinicalInfo?: string;
}

export class OrderValidator {
  /**
   * Validate order requisitions fields.
   */
  static validate(order: Partial<Order>): { isValid: boolean; errors: OrderValidationError } {
    const errors: OrderValidationError = {};

    if (!order.patientId) {
      errors.patientId = 'Patient selection is required.';
    }

    if (!order.physicianName || order.physicianName.trim().length < 3) {
      errors.physicianName = 'Ordering physician name must be at least 3 characters.';
    }

    if (!order.priority) {
      errors.priority = 'Order urgency priority is required.';
    }

    if (!order.requestedTests || order.requestedTests.length === 0) {
      errors.requestedTests = 'At least one diagnostic investigation must be requested.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}
