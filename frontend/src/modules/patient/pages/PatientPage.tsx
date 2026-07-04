import React, { useState } from 'react';
import { PatientList } from '../components/PatientList';
import { PatientWizard } from '../components/PatientWizard';
import { PatientProfile } from '../components/PatientProfile';
import { PatientMergeDialog } from '../dialogs/PatientMergeDialog';
import { usePermission } from '../../../infrastructure/permissions/usePermission';
import { Permission } from '../../../infrastructure/permissions/constants';
import { ForbiddenPage } from '../../../pages/ModulePlaceholders';

export const PatientPage: React.FC = () => {
  const { hasPermission } = usePermission();
  const canView = hasPermission(Permission.PATIENT_VIEW);

  // View States: LIST, REGISTER, EDIT, PROFILE
  const [viewState, setViewState] = useState<'LIST' | 'REGISTER' | 'EDIT' | 'PROFILE'>('LIST');
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(undefined);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);

  // 1. Permission Guard
  if (!canView) {
    return <ForbiddenPage />;
  }

  // 2. Render states
  return (
    <div style={styles.pageWrapper}>
      {viewState === 'LIST' && (
        <PatientList
          onViewProfile={(id) => {
            setSelectedPatientId(id);
            setViewState('PROFILE');
          }}
          onEditPatient={(id) => {
            setSelectedPatientId(id);
            setViewState('EDIT');
          }}
          onRegisterPatient={() => {
            setSelectedPatientId(undefined);
            setViewState('REGISTER');
          }}
          onOpenMerge={() => setMergeDialogOpen(true)}
        />
      )}

      {(viewState === 'REGISTER' || viewState === 'EDIT') && (
        <PatientWizard
          patientId={selectedPatientId}
          onClose={() => {
            setViewState('LIST');
            setSelectedPatientId(undefined);
          }}
        />
      )}

      {viewState === 'PROFILE' && selectedPatientId && (
        <PatientProfile
          patientId={selectedPatientId}
          onBack={() => {
            setViewState('LIST');
            setSelectedPatientId(undefined);
          }}
          onEdit={(id) => {
            setSelectedPatientId(id);
            setViewState('EDIT');
          }}
        />
      )}

      {/* Patient Merge Consolidation Dialog */}
      <PatientMergeDialog
        isOpen={mergeDialogOpen}
        onClose={() => setMergeDialogOpen(false)}
        onSuccess={() => {
          // Trigger reload in list by temporarily toggling viewState or let state refresh
          setViewState('LIST');
        }}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pageWrapper: {
    padding: 'var(--spacing-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
    minHeight: 'calc(100vh - var(--header-height-px) - 40px)',
    backgroundColor: 'var(--color-surface-base)',
  },
};
export default PatientPage;
