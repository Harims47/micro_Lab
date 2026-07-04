import React, { useState, useEffect, useCallback } from 'react';
import type { ComplianceSummary } from '../models/types';
import { AuditService } from '../services/auditService';
import { AuditDashboard } from '../components/AuditDashboard';
import { AuditViewer } from '../components/AuditViewer';
import { CompliancePanel } from '../components/CompliancePanel';

import { PageContainer, Card } from '../../../components/Layout';
import { Tabs } from '../../../components/Layout/Tabs';

export const AuditPage: React.FC = () => {
  const [summary, setSummary] = useState<ComplianceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const s = await AuditService.getComplianceSummary();
      setSummary(s);
    } catch { /* silently ignore */ }
    finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (loading || !summary) {
    return (
      <PageContainer>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading Audit Registry...</p>
      </PageContainer>
    );
  }

  const tabItems = [
    {
      id: 'logs',
      label: 'Audit Trail Logs',
      content: <AuditViewer />,
    },
    {
      id: 'compliance',
      label: 'Regulatory Compliance',
      content: <CompliancePanel />,
    },
  ];

  return (
    <PageContainer>
      <div style={{ borderBottom: '1px solid var(--color-border-default)', paddingBottom: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
        <h2 style={{ font: 'var(--type-heading-page)', margin: 0 }}>Compliance & Central Audit Registry</h2>
        <p style={{ margin: '4px 0 0', font: 'var(--type-body-small)', color: 'var(--color-text-secondary)' }}>
          Review immutable user activity records, validation changes, and system compliance status checks.
        </p>
      </div>

      <AuditDashboard summary={summary} />

      <Card style={{ marginTop: '12px' }}>
        <Tabs items={tabItems} />
      </Card>
    </PageContainer>
  );
};

export default AuditPage;
