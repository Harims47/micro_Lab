import React from 'react';
import { ErrorBoundary } from '../infrastructure/errors/ErrorBoundary';
import { ConfigProvider } from '../infrastructure/config/ConfigProvider';
import { LoggerProvider } from '../infrastructure/logger/LoggerProvider';
import { FeatureFlagProvider } from '../infrastructure/featureFlags/FeatureFlagProvider';
import { NotificationProvider } from '../infrastructure/notifications/NotificationProvider';
import { DialogProvider } from '../infrastructure/dialogs/DialogProvider';
import { SearchProvider } from '../infrastructure/search/SearchProvider';
import { GlobalStateProvider } from './GlobalStateProvider';
import { PermissionProvider } from '../infrastructure/permissions/PermissionProvider';
import { GlobalErrorHandler } from '../infrastructure/errors/GlobalErrorHandler';
import { AlertService } from '../infrastructure/notifications/AlertService';
import { IdentityProvider, AuthProvider, useIdentity } from '../infrastructure/auth';
import { initializeMockAuthServer } from '../infrastructure/http';
import { initializeMockPatientServer } from '../modules/patient/api/mockPatientServer';
import { initializeMockOrderServer } from '../modules/order/api/mockOrderServer';
import { initializeMockSpecimenServer } from '../modules/specimen/api/mockSpecimenServer';
import { initializeMockCultureServer } from '../modules/culture/api/mockCultureServer';
import { initializeMockOrganismServer } from '../modules/organism/api/mockOrganismServer';
import { initializeMockAstServer } from '../modules/ast/api/mockAstServer';
import { initializeMockValidationServer } from '../modules/validation/api/mockValidationServer';

// Initialize global window error handlers
GlobalErrorHandler.install();

// Wire the GlobalErrorHandler dispatch directly into our AlertService
GlobalErrorHandler.setDispatch((err) => {
  AlertService.error(err.userMessage, `Error [${err.code}]`);
});

// Initialize mock HTTP authentication backend endpoints
initializeMockAuthServer();
initializeMockPatientServer();
initializeMockOrderServer();
initializeMockSpecimenServer();
initializeMockCultureServer();
initializeMockOrganismServer();
initializeMockAstServer();
initializeMockValidationServer();

/**
 * Bridges user credentials from IdentityProvider to the PermissionProvider.
 * Since PermissionProvider depends on activeRole, it resides inside IdentityProvider.
 */
const PermissionBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useIdentity();
  return (
    <PermissionProvider activeRole={user ? user.activeRole : null}>
      {children}
    </PermissionProvider>
  );
};

export const AppInfrastructureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <ConfigProvider>
        <LoggerProvider>
          <FeatureFlagProvider>
            <NotificationProvider>
              <DialogProvider>
                <SearchProvider>
                  <IdentityProvider>
                    <AuthProvider>
                      <PermissionBridge>
                        <GlobalStateProvider>
                          {children}
                        </GlobalStateProvider>
                      </PermissionBridge>
                    </AuthProvider>
                  </IdentityProvider>
                </SearchProvider>
              </DialogProvider>
            </NotificationProvider>
          </FeatureFlagProvider>
        </LoggerProvider>
      </ConfigProvider>
    </ErrorBoundary>
  );
};
export default AppInfrastructureProvider;
