export interface DialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  severity?: 'info' | 'warning' | 'danger';
}

export interface UnsavedChangesOptions {
  title?: string;
  message?: string;
  discardLabel?: string;
  keepEditingLabel?: string;
}

export interface SessionExpiredOptions {
  title?: string;
  message?: string;
  loginLabel?: string;
}

export interface DeleteConfirmOptions {
  title?: string;
  message: string;
  entityName?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}
