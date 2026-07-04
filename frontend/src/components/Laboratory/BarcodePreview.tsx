import React, { useState, useEffect, useCallback } from 'react';
import type { BarcodeLabelTemplate, BarcodePrintPayload } from '../../services/platform/barcodeService';
import { BarcodeService } from '../../services/platform/barcodeService';
import { usePermission } from '../../infrastructure/permissions/usePermission';
import { Permission } from '../../infrastructure/permissions/constants';
import { useNotification } from '../../infrastructure/notifications/useNotification';
import { Button } from '../Foundation/Button';
import { TextInput } from '../Form/TextInput';
import { Card } from '../Layout/Card';

interface BarcodePreviewProps {
  barcode: string;
  patientName: string;
  patientMrn: string;
  testName: string;
}

export const BarcodePreview: React.FC<BarcodePreviewProps> = ({
  barcode,
  patientName,
  patientMrn,
  testName,
}) => {
  const { hasPermission } = usePermission();
  const { addToast } = useNotification();
  const canReprint = hasPermission(Permission.BARCODE_REPRINT);

  const [template, setTemplate] = useState<BarcodeLabelTemplate>('Specimen Label');
  const [reprintOpen, setReprintOpen] = useState(false);
  const [reprintReason, setReprintReason] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  const fetchPrintLogs = useCallback(() => {
    setHistory(BarcodeService.getPrintHistory(barcode));
  }, [barcode]);

  useEffect(() => {
    fetchPrintLogs();
  }, [fetchPrintLogs]);

  const handlePrint = (isReplacement: boolean = false) => {
    const payload: BarcodePrintPayload = {
      barcode,
      template,
      patientName,
      patientMrn,
      testName,
      workstation: 'WS-Intake-1',
      user: 'tech_user',
      isReplacement,
      reason: isReplacement ? reprintReason : undefined,
    };
    BarcodeService.printLabel(payload);
    addToast('success', `Label printed successfully [Template: ${template}].`);
    setReprintOpen(false);
    setReprintReason('');
    fetchPrintLogs();
  };

  return (
    <Card style={styles.container}>
      <h4 style={styles.title}>Barcode & Labels Station</h4>

      <div style={styles.row}>
        <div style={{ flex: 1 }}>
          <label className="lims-form-label" style={{ display: 'block', marginBottom: '6px' }}>
            Label Template
          </label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value as BarcodeLabelTemplate)}
            className="lims-input"
            style={styles.select}
          >
            <option value="Specimen Label">Specimen Label</option>
            <option value="Culture Plate Label">Culture Plate Label</option>
            <option value="Aliquot Label">Aliquot Label</option>
            <option value="Archive Label">Archive Label</option>
            <option value="Transport Label">Transport Label</option>
          </select>
        </div>
      </div>

      {/* Label Box Layout */}
      <div style={styles.previewBox}>
        <div style={styles.labelHeader}>
          <strong>{template.toUpperCase()}</strong>
          <span style={{ fontSize: '0.65rem' }}>MRN: {patientMrn}</span>
        </div>
        <div style={styles.barcodeGraphics}>
          <span>||||| ||| | |||| ||| |||</span>
          <strong style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{barcode}</strong>
        </div>
        <div style={styles.labelFooter}>
          <span>Patient: {patientName}</span>
          <span>Target: {testName}</span>
          <span style={{ fontSize: '0.6rem', color: 'gray' }}>WS-Intake-1 | {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div style={styles.actions}>
        <Button variant="solid" onClick={() => handlePrint(false)}>
          Print Label
        </Button>
        {canReprint && (
          <Button variant="outline" onClick={() => setReprintOpen(true)}>
            Reprint Request
          </Button>
        )}
      </div>

      {/* Reprints Logs List */}
      {history.length > 0 && (
        <div style={{ marginTop: 'var(--spacing-md)' }}>
          <strong style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Print History Logs</strong>
          <div style={styles.historyList}>
            {history.map((log, idx) => (
              <div key={log.id} style={styles.historyItem}>
                <span>#{idx + 1} | {log.template} | {log.isReplacement ? 'Reprint' : 'Original'}</span>
                <span style={{ fontSize: '0.7rem', color: 'gray' }}>
                  {new Date(log.timestamp).toLocaleString()} by {log.user}
                </span>
                {log.reason && <p style={styles.reasonText}>Reason: {log.reason}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reprint reason dialog */}
      {reprintOpen && (
        <div style={styles.dialogOverlay}>
          <Card style={styles.dialogBox}>
            <h4 style={{ margin: '0 0 var(--spacing-sm) 0' }}>Reprint Audit Reason</h4>
            <TextInput
              label="Audit Reason"
              value={reprintReason}
              onChange={(e) => setReprintReason(e.target.value)}
              placeholder="e.g., Label damaged, Printer jam..."
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
              <Button variant="outline" onClick={() => setReprintOpen(false)}>Cancel</Button>
              <Button variant="solid" onClick={() => handlePrint(true)} disabled={!reprintReason.trim()}>
                Print Replacement
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 'var(--spacing-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  },
  title: {
    font: 'var(--type-heading-item)',
    margin: 0,
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: '4px',
  },
  row: {
    display: 'flex',
    gap: '12px',
  },
  select: {
    width: '100%',
    height: '36px',
    cursor: 'pointer',
  },
  previewBox: {
    backgroundColor: 'white',
    color: 'black',
    border: '2px solid black',
    padding: '12px',
    borderRadius: 'var(--radius-xs)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontFamily: 'monospace',
    width: '240px',
    margin: '12px auto',
    boxShadow: 'var(--elevation-1)',
  },
  labelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.7rem',
    borderBottom: '1px dotted black',
    paddingBottom: '2px',
  },
  barcodeGraphics: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: '1.25rem',
    letterSpacing: '2px',
  },
  labelFooter: {
    fontSize: '0.625rem',
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1px dotted black',
    paddingTop: '2px',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  historyList: {
    marginTop: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    maxHeight: '120px',
    overflowY: 'auto',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-xs)',
    padding: '6px',
  },
  historyItem: {
    padding: '4px',
    borderBottom: '1px solid var(--color-border-default)',
    display: 'flex',
    flexDirection: 'column',
    fontSize: '0.75rem',
  },
  reasonText: {
    margin: '2px 0 0 0',
    fontStyle: 'italic',
    color: 'var(--color-status-danger)',
  },
  dialogOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1200,
  },
  dialogBox: {
    width: '320px',
    padding: 'var(--spacing-md)',
  },
};
export default BarcodePreview;
