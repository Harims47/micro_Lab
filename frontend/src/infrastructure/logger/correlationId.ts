let _correlationId: string = generateCorrelationId();

export function generateCorrelationId(): string {
  // Crypto UUID if available, otherwise fallback
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: time-based UUID v4-like
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Returns the current session-level correlation ID.
 * A new ID is generated on each page load.
 */
export function getCorrelationId(): string {
  return _correlationId;
}

/**
 * Generates a new correlation ID (e.g., for a new request chain).
 */
export function refreshCorrelationId(): string {
  _correlationId = generateCorrelationId();
  return _correlationId;
}
