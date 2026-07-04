import type { Patient } from '../models/types';

/**
 * Validates clinical patient demographics fields.
 * Returns a key-value record of active validation errors.
 */
export function validatePatient(patient: Partial<Patient>): Record<string, string> {
  const errors: Record<string, string> = {};

  // 1. Required Demographics
  if (!patient.firstName?.trim()) {
    errors.firstName = 'First name is a mandatory clinical field.';
  } else if (/[^a-zA-Z\s.-]/.test(patient.firstName)) {
    errors.firstName = 'First name contains invalid special characters.';
  }

  if (!patient.lastName?.trim()) {
    errors.lastName = 'Last name is a mandatory clinical field.';
  } else if (/[^a-zA-Z\s.-]/.test(patient.lastName)) {
    errors.lastName = 'Last name contains invalid special characters.';
  }

  if (!patient.gender) {
    errors.gender = 'Gender classification is required.';
  }

  // 2. Date of Birth (DOB) Validation
  if (!patient.dob) {
    errors.dob = 'Date of birth is required.';
  } else {
    const dobDate = new Date(patient.dob);
    if (isNaN(dobDate.getTime())) {
      errors.dob = 'Please enter a valid date of birth calendar format.';
    } else if (dobDate > new Date()) {
      errors.dob = 'Future dates are prohibited for patient births.';
    } else {
      // Basic age sanity check (under 150 years)
      const age = new Date().getFullYear() - dobDate.getFullYear();
      if (age > 130) {
        errors.dob = 'Date of birth exceeds clinical lifespan limits.';
      }
    }
  }

  // 3. Contact Phone & Email
  if (patient.phone) {
    const cleanPhone = patient.phone.replace(/[\s()-]/g, '');
    if (cleanPhone && !/^\+?\d{7,15}$/.test(cleanPhone)) {
      errors.phone = 'Phone number must contain between 7 and 15 digits.';
    }
  }

  if (patient.email?.trim()) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(patient.email.trim())) {
      errors.email = 'Email address format is invalid.';
    }
  }

  // 4. Identity rules
  if (patient.mrn?.trim()) {
    if (!/^MRN-\d+$/.test(patient.mrn.trim())) {
      errors.mrn = 'MRN format must match pattern: MRN-XXXXXXXX (digits).';
    }
  }

  return errors;
}
