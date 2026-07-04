import React, { useState, useEffect } from 'react';
import type { Order } from '../models/types';
import { TEST_CATALOG } from '../models/types';
import { OrderService } from '../services/orderService';
import { PatientService } from '../../patient/services/patientService';
import type { Patient } from '../../patient/models/types';
import { useNotification } from '../../../infrastructure/notifications/useNotification';
import { Card, PageContainer } from '../../../components/Layout';
import { Button } from '../../../components/Foundation/Button';
import { Timeline } from '../../../components/Data/Timeline';
import { Tabs } from '../../../components/Layout/Tabs';

interface OrderProfileProps {
  orderId: string;
  onBack: () => void;
  onEdit: (id: string) => void;
}

export const OrderProfile: React.FC<OrderProfileProps> = ({ orderId, onBack, onEdit }) => {
  const { addToast } = useNotification();
  const [order, setOrder] = useState<Order | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const o = await OrderService.getOrderById(orderId);
        setOrder(o);
        const p = await PatientService.getPatientById(o.patientId);
        setPatient(p);
      } catch {
        addToast('error', 'Failed to retrieve order requisition details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [orderId, addToast]);

  if (loading) {
    return <p style={{ font: 'var(--type-body-default)', color: 'var(--color-text-secondary)' }}>Loading requisition index details...</p>;
  }

  if (!order) {
    return (
      <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
        <p style={{ font: 'var(--type-body-default)', color: 'var(--color-status-danger)' }}>Requisition record not found.</p>
        <Button onClick={onBack} variant="outline" style={{ marginTop: '12px' }}>
          Back to Directory
        </Button>
      </div>
    );
  }

  const timelineEvents = order.timeline.map((evt) => ({
    id: evt.id,
    title: evt.status,
    time: new Date(evt.timestamp).toLocaleString(),
    description: evt.notes ? `Performed by ${evt.performedBy}. Notes: ${evt.notes}` : `Performed by ${evt.performedBy}.`
  }));

  const tabItems = [
    {
      id: 'clinical',
      label: 'Clinical Requisition',
      content: (
        <div style={styles.tabContent}>
          <div style={styles.grid}>
            <div>
              <h4 style={styles.sectionTitle}>Requisition Demographics</h4>
              <p style={styles.metadataLine}>Accession Number: <strong>{order.accessionNumber}</strong></p>
              <p style={styles.metadataLine}>Created On: <strong>{new Date(order.createdAt).toLocaleString()}</strong></p>
              <p style={styles.metadataLine}>Priority Level: <strong>{order.priority}</strong></p>
              <p style={styles.metadataLine}>Workflow State: <strong>{order.status}</strong></p>
            </div>
            <div>
              <h4 style={styles.sectionTitle}>Patient Profile</h4>
              {patient ? (
                <>
                  <p style={styles.metadataLine}>Full Name: <strong>{patient.lastName}, {patient.firstName}</strong></p>
                  <p style={styles.metadataLine}>MRN: <strong>{patient.mrn}</strong></p>
                  <p style={styles.metadataLine}>Gender/DOB: <strong>{patient.gender} | {patient.dob}</strong></p>
                </>
              ) : (
                <p style={{ color: 'var(--color-text-secondary)' }}>Loading demographic details...</p>
              )}
            </div>
          </div>

          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <h4 style={styles.sectionTitle}>Clinical Indication Notes</h4>
            <div style={styles.clinicalBox}>
              {order.clinicalInfo || 'No signs or symptoms specified.'}
            </div>
          </div>

          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <h4 style={styles.sectionTitle}>Specimens & Tests Guidelines</h4>
            <div style={styles.testsGrid}>
              {order.requestedTests.map((code) => {
                const test = TEST_CATALOG.find((cat) => cat.code === code);
                if (!test) return null;
                return (
                  <div key={code} style={styles.specCard}>
                    <strong style={{ color: 'var(--color-brand-primary)' }}>{test.name} ({test.code})</strong>
                    <div style={styles.specDetails}>
                      <span>Specimen type: <strong>{test.requiredSpecimen}</strong></span>
                      <span>Container type: <strong>{test.container}</strong></span>
                      <span>Volume limit: <strong>{test.volume}</strong></span>
                      <span>Transport guidelines: <strong>{test.transport}</strong></span>
                      <span>Collection notes: <span style={{ fontStyle: 'italic' }}>{test.collectionNotes}</span></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'timeline',
      label: 'Workflow Timeline',
      content: (
        <div style={styles.tabContent}>
          <h4 style={styles.sectionTitle}>Requisition Status Progress</h4>
          <Timeline events={timelineEvents} />
        </div>
      ),
    },
    {
      id: 'audit',
      label: 'System Audit Trail',
      content: (
        <div style={styles.tabContent}>
          <h4 style={styles.sectionTitle}>Access & Activity Logs</h4>
          <div style={styles.auditList}>
            {order.auditTrail.map((log) => (
              <div key={log.id} style={styles.auditItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong>{log.action}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  <span>Performed by: <strong>{log.performedBy}</strong></span>
                  {log.reason && <p style={{ margin: '4px 0 0 0' }}>Reason: <em>{log.reason}</em></p>}
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
      {/* Detail header */}
      <div style={styles.header}>
        <div>
          <h2 style={{ font: 'var(--type-heading-page)', margin: 0 }}>Order details: {order.accessionNumber}</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-secondary)', font: 'var(--type-body-small)' }}>
            Patient: {order.patientName} ({order.patientMrn}) | Physician: {order.physicianName}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" onClick={onBack}>
            Back to Directory
          </Button>
          <Button variant="solid" onClick={() => onEdit(order.orderId)}>
            Edit Requisition
          </Button>
        </div>
      </div>

      <Card>
        <Tabs items={tabItems} />
      </Card>
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
  clinicalBox: {
    backgroundColor: 'var(--color-surface-base)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--spacing-md)',
    font: 'var(--type-body-default)',
    color: 'var(--color-text-primary)',
    minHeight: '60px',
  },
  testsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  },
  specCard: {
    borderLeft: '3px solid var(--color-brand-primary)',
    backgroundColor: 'var(--color-surface-base)',
    border: '1px solid var(--color-border-default)',
    borderLeftColor: 'var(--color-brand-primary)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--spacing-md)',
  },
  specDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '6px var(--spacing-md)',
    marginTop: 'var(--spacing-sm)',
    font: 'var(--type-body-small)',
    color: 'var(--color-text-secondary)',
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
};
export default OrderProfile;
