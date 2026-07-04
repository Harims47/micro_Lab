import React, { useState, useEffect, useCallback } from 'react';
import type { QCSample, QCInstrument, QCReagent } from '../models/types';
import { QcService } from '../services/qcService';
import { QCDashboard } from '../components/QCDashboard';
import { QCWorklist } from '../components/QCWorklist';
import { QCScheduler } from '../components/QCScheduler';
import { QCInstrumentPanel } from '../components/QCInstrumentPanel';
import { QCReagentPanel } from '../components/QCReagentPanel';
import { QCProfile } from '../components/QCProfile';

import { PageContainer, Card } from '../../../components/Layout';
import { Tabs } from '../../../components/Layout/Tabs';

export const QCPage: React.FC = () => {
  const [samples, setSamples] = useState<QCSample[]>([]);
  const [instruments, setInstruments] = useState<QCInstrument[]>([]);
  const [reagents, setReagents] = useState<QCReagent[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewState, setViewState] = useState<'LIST' | 'DETAILS'>('LIST');
  const [selectedSample, setSelectedSample] = useState<QCSample | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, i, r] = await Promise.all([
        QcService.getSamples(),
        QcService.getInstruments(),
        QcService.getReagents(),
      ]);
      setSamples(s);
      setInstruments(i);
      setReagents(r);
    } catch { /* silently ignore */ }
    finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <PageContainer>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading Quality Control Platform...</p>
      </PageContainer>
    );
  }

  const tabItems = [
    {
      id: 'worklist',
      label: 'QC Worklist',
      content: (
        <QCWorklist
          samples={samples}
          onSelectSample={(sample) => {
            setSelectedSample(sample);
            setViewState('DETAILS');
          }}
        />
      ),
    },
    {
      id: 'scheduler',
      label: 'Schedule Runs',
      content: <QCScheduler onRefresh={fetchData} />,
    },
    {
      id: 'instruments',
      label: 'Instruments QC',
      content: <QCInstrumentPanel instruments={instruments} onRefresh={fetchData} />,
    },
    {
      id: 'reagents',
      label: 'Reagents QC',
      content: <QCReagentPanel reagents={reagents} onRefresh={fetchData} />,
    },
  ];

  return (
    <PageContainer>
      {viewState === 'LIST' && (
        <>
          <div style={{ borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
            <h2 style={{ font: 'var(--type-heading-page)', margin: 0 }}>Quality Control & Calibration Platform</h2>
            <p style={{ margin: '4px 0 0', font: 'var(--type-body-small)', color: 'var(--color-text-secondary)' }}>
              Monitor control strain runs, execute instrument calibrations, and verify reagent lot expirations.
            </p>
          </div>

          <QCDashboard samples={samples} instruments={instruments} reagents={reagents} />

          <Card style={{ marginTop: '12px' }}>
            <Tabs items={tabItems} />
          </Card>
        </>
      )}

      {viewState === 'DETAILS' && selectedSample && (
        <QCProfile
          sample={selectedSample}
          onBack={() => {
            setViewState('LIST');
            setSelectedSample(null);
          }}
          onRefresh={fetchData}
        />
      )}
    </PageContainer>
  );
};

export default QCPage;
