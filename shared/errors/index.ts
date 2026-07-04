export interface LimsError {
  errorCode: string;
  message: string;
  field?: string;
}

export const ErrorRegistry: Record<string, string> = {
  'ERR-001': 'Authentication failed: Invalid credentials.',
  'ERR-002': 'Session expired. Please log in again.',
  'ERR-003': 'Specimen quality check failed: container damaged or compromised.',
  'ERR-004': 'Access Denied: You do not have permission to access this resource.',
  'ERR-005': 'Patient MRN already exists.',
  'ERR-006': 'Invalid Order Panel configuration.',
  'ERR-007': 'Specimen barcode mismatch or unreadable.',
  'ERR-008': 'Media lot is expired or invalid.',
  'ERR-009': 'Inoculation Shelf location is occupied.',
  'ERR-010': 'Organism ID not found in approved taxonomy dictionary.',
  'ERR-011': 'AST Zone Diameter value is out of physical limits.',
  'ERR-012': 'Delta check validation warning: result exceeds threshold.',
  'ERR-013': 'Digital signature verification failed.',
  'ERR-014': 'Required field is missing or empty.'
};
