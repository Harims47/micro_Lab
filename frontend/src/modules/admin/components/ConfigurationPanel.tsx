import React, { useState } from 'react';
import type { ConfigurationSetting } from '../models/types';
import { AdminService } from '../services/adminService';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { useNotification } from '../../../infrastructure/notifications/useNotification';

interface ConfigPanelProps {
  configs: ConfigurationSetting[];
  onRefresh: () => void;
}

export const ConfigurationPanel: React.FC<ConfigPanelProps> = ({ configs: initialConfigs, onRefresh }) => {
  const { addToast } = useNotification();
  const [configs, setConfigs] = useState<ConfigurationSetting[]>(initialConfigs.map((c) => ({ ...c })));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key: string, value: string) => {
    setConfigs(
      configs.map((c) => (c.key === key ? { ...c, value } : c))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await AdminService.saveConfigSettings(configs);
      addToast('success', 'Laboratory settings saved successfully.');
      onRefresh();
    } catch {
      addToast('error', 'Failed to save configuration settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card style={{ padding: 'var(--spacing-md)' }}>
      <h4 style={{ margin: '0 0 12px 0', font: 'var(--type-heading-item)' }}>Laboratory System Settings</h4>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {configs.map((c) => (
          <div key={c.key} style={styles.row}>
            <div style={styles.infoCol}>
              <strong>{c.key}</strong>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>{c.description}</div>
            </div>
            <div style={styles.inputCol}>
              {c.value === 'true' || c.value === 'false' ? (
                <select
                  value={c.value}
                  onChange={(e) => handleChange(c.key, e.target.value)}
                  className="lims-input"
                  style={{ height: '34px', width: '120px' }}
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={c.value}
                  onChange={(e) => handleChange(c.key, e.target.value)}
                  className="lims-input"
                  style={{ height: '34px', width: '100%', boxSizing: 'border-box' }}
                />
              )}
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border-default)', paddingTop: '10px' }}>
          <Button variant="solid" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Apply Configurations'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderBottom: '1px solid var(--color-border-default)', paddingBottom: '10px',
    flexWrap: 'wrap', gap: '10px',
  },
  infoCol: { flex: 2, minWidth: '220px' },
  inputCol: { flex: 1, minWidth: '150px' },
};

export default ConfigurationPanel;
