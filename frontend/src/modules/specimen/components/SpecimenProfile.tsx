import React, { useState, useEffect, useCallback } from 'react';
import type { Specimen } from '../models/types';
import { REJECTION_CATEGORIES } from '../models/types';
import { SpecimenService } from '../services/specimenService';
import { useNotification } from '../../../infrastructure/notifications/useNotification';
import { usePermission } from '../../../infrastructure/permissions/usePermission';
import { Permission } from '../../../infrastructure/permissions/constants';

import { PageContainer } from '../../../components/Layout';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { Timeline } from '../../../components/Data/Timeline';
import { Tabs } from '../../../components/Layout/Tabs';
import { Check, X } from 'lucide-react';

interface SpecimenProfileProps {
  specimenId: string;
  onBack: () => void;
}

export const SpecimenProfile: React.FC<SpecimenProfileProps> = ({ specimenId, onBack }) => {
  const { addToast } = useNotification();
  const { hasPermission } = usePermission();
  const canPerformQC = hasPermission(Permission.RECEIVE_SPECIMEN);
  const canSplit = hasPermission(Permission.REGISTER_SPECIMEN); // Splitting requires register/create permissions

  const [specimen, setSpecimen] = useState<Specimen | null>(null);
  const [loading, setLoading] = useState(true);

  // Aliquots splitting parameters
  const [splitOpen, setSplitOpen] = useState(false);
  const [splitVol, setSplitVol] = useState(1);

  // QC parameters form
  const [qcOpen, setQcOpen] = useState(false);
  const [qtySufficient, setQtySufficient] = useState(true);
  const [containerCorrect, setContainerCorrect] = useState(true);
  const [labelCorrect, setLabelCorrect] = useState(true);
  const [leakage, setLeakage] = useState(false);
  const [hemolysis, setHemolysis] = useState(false);
  const [contamination, setContamination] = useState(false);
  const [tempAcceptable, setTempAcceptable] = useState(true);
  const [delay, setDelay] = useState(false);
  
  const [qcDecision, setQcDecision] = useState<'Accepted' | 'Rejected'>('Accepted');
  const [rejectionCat, setRejectionCat] = useState<string>(REJECTION_CATEGORIES[0]);
  const [rejectionRes, setRejectionRes] = useState('');

  // Fetch Specimen
  const fetchDetails = useCallback(async () => {
    setLoading(true);
    try {
      const s = await SpecimenService.getSpecimenById(specimenId);
      setSpecimen(s);
    } catch {
      addToast('error', 'Failed to retrieve specimen details.');
    } finally {
      setLoading(false);
    }
  }, [specimenId, addToast]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  if (loading) {
    return <p style={{ font: 'var(--type-body-default)', color: 'var(--color-text-secondary)' }}>Loading specimen record...</p>;
  }

  if (!specimen) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
        <p style={{ font: 'var(--type-body-default)', color: 'var(--color-status-danger)' }}>Specimen not found.</p>
        <Button onClick={onBack} variant="outline" style={{ marginTop: '12px' }}>
          Back to Directory
        </Button>
      </div>
    );
  }

  // Handle Quality Check Submit
  const handleQcSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        quantitySufficient: qtySufficient,
        containerCorrect,
        labelCorrect,
        leakage,
        hemolysis,
        contamination,
        temperatureAcceptable: tempAcceptable,
        transportDelay: delay,
        decision: qcDecision,
        rejectionCategory: qcDecision === 'Rejected' ? rejectionCat : undefined,
        rejectionReason: qcDecision === 'Rejected' ? rejectionRes : undefined,
      };

      await SpecimenService.performQualityCheck(specimen.specimenId, payload);
      addToast('success', `Quality Check completed: Specimen ${qcDecision}`);
      setQcOpen(false);
      fetchDetails();
    } catch {
      addToast('error', 'Failed to submit specimen quality check results.');
    }
  };

  // Handle Aliquot Split Submit
  const handleSplitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (specimen.volume < splitVol) {
      addToast('error', 'Volume to split exceeds parent container capacity.');
      return;
    }
    try {
      await SpecimenService.splitSpecimen(specimen.specimenId, splitVol);
      addToast('success', `Split child aliquot of ${splitVol}mL successfully.`);
      setSplitOpen(false);
      fetchDetails();
    } catch {
      addToast('error', 'Failed to split specimen aliquot.');
    }
  };

  const timelineEvents = specimen.custodyHistory.map((evt) => ({
    id: evt.id,
    title: `${evt.status} — ${evt.action}`,
    time: new Date(evt.timestamp).toLocaleString(),
    description: `Custodian: ${evt.performedBy} (${evt.role}) | Dept: ${evt.department} | Location: ${evt.location}`
  }));

  const tabItems = [
    {
      id: 'assessment',
      label: 'Quality Check & Demographics',
      content: (
        <div style={styles.tabContent}>
          <div style={styles.grid}>
            <div>
              <h4 style={styles.sectionTitle}>Collection Parameters</h4>
              <p style={styles.metadataLine}>Barcode ID: <strong>{specimen.barcode}</strong></p>
              <p style={styles.metadataLine}>Collector Staff: <strong>{specimen.collectionDetails.collector}</strong></p>
              <p style={styles.metadataLine}>Clinic Location: <strong>{specimen.collectionDetails.location}</strong></p>
              <p style={styles.metadataLine}>Collection Method: <strong>{specimen.collectionDetails.method}</strong></p>
              <p style={styles.metadataLine}>Container Type: <strong>{specimen.containerType}</strong></p>
              <p style={styles.metadataLine}>Available Volume: <strong>{specimen.volume} mL/Swabs</strong></p>
            </div>
            <div>
              <h4 style={styles.sectionTitle}>Quality Check Assessment</h4>
              {specimen.qualityAssessment ? (
                <div style={styles.qaCard}>
                  <p style={styles.metadataLine}>QC Verdict: 
                    <span style={{
                      marginLeft: '6px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-circular)',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      backgroundColor: specimen.qualityAssessment.decision === 'Accepted' ? 'var(--color-status-success-bg)' : 'var(--color-status-danger-bg)',
                      color: specimen.qualityAssessment.decision === 'Accepted' ? 'var(--color-status-success)' : 'var(--color-status-danger)',
                    }}>
                      {specimen.qualityAssessment.decision}
                    </span>
                  </p>
                  <p style={styles.metadataLine}>Reviewer: <strong>{specimen.qualityAssessment.reviewer}</strong></p>
                  <p style={styles.metadataLine}>Assessment Time: <strong>{new Date(specimen.qualityAssessment.timestamp).toLocaleString()}</strong></p>
                  
                  <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <span style={styles.qaCheckItem}>
                      {specimen.qualityAssessment.quantitySufficient ? <Check size={14} color="green" /> : <X size={14} color="red" />} Quantity Sufficient
                    </span>
                    <span style={styles.qaCheckItem}>
                      {specimen.qualityAssessment.containerCorrect ? <Check size={14} color="green" /> : <X size={14} color="red" />} Container Correct
                    </span>
                    <span style={styles.qaCheckItem}>
                      {specimen.qualityAssessment.labelCorrect ? <Check size={14} color="green" /> : <X size={14} color="red" />} Label Correct
                    </span>
                    <span style={styles.qaCheckItem}>
                      {!specimen.qualityAssessment.leakage ? <Check size={14} color="green" /> : <X size={14} color="red" />} No Leakage
                    </span>
                  </div>

                  {specimen.status === 'Rejected' && (
                    <div style={styles.rejectionBox}>
                      <strong>Rejection Reason ({specimen.rejectionCategory}):</strong>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>{specimen.rejectionReason}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>QC Assessment pending for this specimen.</p>
                  {canPerformQC && (
                    <Button variant="solid" onClick={() => setQcOpen(true)} style={{ marginTop: '12px' }}>
                      Perform Quality Check
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'timeline',
      label: 'Chain of Custody Timeline',
      content: (
        <div style={styles.tabContent}>
          <h4 style={styles.sectionTitle}>Chain of Custody Events</h4>
          <Timeline events={timelineEvents} />
        </div>
      ),
    },
    {
      id: 'audit',
      label: 'Activity Audit Log',
      content: (
        <div style={styles.tabContent}>
          <h4 style={styles.sectionTitle}>Access & Reprint Logs</h4>
          <div style={styles.auditList}>
            {specimen.auditTrail.map((log) => (
              <div key={log.id} style={styles.auditItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong>{log.action}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  <span>User: <strong>{log.performedBy}</strong> | Source: {log.source}</span>
                  {log.reason && <p style={{ margin: '4px 0 0 0' }}>Reprint Reason: <em>{log.reason}</em></p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <div style={styles.header}>
        <div>
          <h2 style={{ font: 'var(--type-heading-page)', margin: 0 }}>Specimen profile: {specimen.barcode}</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-secondary)', font: 'var(--type-body-small)' }}>
            Patient: {specimen.patientName} ({specimen.patientMrn}) | Accession: {specimen.orderAccession} | Test: {specimen.testName}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" onClick={onBack}>
            Back to Directory
          </Button>
          {canSplit && specimen.status === 'Accepted' && (
            <Button variant="outline" onClick={() => setSplitOpen(true)}>
              Split Aliquot
            </Button>
          )}
        </div>
      </div>

      <Card>
        <Tabs items={tabItems} />
      </Card>

      {/* QC Form Modal */}
      {qcOpen && (
        <div style={styles.modalOverlay}>
          <Card style={styles.modalBox}>
            <h4 style={styles.modalTitle}>Quality Check Assessment</h4>
            <form onSubmit={handleQcSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={styles.checkboxGrid}>
                <label><input type="checkbox" checked={qtySufficient} onChange={(e) => setQtySufficient(e.target.checked)} /> Quantity Sufficient</label>
                <label><input type="checkbox" checked={containerCorrect} onChange={(e) => setContainerCorrect(e.target.checked)} /> Container Correct</label>
                <label><input type="checkbox" checked={labelCorrect} onChange={(e) => setLabelCorrect(e.target.checked)} /> Label Correct</label>
                <label><input type="checkbox" checked={!leakage} onChange={(e) => setLeakage(!e.target.checked)} /> No Leakage</label>
                <label><input type="checkbox" checked={!hemolysis} onChange={(e) => setHemolysis(e.target.checked)} /> No Hemolysis</label>
                <label><input type="checkbox" checked={!contamination} onChange={(e) => setContamination(e.target.checked)} /> No Contamination</label>
                <label><input type="checkbox" checked={tempAcceptable} onChange={(e) => setTempAcceptable(e.target.checked)} /> Temp Acceptable</label>
                <label><input type="checkbox" checked={!delay} onChange={(e) => setDelay(!e.target.checked)} /> No Transport Delay</label>
              </div>

              <div>
                <label className="lims-form-label" style={{ display: 'block', marginBottom: '4px' }}>Assessment Decision</label>
                <select
                  value={qcDecision}
                  onChange={(e) => setQcDecision(e.target.value as any)}
                  className="lims-input"
                  style={{ width: '100%', height: '36px' }}
                >
                  <option value="Accepted">Accept Specimen</option>
                  <option value="Rejected">Reject Specimen</option>
                </select>
              </div>

              {qcDecision === 'Rejected' && (
                <>
                  <div>
                    <label className="lims-form-label" style={{ display: 'block', marginBottom: '4px' }}>Rejection Category</label>
                    <select
                      value={rejectionCat}
                      onChange={(e) => setRejectionCat(e.target.value)}
                      className="lims-input"
                      style={{ width: '100%', height: '36px' }}
                    >
                      {REJECTION_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="lims-form-label" style={{ display: 'block', marginBottom: '4px' }}>Reason details</label>
                    <textarea
                      value={rejectionRes}
                      onChange={(e) => setRejectionRes(e.target.value)}
                      className="lims-input"
                      style={{ width: '100%', height: '60px', padding: '6px', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <Button variant="outline" onClick={() => setQcOpen(false)}>Cancel</Button>
                <Button variant="solid" type="submit">Submit Assessment</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Aliquot Split Modal */}
      {splitOpen && (
        <div style={styles.modalOverlay}>
          <Card style={styles.modalBox}>
            <h4 style={styles.modalTitle}>Split Aliquot Container</h4>
            <form onSubmit={handleSplitSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ font: 'var(--type-body-small)', color: 'var(--color-text-secondary)', margin: 0 }}>
                Parent volume capacity: <strong>{specimen.volume} mL</strong>.
              </p>
              <div>
                <label className="lims-form-label" style={{ display: 'block', marginBottom: '6px' }}>Aliquot volume to subtract (mL)</label>
                <input
                  type="number"
                  value={splitVol}
                  onChange={(e) => setSplitVol(Number(e.target.value))}
                  className="lims-input"
                  style={{ width: '100%', height: '36px', boxSizing: 'border-box', padding: '0 8px' }}
                  min={0.1}
                  step={0.1}
                  max={specimen.volume}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <Button variant="outline" onClick={() => setSplitOpen(false)}>Cancel</Button>
                <Button variant="solid" type="submit">Perform Split</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </PageContainer>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 'var(--spacing-md)',
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: 'var(--spacing-md)',
  },
  tabContent: {
    padding: 'var(--spacing-md) 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--spacing-lg)',
  },
  sectionTitle: {
    font: 'var(--type-heading-item)',
    margin: '0 0 var(--spacing-sm) 0',
    color: 'var(--color-text-primary)',
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: '6px',
  },
  metadataLine: {
    margin: '6px 0',
    font: 'var(--type-body-default)',
    color: 'var(--color-text-primary)',
  },
  qaCard: {
    backgroundColor: 'var(--color-surface-base)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--spacing-md)',
  },
  qaCheckItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    font: 'var(--type-body-small)',
  },
  rejectionBox: {
    marginTop: '12px',
    backgroundColor: 'var(--color-status-danger-bg)',
    border: '1px solid var(--color-status-danger)',
    borderRadius: 'var(--radius-xs)',
    padding: '8px',
    color: 'var(--color-status-danger)',
  },
  auditList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  },
  auditItem: {
    padding: '10px 12px',
    backgroundColor: 'var(--color-surface-base)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-xs)',
    font: 'var(--type-body-default)',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
  },
  modalBox: {
    width: '420px',
    backgroundColor: 'var(--color-surface-raised)',
    padding: 'var(--spacing-lg)',
    boxShadow: 'var(--elevation-3)',
  },
  modalTitle: {
    font: 'var(--type-heading-subsection)',
    margin: '0 0 var(--spacing-md) 0',
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    font: 'var(--type-body-small)',
  },
};
export default SpecimenProfile;
