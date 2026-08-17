export const LICENSE_CATEGORIES = ['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'] as const;
export const LICENSE_EXPIRING_SOON_DAYS = 30;
export type LicenseStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';

export function licenseStatus(expiresAt: Date, reference = new Date()): LicenseStatus {
  const today = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), reference.getUTCDate()));
  const expiry = new Date(Date.UTC(expiresAt.getUTCFullYear(), expiresAt.getUTCMonth(), expiresAt.getUTCDate()));
  if (expiry < today) return 'EXPIRED';
  const limit = new Date(today);
  limit.setUTCDate(limit.getUTCDate() + LICENSE_EXPIRING_SOON_DAYS);
  return expiry <= limit ? 'EXPIRING_SOON' : 'VALID';
}
