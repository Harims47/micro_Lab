import React, { useState } from 'react';
import type { RoleDefinition } from '../models/types';
import { AdminService } from '../services/adminService';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { useNotification } from '../../../infrastructure/notifications/useNotification';

interface RoleMgmtProps {
  roles: RoleDefinition[];
  onRefresh: () => void;
}

export const RoleManagement: React.FC<RoleMgmtProps> = ({ roles, onRefresh }) => {
  const { addToast } = useNotification();
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(roles[0] || null);
  const [permissions, setPermissions] = useState<string[]>(selectedRole?.permissions || []);

  const ALL_PERMISSIONS = [
    { key: 'VIEW_SPECIMENS',     label: 'View Specimen Records & Audits' },
    { key: 'REGISTER_SPECIMEN',  label: 'Register Accession Specimens' },
    { key: 'VALIDATE_TECHNICAL', label: 'Validate Technical Review stages' },
    { key: 'RELEASE_REPORTS',    label: 'Authorise & Release Final Reports' },
    { key: 'EDIT_CONFIG',        label: 'Modify Laboratory Admin Configs' },
  ];

  const handleSelectRole = (role: RoleDefinition) => {
    setSelectedRole(role);
    setPermissions(role.permissions);
  };

  const handleTogglePerm = (perm: string) => {
    setPermissions(
      permissions.includes(perm) ? permissions.filter((p) => p !== perm) : [...permissions, perm]
    );
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    try {
      await AdminService.updateRole(selectedRole.roleId, permissions);
      addToast('success', `Permissions updated for ${selectedRole.name}.`);
      onRefresh();
    } catch {
      addToast('error', 'Failed to update role permissions.');
    }
  };

  return (
    <div style={styles.grid}>
      {/* Roles List */}
      <Card style={{ padding: 'var(--spacing-md)' }}>
        <h4 style={{ margin: '0 0 12px 0', font: 'var(--type-heading-item)' }}>Laboratory Roles</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {roles.map((r) => {
            const isSelected = selectedRole?.roleId === r.roleId;
            return (
              <div
                key={r.roleId}
                onClick={() => handleSelectRole(r)}
                style={{
                  ...styles.roleCard,
                  borderColor: isSelected ? 'var(--color-brand-primary)' : 'var(--color-border-default)',
                  backgroundColor: isSelected ? 'var(--color-surface-base)' : 'transparent',
                }}
              >
                <strong>{r.name}</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  {r.description}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Permissions Editor */}
      {selectedRole && (
        <Card style={{ padding: 'var(--spacing-md)' }}>
          <h4 style={{ margin: '0 0 12px 0', font: 'var(--type-heading-item)' }}>
            Edit Permissions: <u>{selectedRole.name}</u>
          </h4>

          <div style={styles.checkboxList}>
            {ALL_PERMISSIONS.map((p) => (
              <label key={p.key} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={permissions.includes(p.key)}
                  onChange={() => handleTogglePerm(p.key)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <div>
                  <strong>{p.key}</strong>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>{p.label}</div>
                </div>
              </label>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <Button variant="solid" onClick={handleSave}>
              Save Permissions Map
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' },
  roleCard: {
    padding: '10px 14px', borderRadius: '6px', border: '1px solid',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  checkboxList: { display: 'flex', flexDirection: 'column', gap: '10px', padding: '6px 0' },
  checkboxLabel: { display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' },
};

export default RoleManagement;
