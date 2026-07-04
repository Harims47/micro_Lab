import React, { useState, useEffect, useCallback } from 'react';
import type { Culture, PlateObservation, ColonyItem } from '../models/types';
import { CultureService } from '../services/cultureService';
import { useNotification } from '../../../infrastructure/notifications/useNotification';
import { usePermission } from '../../../infrastructure/permissions/usePermission';
import { Permission } from '../../../infrastructure/permissions/constants';

import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { Tabs } from '../../../components/Layout/Tabs';
import { CultureObservationDialog } from '../dialogs/CultureObservationDialog';
import {
  AttachmentPanel,
  TimelineViewer,
  AuditViewer,
  NotesPanel,
  TaskAssignmentPanel,
} from '../../../components/Laboratory';

interface CultureProfileProps {
  cultureId: string;
  onBack: () => void;
}

export const CultureProfile: React.FC<CultureProfileProps> = ({ cultureId, onBack }) => {
  const { addToast } = useNotification();
  const { hasPermission } = usePermission();
  const canObserve = hasPermission(Permission.OBSERVE_GROWTH);
  const canCancel = hasPermission(Permission.ORDER_CANCEL);

  const [culture, setCulture] = useState<Culture | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal dialog states
  const [obsPlateId, setObsPlateId] = useState<string | null>(null);
  const [contamPlateId, setContamPlateId] = useState<string | null>(null);
  
  const [contamSource, setContamSource] = useState('Incubator humidity');
  const [contamSeverity, setContamSeverity] = useState('Medium');

  // State comments list
  const [notesList, setNotesList] = useState<any[]>([
    {
      id: 'N-01',
      author: 'Sarah Connor',
      role: 'Registrar',
      timestamp: new Date().toISOString(),
      category: 'Laboratory',
      content: 'Specimen streak completed. Checked lot preparation expiration dates.',
    },
  ]);

  const fetchCulture = useCallback(async () => {
    setLoading(true);
    try {
      const c = await CultureService.getCultureById(cultureId);
      setCulture(c);
    } catch {
      addToast('error', 'Failed to retrieve culture details.');
    } finally {
      setLoading(false);
    }
  }, [cultureId, addToast]);

  useEffect(() => {
    fetchCulture();
  }, [fetchCulture]);

  if (loading) {
    return <p style={{ font: 'var(--type-body-default)', color: 'var(--color-text-secondary)' }}>Loading culture profile...</p>;
  }

  if (!culture) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
        <p style={{ font: 'var(--type-body-default)', color: 'var(--color-status-danger)' }}>Culture record not found.</p>
        <Button onClick={onBack} variant="outline" style={{ marginTop: '12px' }}>
          Back to Directory
        </Button>
      </div>
    );
  }

  const handleStartIncubate = async (plateId: string) => {
    try {
      await CultureService.updatePlateStatus(culture.cultureId, plateId, 'Incubating');
      addToast('success', 'Plate started incubation.');
      fetchCulture();
    } catch {
      addToast('error', 'Failed to update plate status.');
    }
  };

  const handleObservationSubmit = async (
    obs: Partial<PlateObservation>,
    colonies: Partial<ColonyItem>[]
  ) => {
    if (!obsPlateId) return;
    try {
      await CultureService.recordObservation(culture.cultureId, obsPlateId, obs, colonies as ColonyItem[]);
      addToast('success', 'colony growth observations recorded.');
      setObsPlateId(null);
      fetchCulture();
    } catch {
      addToast('error', 'Failed to submit observations.');
    }
  };

  const handleContamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contamPlateId) return;
    try {
      await CultureService.logContamination(culture.cultureId, contamPlateId, {
        severity: contamSeverity,
        source: contamSource,
        action: 'Repeat Culture',
      });
      addToast('success', 'Contamination reported to department supervisors.');
      setContamPlateId(null);
      fetchCulture();
    } catch {
      addToast('error', 'Failed to log contamination.');
    }
  };

  // Timeline events mapping
  const timelineEvents = culture.auditTrail.map((log: any, idx: number) => ({
    id: log.id || `TL-${idx}`,
    title: log.action,
    time: log.timestamp,
    severity: log.action.includes('Contam') ? ('Critical' as const) : ('Info' as const),
    performedBy: log.performedBy || 'Sarah Connor',
    role: 'Lab Technician',
    description: log.reason,
  }));

  // Auditing diff records
  const auditRecords = culture.auditTrail.map((log: any, idx: number) => ({
    id: log.id || `AUD-${idx}`,
    timestamp: log.timestamp,
    performedBy: log.performedBy || 'Sarah Connor',
    module: 'Culture Management',
    action: log.action,
    reason: log.reason,
  }));

  // Reassignments task
  const mockTask = {
    taskId: culture.cultureId,
    assignedTo: culture.assignedTech || 'tech_user',
    queue: 'Culture Queue' as const,
    priority: 'Routine' as const,
    dueDate: new Date().toISOString(),
  };

  const tabItems = [
    {
      id: 'timeline',
      label: 'Timeline Events',
      content: <TimelineViewer events={timelineEvents} />,
    },
    {
      id: 'attachments',
      label: 'Attachments',
      content: <AttachmentPanel entityId={culture.cultureId} />,
    },
    {
      id: 'notes',
      label: 'Notes & Commentary',
      content: (
        <NotesPanel
          notes={notesList}
          onAddNote={(note) => {
            setNotesList([
              ...notesList,
              {
                id: `N-${notesList.length + 1}`,
                author: 'tech_user',
                role: 'Technician',
                timestamp: new Date().toISOString(),
                category: note.category,
                content: note.content,
                mentions: note.mentions,
              },
            ]);
          }}
        />
      ),
    },
    {
      id: 'audits',
      label: 'System Audit Trail',
      content: <AuditViewer audits={auditRecords} />,
    },
    {
      id: 'assignment',
      label: 'Task Assignment',
      content: (
        <TaskAssignmentPanel
          task={mockTask}
          onUpdateAssignment={(upd) => {
            addToast('success', `Technician pool reallocated to ${upd.assignedTo || 'Unassigned'}.`);
          }}
        />
      ),
    },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={{ font: 'var(--type-heading-page)', margin: 0 }}>Culture Set: {culture.cultureAccession}</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-secondary)', font: 'var(--type-body-small)' }}>
            Patient: {culture.patientName} | Specimen ID: {culture.specimenBarcode}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" onClick={onBack}>
            Back to Directory
          </Button>
        </div>
      </div>

      {/* Plates Display Grid */}
      <div style={styles.platesSection}>
        <h4 style={styles.sectionTitle}>Inoculated Agar Plates</h4>
        <div style={styles.platesGrid}>
          {culture.plates.map((plate) => (
            <Card key={plate.plateId} style={styles.plateCard}>
              <div style={styles.plateHeader}>
                <strong>{plate.mediaName}</strong>
                <span
                  style={{
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-circular)',
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    backgroundColor: plate.status === 'Completed' ? 'var(--color-status-success-bg)' : 'var(--color-brand-secondary-bg)',
                    color: plate.status === 'Completed' ? 'var(--color-status-success)' : 'var(--color-brand-primary)',
                  }}
                >
                  {plate.status}
                </span>
              </div>

              <div style={styles.plateBody}>
                <p>Barcode: <strong>{plate.plateBarcode}</strong></p>
                <p>Batch Lot: <strong>{plate.mediaLot}</strong></p>
                <p>Incubator Shelf: <strong>{plate.incubation.incubatorId} ({plate.incubation.chamber})</strong></p>
                
                {plate.observations.length > 0 && (
                  <div style={styles.obsList}>
                    <strong>Latest Observation:</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem' }}>
                      Round #{plate.observations[plate.observations.length - 1].roundNumber}: {plate.observations[plate.observations.length - 1].growthLevel}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions toolbar */}
              <div style={styles.plateActions}>
                {plate.status === 'Created' && (
                  <Button variant="solid" onClick={() => handleStartIncubate(plate.plateId)}>
                    Start Incubation
                  </Button>
                )}
                {plate.status === 'Incubating' && canObserve && (
                  <Button variant="solid" onClick={() => setObsPlateId(plate.plateId)}>
                    Record Growth
                  </Button>
                )}
                {plate.status === 'Incubating' && canCancel && (
                  <Button
                    variant="outline"
                    onClick={() => setContamPlateId(plate.plateId)}
                    style={{ color: 'var(--color-status-danger)' }}
                  >
                    Flag Contam
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Card style={{ marginTop: 'var(--spacing-md)' }}>
        <Tabs items={tabItems} />
      </Card>

      {/* Observation dialogue */}
      {obsPlateId && (
        <CultureObservationDialog
          onClose={() => setObsPlateId(null)}
          onSubmit={handleObservationSubmit}
        />
      )}

      {/* Contamination form */}
      {contamPlateId && (
        <div style={styles.modalOverlay}>
          <Card style={styles.modalBox}>
            <h4 style={{ margin: '0 0 var(--spacing-sm) 0' }}>Flag Specimen Contamination</h4>
            <form onSubmit={handleContamSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="lims-form-label" style={{ display: 'block', marginBottom: '4px' }}>Contamination Source</label>
                <input
                  type="text"
                  value={contamSource}
                  onChange={(e) => setContamSource(e.target.value)}
                  className="lims-input"
                  style={{ width: '100%', height: '36px', padding: '0 8px', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div>
                <label className="lims-form-label" style={{ display: 'block', marginBottom: '4px' }}>Severity Level</label>
                <select
                  value={contamSeverity}
                  onChange={(e) => setContamSeverity(e.target.value)}
                  className="lims-input"
                  style={{ width: '100%', height: '36px' }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <Button variant="outline" type="button" onClick={() => setContamPlateId(null)}>Cancel</Button>
                <Button variant="solid" type="submit" style={{ backgroundColor: 'var(--color-status-danger)', color: 'white' }}>
                  Log Contamination
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: 'var(--spacing-sm)',
    flexWrap: 'wrap',
    gap: '8px',
  },
  platesSection: {
    marginTop: 'var(--spacing-sm)',
  },
  sectionTitle: {
    font: 'var(--type-heading-subsection)',
    margin: '0 0 var(--spacing-sm) 0',
  },
  platesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 'var(--spacing-md)',
  },
  plateCard: {
    padding: 'var(--spacing-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  },
  plateHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: '6px',
  },
  plateBody: {
    fontSize: '0.82rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  obsList: {
    marginTop: '6px',
    backgroundColor: 'var(--color-surface-base)',
    padding: '6px',
    borderRadius: '4px',
  },
  plateActions: {
    marginTop: 'auto',
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
  },
  modalBox: {
    width: '360px',
    padding: 'var(--spacing-lg)',
  },
};
export default CultureProfile;
