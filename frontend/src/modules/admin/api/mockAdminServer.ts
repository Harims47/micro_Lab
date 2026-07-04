import { mockAdapter } from '../../../infrastructure/http/mockAdapter';
import { eventBus } from '../../../services/platform/eventBus';
import type { UserProfile, RoleDefinition, Department, MasterRecord, ConfigurationSetting } from '../models/types';

let usersDb: UserProfile[] = [
  { userId: 'USR-1', username: 'tech_user', fullName: 'David Miller', email: 'd.miller@metropolis.org', role: 'Laboratory Technologist', department: 'Microbiology', status: 'Active', createdAt: '2026-01-15T09:00:00Z' },
  { userId: 'USR-2', username: 'supervisor_user', fullName: 'Dr. Jane Smith', email: 'j.smith@metropolis.org', role: 'Clinical Supervisor', department: 'Microbiology', status: 'Active', createdAt: '2026-01-15T09:00:00Z' },
  { userId: 'USR-3', username: 'dr_chen', fullName: 'Dr. Arthur Chen', email: 'a.chen@metropolis.org', role: 'Clinical Microbiologist', department: 'Microbiology', status: 'Active', createdAt: '2026-01-20T10:00:00Z' },
  { userId: 'USR-4', username: 'dr_patel', fullName: 'Dr. Rajesh Patel', email: 'r.patel@metropolis.org', role: 'Pathologist', department: 'Pathology', status: 'Active', createdAt: '2026-01-20T11:00:00Z' },
  { userId: 'USR-5', username: 'lab_director', fullName: 'Prof. Alice Johnson', email: 'a.johnson@metropolis.org', role: 'Laboratory Director', department: 'Administration', status: 'Active', createdAt: '2026-01-01T08:00:00Z' },
];

let rolesDb: RoleDefinition[] = [
  { roleId: 'ROL-1', name: 'Laboratory Technologist', permissions: ['VIEW_SPECIMENS', 'REGISTER_SPECIMEN'], description: 'Processes specimens, runs culture media plates, AST assays, and logs results.' },
  { roleId: 'ROL-2', name: 'Clinical Supervisor', permissions: ['VIEW_SPECIMENS', 'VALIDATE_TECHNICAL'], description: 'Performs technical validations, assigns reviewers, checks QC thresholds.' },
  { roleId: 'ROL-3', name: 'Clinical Microbiologist', permissions: ['VIEW_SPECIMENS', 'VALIDATE_TECHNICAL'], description: 'Signs clinical validations, reviews AST override logs, correlates findings.' },
  { roleId: 'ROL-4', name: 'Pathologist', permissions: ['VIEW_SPECIMENS', 'VALIDATE_TECHNICAL'], description: 'Performs pathologist validation stage, issues final laboratory release authorization.' },
];

let deptsDb: Department[] = [
  { deptId: 'DEP-1', name: 'Microbiology', code: 'MB', head: 'Dr. Jane Smith' },
  { deptId: 'DEP-2', name: 'Pathology', code: 'PATH', head: 'Dr. Rajesh Patel' },
  { deptId: 'DEP-3', name: 'Virology', code: 'VR', head: 'Dr. Arthur Chen' },
  { deptId: 'DEP-4', name: 'Administration', code: 'ADMIN', head: 'Prof. Alice Johnson' },
];

let configsDb: ConfigurationSetting[] = [
  { key: 'lab.name', value: 'Metropolis Microbiology LIMS', description: 'Institutional Laboratory Name.', category: 'Laboratory' },
  { key: 'workflow.autoAssignQC', value: 'true', description: 'Auto-assign technicians to QC checks.', category: 'Workflow' },
  { key: 'notification.emailEnabled', value: 'true', description: 'Enable email distribution logs.', category: 'Notification' },
  { key: 'branding.logoUrl', value: '/assets/logo.png', description: 'Report layout heading brand logo url.', category: 'Branding' },
  { key: 'numbering.reportPrefix', value: 'REP-', description: 'Standard numbering sequence prefix for report outputs.', category: 'Numbering' },
];

let mastersDb: MasterRecord[] = [];

