import React, { useState, useEffect } from 'react';
import type { CulturePlate, MediaName } from '../models/types';
import { CultureService } from '../services/cultureService';
import { CultureValidator } from '../validators/cultureValidator';
import { SpecimenService } from '../../specimen/services/specimenService';
import type { Specimen } from '../../specimen/models/types';
import { useNotification } from '../../../infrastructure/notifications/useNotification';
import { useDialog } from '../../../infrastructure/dialogs/useDialog';

import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { TextInput } from '../../../components/Form/TextInput';
import { SearchBox } from '../../../components/Data/SearchBox';

interface CultureWizardProps {
  onClose: () => void;
}

export const CultureWizard: React.FC<CultureWizardProps> = ({ onClose }) => {
  const { addToast } = useNotification();
  const { confirmDelete } = useDialog();

  const [step, setStep] = useState(1);
  const [dirty, setDirty] = useState(false);

  // Specimen search parameters
  const [specimenQuery, setSpecimenQuery] = useState('');
  const [specimenList, setSpecimenList] = useState<Specimen[]>([]);
  const [searchingSpecs, setSearchingSpecs] = useState(false);
  const [selectedSpecimen, setSelectedSpecimen] = useState<Specimen | null>(null);

  // Multi-plates setup
  const [selectedMedia, setSelectedMedia] = useState<MediaName[]>(['Blood Agar']);
  const [lotNumbers, setLotNumbers] = useState<string[]>(['LOT-202607-01']);
  const [expiryDates, setExpiryDates] = useState<string[]>(['2026-12-31']);

  // Inoculation params
  const [inocMethod, setInocMethod] = useState('Loop streak isolation');
  const [inocLoop, setInocLoop] = useState('10 uL');
  const [inocPattern, setInocPattern] = useState('4-Quadrant streak');
  const [bench, setBench] = useState('Bench-Micro-3');

  // Incubation params
  const [incubatorId, setIncubatorId] = useState('INC-01');
  const [tempCelsius, setTempCelsius] = useState(37);
  const [co2, setCo2] = useState(5);
  const [humidity, setHumidity] = useState(85);

  // Search active accepted specimens
  useEffect(() => {
    if (specimenQuery.trim().length >= 2) {
      setSearchingSpecs(true);
      const delay = setTimeout(async () => {
        try {
          const res = await SpecimenService.getSpecimens({ search: specimenQuery, limit: 5 });
          // Only show specimens that are accepted
          setSpecimenList(res.specimens.filter((s) => s.status === 'Accepted'));
        } catch {
          // Ignore
        } finally {
          setSearchingSpecs(false);
        }
      }, 500);
      return () => clearTimeout(delay);
    } else {
      setSpecimenList([]);
    }
  }, [specimenQuery]);

  const handleSelectSpecimen = (s: Specimen) => {
    setSelectedSpecimen(s);
    setSpecimenQuery('');
    setSpecimenList([]);
    setDirty(true);
  };

  const handleAddPlate = () => {
    setSelectedMedia([...selectedMedia, 'MacConkey']);
    setLotNumbers([...lotNumbers, `LOT-202607-0${lotNumbers.length + 1}`]);
    setExpiryDates([...expiryDates, '2026-12-31']);
    setDirty(true);
  };

  const handleRemovePlate = (idx: number) => {
    if (selectedMedia.length === 1) return;
    setSelectedMedia(selectedMedia.filter((_, i) => i !== idx));
    setLotNumbers(lotNumbers.filter((_, i) => i !== idx));
    setExpiryDates(expiryDates.filter((_, i) => i !== idx));
  };

  const handleCancel = async () => {
    if (dirty) {
      const confirm = await confirmDelete({
        title: 'Discard Inoculation Progress',
        message: 'Are you sure you want to discard culture progress?',
      });
      if (!confirm) return;
    }
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedSpecimen) return;

    // Create plates payloads
    const platesPayloads: Partial<CulturePlate>[] = selectedMedia.map((media, idx) => ({
      mediaName: media,
      mediaLot: lotNumbers[idx] || 'LOT-UNKNOWN',
      mediaExpiry: expiryDates[idx] || new Date().toISOString(),
      status: 'Inoculated',
      inoculation: {
        method: inocMethod,
        loopSize: inocLoop,
        streakPattern: inocPattern,
        timestamp: new Date().toISOString(),
        bench,
        technician: 'Sarah Connor',
      },
      incubation: {
        incubatorId,
        chamber: `Chamber-${idx + 1}`,
        rack: `Rack-${idx + 1}`,
        shelf: `Shelf-1`,
        tempCelsius,
        co2Percentage: co2,
        humidityPercentage: humidity,
        startDatetime: new Date().toISOString(),
        expectedCompletionDatetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    }));

    // Validate each plate
    for (const p of platesPayloads) {
      const { isValid, errors } = CultureValidator.validatePlate(p);
      if (!isValid) {
        const err = Object.values(errors)[0];
        addToast('error', `Plate Validation failed: ${err}`);
        return;
      }
    }

    try {
      const payload = {
        patientId: selectedSpecimen.patientId,
        patientName: selectedSpecimen.patientName,
        patientMrn: selectedSpecimen.patientMrn,
        orderId: selectedSpecimen.orderId,
        orderAccession: selectedSpecimen.orderAccession,
        specimenId: selectedSpecimen.specimenId,
        specimenBarcode: selectedSpecimen.barcode,
        plates: platesPayloads,
      };

      await CultureService.createCulture(payload);
      addToast('success', `Culture registered successfully with ${selectedMedia.length} media plates.`);
      onClose();
    } catch {
      addToast('error', 'Failed to register inoculation culture plates.');
    }
  };

  return (
    <Card style={styles.container}>
      {/* Stepper Header */}
      <div style={styles.stepper}>
        {[1, 2, 3].map((s) => (
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
              {s === 1 ? 'Specimen Lookup' : s === 2 ? 'Media Plates Setup' : 'Inoculation Settings'}
            </span>
            {s < 3 && <span style={styles.stepLine} />}
          </div>
        ))}
      </div>

      {/* Step 1: Specimen lookup */}
      {step === 1 && (
        <div style={styles.stepBody}>
          <h3 style={styles.sectionTitle}>Step 1: Link Accepted Specimen</h3>
          {selectedSpecimen ? (
            <div style={styles.selectedRecordCard}>
              <div>
                <strong>Barcode: {selectedSpecimen.barcode}</strong>
                <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                  Patient: {selectedSpecimen.patientName} | MRN: {selectedSpecimen.patientMrn} | Requisition: {selectedSpecimen.orderAccession} | Test: {selectedSpecimen.testName}
                </p>
              </div>
              <Button variant="outline" onClick={() => setSelectedSpecimen(null)}>Change Specimen</Button>
            </div>
          ) : (
            <div>
              <SearchBox
                value={specimenQuery}
                onChangeValue={setSpecimenQuery}
                placeholder="Search accepted specimen barcode, MRN or patient name..."
                style={{ width: '100%' }}
              />
              {searchingSpecs && <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Querying specimen database...</p>}
              <div style={styles.resultsList}>
                {specimenList.map((s) => (
                  <div
                    key={s.specimenId}
                    onClick={() => handleSelectSpecimen(s)}
                    style={styles.resultItem}
                  >
                    <strong>Barcode ID: {s.barcode}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      Patient: {s.patientName} ({s.patientMrn}) | Test: {s.testName} | Volume: {s.volume} mL
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Multi-media setup */}
      {step === 2 && (
        <div style={styles.stepBody}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={styles.sectionTitle}>Step 2: Multiple Agar Media Plates</h3>
            <Button variant="outline" onClick={handleAddPlate}>Add Agar Plate</Button>
          </div>

          <div style={styles.platesGrid}>
            {selectedMedia.map((media, idx) => (
              <div key={idx} style={styles.plateRow}>
                <div style={{ flex: 2 }}>
                  <label className="lims-form-label" style={{ display: 'block', marginBottom: '4px' }}>Agar Media Type</label>
                  <select
                    value={media}
                    onChange={(e) => {
                      const updated = [...selectedMedia];
                      updated[idx] = e.target.value as MediaName;
                      setSelectedMedia(updated);
                    }}
                    className="lims-input"
                    style={{ width: '100%', height: '36px' }}
                  >
                    <option value="Blood Agar">Blood Agar</option>
                    <option value="MacConkey">MacConkey</option>
                    <option value="Chocolate Agar">Chocolate Agar</option>
                    <option value="CLED">CLED</option>
                    <option value="Sabouraud">Sabouraud</option>
                    <option value="Mueller Hinton">Mueller Hinton</option>
                  </select>
                </div>

                <div style={{ flex: 2 }}>
                  <TextInput
                    label="Media Lot Number"
                    value={lotNumbers[idx] || ''}
                    onChange={(e) => {
                      const updated = [...lotNumbers];
                      updated[idx] = e.target.value;
                      setLotNumbers(updated);
                    }}
                  />
                </div>

                <div style={{ flex: 2 }}>
                  <TextInput
                    label="Expiry Date"
                    type="date"
                    value={expiryDates[idx] || ''}
                    onChange={(e) => {
                      const updated = [...expiryDates];
                      updated[idx] = e.target.value;
                      setExpiryDates(updated);
                    }}
                  />
                </div>

                {selectedMedia.length > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => handleRemovePlate(idx)}
                    style={{ color: 'var(--color-status-danger)', marginTop: '22px' }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Inoculation Details */}
      {step === 3 && (
        <div style={styles.stepBody}>
          <h3 style={styles.sectionTitle}>Step 3: Inoculation and Incubation Chamber Parameters</h3>
          <div style={styles.formGrid}>
            <TextInput
              label="Inoculation Method"
              value={inocMethod}
              onChange={(e) => setInocMethod(e.target.value)}
            />
            <TextInput
              label="Inoculation Loop size"
              value={inocLoop}
              onChange={(e) => setInocLoop(e.target.value)}
            />
            <TextInput
              label="Streak isolation pattern"
              value={inocPattern}
              onChange={(e) => setInocPattern(e.target.value)}
            />
            <TextInput
              label="Workstation Bench"
              value={bench}
              onChange={(e) => setBench(e.target.value)}
            />
          </div>

          <h4 style={{ ...styles.sectionTitle, marginTop: 'var(--spacing-md)' }}>Incubator Environmental Control</h4>
          <div style={styles.formGrid}>
            <TextInput
              label="Target Incubator Chamber ID"
              value={incubatorId}
              onChange={(e) => setIncubatorId(e.target.value)}
            />
            <TextInput
              label="Chamber Temperature (°C)"
              type="number"
              value={tempCelsius}
              onChange={(e) => setTempCelsius(Number(e.target.value))}
            />
            <TextInput
              label="CO₂ gas level (%)"
              type="number"
              value={co2}
              onChange={(e) => setCo2(Number(e.target.value))}
            />
            <TextInput
              label="Chamber Humidity (%)"
              type="number"
              value={humidity}
              onChange={(e) => setHumidity(Number(e.target.value))}
            />
          </div>
        </div>
      )}

      {/* Actions footer */}
      <div style={styles.actions}>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>

        <div style={{ display: 'flex', gap: '8px' }}>
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 3 && selectedSpecimen && (
            <Button variant="solid" onClick={() => setStep(step + 1)}>
              Continue
            </Button>
          )}
          {step === 3 && (
            <Button variant="solid" onClick={handleSubmit}>
              Register Inoculation
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
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
  platesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  },
  plateRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    backgroundColor: 'var(--color-surface-base)',
    padding: 'var(--spacing-md)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-sm)',
    flexWrap: 'wrap',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--spacing-md)',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px solid var(--color-border-default)',
    paddingTop: 'var(--spacing-md)',
  },
};
export default CultureWizard;
