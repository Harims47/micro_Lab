import React from 'react';
import { useGlobalState } from '../providers/GlobalStateProvider';
import { SpecimenStatus, ValidationStatus } from '../types';

// Generic Header wrapper for consistent layout styling
const PageHeader: React.FC<{ title: string; subtitle: string; actions?: React.ReactNode }> = ({ title, subtitle, actions }) => (
  <div style={placeholderStyles.header}>
    <div>
      <h1 style={placeholderStyles.headerTitle}>{title}</h1>
      <p style={placeholderStyles.headerSubtitle}>{subtitle}</p>
    </div>
    {actions && <div style={placeholderStyles.headerActions}>{actions}</div>}
  </div>
);

// 1. Dashboard Page
export const DashboardPage: React.FC = () => {
  const { patients, orders, specimens, plates, reports } = useGlobalState();

  const stats = [
    { label: 'Registered Patients', count: patients.length, color: 'var(--color-brand-primary)' },
    { label: 'Diagnostic Orders', count: orders.length, color: 'var(--color-status-info)' },
    { label: 'Active Specimens', count: specimens.filter(s => s.status !== SpecimenStatus.REJECTED && s.status !== SpecimenStatus.DELIVERED).length, color: 'var(--color-status-warning)' },
    { label: 'Incubated Plates', count: plates.length, color: 'var(--color-status-success)' },
    { label: 'Pending Validations', count: reports.filter(r => r.validationStatus === ValidationStatus.PENDING).length, color: 'var(--color-status-danger)' }
  ];

  return (
    <div style={placeholderStyles.container}>
      <PageHeader title="Laboratory Operations Dashboard" subtitle="Operational worklist metrics overview." />
      
      <div style={placeholderStyles.statsGrid}>
        {stats.map((s, i) => (
          <div key={i} style={placeholderStyles.statCard}>
            <div style={{ ...placeholderStyles.statColorBar, backgroundColor: s.color }} />
            <span style={placeholderStyles.statLabel}>{s.label}</span>
            <span style={placeholderStyles.statValue}>{s.count}</span>
          </div>
        ))}
      </div>

      <div style={placeholderStyles.card}>
        <h2 style={placeholderStyles.cardTitle}>Active Specimen Queue</h2>
        <table style={placeholderStyles.table}>
          <thead>
            <tr style={placeholderStyles.tableHeader}>
              <th style={placeholderStyles.th}>Accession ID</th>
              <th style={placeholderStyles.th}>Type</th>
              <th style={placeholderStyles.th}>Source</th>
              <th style={placeholderStyles.th}>Status</th>
              <th style={placeholderStyles.th}>Received At</th>
            </tr>
          </thead>
          <tbody>
            {specimens.map((spec) => (
              <tr key={spec.specimenId} style={placeholderStyles.tableRow}>
                <td style={{ ...placeholderStyles.td, fontFamily: 'var(--font-mono)' }}>{spec.accessionNumber}</td>
                <td style={placeholderStyles.td}>{spec.specimenType}</td>
                <td style={placeholderStyles.td}>{spec.sampleSource}</td>
                <td style={placeholderStyles.td}>
                  <span style={{
                    ...placeholderStyles.badge,
                    backgroundColor: spec.status === SpecimenStatus.REJECTED ? 'var(--color-status-danger-bg)' : 'var(--color-status-pending-bg)',
                    color: spec.status === SpecimenStatus.REJECTED ? 'var(--color-status-danger)' : 'var(--color-text-primary)'
                  }}>{spec.status}</span>
                </td>
                <td style={placeholderStyles.td}>{spec.receivedAt ? new Date(spec.receivedAt).toLocaleString() : 'Pending'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Standard Template for Module Placeholders
const ModulePlaceholder: React.FC<{ name: string; description: string; moduleCode: string }> = ({ name, description, moduleCode }) => (
  <div style={placeholderStyles.container}>
    <PageHeader title={`${name} Management`} subtitle={`LIMS Core Module: ${moduleCode}`} />
    <div style={placeholderStyles.placeholderContent}>
      <div style={placeholderStyles.infoBox}>
        <div style={placeholderStyles.infoIcon}>⚙️</div>
        <h3 style={placeholderStyles.infoTitle}>{name} Module Base System</h3>
        <p style={placeholderStyles.infoDesc}>{description}</p>
        <div style={placeholderStyles.metadataRow}>
          <span style={placeholderStyles.metaTag}>Status: Baseline Mocked</span>
          <span style={placeholderStyles.metaTag}>Trace ID: REQ-SRS-{moduleCode}</span>
        </div>
      </div>
    </div>
  </div>
);

// 2. Patient Placeholder
export const PatientPage: React.FC = () => (
  <ModulePlaceholder name="Patient Demographics" description="Manages Patient Medical Records (MRN), contact matrices, and clinical demographics collection." moduleCode="PAT" />
);

// 3. Orders Placeholder
export const OrdersPage: React.FC = () => (
  <ModulePlaceholder name="Order Entry" description="Coordinates laboratory panel requests, links billing status, and catalogs diagnostic requisition records." moduleCode="ORD" />
);

// 4. Specimen Placeholder
export const SpecimenPage: React.FC = () => (
  <ModulePlaceholder name="Specimen Intake" description="Handles specimen container barcode scanning, quality review checklists, and accession tracking logs." moduleCode="SPC" />
);

// 5. Culture Placeholder
export const CulturePage: React.FC = () => (
  <ModulePlaceholder name="Culture Inoculation" description="Tracks media plate lot allocations, incubator assignments, shelf slots, and active growth read timers." moduleCode="CULT" />
);

// 6. Organism Placeholder
export const OrganismPage: React.FC = () => (
  <ModulePlaceholder name="Organism Identification" description="Logs biochemical reactions, MALDI-TOF spectrum maps, and matches organism taxonomy definitions." moduleCode="ORG" />
);

// 7. AST Placeholder
export const AstPage: React.FC = () => (
  <ModulePlaceholder name="Antibiotic Susceptibility" description="Calculates S/I/R limits matching CLSI guidelines, records zone diameters, and mic microdilutions." moduleCode="AST" />
);

// 8. Validation Placeholder
export const ValidationPage: React.FC = () => (
  <ModulePlaceholder name="Result Validation" description="Performs technical reviews and pathologist medical sign-off gates with secure signature locks." moduleCode="VAL" />
);

// 9. Reports Placeholder
export const ReportsPage: React.FC = () => (
  <ModulePlaceholder name="Report Compilation" description="Compiles validated diagnostic findings, generates PDF documents, and manages EHR message dispatches." moduleCode="RPT" />
);

// 10. Admin Placeholder
export const AdminPage: React.FC = () => (
  <ModulePlaceholder name="System Administration" description="Manages user directory permissions, tenant configuration tables, and antibiotic guideline selectors." moduleCode="ADM" />
);

// 11. Audit Placeholder
export const AuditPage: React.FC = () => {
  const { auditLogs } = useGlobalState();
  return (
    <div style={placeholderStyles.container}>
      <PageHeader title="Compliance Audit Log" subtitle="Permanent audit history for security overrides and validation actions." />
      <div style={placeholderStyles.card}>
        <table style={placeholderStyles.table}>
          <thead>
            <tr style={placeholderStyles.tableHeader}>
              <th style={placeholderStyles.th}>Audit ID</th>
              <th style={placeholderStyles.th}>Timestamp</th>
              <th style={placeholderStyles.th}>User</th>
              <th style={placeholderStyles.th}>Action</th>
              <th style={placeholderStyles.th}>Module</th>
              <th style={placeholderStyles.th}>Details</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => (
              <tr key={log.auditId} style={placeholderStyles.tableRow}>
                <td style={{ ...placeholderStyles.td, fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{log.auditId}</td>
                <td style={placeholderStyles.td}>{new Date(log.timestamp).toLocaleString()}</td>
                <td style={placeholderStyles.td}>{log.userName} ({log.role})</td>
                <td style={placeholderStyles.td}><span style={placeholderStyles.bold}>{log.action}</span></td>
                <td style={placeholderStyles.td}>{log.module}</td>
                <td style={placeholderStyles.td}>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 12. Analytics Placeholder
export const AnalyticsPage: React.FC = () => (
  <ModulePlaceholder name="Laboratory Analytics" description="Aggregates diagnostic turnaround times, laboratory defect leakage ratios, and epidemiologic counts." moduleCode="ANA" />
);

// 13. 403 Forbidden Page
export const ForbiddenPage: React.FC = () => (
  <div style={placeholderStyles.errorContainer}>
    <div style={placeholderStyles.errorCard}>
      <span style={placeholderStyles.errorCardIcon}>🔒</span>
      <h1 style={placeholderStyles.errorTitle}>403 - Forbidden</h1>
      <p style={placeholderStyles.errorDesc}>ERR-004: Access Denied. Your active role does not have authorization to view this module.</p>
    </div>
  </div>
);

// 13A. 401 Unauthorized Page
export const UnauthorizedPage: React.FC = () => (
  <div style={placeholderStyles.errorContainer}>
    <div style={placeholderStyles.errorCard}>
      <span style={placeholderStyles.errorCardIcon}>🔑</span>
      <h1 style={placeholderStyles.errorTitle}>401 - Unauthorized</h1>
      <p style={placeholderStyles.errorDesc}>ERR-005: Session Unauthenticated. Please sign in to verify your laboratory credentials.</p>
    </div>
  </div>
);

// 14. 404 Not Found Page
export const NotFoundPage: React.FC = () => (
  <div style={placeholderStyles.errorContainer}>
    <div style={placeholderStyles.errorCard}>
      <span style={placeholderStyles.errorCardIcon}>🔍</span>
      <h1 style={placeholderStyles.errorTitle}>404 - Not Found</h1>
      <p style={placeholderStyles.errorDesc}>The requested screen or layout target does not exist in the routing inventory.</p>
    </div>
  </div>
);

// 15. 500 Server Error Page
export const ServerErrorPage: React.FC = () => (
  <div style={placeholderStyles.errorContainer}>
    <div style={placeholderStyles.errorCard}>
      <span style={placeholderStyles.errorCardIcon}>💥</span>
      <h1 style={placeholderStyles.errorTitle}>500 - Server Error</h1>
      <p style={placeholderStyles.errorDesc}>An unexpected exception occurred inside the mock api execution thread.</p>
    </div>
  </div>
);

// 16. Offline State Page
export const OfflinePage: React.FC = () => (
  <div style={placeholderStyles.errorContainer}>
    <div style={placeholderStyles.errorCard}>
      <span style={placeholderStyles.errorCardIcon}>🔌</span>
      <h1 style={placeholderStyles.errorTitle}>Connection Offline</h1>
      <p style={placeholderStyles.errorDesc}>Please check your local laboratory network settings. Offline fallback mode active.</p>
    </div>
  </div>
);

// 17. Maintenance State Page
export const MaintenancePage: React.FC = () => (
  <div style={placeholderStyles.errorContainer}>
    <div style={placeholderStyles.errorCard}>
      <span style={placeholderStyles.errorCardIcon}>🚧</span>
      <h1 style={placeholderStyles.errorTitle}>System Maintenance</h1>
      <p style={placeholderStyles.errorDesc}>Microbiology LIMS is currently undergoing scheduled compliance database index updates.</p>
    </div>
  </div>
);

const placeholderStyles: Record<string, React.CSSProperties> = {
  container: {
    padding: 'var(--spacing-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-lg)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: 'var(--spacing-md)'
  },
  headerTitle: {
    font: 'var(--type-heading-section)',
    color: 'var(--color-text-primary)'
  },
  headerSubtitle: {
    font: 'var(--type-body-small)',
    color: 'var(--color-text-secondary)',
    marginTop: '4px'
  },
  headerActions: {
    display: 'flex',
    gap: 'var(--spacing-sm)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--spacing-md)'
  },
  statCard: {
    position: 'relative',
    backgroundColor: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--spacing-md)',
    boxShadow: 'var(--elevation-1)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2xs)',
    overflow: 'hidden'
  },
  statColorBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px'
  },
  statLabel: {
    font: 'var(--type-body-small)',
    color: 'var(--color-text-secondary)',
    fontWeight: 500
  },
  statValue: {
    font: 'var(--type-heading-page)',
    color: 'var(--color-text-primary)',
    fontSize: '2rem',
    fontWeight: 'bold'
  },
  card: {
    backgroundColor: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--spacing-lg)',
    boxShadow: 'var(--elevation-1)'
  },
  cardTitle: {
    font: 'var(--type-heading-subsection)',
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--spacing-md)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  tableHeader: {
    borderBottom: '2px solid var(--color-border-default)'
  },
  th: {
    padding: '12px var(--spacing-sm)',
    font: 'var(--type-label-default)',
    color: 'var(--color-text-secondary)',
    fontWeight: 600
  },
  tableRow: {
    borderBottom: '1px solid var(--color-border-default)',
    transition: 'background-color var(--motion-duration-fast) var(--motion-ease-standard)'
  },
  td: {
    padding: '12px var(--spacing-sm)',
    font: 'var(--type-body-default)',
    color: 'var(--color-text-primary)'
  },
  bold: {
    fontWeight: 600
  },
  badge: {
    padding: '2px 8px',
    borderRadius: 'var(--radius-circular)',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase'
  },
  placeholderContent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 'var(--spacing-4xl) 0'
  },
  infoBox: {
    maxWidth: '520px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    padding: 'var(--spacing-xl)',
    backgroundColor: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--elevation-1)'
  },
  infoIcon: {
    fontSize: '3rem',
    marginBottom: 'var(--spacing-xs)'
  },
  infoTitle: {
    font: 'var(--type-heading-subsection)',
    color: 'var(--color-text-primary)'
  },
  infoDesc: {
    font: 'var(--type-body-default)',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6
  },
  metadataRow: {
    display: 'flex',
    gap: 'var(--spacing-sm)',
    marginTop: 'var(--spacing-xs)'
  },
  metaTag: {
    font: 'var(--type-body-small)',
    fontSize: '0.75rem',
    backgroundColor: 'var(--color-surface-base)',
    border: '1px solid var(--color-border-default)',
    padding: '4px 10px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text-secondary)',
    fontWeight: 500
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    width: '100%'
  },
  errorCard: {
    textAlign: 'center',
    padding: 'var(--spacing-2xl)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-md)'
  },
  errorCardIcon: {
    fontSize: '4rem'
  },
  errorTitle: {
    font: 'var(--type-heading-page)',
    color: 'var(--color-text-primary)'
  },
  errorDesc: {
    font: 'var(--type-body-default)',
    color: 'var(--color-text-secondary)',
    maxWidth: '420px',
    lineHeight: 1.5
  }
};
