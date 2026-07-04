import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { AccountLockedPage } from '../pages/AccountLockedPage';
import { PasswordUpdatedPage } from '../pages/PasswordUpdatedPage';
import { AppLayout } from '../layouts/AppLayout';
import { ComponentPlaybook } from '../pages/ComponentPlaybook';
import { PatientPage } from '../modules/patient';
import { OrderPage } from '../modules/order';
import { SpecimenPage } from '../modules/specimen';
import { CulturePage } from '../modules/culture';
import { OrganismPage } from '../modules/organism';
import { AstPage } from '../modules/ast';
import { ValidationPage } from '../modules/validation';
import {
  DashboardPage,
  ReportsPage,
  AdminPage,
  AuditPage,
  AnalyticsPage,
  NotFoundPage,
  ForbiddenPage,
  UnauthorizedPage
} from '../pages/ModulePlaceholders';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Login Portal */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/account-locked" element={<AccountLockedPage />} />
      <Route path="/password-updated" element={<PasswordUpdatedPage />} />

      {/* Protected App Shell Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="patient" element={<PatientPage />} />
        <Route path="orders" element={<OrderPage />} />
        <Route path="specimen" element={<SpecimenPage />} />
        <Route path="culture" element={<CulturePage />} />
        <Route path="organism" element={<OrganismPage />} />
        <Route path="ast" element={<AstPage />} />
        <Route path="validation" element={<ValidationPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="components" element={<ComponentPlaybook />} />
        <Route path="401" element={<UnauthorizedPage />} />
        <Route path="403" element={<ForbiddenPage />} />
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
};
