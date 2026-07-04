import React, { useState, useEffect } from 'react';
import { TEST_CATALOG } from '../models/types';
import { OrderService } from '../services/orderService';
import { OrderValidator } from '../validators/orderValidator';
import { PatientService } from '../../patient/services/patientService';
import type { Patient } from '../../patient/models/types';
import { useNotification } from '../../../infrastructure/notifications/useNotification';
import { useDialog } from '../../../infrastructure/dialogs/useDialog';
import { useGlobalState } from '../../../providers/GlobalStateProvider';

import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { TextInput } from '../../../components/Form/TextInput';
import { SearchBox } from '../../../components/Data/SearchBox';

interface OrderWizardProps {
  orderId?: string;
  onClose: () => void;
}

const LOCAL_STORAGE_KEY = 'lims_order_draft';

export const OrderWizard: React.FC<OrderWizardProps> = ({ orderId, onClose }) => {
  const { addToast } = useNotification();
  const { confirmDelete } = useDialog();
  const { addAuditLog } = useGlobalState();

  const [step, setStep] = useState(1);
  const [dirty, setDirty] = useState(false);

  // Form parameters
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [physicianName, setPhysicianName] = useState('');
  const [clinicalInfo, setClinicalInfo] = useState('');
  const [requestedTests, setRequestedTests] = useState<string[]>([]);
  const [priority, setPriority] = useState<'Routine' | 'Urgent' | 'STAT' | 'Emergency'>('Routine');
  
  // Patient search states
  const [patientQuery, setPatientQuery] = useState('');
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [searchingPatients, setSearchingPatients] = useState(false);

  // Duplicate Warning
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  // Load existing edit order or restore draft auto-save
  useEffect(() => {
    const loadOrder = async () => {
      if (orderId) {
        try {
          const o = await OrderService.getOrderById(orderId);
          // Retrieve patient details
          const p = await PatientService.getPatientById(o.patientId);
          setSelectedPatient(p);
          setPhysicianName(o.physicianName);
          setClinicalInfo(o.clinicalInfo);
          setRequestedTests(o.requestedTests);
          setPriority(o.priority);
        } catch {
          addToast('error', 'Failed to retrieve order requisition for edits.');
        }
      } else {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.patientId) {
              const p = await PatientService.getPatientById(parsed.patientId);
              setSelectedPatient(p);
            }
            setPhysicianName(parsed.physicianName || '');
            setClinicalInfo(parsed.clinicalInfo || '');
            setRequestedTests(parsed.requestedTests || []);
            setPriority(parsed.priority || 'Routine');
            addToast('info', 'Draft order requisition restored successfully.');
          } catch {
            // Ignore
          }
        }
      }
    };
    loadOrder();
  }, [orderId, addToast]);

  // Draft Auto-Save hook
  useEffect(() => {
    if (!orderId && dirty) {
      const data = {
        patientId: selectedPatient?.patientId || '',
        physicianName,
        clinicalInfo,
        requestedTests,
        priority,
      };
      const timer = setTimeout(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedPatient, physicianName, clinicalInfo, requestedTests, priority, orderId, dirty]);

  // Patient live search
  useEffect(() => {
    if (patientQuery.trim().length >= 2) {
      setSearchingPatients(true);
      const delay = setTimeout(async () => {
        try {
          const res = await PatientService.getPatients({ search: patientQuery, limit: 5 });
          setPatientList(res.patients);
        } catch {
          // Ignore
        } finally {
          setSearchingPatients(false);
        }
      }, 500);
      return () => clearTimeout(delay);
    } else {
      setPatientList([]);
    }
  }, [patientQuery]);

  // Duplicate Warning engine checks
  const checkDuplicateOrder = async (pId: string, testCodes: string[]) => {
    if (testCodes.length === 0) return;
    try {
      const res = await OrderService.getOrders({ page: 1, limit: 5 });
      // Filter existing active orders for same patient and overlapping test codes
      const overlap = res.orders.find(
        (o) =>
          o.patientId === pId &&
          o.status !== 'Cancelled' &&
          o.requestedTests.some((t) => testCodes.includes(t))
      );
      setShowDuplicateWarning(!!overlap);
    } catch {
      // Ignore
    }
  };

  const handleSelectPatient = (p: Patient) => {
    if (p.status !== 'Active') {
      addToast('error', 'Selected patient registry status is inactive/merged. Order creation restricted.', 'Eligibility Alert');
      return;
    }
    setSelectedPatient(p);
    setPatientQuery('');
    setPatientList([]);
    setDirty(true);
    checkDuplicateOrder(p.patientId, requestedTests);
  };

  const handleTestToggle = (code: string) => {
    setDirty(true);
    let updated = [...requestedTests];
    if (updated.includes(code)) {
      updated = updated.filter((c) => c !== code);
    } else {
      updated.push(code);
    }
    setRequestedTests(updated);
    if (selectedPatient) {
      checkDuplicateOrder(selectedPatient.patientId, updated);
    }
  };

  const handleCancelClick = async () => {
    if (dirty) {
      const confirm = await confirmDelete({
        title: 'Unsaved Requisition Progress',
        message: 'You have unsaved changes on this requisition layout. Close wizard and discard drafts?',
      });
      if (!confirm) return;
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    onClose();
  };

  const handleSubmit = async (submitStatus: 'Draft' | 'Submitted') => {
    const payload = {
      patientId: selectedPatient?.patientId || '',
      patientMrn: selectedPatient?.mrn || '',
      patientName: selectedPatient ? `${selectedPatient.lastName}, ${selectedPatient.firstName}` : '',
      physicianName,
      clinicalInfo,
      requestedTests,
      priority,
      status: submitStatus,
    };

    const { isValid, errors } = OrderValidator.validate(payload);
    if (!isValid) {
      const firstErr = Object.values(errors)[0];
      addToast('error', firstErr || 'Validation checks failed.');
      return;
    }

    try {
      if (orderId) {
        await OrderService.updateOrder(orderId, payload);
        addToast('success', 'Order requisition modifications saved.');
        addAuditLog('Order Edit', 'Order', orderId, `Modified requisition properties.`);
      } else {
        const created = await OrderService.createOrder(payload);
        addToast('success', submitStatus === 'Submitted' ? 'Order requisition submitted successfully.' : 'Order draft saved.');
        addAuditLog('Order Create', 'Order', created.orderId, `Registered new requisition ORD.`);
      }
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      onClose();
    } catch (err: any) {
      addToast('error', err.message || 'Operation failed.');
    }
  };

  return (
    <Card style={styles.wizardContainer}>
      {/* Step Stepper Header */}
      <div style={styles.stepper}>
        {[1, 2, 3, 4].map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                ...styles.stepDot,
                backgroundColor: step === s ? 'var(--color-brand-primary)' : step > s ? 'var(--color-status-success)' : 'var(--color-surface-base)',
                color: step >= s ? 'white' : 'var(--color-text-secondary)',
                borderColor: step >= s ? 'var(--color-brand-primary)' : 'var(--color-border-default)',
              }}
            >
              {step > s ? '✓' : s}
            </span>
            <span style={{ font: 'var(--type-label-default)', color: step === s ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
              {s === 1 ? 'Patient' : s === 2 ? 'Physician' : s === 3 ? 'Tests' : 'Confirm'}
            </span>
            {s < 4 && <span style={styles.stepLine} />}
          </div>
        ))}
      </div>

      {/* Step 1: Patient Selection */}
      {step === 1 && (
        <div style={styles.stepBody}>
          <h3 style={styles.sectionTitle}>Step 1: Patient Eligibility Selection</h3>
          {selectedPatient ? (
            <div style={styles.selectedRecordCard}>
              <div>
                <strong style={{ fontSize: '1rem' }}>{selectedPatient.lastName}, {selectedPatient.firstName}</strong>
                <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                  MRN ID: {selectedPatient.mrn} | Birth Date: {selectedPatient.dob} | Gender: {selectedPatient.gender}
                </p>
              </div>
              <Button variant="outline" onClick={() => setSelectedPatient(null)}>
                Change Patient
              </Button>
            </div>
          ) : (
            <div>
              <SearchBox
                value={patientQuery}
                onChangeValue={setPatientQuery}
                placeholder="Search patient name, MRN..."
                style={{ width: '100%' }}
              />
              {searchingPatients && <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Querying patient indices...</p>}
              <div style={styles.resultsList}>
                {patientList.map((p) => (
                  <div
                    key={p.patientId}
                    onClick={() => handleSelectPatient(p)}
                    style={styles.resultItem}
                  >
                    <strong>{p.lastName}, {p.firstName}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      MRN: {p.mrn} | DOB: {p.dob} | Status: {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Physician & Clinical Notes */}
      {step === 2 && (
        <div style={styles.stepBody}>
          <h3 style={styles.sectionTitle}>Step 2: Clinician & Diagnosis Notes</h3>
          <TextInput
            label="Ordering Physician / Doctor Name"
            value={physicianName}
            onChange={(e) => {
              setPhysicianName(e.target.value);
              setDirty(true);
            }}
            placeholder="e.g. Dr. Allison Cameron"
          />
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <label className="lims-form-label" style={{ display: 'block', marginBottom: '6px' }}>
              Clinical Signs & Symptoms
            </label>
            <textarea
              className="lims-input"
              value={clinicalInfo}
              onChange={(e) => {
                setClinicalInfo(e.target.value);
                setDirty(true);
              }}
              placeholder="Provide symptoms details..."
              style={{ width: '100%', height: '100px', padding: '10px', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      )}

      {/* Step 3: Tests catalog check & spec dependencies */}
      {step === 3 && (
        <div style={styles.stepBody}>
          <h3 style={styles.sectionTitle}>Step 3: Requested Investigations Catalog</h3>
          <div style={styles.testsGrid}>
            <div style={styles.checklist}>
              {TEST_CATALOG.map((test) => (
                <label key={test.code} style={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={requestedTests.includes(test.code)}
                    onChange={() => handleTestToggle(test.code)}
                    style={{ marginRight: '8px' }}
                  />
                  <strong>{test.name}</strong> ({test.code})
                </label>
              ))}
            </div>

            {/* Specimen Guideline Checklist Pane */}
            <div style={styles.detailsPane}>
              <h4 style={{ margin: '0 0 var(--spacing-sm) 0', font: 'var(--type-heading-item)' }}>Specimen Requirements</h4>
              {requestedTests.length === 0 ? (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Select tests to check volume limits.</p>
              ) : (
                requestedTests.map((code) => {
                  const item = TEST_CATALOG.find((cat) => cat.code === code);
                  if (!item) return null;
                  return (
                    <div key={code} style={styles.specCard}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-brand-primary)' }}>{item.name}</span>
                      <div style={styles.specDetails}>
                        <span>Specimen: <strong>{item.requiredSpecimen}</strong></span>
                        <span>Container: <strong>{item.container}</strong></span>
                        <span>Volume: <strong>{item.volume}</strong></span>
                        <span>Transport: <strong>{item.transport}</strong></span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Final Confirmation */}
      {step === 4 && (
        <div style={styles.stepBody}>
          <h3 style={styles.sectionTitle}>Step 4: Review Requisition Details</h3>
          
          {showDuplicateWarning && (
            <div style={styles.duplicateWarning}>
              ⚠️ <strong>Potential Duplicate Order Warning:</strong> An active order for the same test code exists for this patient registered in the last 24h.
            </div>
          )}

          <div style={styles.summaryGrid}>
            <div>
              <strong>Patient Profile:</strong>
              <p>{selectedPatient?.lastName}, {selectedPatient?.firstName} ({selectedPatient?.mrn})</p>
            </div>
            <div>
              <strong>Ordering Clinician:</strong>
              <p>{physicianName || '—'}</p>
            </div>
            <div>
              <strong>Clinical Details:</strong>
              <p>{clinicalInfo || '—'}</p>
            </div>
            <div>
              <strong>Requisition Urgency:</strong>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="lims-input"
                style={{ width: '150px', height: '36px', marginTop: '6px' }}
              >
                <option value="Routine">Routine</option>
                <option value="Urgent">Urgent</option>
                <option value="STAT">STAT</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <strong>Selected Tests:</strong>
            <ul style={{ paddingLeft: '20px', margin: '6px 0 0 0' }}>
              {requestedTests.map((code) => {
                const item = TEST_CATALOG.find((cat) => cat.code === code);
                return (
                  <li key={code} style={{ font: 'var(--type-body-default)', margin: '4px 0' }}>
                    {item ? item.name : code} ({code})
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Navigation button toolbar */}
      <div style={styles.actionsBar}>
        <Button variant="outline" onClick={handleCancelClick}>
          Cancel
        </Button>
        <div style={{ display: 'flex', gap: '8px' }}>
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              variant="solid"
              onClick={() => {
                if (step === 1 && !selectedPatient) {
                  addToast('error', 'Select a patient to proceed.');
                  return;
                }
                if (step === 2 && !physicianName.trim()) {
                  addToast('error', 'Clinician name is required.');
                  return;
                }
                if (step === 3 && requestedTests.length === 0) {
                  addToast('error', 'Request at least one diagnostic investigation.');
                  return;
                }
                setStep(step + 1);
              }}
            >
              Continue
            </Button>
          ) : (
            <>
              {!orderId && (
                <Button variant="outline" onClick={() => handleSubmit('Draft')}>
                  Save Draft
                </Button>
              )}
              <Button variant="solid" onClick={() => handleSubmit('Submitted')}>
                {orderId ? 'Save Requisition' : 'Submit Requisition'}
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wizardContainer: {
    padding: 'var(--spacing-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-lg)',
    boxSizing: 'border-box',
  },
  stepper: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)',
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: 'var(--spacing-sm)',
    flexWrap: 'wrap',
  },
  stepDot: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid',
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
  stepLine: {
    width: '40px',
    height: '2px',
    backgroundColor: 'var(--color-border-default)',
  },
  stepBody: {
    flexGrow: 1,
    minHeight: '260px',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  },
  sectionTitle: {
    font: 'var(--type-heading-subsection)',
    margin: '0 0 var(--spacing-sm) 0',
  },
  selectedRecordCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--spacing-md)',
    backgroundColor: 'var(--color-surface-base)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-sm)',
  },
  resultsList: {
    marginTop: 'var(--spacing-xs)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-surface-base)',
    maxHeight: '180px',
    overflowY: 'auto',
  },
  resultItem: {
    padding: '10px 12px',
    borderBottom: '1px solid var(--color-border-default)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
  },
  testsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--spacing-md)',
  },
  checklist: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  checkLabel: {
    display: 'flex',
    alignItems: 'center',
    font: 'var(--type-body-default)',
    cursor: 'pointer',
  },
  detailsPane: {
    backgroundColor: 'var(--color-surface-base)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--spacing-md)',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  specCard: {
    borderLeft: '3px solid var(--color-brand-primary)',
    padding: '6px var(--spacing-sm)',
    backgroundColor: 'var(--color-surface-raised)',
    marginBottom: '8px',
    borderRadius: 'var(--radius-xs)',
  },
  specDetails: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '0.8rem',
    color: 'var(--color-text-secondary)',
    gap: '2px',
    marginTop: '4px',
  },
  duplicateWarning: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeeba',
    color: '#856404',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    font: 'var(--type-body-default)',
    fontSize: '0.85rem',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--spacing-md)',
    font: 'var(--type-body-default)',
  },
  actionsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px solid var(--color-border-default)',
    paddingTop: 'var(--spacing-md)',
  },
};
export default OrderWizard;
