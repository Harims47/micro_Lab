import type { MasterRecord, UserProfile } from '../models/types';

export class AdminValidator {
  static validateMasterRecord(
    record: Partial<MasterRecord>,
    existing: MasterRecord[]
  ): { isValid: boolean; error?: string } {
    if (!record.name || record.name.trim().length === 0) {
      return { isValid: false, error: 'Record Name is required.' };
    }
    if (!record.code || record.code.trim().length === 0) {
      return { isValid: false, error: 'Record Code is required.' };
    }

    const isDuplicate = existing.some(
      (r) =>
        r.recordId !== record.recordId &&
        r.type === record.type &&
        (r.code.toLowerCase() === record.code?.toLowerCase() ||
          r.name.toLowerCase() === record.name?.toLowerCase())
    );

    if (isDuplicate) {
      return { isValid: false, error: `A master record of type ${record.type} already exists with the same name or code.` };
    }

    return { isValid: true };
  }

  static validateUser(user: Partial<UserProfile>): { isValid: boolean; error?: string } {
    if (!user.username || user.username.trim().length < 3) {
      return { isValid: false, error: 'Username must be at least 3 characters long.' };
    }
    if (!user.fullName || user.fullName.trim().length === 0) {
      return { isValid: false, error: 'Full Name is required.' };
    }
    if (!user.email || !user.email.includes('@')) {
      return { isValid: false, error: 'A valid email address is required.' };
    }
    return { isValid: true };
  }
}

export default AdminValidator;
