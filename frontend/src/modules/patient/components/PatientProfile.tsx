import React, { useState, useEffect } from 'react';
import type { Patient } from '../models/types';
import { PatientService } from '../services/patientService';
import { useGlobalState } from '../../../providers/GlobalStateProvider';
import { usePermission } from '../../../infrastructure/permissions/usePermission';
import { Permission } from '../../../infrastructure/permissions/constants';
import { Button } from '../../../components/Foundation/Button';
import { Timeline } from '../../../components/Data/Timeline';
import { ArrowLeft, Edit, AlertOctagon, ShieldAlert, Award, FileText, History } from 'lucide-react';

interface PatientProfileProps {
  patientId: string;
  onBack: () => void;
  onEdit: (id: string) => void;
}

export const PatientProfile: React.FC<PatientProfileProps> = ({
  patientId,
  onBack,
  onEdit,
}) => {
  const { hasPermission } = usePermission();
  const { orders } = useGlobalState();
  const canEdit = hasPermission(Permission.PATIENT_EDIT);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await PatientService.getPatientById(patientId);
        setPatient(data);

        // Fetch history audit trail
        const logs = await PatientService.getPatientHistory(patientId);
        setHistoryLogs(logs);
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve patient medical profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [patientId]);

  // Filter orders related to this patient MRN
  const relatedOrders = orders.filter((o) => o.patientId === patientId || (patient && o.mrn === patient.mrn));

  // Expanded complete downstream lifecycle timeline nodes conforming exactly to TimelineEvent
  const expandedTimeline = patient
    ? [
        {
          id: 'evt-1',
          title: 'Patient Registered',
          time: new Date(patient.createdAt).toLocaleString(),
          description: 'Demographics record captured and locked in LIMS registry.',
        },
        {
          id: 'evt-2',
          title: 'Laboratory Requisition Order',
          time: relatedOrders.length > 0 ? new Date(relatedOrders[0].requisitionDate).toLocaleString() : 'Pending',
          description: relatedOrders.length > 0 ? `Ordered panels: ${relatedOrders[0].panelsRequested.join(', ')}` : 'Waiting for physician requisition order.',
        },
        {
          id: 'evt-3',
          title: 'Specimen Collection',
          time: relatedOrders.length > 0 ? new Date(relatedOrders[0].requisitionDate).toLocaleString() : 'Pending',
          description: relatedOrders.length > 0 ? 'Specimen blood culture bottle drawn and labeled.' : 'Awaiting collection.',
        },
        {
          id: 'evt-4',
          title: 'Specimen Intake Received',
          time: relatedOrders.length > 0 ? new Date(relatedOrders[0].createdAt).toLocaleString() : 'Pending',
          description: relatedOrders.length > 0 ? 'Container scan matched accession barcoding checks.' : 'Awaiting receipt.',
        },
        {
          id: 'evt-5',
          title: 'Microbiology Inoculation',
          time: relatedOrders.length > 0 ? new Date(new Date(relatedOrders[0].createdAt).getTime() + 1800000).toLocaleString() : 'Pending',
          description: 'Inoculated on Blood Agar & MacConkey media, loaded into incubator.',
        },
        {
          id: 'evt-6',
          title: 'Incubation Growth Readings',
          time: relatedOrders.length > 0 ? 'Active Monitoring' : 'Pending',
          description: 'Colony morphologies monitored. Growth detected.',
        },
        {
          id: 'evt-7',
          title: 'AST Susceptibility Matrix',
          time: 'Pending',
          description: 'Determination of antibiotic susceptibility SIR profile.',
        },
        {
          id: 'evt-8',
          title: 'Technical Verification & Report',
          time: 'Pending',
          description: 'Verification of clinical diagnostic report signature.',
        },
      ]
    : [];

  if (loading) {
    return (
      <div style={styles.loader}>
        <span>🔄 Loading clinical demographics profile...</span>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div style={styles.errorCard}>
        <span>⚠️</span>
        <span style={{ color: 'var(--color-status-danger)', fontWeight: 'bold' }}>{error || 'Profile could not be resolved.'}</span>
        <Button variant="outline" onClick={onBack}>Return to Registry</Button>
      </div>
    );
  }

  const { address, emergencyContact: emergency, insurance, clinicalFlags } = patient;

  return (
    <div style={styles.container}>
      {/* Profile Toolbar */}
      <div style={styles.toolbar}>
        <button onClick={onBack} style={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>Back to Registry</span>
        </button>
        {canEdit && patient.status === 'Active' && (
          <Button variant="solid" onClick={() => onEdit(patient.patientId)}>
            <Edit size={16} style={{ marginRight: '6px' }} />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Demographics Card Summary */}
      <div style={styles.gridContainer}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {/* Identity & Demographics */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.avatar}>
                {patient.firstName[0]}
                {patient.lastName[0]}
              </div>
              <div>
                <h2 style={styles.patientName}>{patient.lastName}, {patient.firstName}</h2>
                <div style={{ display: 'flex', gap: 'var(--spacing-xs)', marginTop: '4px' }}>
                  <span style={styles.mrnTag}>{patient.mrn}</span>
                  <span style={styles.statusTag}>{patient.status}</span>
                </div>
              </div>
            </div>

            <div style={styles.fieldsGrid}>
              <div style={styles.fieldItem}><span style={styles.fieldLabel}>Date of Birth</span><span>{new Date(patient.dob).toLocaleDateString()}</span></div>
              <div style={styles.fieldItem}><span style={styles.fieldLabel}>Gender</span><span>{patient.gender}</span></div>
              <div style={styles.fieldItem}><span style={styles.fieldLabel}>National ID</span><span>{patient.nationalId || '—'}</span></div>
              <div style={styles.fieldItem}><span style={styles.fieldLabel}>Passport No.</span><span>{patient.passportNumber || '—'}</span></div>
              <div style={styles.fieldItem}><span style={styles.fieldLabel}>Mobile Phone</span><span>{patient.phone || '—'}</span></div>
              <div style={styles.fieldItem}><span style={styles.fieldLabel}>Clinical Email</span><span>{patient.email || '—'}</span></div>
            </div>
          </div>

          {/* Clinical Flags Alerts */}
          {clinicalFlags && (clinicalFlags.isolationRequired || clinicalFlags.allergies.length > 0) && (
            <div style={styles.alertsCard}>
              <div style={styles.alertsHeader}>
                <ShieldAlert size={20} />
                <h3 style={{ margin: 0, font: 'var(--type-heading-item)' }}>Active Clinical Alerts</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                {clinicalFlags.isolationRequired && (
                  <div style={styles.alertBanner}>
                    <AlertOctagon size={16} />
                    <span><strong>INFECTION CONTROL WARNING:</strong> Patient requires strict isolation precautions.</span>
                  </div>
                )}
                {clinicalFlags.allergies.length > 0 && (
                  <div style={styles.allergyList}>
                    <strong>Allergy Registries:</strong> {clinicalFlags.allergies.join(', ')}
                  </div>
                )}
                {clinicalFlags.notes && (
                  <p style={{ font: 'var(--type-body-small)', color: 'var(--color-text-secondary)', margin: 0 }}>
                    <strong>Clinical Notes:</strong> {clinicalFlags.notes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Contact details / Address / Insurance */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Extended Details</h3>
            <div style={styles.fieldsGrid}>
              <div style={styles.fieldItem}>
                <span style={styles.fieldLabel}>Street Address</span>
                <span>{address?.street || '—'}</span>
              </div>
              <div style={styles.fieldItem}>
                <span style={styles.fieldLabel}>City / State</span>
                <span>{address ? `${address.city}, ${address.state} ${address.zipCode}` : '—'}</span>
              </div>
              <div style={styles.fieldItem}>
                <span style={styles.fieldLabel}>Emergency Contact</span>
                <span>{emergency?.name || '—'}</span>
              </div>
              <div style={styles.fieldItem}>
                <span style={styles.fieldLabel}>Relation / Phone</span>
                <span>{emergency ? `${emergency.relationship} (${emergency.phone})` : '—'}</span>
              </div>
              <div style={styles.fieldItem}>
                <span style={styles.fieldLabel}>Insurance Provider</span>
                <span>{insurance?.provider || '—'}</span>
              </div>
              <div style={styles.fieldItem}>
                <span style={styles.fieldLabel}>Policy Number</span>
                <span>{insurance?.policyNumber || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline, Related Orders, Audit Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {/* Related Orders */}
          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--spacing-sm)' }}>
              <FileText size={18} color="var(--color-brand-primary)" />
              <h3 style={{ margin: 0, font: 'var(--type-heading-item)' }}>Linked Requisitions</h3>
            </div>
            {relatedOrders.length === 0 ? (
              <div style={styles.emptyPrompt}>No laboratory orders mapped for this patient.</div>
            ) : (
              <div style={styles.ordersList}>
                {relatedOrders.map((o) => (
                  <div key={o.orderId} style={styles.orderRow}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{o.orderId}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-brand-primary)' }}>{o.orderStatus}</span>
                    </div>
                    <div style={{ font: 'var(--type-body-small)', color: 'var(--color-text-secondary)' }}>
                      Physician: {o.physicianName} | Requisition: {new Date(o.requisitionDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--spacing-sm)' }}>
              <Award size={18} color="var(--color-brand-primary)" />
              <h3 style={{ margin: 0, font: 'var(--type-heading-item)' }}>Diagnostic Lifecycle Timeline</h3>
            </div>
            <div style={styles.timelineBlock}>
              <Timeline events={expandedTimeline} />
            </div>
          </div>

          {/* Audit Trail */}
          <div style={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--spacing-sm)' }}>
              <History size={18} color="var(--color-brand-primary)" />
              <h3 style={{ margin: 0, font: 'var(--type-heading-item)' }}>Demographics Audit Logs</h3>
            </div>
            {historyLogs.length === 0 ? (
              <div style={styles.emptyPrompt}>No registration edit logs recorded.</div>
            ) : (
              <div style={styles.auditLogs}>
                {historyLogs.map((log, idx) => (
                  <div key={idx} style={styles.auditLogItem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--type-body-small)', fontWeight: 600 }}>
                      <span>{log.title}</span>
                      <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0 0', font: 'var(--type-body-small)', color: 'var(--color-text-secondary)' }}>
                      {log.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: 'var(--spacing-sm)',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    border: '1px solid var(--color-border-default)',
    backgroundColor: 'var(--color-surface-raised)',
    padding: '8px 16px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text-primary)',
    font: 'var(--type-label-default)',
    cursor: 'pointer',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: 'var(--spacing-md)',
  },
  card: {
    backgroundColor: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--spacing-md)',
    boxShadow: 'var(--elevation-1)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-md)',
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: 'var(--spacing-sm)',
    marginBottom: 'var(--spacing-md)',
  },
  avatar: {
    height: '54px',
    width: '54px',
    borderRadius: 'var(--radius-circular)',
    backgroundColor: 'var(--color-brand-secondary-bg)',
    color: 'var(--color-brand-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  patientName: {
    font: 'var(--type-heading-section)',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  mrnTag: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    backgroundColor: 'var(--color-surface-base)',
    border: '1px solid var(--color-border-default)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-xs)',
    color: 'var(--color-text-secondary)',
  },
  statusTag: {
    fontSize: '0.75rem',
    backgroundColor: 'var(--color-status-success-bg)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-circular)',
    color: 'var(--color-status-success)',
    fontWeight: 600,
  },
  fieldsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--spacing-md) var(--spacing-sm)',
  },
  fieldItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    font: 'var(--type-body-default)',
    color: 'var(--color-text-primary)',
  },
  fieldLabel: {
    font: 'var(--type-label-default)',
    color: 'var(--color-text-secondary)',
    fontSize: '0.75rem',
  },
  sectionTitle: {
    margin: '0 0 var(--spacing-sm) 0',
    font: 'var(--type-heading-item)',
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: '4px',
  },
  alertsCard: {
    backgroundColor: 'var(--color-status-danger-bg)',
    border: '1px solid var(--color-status-danger)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--spacing-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  },
  alertsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
    color: 'var(--color-status-danger)',
  },
  alertBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--color-status-danger)',
    font: 'var(--type-body-default)',
    backgroundColor: 'var(--color-surface-raised)',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-status-danger)',
  },
  allergyList: {
    font: 'var(--type-body-default)',
    color: 'var(--color-text-primary)',
  },
  emptyPrompt: {
    font: 'var(--type-body-default)',
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
    padding: 'var(--spacing-md) 0',
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xs)',
  },
  orderRow: {
    border: '1px solid var(--color-border-default)',
    padding: '10px var(--spacing-sm)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-surface-base)',
  },
  timelineBlock: {
    padding: 'var(--spacing-xs) 0',
  },
  auditLogs: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '220px',
    overflowY: 'auto',
  },
  auditLogItem: {
    backgroundColor: 'var(--color-surface-base)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px',
  },
  loader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '300px',
    color: 'var(--color-text-secondary)',
    font: 'var(--type-body-default)',
  },
  errorCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '300px',
    gap: 'var(--spacing-sm)',
  },
};
export default PatientProfile;
