/* Mobile number rules. Dependency-free — imported by client components.
   Matches the WhatsApp-number rules the enrolment form already uses, so a
   number accepted at signup is accepted at enrolment too. */

export const DEFAULT_DIAL_CODE = '+91';

/* Keep digits and a single leading '+', nothing else. */
export function normalisePhone(value) {
  const raw = String(value || '').trim();
  const plus = raw.startsWith('+');
  const digits = raw.replace(/\D/g, '');
  return (plus ? '+' : '') + digits;
}

/* Tidy for display / storage — spacing kept, because a human reads this off a
   registration list. */
export function tidyPhone(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

export function phoneError(value) {
  const raw = String(value || '').trim();
  if (!raw || raw === DEFAULT_DIAL_CODE) return 'We need a mobile number.';
  if (!raw.startsWith('+')) return 'Add your country code, like +91.';
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 9) return 'That number looks too short.';
  if (digits.length > 15) return 'That number looks too long.';
  return null;
}

export function isValidPhone(value) {
  return phoneError(value) === null;
}
