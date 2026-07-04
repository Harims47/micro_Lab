import React, { useState, useEffect } from 'react';
import { AstDashboard } from '../components/AstDashboard';
import { AstList } from '../components/AstList';
import { AstWizard } from '../components/AstWizard';
import { AstProfile } from '../components/AstProfile';
import { AstService } from '../services/astService';
import type { AstResult } from '../models/types';
import { usePermission } from '../../../infrastructure/permissions/usePermission';
import { Permission } from '../../../infrastructure/permissions/constants';
import { ForbiddenPage } from '../../../pages/ModulePlaceholders';

export const AstPage: React.FC = () => {
  const { hasPermission } = usePermission();
  const canView = hasPermission(Permission.VIEW_SPECIMENS);

  const [viewState, setViewState] = useState<'LIST' | 'CREATE' | 'DETAILS'>('LIST');
  const [selectedAstId, setSelectedAstId] = useState<string | undefined>(undefined);
  const [asts, setAsts] = useState<AstResult[]>([]);

  const fetchDashboardData = async () => {
    try {
      const res = await AstService.getAstRecords({ limit: 100 });
      setAsts(res.asts);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (viewState === 'LIST') {
      fetchDashboardData();
    }
  }, [viewState]);

  if (!canView) return <ForbiddenPage />;

  return (
    <div style={styles.pageWrapper}>
      {viewState === 'LIST' && (
        <>
          <AstDashboard asts={asts} />
          <AstList
            onViewDetails={(id: string) => { setSelectedAstId(id); setViewState('DETAILS'); }}
            onCreateAst={() => { setSelectedAstId(undefined); setViewState('CREATE'); }}
          />
        </>
      )}

      {viewState === 'CREATE' && (
        <AstWizard onClose={() => { setViewState('LIST'); setSelectedAstId(undefined); }} />
      )}

      {viewState === 'DETAILS' && selectedAstId && (
        <AstProfile
          astId={selectedAstId}
          onBack={() => { setViewState('LIST'); setSelectedAstId(undefined); }}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pageWrapper: {
    padding: 'var(--spacing-md)',
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)',
    minHeight: 'calc(100vh - var(--header-height-px) - 40px)',
    backgroundColor: 'var(--color-surface-base)',
    boxSizing: 'border-box',
  },
};

export default AstPage;
