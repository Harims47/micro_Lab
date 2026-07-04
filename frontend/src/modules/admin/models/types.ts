export interface UserProfile {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface RoleDefinition {
  roleId: string;
  name: string;
  permissions: string[];
  description: string;
}

export interface Department {
  deptId: string;
  name: string;
  code: string;
  head: string;
}

export interface MasterRecord {
  recordId: string;
  category: 'Reference' | 'Clinical' | 'Laboratory' | 'System';
  type: 'Organism' | 'Antibiotic' | 'Instrument' | 'Incubator' | 'CultureMedia' | 'SpecimenType' | 'TestPanel' | 'ReportTemplate' | 'Location' | 'Workstation' | 'PrinterConfig' | 'BarcodePrinterConfig';
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

export interface ConfigurationSetting {
  key: string;
  value: string;
  description: string;
  category: 'Laboratory' | 'Workflow' | 'Notification' | 'Branding' | 'Numbering';
}
