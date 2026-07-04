import React, { useState } from 'react';
import { OrderList } from '../components/OrderList';
import { OrderWizard } from '../components/OrderWizard';
import { OrderProfile } from '../components/OrderProfile';
import { usePermission } from '../../../infrastructure/permissions/usePermission';
import { Permission } from '../../../infrastructure/permissions/constants';
import { ForbiddenPage } from '../../../pages/ModulePlaceholders';

export const OrderPage: React.FC = () => {
  const { hasPermission } = usePermission();
  const canView = hasPermission(Permission.ORDER_VIEW);

  // View States: LIST, CREATE, EDIT, DETAILS
  const [viewState, setViewState] = useState<'LIST' | 'CREATE' | 'EDIT' | 'DETAILS'>('LIST');
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);

  // 1. Module Level Permission Guard
  if (!canView) {
    return <ForbiddenPage />;
  }

  return (
    <div style={styles.pageWrapper}>
      {viewState === 'LIST' && (
        <OrderList
          onViewDetails={(id) => {
            setSelectedOrderId(id);
            setViewState('DETAILS');
          }}
          onEditOrder={(id) => {
            setSelectedOrderId(id);
            setViewState('EDIT');
          }}
          onCreateOrder={() => {
            setSelectedOrderId(undefined);
            setViewState('CREATE');
          }}
        />
      )}

      {(viewState === 'CREATE' || viewState === 'EDIT') && (
        <OrderWizard
          orderId={selectedOrderId}
          onClose={() => {
            setViewState('LIST');
            setSelectedOrderId(undefined);
          }}
        />
      )}

      {viewState === 'DETAILS' && selectedOrderId && (
        <OrderProfile
          orderId={selectedOrderId}
          onBack={() => {
            setViewState('LIST');
            setSelectedOrderId(undefined);
          }}
          onEdit={(id) => {
            setSelectedOrderId(id);
            setViewState('EDIT');
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

export default OrderPage;
