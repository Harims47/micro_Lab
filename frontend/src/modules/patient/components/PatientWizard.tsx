import React, { useState, useEffect } from 'react';
import type { Patient, PatientAddress, EmergencyContact, PatientInsurance, ClinicalFlags } from '../models/types';
import { PatientService } from '../services/patientService';
import { validatePatient } from '../validators/patientValidator';
import { useNotification } from '../../../infrastructure/notifications/useNotification';
import { useDialog } from '../../../infrastructure/dialogs/useDialog';
import { useGlobalState } from '../../../providers/GlobalStateProvider';
import { Button } from '../../../components/Foundation/Button';
import { TextInput } from '../../../components/Form/TextInput';
import { Select } from '../../../components/Form/Select';
import { Checkbox } from '../../../components/Form/Checkbox';
import { TextArea } from '../../../components/Form/TextArea';

interface PatientWizardProps {
  patientId?: string; // If provided, we are in Edit mode
  onClose: () => void;
}

const INITIAL_ADDRESS: PatientAddress = { street: '', city: '', state: '', zipCode: '' };
const INITIAL_EMERGENCY: EmergencyContact = { name: '', relationship: '', phone: '' };
const INITIAL_INSURANCE: PatientInsurance = { provider: '', policyNumber: '' };
const INITIAL_FLAGS: ClinicalFlags = { allergies: [], isolationRequired: false, notes: '' };

