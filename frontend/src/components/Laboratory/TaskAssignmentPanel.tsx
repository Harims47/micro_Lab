import React, { useState } from 'react';
import { Card } from '../Layout/Card';
import { Button } from '../Foundation/Button';
import { useNotification } from '../../infrastructure/notifications/useNotification';
import { usePermission } from '../../infrastructure/permissions/usePermission';
import { Permission } from '../../infrastructure/permissions/constants';
import { ShieldAlert, User, Clock } from 'lucide-react';

export interface TaskAssignment {
  taskId: string;
  assignedTo?: string; // staff username
  queue: 'Hematology' | 'Microbiology Intake' | 'Culture Queue' | 'AST Queue' | 'Validation';
  priority: 'Routine' | 'Urgent' | 'STAT' | 'Emergency';
  dueDate: string;
  isEscalated?: boolean;
}

interface TaskAssignmentPanelProps {
  task: TaskAssignment;
  onUpdateAssignment: (updates: Partial<TaskAssignment>) => void;
}

export const TaskAssignmentPanel: React.FC<TaskAssignmentPanelProps> = ({
  task,
  onUpdateAssignment,
}) => {
  const { addToast } = useNotification();
  const { hasPermission } = usePermission();
  const canAssign = hasPermission(Permission.TASK_ASSIGN);

  const [tech, setTech] = useState(task.assignedTo || '');
  const [queue, setQueue] = useState(task.queue);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate.slice(0, 16)); // Format for local datetime input

  const techniciansList = [
    { username: 'tech_user', name: 'John Miller (Technician)' },
    { username: 'supervisor_user', name: 'Jane Connor (Supervisor)' },
    { username: 'registrar_user', name: 'Sarah Registrar (Registrar)' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAssign) {
      addToast('error', 'Unauthorized to assign laboratory tasks.');
      return;
    }

    onUpdateAssignment({
      assignedTo: tech || undefined,
      queue,
      priority,
      dueDate: new Date(dueDate).toISOString(),
      isEscalated: new Date(dueDate).getTime() < Date.now() + 60 * 60 * 1000, // Escalates if due within 1 hour!
    });

    addToast('success', 'Work task queue settings updated successfully.');
  };

  return (
    <Card style={styles.container}>
      <div style={styles.header}>
        <h4 style={styles.title}>Technician Work Task Assignment</h4>
        {task.isEscalated && (
          <span style={styles.escalatedBadge}>
            <ShieldAlert size={12} /> ESCALATED SLA
          </span>
        )}
      </div>

      <form onSubmit={handleSave} style={styles.form}>
        <div style={styles.grid}>
          <div>
            <label className="lims-form-label" style={{ display: 'block', marginBottom: '6px' }}>Assign Operator</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} color="gray" />
              <select
                value={tech}
                onChange={(e) => setTech(e.target.value)}
                disabled={!canAssign}
                className="lims-input"
                style={{ flex: 1, height: '36px' }}
              >
                <option value="">Unassigned (Queue Pool)</option>
                {techniciansList.map((t) => (
                  <option key={t.username} value={t.username}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="lims-form-label" style={{ display: 'block', marginBottom: '6px' }}>Workstation Queue</label>
            <select
              value={queue}
              onChange={(e) => setQueue(e.target.value as any)}
              disabled={!canAssign}
              className="lims-input"
              style={{ width: '100%', height: '36px' }}
            >
              <option value="Microbiology Intake">Microbiology Intake</option>
              <option value="Culture Queue">Culture Queue</option>
              <option value="AST Queue">AST Queue</option>
              <option value="Validation">Validation</option>
            </select>
          </div>

          <div>
            <label className="lims-form-label" style={{ display: 'block', marginBottom: '6px' }}>Priority Level</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              disabled={!canAssign}
              className="lims-input"
              style={{ width: '100%', height: '36px' }}
            >
              <option value="Routine">Routine</option>
              <option value="Urgent">Urgent</option>
              <option value="STAT">STAT</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          <div>
            <label className="lims-form-label" style={{ display: 'block', marginBottom: '6px' }}>SLA Due Time</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} color="gray" />
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={!canAssign}
                className="lims-input"
                style={{ flex: 1, height: '36px', boxSizing: 'border-box', padding: '0 8px' }}
                required
              />
            </div>
          </div>
        </div>

        {canAssign && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <Button variant="solid" type="submit">
              Save Work Assignment
            </Button>
          </div>
        )}
      </form>
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
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-border-default)',
    paddingBottom: '6px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  escalatedBadge: {
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: 'var(--color-status-danger-bg)',
    color: 'var(--color-status-danger)',
    fontSize: '0.68rem',
    fontWeight: 'bold',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  form: {
    marginTop: '6px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--spacing-md)',
  },
};
export default TaskAssignmentPanel;
