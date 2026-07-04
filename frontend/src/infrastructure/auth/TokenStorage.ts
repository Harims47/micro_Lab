export interface TokenStorage {
  saveAccessToken: (token: string) => void;
  getAccessToken: () => string | null;
  saveRefreshToken: (token: string) => void;
  getRefreshToken: () => string | null;
  clearTokens: () => void;
}

/**
 * Standard implementation using Session & Local storage.
 * Easily swappable for cookies later since the API remains identical.
 */
export const TokenStorageInstance: TokenStorage = {
  saveAccessToken: (token: string) => {
    sessionStorage.setItem('lims_access_token', token);
  },
  getAccessToken: () => {
    return sessionStorage.getItem('lims_access_token');
  },
  saveRefreshToken: (token: string) => {
    localStorage.setItem('lims_refresh_token', token);
  },
  getRefreshToken: () => {
    return localStorage.getItem('lims_refresh_token');
  },
  clearTokens: () => {
    sessionStorage.removeItem('lims_access_token');
    localStorage.removeItem('lims_refresh_token');
  },
};
