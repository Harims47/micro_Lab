import React, { useState, useEffect } from 'react';
import { ReportDashboard } from '../components/ReportDashboard';
import { ReportList } from '../components/ReportList';
import { ReportProfile } from '../components/ReportProfile';
import { ReportService } from '../services/reportService';
import type { LaboratoryReport } from '../models/types';
import { usePermission } from '../../../infrastructure/permissions/usePermission';
import { Permission } from '../../../infrastructure/permissions/constants';
import { ForbiddenPage } from '../../../pages/ModulePlaceholders';

export const ReportPage: React.FC = () => {
  const { hasPermission } = usePermission();
  const canView = hasPermission(Permission.VIEW_SPECIMENS);

  const [viewState, setViewState] = useState<'LIST' | 'DETAILS'>('LIST');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [dashboardReports, setDashboardReports] = useState<LaboratoryReport[]>([]);

  const fetchDashboardData = async () => {
    try {
      const res = await ReportService.getReports({ limit: 100 });
      setDashboardReports(res.reports);
    } catch { /* silently ignore */ }
  };

  useEffect(() => {
    if (viewState === 'LIST') fetchDashboardData();
  }, [viewState]);

  if (!canView) return <ForbiddenPage />;

  return (
    <div style={styles.page}>
      {viewState === 'LIST' && (
        <>
          <ReportDashboard reports={dashboardReports} />
          <ReportList
            onViewDetails={(id: string) => {
              setSelectedId(id);
              setViewState('DETAILS');
            }}
          />
        </>
      )}

      {viewState === 'DETAILS' && selectedId && (
        <ReportProfile
          reportId={selectedId}
          onBack={() => {
            setViewState('LIST');
            setSelectedId(undefined);
          }}
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

export default ReportPage;
