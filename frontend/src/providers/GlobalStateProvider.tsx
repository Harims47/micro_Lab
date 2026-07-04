import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Patient, Order, Specimen, CulturePlate, Observation, ASTResult, DiagnosticReport, AuditLog } from '../types';
import { UserRole, SpecimenStatus, ValidationStatus } from '../types';
import { mockPatients, mockOrders, mockSpecimens, mockPlates, mockObservations, mockASTResults, mockReports, mockAuditLogs } from '../mock/mockData';

interface Toast {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

interface GlobalStateContextType {
  // App & UI State
  currentUser: User | null;
  activeRole: UserRole | null;
  theme: 'light' | 'dark';
  density: 'comfortable' | 'compact' | 'high-density';
  isSidebarOpen: boolean;
  toasts: Toast[];
  commandPaletteOpen: boolean;
  
  // Server State Cache
  patients: Patient[];
  orders: Order[];
  specimens: Specimen[];
  plates: CulturePlate[];
  observations: Observation[];
  astResults: ASTResult[];
  reports: DiagnosticReport[];
  auditLogs: AuditLog[];
  
  // Workflow Context
  activeSpecimenId: string | null;
  activeOrderId: string | null;

  // Actions
  login: (username: string) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  toggleTheme: () => void;
  setDensity: (density: 'comfortable' | 'compact' | 'high-density') => void;
  setSidebarOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  addToast: (type: 'success' | 'warning' | 'error' | 'info', message: string) => void;
  dismissToast: (id: string) => void;
  