const seedMasters = () => {
  if (mastersDb.length > 0) return;

  const typeMap: Array<{ type: MasterRecord['type']; category: MasterRecord['category']; prefix: string; names: string[] }> = [
    { type: 'Organism', category: 'Reference', prefix: 'ORG', names: ['Escherichia coli', 'Staphylococcus aureus', 'Pseudomonas aeruginosa', 'Klebsiella pneumoniae', 'Enterococcus faecalis', 'Streptococcus pneumoniae'] },
    { type: 'Antibiotic', category: 'Reference', prefix: 'AB', names: ['Amoxicillin', 'Ciprofloxacin', 'Gentamicin', 'Ceftriaxone', 'Imipenem', 'Penicillin', 'Vancomycin', 'Erythromycin', 'Clindamycin', 'Linezolid'] },
    { type: 'SpecimenType', category: 'Clinical', prefix: 'SPC', names: ['Blood Culture', 'Clean Catch Urine', 'Wound Swab', 'Sputum', 'Cerebrospinal Fluid (CSF)'] },
    { type: 'TestPanel', category: 'Clinical', prefix: 'PANEL', names: ['Enteric Panel', 'Gram-Positive Cocci Panel', 'Urine Pathogen Panel', 'CSF Panel'] },
    { type: 'Instrument', category: 'Laboratory', prefix: 'INST', names: ['Vitek 2 Analyzer', 'MALDI-TOF Microflex', 'Bact/ALERT Virtuo', 'GeneXpert IV'] },
    { type: 'Incubator', category: 'Laboratory', prefix: 'INC', names: ['Incubator Room A (37C)', 'Incubator Room B (CO2)', 'Anaerobic Chamber 1'] },
    { type: 'CultureMedia', category: 'Laboratory', prefix: 'MEDIA', names: ['Blood Agar', 'MacConkey Agar', 'Chocolate Agar', 'CLED Agar', 'Sabouraud Dextrose Agar'] },
    { type: 'Location', category: 'Laboratory', prefix: 'LOC', names: ['Bench 1 - Processing', 'Bench 2 - Reading', 'Incubator Room 102'] },
    { type: 'Workstation', category: 'Laboratory', prefix: 'WORK', names: ['WS-MB-01', 'WS-MB-02', 'WS-PATH-01'] },
    { type: 'PrinterConfig', category: 'System', prefix: 'PRN', names: ['Pathology Laser Jet 1', 'Admin PDF Network Printer'] },
    { type: 'BarcodePrinterConfig', category: 'System', prefix: 'BAR', names: ['Zebra ZD420 Labeler 1', 'Zebra ZD420 Labeler 2'] },
    { type: 'ReportTemplate', category: 'System', prefix: 'TMPL', names: ['Standard Laboratory Report', 'Hospital Summary Layout', 'Compact Patient Output'] },
  ];

  let idCounter = 1;
  typeMap.forEach((entry) => {
    entry.names.forEach((name, i) => {
      mastersDb.push({
        recordId: `${entry.prefix}-${String(idCounter++).padStart(4, '0')}`,
        category: entry.category,
        type: entry.type,
        name,
        code: `${entry.prefix}-${name.slice(0, 3).toUpperCase()}-${i + 1}`,
        description: `Master catalog definition for clinical/laboratory ${name}.`,
        isActive: true,
      });
    });
  });

  // Backfill until we have 80+ records
  while (mastersDb.length < 85) {
    mastersDb.push({
      recordId: `GEN-${String(idCounter++).padStart(4, '0')}`,
      category: 'Reference',
      type: 'Organism',
      name: `Mock Organism Species ${mastersDb.length}`,
      code: `ORG-MCK-${mastersDb.length}`,
      description: 'System backfill mock reference organism.',
      isActive: false,
    });
  }
};

export const initializeMockAdminServer = () => {
  seedMasters();

  // 1. GET /admin/users
  mockAdapter.register('GET', '/admin/users', () => {
    return usersDb;
  });

  // 2. POST /admin/users
  mockAdapter.register('POST', '/admin/users', (body: any) => {
    const newUser: UserProfile = {
      userId: `USR-${Date.now()}`,
      username: body.username,
      fullName: body.fullName,
      email: body.email,
      role: body.role || 'Laboratory Technologist',
      department: body.department || 'Microbiology',
      status: 'Active',
      createdAt: new Date().toISOString(),
    };
    usersDb.push(newUser);
    eventBus.publish('USER_CREATED', newUser);
    return newUser;
  });

  // 3. POST /admin/users/:id/status
  mockAdapter.register('POST', '^/admin/users/[a-zA-Z0-9\\-]+/status$', (body: any, url?: string) => {
    const parts = url?.split('/');
    const id = parts?.[3];
    const user = usersDb.find((u) => u.userId === id);
    if (!user) throw { status: 404, message: 'User not found.' };
    user.status = body.status;
    return user;
  });

  // 4. GET /admin/roles
  mockAdapter.register('GET', '/admin/roles', () => {
    return rolesDb;
  });

  // 5. POST /admin/roles/:id
  mockAdapter.register('POST', '^/admin/roles/[a-zA-Z0-9\\-]+$', (body: any, url?: string) => {
    const parts = url?.split('/');
    const id = parts?.[3];
    const role = rolesDb.find((r) => r.roleId === id);
    if (!role) throw { status: 404, message: 'Role not found.' };
    role.permissions = body.permissions || [];
    eventBus.publish('ROLE_UPDATED', role);
    return role;
  });

  // 6. GET /admin/departments
  mockAdapter.register('GET', '/admin/departments', () => {
    return deptsDb;
  });

  // 7. GET /admin/masters
  mockAdapter.register('GET', '/admin/masters', (qp: any) => {
    const { type } = qp || {};
    if (type) {
      return mastersDb.filter((m) => m.type === type);
    }
    return mastersDb;
  });

  // 8. POST /admin/masters
  mockAdapter.register('POST', '/admin/masters', (body: any) => {
    const newRecord: MasterRecord = {
      recordId: `${body.type.slice(0, 3).toUpperCase()}-${Date.now()}`,
      category: body.category || 'Reference',
      type: body.type,
      name: body.name,
      code: body.code,
      description: body.description || '',
      isActive: true,
    };
    mastersDb.unshift(newRecord);
    return newRecord;
  });

  // 9. POST /admin/masters/:id
  mockAdapter.register('POST', '^/admin/masters/[a-zA-Z0-9\\-]+$', (body: any, url?: string) => {
    const parts = url?.split('/');
    const id = parts?.[3];
    const idx = mastersDb.findIndex((m) => m.recordId === id);
    if (idx === -1) throw { status: 404, message: 'Master record not found.' };
    const record = { ...mastersDb[idx], ...body };
    mastersDb[idx] = record;
    return record;
  });

  // 10. GET /admin/configs
  mockAdapter.register('GET', '/admin/configs', () => {
    return configsDb;
  });

  // 11. POST /admin/configs
  mockAdapter.register('POST', '/admin/configs', (body: any) => {
    configsDb = body.configs || [];
    eventBus.publish('CONFIGURATION_UPDATED', configsDb);
    return configsDb;
  });
};

export default initializeMockAdminServer;
export { mastersDb, usersDb };
