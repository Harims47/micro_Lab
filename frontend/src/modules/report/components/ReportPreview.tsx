import React, { useState } from 'react';
import type { LaboratoryReport } from '../models/types';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { useNotification } from '../../../infrastructure/notifications/useNotification';

interface ReportPreviewProps {
  report: LaboratoryReport;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({ report }) => {
  const { addToast } = useNotification();
  const [zoom, setZoom] = useState(100);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const res = report.approvedResult;

  const handleDownload = () => {
    addToast('success', `PDF Report successfully exported: ${report.reportId}.pdf`);
  };

  const reportContent = (
    <div style={{
      ...styles.reportSheet,
      transform: `scale(${zoom / 100})`,
      transformOrigin: 'top center',
      marginBottom: `${(zoom - 100) * 4}px`, // adjust margin spacing for scaling
    }}>
      {/* Header section */}
      {report.sections.find((s) => s.sectionId === 'header')?.visible && (
        <div style={styles.repHeader}>
          <div>
            <h2 style={{ margin: 0, color: 'var(--color-brand-primary)' }}>METROPOLIS MICROBIOLOGY LIMS</h2>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
              100 Clinical Way, Suite 400 &nbsp;|&nbsp; Tel: (555) 019-2834 &nbsp;|&nbsp; CLIA: 99D1029384
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ margin: 0 }}>LABORATORY REPORT</h3>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>Report ID: {report.reportId}</span>
          </div>
        </div>
      )}

      {/* Patient demographics */}
      {report.sections.find((s) => s.sectionId === 'patient')?.visible && report.template.showDemographics && (
        <div style={styles.repSection}>
          <h4 style={styles.sectionTitle}>Patient Demographics</h4>
          <div style={styles.detailGrid}>
            <div><strong>Patient Name:</strong> <span>{res.patientName}</span></div>
            <div><strong>Patient ID:</strong> <span>{res.patientId}</span></div>
            <div><strong>Order Reference:</strong> <span>{res.orderId}</span></div>
            <div><strong>Accession Date:</strong> <span>{new Date(res.collectionDateTime).toLocaleDateString()}</span></div>
          </div>
        </div>
      )}

      {/* Specimen details */}
      {report.sections.find((s) => s.sectionId === 'specimen')?.visible && (
        <div style={styles.repSection}>
          <h4 style={styles.sectionTitle}>Specimen Information</h4>
          <div style={styles.detailGrid}>
            <div><strong>Specimen ID:</strong> <span>{res.specimenId}</span></div>
            <div><strong>Source Type:</strong> <span>{res.specimenType}</span></div>
            <div><strong>Collection Time:</strong> <span>{new Date(res.collectionDateTime).toLocaleString()}</span></div>
            <div><strong>Validation Reference:</strong> <span>{res.validationId}</span></div>
          </div>
        </div>
      )}

