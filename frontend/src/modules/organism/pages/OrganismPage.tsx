import React, { useState, useEffect } from 'react';
import { OrganismDashboard } from '../components/OrganismDashboard';
import { OrganismList } from '../components/OrganismList';
import { OrganismWizard } from '../components/OrganismWizard';
import { OrganismProfile } from '../components/OrganismProfile';
import { OrganismService } from '../services/organismService';
import type { Colony } from '../models/types';
import { usePermission } from '../../../infrastructure/permissions/usePermission';
import { Permission } from '../../../infrastructure/permissions/constants';
import { ForbiddenPage } from '../../../pages/ModulePlaceholders';

export const OrganismPage: React.FC = () => {
  const { hasPermission } = usePermission();
  const canView = hasPermission(Permission.VIEW_SPECIMENS); // Mapped to organism view

  // View States: LIST, CREATE, DETAILS
  const [viewState, setViewState] = useState<'LIST' | 'CREATE' | 'DETAILS'>('LIST');
  const [selectedColonyId, setSelectedColonyId] = useState<string | undefined>(undefined);
  const [colonies, setColonies] = useState<Colony[]>([]);

  // Fetch colonies for dashboard metrics updates
  const fetchDashboardData = async () => {
    try {
      const res = await OrganismService.getColonies({ limit: 100 });
      setColonies(res.colonies);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (viewState === 'LIST') {
      fetchDashboardData();
    }
  }, [viewState]);

  // 1. Module Level Permission Guard
  if (!canView) {
    return <ForbiddenPage />;
  }

  return (
    <div style={styles.pageWrapper}>
      {viewState === 'LIST' && (
        <>
          <OrganismDashboard colonies={colonies} />
          <OrganismList
            onViewDetails={(id) => {
              setSelectedColonyId(id);
              setViewState('DETAILS');
            }}
            onStartIdentification={() => {
              setSelectedColonyId(undefined);
              setViewState('CREATE');
            }}
          />
        </>
      )}

      {viewState === 'CREATE' && (
        <OrganismWizard
          onClose={() => {
            setViewState('LIST');
            setSelectedColonyId(undefined);
          }}
        />
      )}

      {viewState === 'DETAILS' && selectedColonyId && (
        <OrganismProfile
          colonyId={selectedColonyId}
          onBack={() => {
            setViewState('LIST');
            setSelectedColonyId(undefined);
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

export default OrganismPage;
