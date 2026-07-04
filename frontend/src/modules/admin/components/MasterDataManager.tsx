import React, { useState } from 'react';
import type { MasterRecord } from '../models/types';
import { AdminService } from '../services/adminService';
import { AdminValidator } from '../validators/adminValidator';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { useNotification } from '../../../infrastructure/notifications/useNotification';

interface MasterDataProps {
  masters: MasterRecord[];
  onRefresh: () => void;
}

export const MasterDataManager: React.FC<MasterDataProps> = ({ masters, onRefresh }) => {
  const { addToast } = useNotification();
  const [activeCategory, setActiveCategory] = useState<MasterRecord['category']>('Reference');
  const [activeType, setActiveType] = useState<MasterRecord['type']>('Organism');

  // New record form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const CATEGORIES: MasterRecord['category'][] = ['Reference', 'Clinical', 'Laboratory', 'System'];

  const TYPES_BY_CAT: Record<MasterRecord['category'], MasterRecord['type'][]> = {
    Reference: ['Organism', 'Antibiotic'],
    Clinical: ['SpecimenType', 'TestPanel'],
    Laboratory: ['Instrument', 'Incubator', 'CultureMedia', 'Location', 'Workstation'],
    System: ['ReportTemplate', 'PrinterConfig', 'BarcodePrinterConfig'],
  };

  const handleCategoryChange = (cat: MasterRecord['category']) => {
    setActiveCategory(cat);
    setActiveType(TYPES_BY_CAT[cat][0]);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: Partial<MasterRecord> = {
      category: activeCategory,
      type: activeType,
      name,
      code,
      description,
    };

    const check = AdminValidator.validateMasterRecord(newRecord, masters);
    if (!check.isValid) {
      addToast('error', check.error!);
      return;
    }

    setIsSubmitting(true);
    try {
      await AdminService.createMasterRecord(newRecord);
      addToast('success', `Master record added: ${name}`);
      setName('');
      setCode('');
      setDescription('');
      onRefresh();
    } catch {
      addToast('error', 'Failed to add master record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (rec: MasterRecord) => {
    try {
      await AdminService.updateMasterRecord(rec.recordId, { isActive: !rec.isActive });
      addToast('success', `Record status updated.`);
      onRefresh();
    } catch {
      addToast('error', 'Failed to toggle record state.');
    }
  };

  const filtered = masters.filter((m) => m.category === activeCategory && m.type === activeType);

  return (
    <div style={styles.container}>
      {/* Category Tabs */}
      <div style={styles.tabsRow}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            style={{
              ...styles.tabBtn,
              backgroundColor: activeCategory === cat ? 'var(--color-brand-primary)' : 'transparent',
              color: activeCategory === cat ? 'white' : 'var(--color-text-secondary)',
              borderColor: activeCategory === cat ? 'var(--color-brand-primary)' : 'var(--color-border-default)',
            }}
          >
            {cat} Masters
          </button>
        ))}
      </div>

      <div style={styles.mainGrid}>
        {/* Creation panel */}
        <Card style={{ padding: 'var(--spacing-md)' }}>
          <h4 style={{ margin: '0 0 10px 0', font: 'var(--type-heading-item)' }}>Add Master Catalog Record</h4>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label className="lims-form-label" style={{ display: 'block', marginBottom: '4px' }}>Sub-Type</label>
              <select
                value={activeType}
                onChange={(e) => setActiveType(e.target.value as any)}
                className="lims-input"
                style={{ width: '100%', height: '36px' }}
              >
                {TYPES_BY_CAT[activeCategory].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="lims-form-label" style={{ display: 'block', marginBottom: '4px' }}>Record Name</label>
              <input
                type="text"
                placeholder="e.g. Staphylococcus epidermidis"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="lims-input"
                style={{ width: '100%', height: '34px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label className="lims-form-label" style={{ display: 'block', marginBottom: '4px' }}>Record Code</label>
              <input
                type="text"
                placeholder="e.g. ORG-SE-1"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="lims-input"
                style={{ width: '100%', height: '34px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label className="lims-form-label" style={{ display: 'block', marginBottom: '4px' }}>Description</label>
              <textarea
                placeholder="Details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="lims-input"
                style={{ width: '100%', height: '50px', boxSizing: 'border-box', padding: '6px' }}
              />
            </div>
            <Button variant="solid" type="submit" disabled={isSubmitting} style={{ marginTop: '4px' }}>
              Add Record
            </Button>
          </form>
        </Card>

        {/* List panel */}
        <Card style={{ padding: 'var(--spacing-md)' }}>
          <h4 style={{ margin: '0 0 10px 0', font: 'var(--type-heading-item)' }}>
            Registry: {activeType} ({filtered.length} records)
          </h4>
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Record ID</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Code</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.recordId}>
                    <td style={styles.td}><code style={{ fontSize: '0.78rem' }}>{m.recordId}</code></td>
                    <td style={styles.td}><strong>{m.name}</strong></td>
                    <td style={styles.td}><code style={{ fontSize: '0.78rem' }}>{m.code}</code></td>
                    <td style={styles.td}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600,
                        backgroundColor: m.isActive ? 'rgba(34,197,94,0.06)' : 'var(--color-surface-base)',
                        color: m.isActive ? 'var(--color-status-success)' : 'var(--color-text-secondary)',
                      }}>
                        {m.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => handleToggleActive(m)}
                        style={{
                          border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                          color: m.isActive ? 'var(--color-status-danger)' : 'var(--color-status-success)',
                        }}
                      >
                        {m.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' },
  tabsRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  tabBtn: {
    padding: '6px 14px', borderRadius: 'var(--radius-circular)', border: '1px solid',
    fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s',
  },
  mainGrid: { display: 'grid', gridTemplateColumns: '220px 1fr', gap: 'var(--spacing-md)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' },
  th: {
    textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--color-border-default)',
    color: 'var(--color-text-secondary)', fontWeight: 700,
  },
  td: { padding: '6px 8px', borderBottom: '1px solid var(--color-border-default)' },
};

export default MasterDataManager;
