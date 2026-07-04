import React, { useState } from 'react';
import type { UserProfile } from '../models/types';
import { AdminService } from '../services/adminService';
import { AdminValidator } from '../validators/adminValidator';
import { Card } from '../../../components/Layout/Card';
import { Button } from '../../../components/Foundation/Button';
import { useNotification } from '../../../infrastructure/notifications/useNotification';

interface UserMgmtProps {
  users: UserProfile[];
  onRefresh: () => void;
}

export const UserManagement: React.FC<UserMgmtProps> = ({ users, onRefresh }) => {
  const { addToast } = useNotification();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Laboratory Technologist');
  const [department, setDepartment] = useState('Microbiology');
  const [search, setSearch] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = AdminValidator.validateUser({ username, fullName, email });
    if (!check.isValid) {
      addToast('error', check.error!);
      return;
    }

    setIsSubmitting(true);
    try {
      await AdminService.createUser({ username, fullName, email, role, department });
      addToast('success', `User account created: ${username}`);
      setUsername('');
      setFullName('');
      setEmail('');
      onRefresh();
    } catch {
      addToast('error', 'Failed to create user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: 'Active' | 'Inactive') => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      await AdminService.updateStatus(userId, nextStatus);
      addToast('success', `User status updated to ${nextStatus}.`);
      onRefresh();
    } catch {
      addToast('error', 'Failed to update user status.');
    }
  };

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Create staff form */}
      <Card style={{ padding: 'var(--spacing-md)' }}>
        <h4 style={{ margin: '0 0 12px 0', font: 'var(--type-heading-item)' }}>Register Laboratory Staff Profile</h4>
        <form onSubmit={handleCreate} style={styles.form}>
          <input
            type="text"
            placeholder="Username (e.g. j_doe)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="lims-input"
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="lims-input"
            style={styles.input}
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="lims-input"
            style={styles.input}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="lims-input"
            style={styles.input}
          >
            <option value="Laboratory Technologist">Laboratory Technologist</option>
            <option value="Clinical Supervisor">Clinical Supervisor</option>
            <option value="Clinical Microbiologist">Clinical Microbiologist</option>
            <option value="Pathologist">Pathologist</option>
          </select>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="lims-input"
            style={styles.input}
          >
            <option value="Microbiology">Microbiology</option>
            <option value="Pathology">Pathology</option>
            <option value="Virology">Virology</option>
            <option value="Administration">Administration</option>
          </select>
          <Button variant="solid" type="submit" disabled={isSubmitting} style={{ height: '36px' }}>
            Register User
          </Button>
        </form>
      </Card>

      {/* Staff lists */}
      <Card style={{ padding: 'var(--spacing-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <h4 style={{ margin: 0, font: 'var(--type-heading-item)' }}>Active Staff Registry</h4>
          <input
            type="text"
            placeholder="Search staff registry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="lims-input"
            style={{ width: '220px', height: '32px', fontSize: '0.8rem' }}
          />
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Full Name</th>
              <th style={styles.th}>Username</th>
              <th style={styles.th}>Email Address</th>
              <th style={styles.th}>Assigned Role</th>
              <th style={styles.th}>Department</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.userId}>
                <td style={styles.td}><strong>{u.fullName}</strong></td>
                <td style={styles.td}><code style={{ fontSize: '0.78rem' }}>{u.username}</code></td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>{u.role}</td>
                <td style={styles.td}>{u.department}</td>
                <td style={styles.td}>
                  <span style={{
                    padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600,
                    backgroundColor: u.status === 'Active' ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                    color: u.status === 'Active' ? 'var(--color-status-success)' : 'var(--color-status-danger)',
                  }}>
                    {u.status}
                  </span>
                </td>
                <td style={styles.td}>
                  <button
                    onClick={() => handleToggleStatus(u.userId, u.status)}
                    style={{
                      border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                      color: u.status === 'Active' ? 'var(--color-status-danger)' : 'var(--color-status-success)',
                    }}
                  >
                    {u.status === 'Active' ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' },
  form: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' },
  input: { height: '36px', minWidth: '150px', flex: 1, fontSize: '0.82rem' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' },
  th: {
    textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--color-border-default)',
    color: 'var(--color-text-secondary)', fontWeight: 700,
  },
  td: { padding: '6px 8px', borderBottom: '1px solid var(--color-border-default)' },
};

export default UserManagement;