export const PatientWizard: React.FC<PatientWizardProps> = ({
  patientId,
  onClose,
}) => {
  const isEditMode = !!patientId;
  const { addToast } = useNotification();
  const { confirmUnsavedChanges } = useDialog();
  const { addAuditLog } = useGlobalState();

  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form Fields State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [mrn, setMrn] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [passportNumber, setPassportNumber] = useState('');

  // Nested structures
  const [address, setAddress] = useState<PatientAddress>(INITIAL_ADDRESS);
  const [emergency, setEmergency] = useState<EmergencyContact>(INITIAL_EMERGENCY);
  const [insurance, setInsurance] = useState<PatientInsurance>(INITIAL_INSURANCE);
  const [flags, setFlags] = useState<ClinicalFlags>(INITIAL_FLAGS);

  // ─── Fetch / Restore / Draft Logic ──────────────────────────────────────────

  // Fetch patient if in edit mode
  useEffect(() => {
    if (isEditMode && patientId) {
      const fetchPatientDetails = async () => {
        setLoading(true);
        try {
          const p = await PatientService.getPatientById(patientId);
          setFirstName(p.firstName);
          setLastName(p.lastName);
          setDob(p.dob);
          setGender(p.gender);
          setMrn(p.mrn);
          setPhone(p.phone || '');
          setEmail(p.email || '');
          setNationalId(p.nationalId || '');
          setPassportNumber(p.passportNumber || '');
          if (p.address) setAddress(p.address);
          if (p.emergencyContact) setEmergency(p.emergencyContact);
          if (p.insurance) setInsurance(p.insurance);
          if (p.clinicalFlags) setFlags(p.clinicalFlags);
        } catch (err: any) {
          addToast('error', err.message || 'Failed to fetch patient data.');
          onClose();
        } finally {
          setLoading(false);
        }
      };
      fetchPatientDetails();
    } else {
      // Creation Mode: Check for saved drafts
      const draft = localStorage.getItem('lims_patient_draft');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          const resume = window.confirm('LIMS recovery: An unsaved registration draft was detected. Resume draft?');
          if (resume) {
            setFirstName(parsed.firstName || '');
            setLastName(parsed.lastName || '');
            setDob(parsed.dob || '');
            setGender(parsed.gender || '');
            setMrn(parsed.mrn || '');
            setPhone(parsed.phone || '');
            setEmail(parsed.email || '');
            setNationalId(parsed.nationalId || '');
            setPassportNumber(parsed.passportNumber || '');
            if (parsed.address) setAddress(parsed.address);
            if (parsed.emergencyContact) setEmergency(parsed.emergencyContact);
            if (parsed.insurance) setInsurance(parsed.insurance);
            if (parsed.clinicalFlags) setFlags(parsed.clinicalFlags);
            setDirty(true);
            addToast('info', 'Draft retrieved successfully.');
          } else {
            localStorage.removeItem('lims_patient_draft');
          }
        } catch {
          // Silent catch
        }
      }
    }
  }, [isEditMode, patientId, onClose, addToast]);

  const saveDraft = () => {
    const payload = {
      firstName, lastName, dob, gender, mrn, phone, email, nationalId, passportNumber,
      address, emergencyContact: emergency, insurance, clinicalFlags: flags
    };
    localStorage.setItem('lims_patient_draft', JSON.stringify(payload));
    addToast('success', 'Draft saved locally.', 'Registration Draft');
  };

  const clearDraft = () => {
    localStorage.removeItem('lims_patient_draft');
  };

  // ─── Step Transitions & Validations ─────────────────────────────────────────

  const validateCurrentStep = (): boolean => {
    setErrors({});
    const validationErrors = validatePatient({
      firstName,
      lastName,
      dob,
      gender,
      mrn,
      phone,
      email,
    });

    // Check specific fields corresponding to step
    const stepErrors: Record<string, string> = {};
    if (activeStep === 1) {
      if (validationErrors.firstName) stepErrors.firstName = validationErrors.firstName;
      if (validationErrors.lastName) stepErrors.lastName = validationErrors.lastName;
      if (validationErrors.dob) stepErrors.dob = validationErrors.dob;
      if (validationErrors.gender) stepErrors.gender = validationErrors.gender;
      if (validationErrors.mrn) stepErrors.mrn = validationErrors.mrn;
    } else if (activeStep === 2) {
      if (validationErrors.phone) stepErrors.phone = validationErrors.phone;
      if (validationErrors.email) stepErrors.email = validationErrors.email;
    }

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      addToast('error', 'Form contains validation errors. Please correct fields.', 'Validation Error');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleCancel = async () => {
    if (dirty) {
      const exit = await confirmUnsavedChanges();
      if (!exit) return;
    }
    clearDraft();
    onClose();
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setLoading(true);
    const payload: Omit<Patient, 'patientId' | 'createdAt' | 'status'> = {
      firstName,
      lastName,
      dob,
      gender,
      mrn,
      phone,
      email,
      nationalId,
      passportNumber,
      address,
      emergencyContact: emergency,
      insurance,
      clinicalFlags: flags,
    };

    try {
      if (isEditMode && patientId) {
        await PatientService.updatePatient(patientId, payload);
        addToast('success', 'Patient record updated successfully.', 'Registry Updated');
        addAuditLog('Patient Update', 'Patient', patientId, `Modified patient details for ${lastName}, ${firstName}`);
      } else {
        const created = await PatientService.createPatient(payload);
        addToast('success', `Registered patient: ${firstName} ${lastName}`, 'Registry Created');
        addAuditLog('Patient Create', 'Patient', created.patientId, `Created patient record ${created.mrn}`);
      }
      clearDraft();
      onClose();
    } catch (err: any) {
      addToast('error', err.message || 'Failed to submit patient details.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to handle flat field dirty tracking
  const updateField = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
    setter(value);
    setDirty(true);
  };

  return (
    <div style={styles.container}>
      {/* Title */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          {isEditMode ? 'Edit Patient Demographics' : 'Register New Patient'}
        </h2>
        <span style={styles.subtitle}>
          Step {activeStep} of 7: {getStepName(activeStep)}
        </span>
      </div>

      {/* Progress Line Bar */}
      <div style={styles.progressTracker}>
        {Array.from({ length: 7 }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            style={{
              ...styles.progressBarNode,
              backgroundColor:
                step === activeStep
                  ? 'var(--color-brand-primary)'
                  : step < activeStep
                  ? 'var(--color-status-success)'
                  : 'var(--color-border-default)',
            }}
          />
        ))}
      </div>

      {/* Step Form Outlets */}
      <div style={styles.formPanel}>
        {loading ? (
          <div style={styles.loader}>🔄 Locking clinical registry indexes...</div>
        ) : (
          <>
            {/* Step 1: Patient Identity */}
            {activeStep === 1 && (
              <div style={styles.stepForm}>
                <div style={styles.formRow}>
                  <TextInput
                    label="First Name"
                    value={firstName}
                    onChange={(e) => updateField(setFirstName, e.target.value)}
                    error={errors.firstName}
                    required
                  />
                  <TextInput
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => updateField(setLastName, e.target.value)}
                    error={errors.lastName}
                    required
                  />
                </div>
                <div style={styles.formRow}>
                  <TextInput
                    label="Date of Birth"
                    type="date"
                    value={dob}
                    onChange={(e) => updateField(setDob, e.target.value)}
                    error={errors.dob}
                    required
                  />
                  <Select
                    label="Gender"
                    value={gender}
                    onChange={(val) => updateField(setGender, val)}
                    options={[
                      { value: '', label: '-- Choose Option --' },
                      { value: 'Male', label: 'Male' },
                      { value: 'Female', label: 'Female' },
                      { value: 'Other', label: 'Other' },
                      { value: 'Unknown', label: 'Unknown' },
                    ]}
                    error={errors.gender}
                    required
                  />
                </div>
                <div style={styles.formRow}>
                  <TextInput
                    label="Medical Record Number (MRN)"
                    value={mrn}
                    onChange={(e) => updateField(setMrn, e.target.value)}
                    placeholder="e.g. MRN-12345678"
                    error={errors.mrn}
                  />
                  <div style={{ flex: 1 }} />
                </div>
              </div>
            )}

            {/* Step 2: Contact Details */}
            {activeStep === 2 && (
              <div style={styles.stepForm}>
                <div style={styles.formRow}>
                  <TextInput
                    label="Mobile Telephone Number"
                    value={phone}
                    onChange={(e) => updateField(setPhone, e.target.value)}
                    placeholder="e.g. 555-0100"
                    error={errors.phone}
                  />
                  <TextInput
                    label="Primary Clinical Email"
                    value={email}
                    onChange={(e) => updateField(setEmail, e.target.value)}
                    placeholder="e.g. name@domain.com"
                    error={errors.email}
                  />
                </div>
                <div style={styles.formRow}>
                  <TextInput
                    label="National ID Card"
                    value={nationalId}
                    onChange={(e) => updateField(setNationalId, e.target.value)}
                    placeholder="Enter ID digits"
                  />
                  <TextInput
                    label="Passport Number"
                    value={passportNumber}
                    onChange={(e) => updateField(setPassportNumber, e.target.value)}
                    placeholder="Enter passport number"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Address */}
            {activeStep === 3 && (
              <div style={styles.stepForm}>
                <TextInput
                  label="Street Address"
                  value={address.street}
                  onChange={(e) => {
                    setAddress({ ...address, street: e.target.value });
                    setDirty(true);
                  }}
                  placeholder="e.g. 123 Health Ave"
                />
                <div style={styles.formRow}>
                  <TextInput
                    label="City"
                    value={address.city}
                    onChange={(e) => {
                      setAddress({ ...address, city: e.target.value });
                      setDirty(true);
                    }}
                    placeholder="e.g. Metropolis"
                  />
                  <TextInput
                    label="State / Province"
                    value={address.state}
                    onChange={(e) => {
                      setAddress({ ...address, state: e.target.value });
                      setDirty(true);
                    }}
                    placeholder="e.g. NY"
                  />
                  <TextInput
                    label="ZIP / Postal Code"
                    value={address.zipCode}
                    onChange={(e) => {
                      setAddress({ ...address, zipCode: e.target.value });
                      setDirty(true);
                    }}
                    placeholder="e.g. 10001"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Emergency Contacts */}
            {activeStep === 4 && (
              <div style={styles.stepForm}>
                <TextInput
                  label="Contact Full Name"
                  value={emergency.name}
                  onChange={(e) => {
                    setEmergency({ ...emergency, name: e.target.value });
                    setDirty(true);
                  }}
                  placeholder="Enter contact full name"
                />
                <div style={styles.formRow}>
                  <TextInput
                    label="Relationship"
                    value={emergency.relationship}
                    onChange={(e) => {
                      setEmergency({ ...emergency, relationship: e.target.value });
                      setDirty(true);
                    }}
                    placeholder="e.g. Parent, Spouse"
                  />
                  <TextInput
                    label="Emergency Telephone"
                    value={emergency.phone}
                    onChange={(e) => {
                      setEmergency({ ...emergency, phone: e.target.value });
                      setDirty(true);
                    }}
                    placeholder="Enter phone digits"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Insurance */}
            {activeStep === 5 && (
              <div style={styles.stepForm}>
                <div style={styles.formRow}>
                  <TextInput
                    label="Insurance Provider"
                    value={insurance.provider}
                    onChange={(e) => {
                      setInsurance({ ...insurance, provider: e.target.value });
                      setDirty(true);
                    }}
                    placeholder="e.g. Central Healthcare Service"
                  />
                  <TextInput
                    label="Policy Group Number"
                    value={insurance.policyNumber}
                    onChange={(e) => {
                      setInsurance({ ...insurance, policyNumber: e.target.value });
                      setDirty(true);
                    }}
                    placeholder="e.g. POL-123456"
                  />
                </div>
              </div>
            )}

            {/* Step 6: Clinical Alerts Flags */}
            {activeStep === 6 && (
              <div style={styles.stepForm}>
                <Checkbox
                  label="Isolation Precautions Required"
                  description="Check if patient requires specific infection control precautions (MRSA, C. diff, etc.)."
                  checked={flags.isolationRequired}
                  onChange={(e) => {
                    setFlags({ ...flags, isolationRequired: e.target.checked });
                    setDirty(true);
                  }}
                />
                <TextInput
                  label="Allergy Flags (Comma-separated)"
                  value={flags.allergies.join(', ')}
                  onChange={(e) => {
                    setFlags({
                      ...flags,
                      allergies: e.target.value.split(',').map((val) => val.trim()).filter(Boolean),
                    });
                    setDirty(true);
                  }}
                  placeholder="e.g. Penicillin, Sulfa, Nuts"
                />
                <TextArea
                  label="Clinical Demographics Notes"
                  value={flags.notes || ''}
                  onChange={(e) => {
                    setFlags({ ...flags, notes: e.target.value });
                    setDirty(true);
                  }}
                  placeholder="Enter clinical notations regarding demographics."
                />
              </div>
            )}

            {/* Step 7: Review & Confirm */}
            {activeStep === 7 && (
              <div style={styles.stepForm}>
                <h3 style={{ margin: '0 0 var(--spacing-xs) 0', borderBottom: '1px solid var(--color-border-default)', paddingBottom: '4px' }}>
                  Demographics Validation Summary
                </h3>
                <div style={styles.summaryGrid}>
                  <div style={styles.summaryItem}><strong>Full Name:</strong> {lastName}, {firstName}</div>
                  <div style={styles.summaryItem}><strong>Gender:</strong> {gender}</div>
                  <div style={styles.summaryItem}><strong>Birth Date:</strong> {new Date(dob).toLocaleDateString()}</div>
                  <div style={styles.summaryItem}><strong>MRN ID:</strong> {mrn || 'Auto-Generate'}</div>
                  <div style={styles.summaryItem}><strong>Mobile:</strong> {phone || 'Not provided'}</div>
                  <div style={styles.summaryItem}><strong>Email:</strong> {email || 'Not provided'}</div>
                  <div style={styles.summaryItem}><strong>Address:</strong> {address.street || 'Not provided'}, {address.city}</div>
                  <div style={styles.summaryItem}><strong>Emergency Contact:</strong> {emergency.name} ({emergency.relationship})</div>
                  <div style={styles.summaryItem}><strong>Insurance:</strong> {insurance.provider} - {insurance.policyNumber}</div>
                  <div style={styles.summaryItem}>
                    <strong>Isolation Needed:</strong>{' '}
                    <span style={{ color: flags.isolationRequired ? 'var(--color-status-danger)' : 'var(--color-text-secondary)', fontWeight: 600 }}>
                      {flags.isolationRequired ? 'Yes (Strict Contact)' : 'No'}
                    </span>
                  </div>
                  {flags.allergies.length > 0 && (
                    <div style={styles.summaryItem}>
                      <strong>Active Allergies:</strong> {flags.allergies.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Wizard Action Toolbar */}
      <div style={styles.actionsBar}>
        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          {!isEditMode && activeStep < 7 && (
            <Button variant="outline" onClick={saveDraft} disabled={loading}>
              Save Draft
            </Button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
          {activeStep > 1 && (
            <Button variant="outline" onClick={handlePrev} disabled={loading}>
              Back
            </Button>
          )}
          {activeStep < 7 ? (
            <Button variant="solid" onClick={handleNext} disabled={loading}>
              Continue
            </Button>
          ) : (
            <Button variant="solid" onClick={handleSubmit} disabled={loading}>
              {isEditMode ? 'Save Updates' : 'Confirm Registration'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const getStepName = (step: number): string => {
  switch (step) {
    case 1: return 'Patient Identity';
    case 2: return 'Contact Details';
    case 3: return 'Address';
    case 4: return 'Emergency Contact';
    case 5: return 'Insurance';
    case 6: return 'Clinical Flags';
    case 7: return 'Review & Confirm';
    default: return 'Identity';
  }
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--elevation-2)',
    padding: 'var(--spacing-xl)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: 'var(--spacing-xs)',
  },
  title: {
    font: 'var(--type-heading-section)',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  subtitle: {
    font: 'var(--type-body-small)',
    color: 'var(--color-text-secondary)',
  },
  progressTracker: {
    display: 'flex',
    gap: '4px',
    height: '4px',
    width: '100%',
  },
  progressBarNode: {
    flex: 1,
    borderRadius: 'var(--radius-sm)',
    transition: 'background-color var(--motion-duration-normal) var(--motion-ease-standard)',
  },
  formPanel: {
    minHeight: '260px',
    padding: 'var(--spacing-sm) 0',
  },
  stepForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  },
  formRow: {
    display: 'flex',
    gap: 'var(--spacing-md)',
    width: '100%',
  },
  actionsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--color-border-default)',
    paddingTop: 'var(--spacing-md)',
    marginTop: 'var(--spacing-xs)',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 'var(--spacing-sm)',
    backgroundColor: 'var(--color-surface-base)',
    border: '1px solid var(--color-border-default)',
    padding: 'var(--spacing-md)',
    borderRadius: 'var(--radius-sm)',
  },
  summaryItem: {
    font: 'var(--type-body-default)',
    color: 'var(--color-text-primary)',
  },
  loader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    color: 'var(--color-text-secondary)',
    font: 'var(--type-body-default)',
  },
};
export default PatientWizard;
