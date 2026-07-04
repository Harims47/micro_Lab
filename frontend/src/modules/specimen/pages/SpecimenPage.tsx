import React, { useState } from 'react';
import { SpecimenList } from '../components/SpecimenList';
import { SpecimenWizard } from '../components/SpecimenWizard';
import { SpecimenProfile } from '../components/SpecimenProfile';
import { usePermission } from '../../../infrastructure/permissions/usePermission';
import { Permission } from '../../../infrastructure/permissions/constants';
import { ForbiddenPage } from '../../../pages/ModulePlaceholders';

export const SpecimenPage: React.FC = () => {
  const { hasPermission } = usePermission();
  const canView = hasPermission(Permission.VIEW_SPECIMENS);

  // View States: LIST, COLLECT, DETAILS
  const [viewState, setViewState] = useState<'LIST' | 'COLLECT' | 'DETAILS'>('LIST');
  const [selectedSpecimenId, setSelectedSpecimenId] = useState<string | undefined>(undefined);

  // 1. Module Level Permission Guard
  if (!canView) {
    return <ForbiddenPage />;
  }

  return (
    <div style={styles.pageWrapper}>
      {viewState === 'LIST' && (
        <SpecimenList
          onViewDetails={(id) => {
            setSelectedSpecimenId(id);
            setViewState('DETAILS');
          }}
          onCollectSpecimen={() => {
            setSelectedSpecimenId(undefined);
            setViewState('COLLECT');
          }}
        />
      )}

      {viewState === 'COLLECT' && (
        <SpecimenWizard
          onClose={() => {
            setViewState('LIST');
            setSelectedSpecimenId(undefined);
          }}
        />
      )}

      {viewState === 'DETAILS' && selectedSpecimenId && (
        <SpecimenProfile
          specimenId={selectedSpecimenId}
          onBack={() => {
            setViewState('LIST');
            setSelectedSpecimenId(undefined);
          }}
        />
      )}
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
    boxSizing: 'border-box',
  },
};

export default SpecimenPage;