  // Data modification actions (Mock API layers)
  addPatient: (patient: Omit<Patient, 'patientId' | 'createdAt'>) => void;
  addOrder: (order: Omit<Order, 'orderId' | 'createdAt'>) => void;
  receiveSpecimen: (specimenId: string, condition: string) => void;
  rejectSpecimen: (specimenId: string, reason: string) => void;
  inoculatePlate: (specimenId: string, mediaType: string, lotNumber: string, expiryDate: string) => void;
  saveObservation: (plateId: string, colonyCount: string, morphology: string, gramReaction: 'Gram Positive' | 'Gram Negative' | 'N/A', isContaminated: boolean, notes?: string) => void;
  saveASTResult: (specimenId: string, organismName: string, results: Omit<ASTResult, 'astId' | 'specimenId' | 'organismName' | 'determinedAt'>[]) => void;
  validateReport: (reportId: string, level: 'technical' | 'medical', signature?: string) => void;
  addAuditLog: (action: string, module: string, entityId: string, details: string) => void;
  setActiveSpecimenId: (id: string | null) => void;
  setActiveOrderId: (id: string | null) => void;
}

import { useIdentity } from '../infrastructure/auth/useIdentity';

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, switchRole: identitySwitchRole } = useIdentity();

  // Map AuthenticatedUser context to legacy User layout for backward compatibility
  const currentUser: User | null = user
    ? {
        userId: user.id,
        username: user.username,
        name: user.name,
        role: user.activeRole,
        email: user.email,
        isActive: true,
      }
    : null;

  const activeRole = user ? user.activeRole : null;

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [density, setDensity] = useState<'comfortable' | 'compact' | 'high-density'>('comfortable');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Server state mocks
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [specimens, setSpecimens] = useState<Specimen[]>(mockSpecimens);
  const [plates, setPlates] = useState<CulturePlate[]>(mockPlates);
  const [observations, setObservations] = useState<Observation[]>(mockObservations);
  const [astResults, setAstResults] = useState<ASTResult[]>(mockASTResults);
  const [reports, setReports] = useState<DiagnosticReport[]>(mockReports);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);

  // Workflow context
  const [activeSpecimenId, setActiveSpecimenId] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Sync theme to DOM attributes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync density to DOM attributes
  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
  }, [density]);

  const addToast = (type: 'success' | 'warning' | 'error' | 'info', message: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 5000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Deprecated login/logout in GlobalState: Login components now use useAuth()
  const login = (_username: string): boolean => {
    console.warn('Deprecated: Use useAuth().login instead of global state login');
    return false;
  };

  const logout = () => {
    console.warn('Deprecated: Use useAuth().logout instead of global state logout');
  };

  const switchRole = (role: UserRole) => {
    identitySwitchRole(role);
    addToast('info', `Switched view context to ${role} permissions.`);
    if (currentUser) {
      addAuditLog('Role Switch', 'Authentication', currentUser.userId, `Switched context to role: ${role}`);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    addToast('info', `Switched theme preferences.`);
  };

  const addAuditLog = (action: string, module: string, entityId: string, details: string) => {
    const newLog: AuditLog = {
      auditId: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.userId || 'SYSTEM',
      userName: currentUser?.name || 'SYSTEM',
      role: activeRole || UserRole.ADMIN,
      action,
      module,
      entityId,
      details
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addPatient = (patient: Omit<Patient, 'patientId' | 'createdAt'>) => {
    const patientId = `PAT-${String(patients.length + 1).padStart(10, '0')}`;
    const newPatient: Patient = {
      ...patient,
      patientId,
      createdAt: new Date().toISOString()
    };
    setPatients((prev) => [...prev, newPatient]);
    addToast('success', `Patient ${patient.lastName}, ${patient.firstName} registered successfully.`);
    addAuditLog('Register Patient', 'Patient', patientId, `MRN: ${patient.mrn}`);
  };

  const addOrder = (order: Omit<Order, 'orderId' | 'createdAt'>) => {
    const orderId = `ORD-${String(orders.length + 1).padStart(8, '0')}`;
    const newOrder: Order = {
      ...order,
      orderId,
      createdAt: new Date().toISOString()
    };
    setOrders((prev) => [...prev, newOrder]);
    addToast('success', `Order ${orderId} generated successfully.`);
    addAuditLog('Create Order', 'Orders', orderId, `Linked Patient ID: ${order.patientId}`);
  };

  const receiveSpecimen = (specimenId: string, condition: string) => {
    setSpecimens((prev) =>
      prev.map((s) =>
        s.specimenId === specimenId
          ? {
              ...s,
              status: SpecimenStatus.RECEIVED,
              receivedAt: new Date().toISOString(),
              receivedBy: currentUser?.name || 'Unknown',
              containerCondition: condition
            }
          : s
      )
    );
    addToast('success', `Specimen ${specimenId} status set to RECEIVED.`);
    addAuditLog('Accession Specimen', 'Specimen', specimenId, `Condition: ${condition}`);
  };

  const rejectSpecimen = (specimenId: string, reason: string) => {
    setSpecimens((prev) =>
      prev.map((s) =>
        s.specimenId === specimenId
          ? {
              ...s,
              status: SpecimenStatus.REJECTED,
              rejectionReason: reason,
              containerCondition: `REJECTED: ${reason}`
            }
          : s
      )
    );
    addToast('warning', `Specimen ${specimenId} has been REJECTED.`);
    addAuditLog('Reject Specimen', 'Specimen', specimenId, `Reason: ${reason}`);
  };

  const inoculatePlate = (specimenId: string, mediaType: string, lotNumber: string, expiryDate: string) => {
    const plateId = `CULT-${specimenId}-${String(plates.filter((p) => p.specimenId === specimenId).length + 1).padStart(2, '0')}`;
    const newPlate: CulturePlate = {
      plateId,
      specimenId,
      mediaType,
      lotNumber,
      expiryDate,
      inoculatedAt: new Date().toISOString(),
      inoculatedBy: currentUser?.name || 'System',
      incubationStart: new Date().toISOString(),
      incubationShelf: `Incubator A - Shelf ${Math.floor(Math.random() * 5) + 1}`,
      growthStatus: 'Pending'
    };
    setPlates((prev) => [...prev, newPlate]);
    setSpecimens((prev) =>
      prev.map((s) => (s.specimenId === specimenId ? { ...s, status: SpecimenStatus.INCUBATION } : s))
    );
    addToast('success', `Inoculated Culture Plate ${plateId} and stored in incubator.`);
    addAuditLog('Plate Inoculation', 'Culture', plateId, `Lot: ${lotNumber}`);
  };

  const saveObservation = (plateId: string, colonyCount: string, morphology: string, gramReaction: 'Gram Positive' | 'Gram Negative' | 'N/A', isContaminated: boolean, notes?: string) => {
    const observationId = `OBS-${plateId}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
    const newObs: Observation = {
      observationId,
      plateId,
      readAt: new Date().toISOString(),
      readBy: currentUser?.name || 'System',
      colonyCount,
      morphology,
      gramReaction,
      isContaminated,
      notes
    };
    setObservations((prev) => [newObs, ...prev]);
    
    // Update plate growth status
    setPlates((prev) =>
      prev.map((p) =>
        p.plateId === plateId ? { ...p, growthStatus: isContaminated ? 'Contaminated' : 'Growth Observed' } : p
      )
    );
    
    // Update specimen status to observation
    const plate = plates.find((p) => p.plateId === plateId);
    if (plate) {
      setSpecimens((prev) =>
        prev.map((s) =>
          s.specimenId === plate.specimenId ? { ...s, status: SpecimenStatus.OBSERVATION } : s
        )
      );
    }
    
    addToast('success', `Observed plate growth for ${plateId}.`);
    addAuditLog('Record Observation', 'Observation', observationId, `Gram reaction: ${gramReaction}`);
  };

  const saveASTResult = (specimenId: string, organismName: string, results: Omit<ASTResult, 'astId' | 'specimenId' | 'organismName' | 'determinedAt'>[]) => {
    const newResults: ASTResult[] = results.map((r) => ({
      ...r,
      astId: `AST-${specimenId}-${r.antibioticCode}`,
      specimenId,
      organismName,
      determinedAt: new Date().toISOString()
    }));
    
    setAstResults((prev) => {
      // Filter out existing AST results for this specimen
      const filtered = prev.filter((ast) => ast.specimenId !== specimenId);
      return [...filtered, ...newResults];
    });

    // Update specimen status to AST
    setSpecimens((prev) =>
      prev.map((s) => (s.specimenId === specimenId ? { ...s, status: SpecimenStatus.AST } : s))
    );

    // Create or Update Report
    setReports((prev) => {
      const existing = prev.find((r) => r.specimenId === specimenId);
      if (existing) {
        return prev.map((r) =>
          r.specimenId === specimenId
            ? { ...r, organismIdentified: organismName, astResults: newResults, validationStatus: ValidationStatus.PENDING }
            : r
        );
      }
      const newReport: DiagnosticReport = {
        reportId: `RPT-${specimenId}-v1`,
        specimenId,
        patientId: orders.find((o) => o.orderId === (specimens.find((s) => s.specimenId === specimenId)?.orderId))?.patientId || 'UNKNOWN',
        organismIdentified: organismName,
        astResults: newResults,
        validationStatus: ValidationStatus.PENDING,
        createdAt: new Date().toISOString()
      };
      return [...prev, newReport];
    });

    addToast('success', `AST Susceptibility Matrix generated successfully for organism: ${organismName}.`);
    addAuditLog('Generate AST', 'AST', specimenId, `Organism: ${organismName}, Antibiotics count: ${results.length}`);
  };

  const validateReport = (reportId: string, level: 'technical' | 'medical', signature?: string) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.reportId === reportId) {
          const isMedical = level === 'medical';
          return {
            ...r,
            validationStatus: isMedical ? ValidationStatus.RELEASED : ValidationStatus.VERIFIED,
            technicallyVerifiedBy: isMedical ? r.technicallyVerifiedBy : currentUser?.name,
            technicallyVerifiedAt: isMedical ? r.technicallyVerifiedAt : new Date().toISOString(),
            medicallyApprovedBy: isMedical ? currentUser?.name : undefined,
            medicallyApprovedAt: isMedical ? new Date().toISOString() : undefined,
            digitalSignature: isMedical ? signature || `SIG-${Date.now()}` : undefined
          };
        }
        return r;
      })
    );

    // Update Specimen status
    const report = reports.find((r) => r.reportId === reportId);
    if (report) {
      setSpecimens((prev) =>
        prev.map((s) =>
          s.specimenId === report.specimenId
            ? {
                ...s,
                status: level === 'medical' ? SpecimenStatus.DELIVERED : SpecimenStatus.VALIDATION
              }
            : s
        )
      );
      addToast('success', `Report ${reportId} successfully ${level === 'medical' ? 'Medically Approved & Released' : 'Technically Verified'}.`);
      addAuditLog(`${level === 'medical' ? 'Medical Release' : 'Technical Verification'}`, 'Validation', reportId, `User: ${currentUser?.name}`);
    }
  };

  return (
    <GlobalStateContext.Provider
      value={{
        currentUser,
        activeRole,
        theme,
        density,
        isSidebarOpen,
        toasts,
        commandPaletteOpen,
        patients,
        orders,
        specimens,
        plates,
        observations,
        astResults,
        reports,
        auditLogs,
        activeSpecimenId,
        activeOrderId,
        login,
        logout,
        switchRole,
        toggleTheme,
        setDensity,
        setSidebarOpen,
        setCommandPaletteOpen,
        addToast,
        dismissToast,
        addPatient,
        addOrder,
        receiveSpecimen,
        rejectSpecimen,
        inoculatePlate,
        saveObservation,
        saveASTResult,
        validateReport,
        addAuditLog,
        setActiveSpecimenId,
        setActiveOrderId
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};
