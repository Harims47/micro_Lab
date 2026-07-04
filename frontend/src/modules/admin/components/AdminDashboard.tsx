import React from 'react';
import { KpiCard } from '../../../components/Data/KpiCard';
import type { UserProfile, Department, MasterRecord } from '../models/types';

interface AdminDashboardProps {
  users: UserProfile[];
  departments: Department[];
  masters: MasterRecord[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, departments, masters }) => {
  const activeUsers = users.filter((u) => u.status === 'Active').length;
  const inactiveUsers = users.length - activeUsers;
  const refMasters = masters.filter((m) => m.category === 'Reference').length;
  const clinMasters = masters.filter((m) => m.category === 'Clinical').length;
  const labMasters = masters.filter((m) => m.category === 'Laboratory').length;
  const sysMasters = masters.filter((m) => m.category === 'System').length;

  const cards = [
    { id: 'total-users', title: 'Total Registered Staff', value: users.length, color: 'var(--color-brand-primary)' },
    { id: 'active-users', title: 'Active Staff Logins', value: activeUsers, color: 'var(--color-status-success)' },
    { id: 'inactive-users', title: 'Suspended Accounts', value: inactiveUsers, color: 'var(--color-status-danger)' },
    { id: 'depts', title: 'Laboratory Departments', value: departments.length, color: '#0891b2' },
    { id: 'ref-m', title: 'Reference Master Records', value: refMasters, color: '#6366f1' },
    { id: 'clin-m', title: 'Clinical Specimen Panels', value: clinMasters, color: '#7c3aed' },
    { id: 'lab-m', title: 'Hardware & Media Masters', value: labMasters, color: 'orange' },
    { id: 'sys-m', title: 'Report & Printer Layouts', value: sysMasters, color: 'purple' },
  ];

  return (
    <div style={styles.grid}>
      {cards.map((c) => (
        <KpiCard key={c.id} title={c.title} value={c.value} indicatorColor={c.color} />
      ))}
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--spacing-md)',
    marginBottom: 'var(--spacing-md)',
  },
};

export default AdminDashboard;
