/* Password rules, shared by signup and reset so the two can't drift.
   Dependency-free — imported by client components. */

export const PASSWORD_RULES = [
  { id: 'len', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { id: 'letter', label: 'A letter', test: (v) => /[a-zA-Z]/.test(v) },
  { id: 'number', label: 'A number', test: (v) => /[0-9]/.test(v) },
];

export function passwordProblems(value) {
  const v = String(value || '');
  return PASSWORD_RULES.filter((r) => !r.test(v));
}

export function isValidPassword(value) {
  return passwordProblems(value).length === 0;
}

/* 0–4, for the strength meter. The three rules are the floor; length and
   variety past that are what move it up. Deliberately simple — a score nobody
   can reverse-engineer into "add one ! to win" is worth more than a clever one
   that rejects good passphrases. */
export function passwordScore(value) {
  const v = String(value || '');
  if (!v) return 0;
  let score = 0;
  if (v.length >= 8) score++;
  if (v.length >= 12) score++;
  if (/[a-zA-Z]/.test(v) && /[0-9]/.test(v)) score++;
  if (/[^a-zA-Z0-9]/.test(v) || v.length >= 16) score++;
  return Math.min(4, score);
}

export const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

/* The one message shown when a password is rejected — says what's missing
   rather than restating the whole policy. */
export function passwordError(value) {
  const missing = passwordProblems(value);
  if (!missing.length) return null;
  if (!String(value || '').length) return 'Choose a password.';
  return 'Needs ' + missing.map((m) => m.label.toLowerCase()).join(', ') + '.';
}
