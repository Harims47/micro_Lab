export * from '../../../shared/enums';
export * from '../../../shared/models';
export * from '../../../shared/errors';
export interface AppState {
  currentUser: any | null;
  activeRole: any | null;
  theme: 'light' | 'dark';
}
