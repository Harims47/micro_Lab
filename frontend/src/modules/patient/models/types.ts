import type { Patient as SharedPatient } from '../../../types';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface PatientAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface PatientInsurance {
  provider: string;
  policyNumber: string;
}

export interface ClinicalFlags {
  allergies: string[];
  isolationRequired: boolean;
  notes?: string;
}

export interface PatientTimelineEvent {
  eventId: string;
  title: string;
  timestamp: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
}

export interface Patient extends SharedPatient {
  status: 'Active' | 'Inactive' | 'Inactive (Merged)';
  nationalId?: string;
  passportNumber?: string;
  address?: PatientAddress;
  emergencyContact?: EmergencyContact;
  insurance?: PatientInsurance;
  clinicalFlags?: ClinicalFlags;
  timeline?: PatientTimelineEvent[];
  mergedIntoId?: string; // If status is Inactive (Merged), this points to the master record
}
