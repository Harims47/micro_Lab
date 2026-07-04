import React, { useState, useEffect } from 'react';
import type { Specimen } from '../models/types';
import { SpecimenService } from '../services/specimenService';
import { SpecimenValidator } from '../validators/specimenValidator';
import { OrderService } from '../../order/services/orderService';
import type { Order } from '../../order/models/types';
import { TEST_CATALOG } from '../../order/models/types';
import { useNotification } from '../../../infrastructure/notifications/useNotification';
import { useDialog } from '../../../infrastructure/dialogs/useDialog';

import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { TextInput } from '../../../components/Form/TextInput';
import { SearchBox } from '../../../components/Data/SearchBox';

interface SpecimenWizardProps {
  onClose: () => void;
}

export const SpecimenWizard: React.FC<SpecimenWizardProps> = ({ onClose }) => {
  const { addToast } = useNotification();
  const { confirmDelete } = useDialog();

  const [step, setStep] = useState(1);
  const [dirty, setDirty] = useState(false);

  // Requisition search parameters
  const [orderQuery, setOrderQuery] = useState('');
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [searchingOrders, setSearchingOrders] = useState(false);

  // Form parameters
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedTestCode, setSelectedTestCode] = useState<string>('');
  
  const [collector, setCollector] = useState('Sarah Connor');
  const [location, setLocation] = useState('Outpatient Clinic Room A');
  const [method, setMethod] = useState('Swab extraction');
  const [volume, setVolume] = useState<number>(1);
  const [containerType, setContainerType] = useState('Sterile Cup');
  const [priority, setPriority] = useState<'Routine' | 'Urgent' | 'STAT' | 'Emergency'>('Routine');
  const [notes, setNotes] = useState('');

  // Generated barcode info
  const [generatedSpecimen, setGeneratedSpecimen] = useState<Specimen | null>(null);

  // Live order search
  useEffect(() => {
    if (orderQuery.trim().length >= 2) {
      setSearchingOrders(true);
      const delay = setTimeout(async () => {
        try {
          const res = await OrderService.getOrders({ search: orderQuery, limit: 5 });
          setOrderList(res.orders.filter((o) => o.status !== 'Cancelled' && o.status !== 'Completed'));
        } catch {
          // Ignore
        } finally {
          setSearchingOrders(false);
        }
      }, 500);
      return () => clearTimeout(delay);
    } else {
      setOrderList([]);
    }
  }, [orderQuery]);

  const handleSelectOrder = (o: Order) => {
    setSelectedOrder(o);
    setPriority(o.priority);
    
    // Default to first requested test in order
    if (o.requestedTests.length > 0) {
      handleTestSelect(o.requestedTests[0]);
    }
    setOrderQuery('');
    setOrderList([]);
    setDirty(true);
  };

  const handleTestSelect = (code: string) => {
    setSelectedTestCode(code);
    const catalogItem = TEST_CATALOG.find((cat) => cat.code === code);
    if (catalogItem) {
      setContainerType(catalogItem.container);
      setMethod(catalogItem.collectionNotes || 'Extraction Swab');
      // Parse minimum volume number if present
      const volNum = parseFloat(catalogItem.volume);
      setVolume(isNaN(volNum) ? 1 : volNum);
    }
  };

  const handleCancel = async () => {
    if (dirty && !generatedSpecimen) {
      const confirm = await confirmDelete({
        title: 'Discard Collection Progress',
        message: 'Are you sure you want to exit the collection wizard? Progress will be lost.',
      });
      if (!confirm) return;
    }
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedOrder) return;
    const testItem = TEST_CATALOG.find((c) => c.code === selectedTestCode);

    const payload = {
      patientId: selectedOrder.patientId,
      orderId: selectedOrder.orderId,
      orderAccession: selectedOrder.accessionNumber,
      testCode: selectedTestCode,
      testName: testItem ? testItem.name : selectedTestCode,
      status: 'Collected' as const,
      priority,
      containerType,
      volume,
      collectionDetails: {
        timestamp: new Date().toISOString(),
        collector,
        location,
        method,
      },
    };

    const { isValid, errors } = SpecimenValidator.validate(payload);
    if (!isValid) {
      const err = Object.values(errors)[0];
      addToast('error', err || 'Validation checks failed.');
      return;
    }

    try {
      const created = await SpecimenService.createSpecimen(payload);
      // Update order status context to received once collection completes
      await OrderService.updateOrder(selectedOrder.orderId, { status: 'Specimen Received' });
      setGeneratedSpecimen(created);
      setStep(3);
      addToast('success', 'Specimen collected and barcode labels generated successfully.');
    } catch {
      addToast('error', 'Failed to register specimen collection.');
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
              {s === 1 ? 'Order Lookup' : s === 2 ? 'Collection details' : 'Barcode Printable'}
            </span>
            {s < 3 && <span style={styles.stepLine} />}
          </div>
        ))}
      </div>

      {/* Step 1: Order select */}
      {step === 1 && (
        <div style={styles.stepBody}>
          <h3 style={styles.sectionTitle}>Step 1: Link Approved Laboratory Order</h3>
          {selectedOrder ? (
            <div>
              <div style={styles.selectedRecordCard}>
                <div>
                  <strong>Requisition accession: {selectedOrder.accessionNumber}</strong>
                  <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                    Patient: {selectedOrder.patientName} | MRN: {selectedOrder.patientMrn} | Priority: {selectedOrder.priority}
                  </p>
                </div>
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>Change Order</Button>
              </div>

              {/* Select test requested on order */}
              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <label className="lims-form-label" style={{ display: 'block', marginBottom: '8px' }}>
                  Select Test to Collect Specimen For:
                </label>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                  {selectedOrder.requestedTests.map((code) => {
                    const test = TEST_CATALOG.find((t) => t.code === code);
                    const isActive = selectedTestCode === code;
                    return (
                      <button
                        key={code}
                        onClick={() => handleTestSelect(code)}
                        style={{
                          ...styles.testBadgeBtn,
                          borderColor: isActive ? 'var(--color-brand-primary)' : 'var(--color-border-default)',
                          backgroundColor: isActive ? 'var(--color-brand-secondary-bg)' : 'var(--color-surface-raised)',
                          color: isActive ? 'var(--color-brand-primary)' : 'var(--color-text-primary)',
                        }}
                      >
                        {test ? test.name : code}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <SearchBox
                value={orderQuery}
                onChangeValue={setOrderQuery}
                placeholder="Search order accession ID or patient name..."
                style={{ width: '100%' }}
              />
              {searchingOrders && <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Querying requisitions database...</p>}
              <div style={styles.resultsList}>
                {orderList.map((o) => (
                  <div
                    key={o.orderId}
                    onClick={() => handleSelectOrder(o)}
                    style={styles.resultItem}
                  >
                    <strong>Accession: {o.accessionNumber}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      Patient: {o.patientName} ({o.patientMrn}) | Priority: {o.priority} | Tests: {o.requestedTests.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Collection parameters */}
      {step === 2 && (
        <div style={styles.stepBody}>
          <h3 style={styles.sectionTitle}>Step 2: Custody Collection Details</h3>
          <div style={styles.formGrid}>
            <TextInput
              label="Collector Staff Name"
              value={collector}
              onChange={(e) => {
                setCollector(e.target.value);
                setDirty(true);
              }}
            />
            <TextInput
              label="Collection Location"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setDirty(true);
              }}
            />
            <TextInput
              label="Container Type"
              value={containerType}
              onChange={(e) => {
                setContainerType(e.target.value);
                setDirty(true);
              }}
            />
            <TextInput
              label="Collected Volume (mL/Swabs)"
              type="number"
              value={volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                setDirty(true);
              }}
            />
            <TextInput
              label="Collection Method Notes"
              value={method}
              onChange={(e) => {
                setMethod(e.target.value);
                setDirty(true);
              }}
            />
            <div>
              <label className="lims-form-label" style={{ display: 'block', marginBottom: '6px' }}>Collection Urgency</label>
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value as any);
                  setDirty(true);
                }}
                className="lims-input"
                style={{ width: '100%', height: '38px' }}
              >
                <option value="Routine">Routine</option>
                <option value="Urgent">Urgent</option>
                <option value="STAT">STAT</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            <label className="lims-form-label" style={{ display: 'block', marginBottom: '6px' }}>Notes</label>
            <textarea
              className="lims-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Clinical observation notes during collection..."
              style={{ width: '100%', height: '60px', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
        </div>
      )}

      {/* Step 3: Barcode labels print preview */}
      {step === 3 && generatedSpecimen && (
        <div style={styles.stepBody}>
          <h3 style={styles.sectionTitle}>Step 3: Barcode Specimen Label Printable</h3>
          <div style={styles.barcodeCenter}>
            <div style={styles.labelCard}>
              <div style={styles.barcodeHeader}>
                <strong>CLINICAL MICROBIOLOGY LAB</strong>
                <span>MRN: {generatedSpecimen.patientMrn}</span>
              </div>
              <div style={styles.barcodeVal}>
                <span>||||||| | ||||| | ||| ||||</span>
                <strong>{generatedSpecimen.barcode}</strong>
              </div>
              <div style={styles.barcodeFooter}>
                <span>Patient: {generatedSpecimen.patientName}</span>
                <span>Test: {generatedSpecimen.testName}</span>
                <span>Vol: {generatedSpecimen.volume} mL | Urgency: {generatedSpecimen.priority}</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => addToast('success', 'Dispatched label print job to workstation WS-Registrar-1.')}
              style={{ marginTop: 'var(--spacing-md)' }}
            >
              Print Physical Label
            </Button>
          </div>
        </div>
      )}

      {/* Actions footer */}
      <div style={styles.actions}>
        <Button variant="outline" onClick={handleCancel}>
          {step === 3 ? 'Close' : 'Cancel'}
        </Button>

        <div style={{ display: 'flex', gap: '8px' }}>
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
          )}
          {step === 1 && selectedOrder && (
            <Button variant="solid" onClick={() => setStep(2)}>
              Continue
            </Button>
          )}
          {step === 2 && (
            <Button variant="solid" onClick={handleSubmit}>
              Register Collection
            </Button>
          )}
          {step === 3 && (
            <Button variant="solid" onClick={onClose}>
              Complete Registration
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
  testBadgeBtn: {
    padding: '6px 12px',
    border: '1px solid',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    font: 'var(--type-label-default)',
    transition: 'all 0.2s ease',
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
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--spacing-md)',
  },
  barcodeCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-lg) 0',
  },
  labelCard: {
    width: '280px',
    border: '2px solid black',
    backgroundColor: 'white',
    color: 'black',
    padding: '12px',
    fontFamily: 'monospace',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    boxShadow: 'var(--elevation-1)',
  },
  barcodeHeader: {
    fontSize: '0.65rem',
    display: 'flex',
    justifyContent: 'space-between',
    borderBottom: '1px solid black',
    paddingBottom: '4px',
  },
  barcodeVal: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '1.25rem',
    letterSpacing: '2px',
    padding: '8px 0',
  },
  barcodeFooter: {
    fontSize: '0.625rem',
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1px solid black',
    paddingTop: '4px',
    gap: '2px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px solid var(--color-border-default)',
    paddingTop: 'var(--spacing-md)',
  },
};
export default SpecimenWizard;
