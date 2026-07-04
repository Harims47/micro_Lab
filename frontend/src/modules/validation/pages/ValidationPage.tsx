import React, { useState, useEffect } from 'react';
import { ValidationDashboard } from '../components/ValidationDashboard';
import { ValidationList } from '../components/ValidationList';
import { ValidationWizard } from '../components/ValidationWizard';
import { ValidationProfile } from '../components/ValidationProfile';
import { ValidationService } from '../services/validationService';
import type { ValidationRecord } from '../models/types';
import { usePermission } from '../../../infrastructure/permissions/usePermission';
import { Permission } from '../../../infrastructure/permissions/constants';
import { ForbiddenPage } from '../../../pages/ModulePlaceholders';
import { Button } from '../../../components/Foundation/Button';

export const ValidationPage: React.FC = () => {
  const { hasPermission } = usePermission();
  const canView = hasPermission(Permission.VIEW_SPECIMENS);

  const [viewState, setViewState] = useState<'LIST' | 'CREATE' | 'DETAILS'>('LIST');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [dashboardRecords, setDashboardRecords] = useState<ValidationRecord[]>([]);

  const fetchDashboard = async () => {
    try {
      const res = await ValidationService.getRecords({ limit: 100 });
      setDashboardRecords(res.records);
    } catch { /* silently ignore */ }
  };

  useEffect(() => {
    if (viewState === 'LIST') fetchDashboard();
  }, [viewState]);

  if (!canView) return <ForbiddenPage />;

  return (
    <div style={styles.page}>
      {viewState === 'LIST' && (
        <>
          <ValidationDashboard records={dashboardRecords} />

          {/* New validation case button above list */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="solid" onClick={() => setViewState('CREATE')}>
              + Initiate New Validation
            </Button>
          </div>

          <ValidationList
            onViewDetails={(id: string) => { setSelectedId(id); setViewState('DETAILS'); }}
          />
        </>
      )}

      {viewState === 'CREATE' && (
        <ValidationWizard
          onClose={() => { setViewState('LIST'); setSelectedId(undefined); }}
        />
      )}

      {viewState === 'DETAILS' && selectedId && (
        <ValidationProfile
          validationId={selectedId}
          onBack={() => { setViewState('LIST'); setSelectedId(undefined); }}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 'var(--spacing-md)',
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)',
    minHeight: 'calc(100vh - var(--header-height-px) - 40px)',
    backgroundColor: 'var(--color-surface-base)',
    boxSizing: 'border-box',
  },
};

export default ValidationPage;