      {/* Identification & AST grid */}
      {report.sections.find((s) => s.sectionId === 'results')?.visible && (
        <div style={styles.repSection}>
          <h4 style={styles.sectionTitle}>Microbiology Findings</h4>
          
          <div style={{ marginBottom: '12px', padding: '10px', borderRadius: '4px', backgroundColor: 'var(--color-surface-base)', border: '1px solid var(--color-border-default)' }}>
            <strong>Isolated Organism:</strong> <span style={{ fontStyle: 'italic', fontSize: '1rem', color: 'var(--color-brand-primary)' }}>{res.organismName}</span>
            {res.confidenceScore && (
              <span style={{ marginLeft: '12px', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                (MALDI-TOF Confidence: {res.confidenceScore}%)
              </span>
            )}
          </div>

          {report.template.showAstGrid && res.astResults.length > 0 && (
            <div style={styles.astTableWrapper}>
              <h5 style={{ margin: '0 0 6px 0', fontSize: '0.82rem' }}>Antimicrobial Susceptibility Testing (AST)</h5>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Antibiotic</th>
                    <th style={styles.th}>Method</th>
                    <th style={styles.th}>Value / Unit</th>
                    <th style={styles.th}>Interpretation</th>
                    <th style={styles.th}>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {res.astResults.map((r) => (
                    <tr key={r.agentId}>
                      <td style={styles.td}><strong>{r.agentName}</strong> ({r.agentId})</td>
                      <td style={styles.td}>{r.method}</td>
                      <td style={styles.td}>{r.value} {r.unit}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.interpBadge,
                          color: r.interpretation === 'S' ? 'var(--color-status-success)' : r.interpretation === 'R' ? 'var(--color-status-danger)' : 'orange',
                          backgroundColor: r.interpretation === 'S' ? 'rgba(34,197,94,0.06)' : r.interpretation === 'R' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)',
                        }}>
                          {r.interpretation}
                        </span>
                      </td>
                      <td style={styles.td}>{r.overrideReason ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Signatures & verification */}
      {report.sections.find((s) => s.sectionId === 'signatures')?.visible && (
        <div style={styles.repSection}>
          <h4 style={styles.sectionTitle}>Electronic Verification & Release</h4>
          
          <div style={styles.signatureRow}>
            {/* Signatures List */}
            <div style={styles.sigsCol}>
              {report.signatures.length === 0 ? (
                <span style={{ fontStyle: 'italic', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                  No electronic signatures attached to this draft report.
                </span>
              ) : (
                report.signatures.map((sig) => (
                  <div key={sig.id} style={styles.sigCard}>
                    <div>
                      <strong>{sig.signer}</strong>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>{sig.role}</div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.72rem' }}>
                      <span style={{ color: 'var(--color-status-success)' }}>✍️ Electronically Signed</span>
                      <div style={{ color: 'var(--color-text-secondary)' }}>{new Date(sig.timestamp).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* QR verification */}
            <div style={styles.qrCol}>
              <div style={styles.qrBox}>
                <div style={{ fontSize: '1.4rem' }}>📱</div>
                <div style={{ fontSize: '0.62rem', textAlign: 'center', color: 'var(--color-text-secondary)', lineHeight: '1.2' }}>
                  Scan to Verify Report Validity
                </div>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                Token: {report.qrCode.verificationToken}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      {report.sections.find((s) => s.sectionId === 'disclaimer')?.visible && report.template.showDisclaimer && (
        <div style={styles.disclaimerBox}>
          {report.template.disclaimerText}
        </div>
      )}
    </div>
  );

  return (
    <Card style={styles.container}>
      {/* Controls panel */}
      <div style={styles.controlHeader}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Zoom:</span>
          <input
            type="range"
            min={50}
            max={150}
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value))}
            style={{ width: '100px', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.8rem', width: '36px' }}>{zoom}%</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" onClick={() => setIsFullScreen(!isFullScreen)}>
            {isFullScreen ? 'Exit Full Screen' : 'Full Screen Preview'}
          </Button>
          <Button variant="solid" onClick={handleDownload}>
            Download PDF Report
          </Button>
        </div>
      </div>

      {/* Preview Sheet Container */}
      <div style={styles.sheetContainer}>
        {reportContent}
      </div>

      {/* Fullscreen Overlay */}
      {isFullScreen && (
        <div style={styles.fullScreenOverlay}>
          <div style={styles.fullScreenControls}>
            <span style={{ color: 'white', fontWeight: 600 }}>Laboratory Report Preview (Full Screen)</span>
            <Button variant="outline" onClick={() => setIsFullScreen(false)} style={{ color: 'white', borderColor: 'white' }}>
              Close Preview
            </Button>
          </div>
          <div style={styles.fullScreenContent}>
            {reportContent}
          </div>
        </div>
      )}
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' },
  controlHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 12px', borderBottom: '1px solid var(--color-border-default)',
    backgroundColor: 'var(--color-surface-base)',
    flexWrap: 'wrap', gap: '8px',
  },
  sheetContainer: {
    padding: 'var(--spacing-lg) 0',
    backgroundColor: 'rgba(0,0,0,0.03)',
    display: 'flex', justifyContent: 'center',
    overflowX: 'auto', overflowY: 'hidden',
  },
  reportSheet: {
    width: '740px',
    minHeight: '960px',
    backgroundColor: 'white',
    boxShadow: 'var(--elevation-2)',
    padding: '40px',
    boxSizing: 'border-box',
    color: 'black',
    display: 'flex', flexDirection: 'column', gap: '20px',
    fontFamily: 'system-ui, sans-serif',
  },
  repHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderBottom: '2px solid black', paddingBottom: '12px',
  },
  repSection: { display: 'flex', flexDirection: 'column', gap: '8px' },
  sectionTitle: {
    margin: 0, paddingBottom: '4px', borderBottom: '1px solid #ccc',
    fontSize: '0.88rem', fontWeight: 700, color: '#333', textTransform: 'uppercase',
  },
  detailGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem',
  },
  astTableWrapper: { marginTop: '6px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' },
  th: {
    textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid black',
    backgroundColor: '#f5f5f5', fontWeight: 700,
  },
  td: { padding: '6px 8px', borderBottom: '1px solid #eee' },
  interpBadge: {
    display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
    fontWeight: 700, fontSize: '0.72rem',
  },
  signatureRow: { display: 'flex', justifyContent: 'space-between', gap: '20px' },
  sigsCol: { flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' },
  sigCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 12px', borderRadius: '4px', border: '1px dashed #ccc',
    backgroundColor: '#fafafa',
  },
  qrCol: {
    width: '120px', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '6px',
  },
  qrBox: {
    width: '90px', height: '90px', border: '2px solid black',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: '4px', padding: '4px',
  },
  disclaimerBox: {
    marginTop: 'auto', borderTop: '1px solid #eee', paddingTop: '12px',
    fontSize: '0.72rem', color: '#666', fontStyle: 'italic', textAlign: 'center',
  },
  fullScreenOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1300,
    display: 'flex', flexDirection: 'column',
  },
  fullScreenControls: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 24px', backgroundColor: '#111',
  },
  fullScreenContent: {
    flex: 1, display: 'flex', justifyContent: 'center',
    padding: '40px 0', overflowY: 'auto',
  },
};

export default ReportPreview;
