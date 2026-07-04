import React, { useState, useEffect, useCallback } from 'react';
import type { AnalyticsSnapshot } from '../models/types';
import { AnalyticsService } from '../services/analyticsService';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { KPIWidgets } from '../components/KPIWidgets';
import { OrganismAnalytics } from '../components/OrganismAnalytics';
import { AstAnalytics } from '../components/AstAnalytics';
import { OperationalAnalytics } from '../components/OperationalAnalytics';

import { PageContainer, Card } from '../../../components/Layout';
import { Tabs } from '../../../components/Layout/Tabs';

export const AnalyticsPage: React.FC = () => {
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSnapshot = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AnalyticsService.getSnapshot();
      setSnapshot(data);
    } catch { /* silently ignore */ }
    finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  if (loading || !snapshot) {
    return (
      <PageContainer>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading Operational Analytics...</p>
      </PageContainer>
    );
  }

  const tabItems = [
    {
      id: 'tat',
      label: 'Stage Turnaround Time',
      content: <KPIWidgets tat={snapshot.kpis.turnaroundTime} />,
    },
    {
      id: 'pathogens',
      label: 'Pathogen Analytics',
      content: (
        <OrganismAnalytics
          organisms={snapshot.organisms}
          positiveRate={snapshot.positiveCultureRate}
          negativeRate={snapshot.negativeCultureRate}
        />
      ),
    },
    {
      id: 'resistance',
      label: 'AST Resistance Rates',
      content: <AstAnalytics ast={snapshot.ast} />,
    },
    {
      id: 'productivity',
      label: 'Productivity Logs',
      content: (
        <OperationalAnalytics
          daily={snapshot.dailyTests}
          monthly={snapshot.monthlyTests}
        />
      ),
    },
  ];

  return (
    <PageContainer>
      <div style={{ borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
        <h2 style={{ font: 'var(--type-heading-page)', margin: 0 }}>Laboratory Intelligence & Analytics</h2>
        <p style={{ margin: '4px 0 0', font: 'var(--type-body-small)', color: 'var(--color-text-secondary)' }}>
          Monitor stage-level turnaround times, pathogen positivity curves, and antibiotic resistance trends.
        </p>
      </div>

      <AnalyticsDashboard kpis={snapshot.kpis} positiveRate={snapshot.positiveCultureRate} />

      <Card style={{ marginTop: '12px' }}>
        <Tabs items={tabItems} />
      </Card>
    </PageContainer>
  );
};

export default AnalyticsPage;
