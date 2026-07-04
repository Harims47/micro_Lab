import React, { useState, useEffect } from 'react';
import { CultureDashboard } from '../components/CultureDashboard';
import { CultureList } from '../components/CultureList';
import { CultureWizard } from '../components/CultureWizard';
import { CultureProfile } from '../components/CultureProfile';
import { CultureService } from '../services/cultureService';
import type { Culture } from '../models/types';
import { usePermission } from '../../../infrastructure/permissions/usePermission';
import { Permission } from '../../../infrastructure/permissions/constants';
import { ForbiddenPage } from '../../../pages/ModulePlaceholders';

export const CulturePage: React.FC = () => {
  const { hasPermission } = usePermission();
  const canView = hasPermission(Permission.VIEW_SPECIMENS); // Mapped to culture view

  // View States: LIST, CREATE, DETAILS
  const [viewState, setViewState] = useState<'LIST' | 'CREATE' | 'DETAILS'>('LIST');
  const [selectedCultureId, setSelectedCultureId] = useState<string | undefined>(undefined);
  const [cultures, setCultures] = useState<Culture[]>([]);

  // Fetch all for dashboard metrics updates
  const fetchDashboardData = async () => {
    try {
      const res = await CultureService.getCultures({ limit: 100 });
      setCultures(res.cultures);
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
          <CultureDashboard cultures={cultures} />
          <CultureList
            onViewDetails={(id) => {
              setSelectedCultureId(id);
              setViewState('DETAILS');
            }}
            onInoculate={() => {
              setSelectedCultureId(undefined);
              setViewState('CREATE');
            }}
          />
        </>
      )}

      {viewState === 'CREATE' && (
        <CultureWizard
          onClose={() => {
            setViewState('LIST');
            setSelectedCultureId(undefined);
          }}
        />
      )}

      {viewState === 'DETAILS' && selectedCultureId && (
        <CultureProfile
          cultureId={selectedCultureId}
          onBack={() => {
            setViewState('LIST');
            setSelectedCultureId(undefined);
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

export default CulturePage;
