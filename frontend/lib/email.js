/* Email checks shared by the signup form and the server-side schema.
   Deliberately dependency-free so importing it into a client component does
   not pull zod into the browser bundle. */

// ---------------------------------------------------------------------------
// Typo guard for the signup form.
//
// Supabase flagged this project for bounced transactional email. A hard bounce
// almost always means the address never existed — and by far the most common
// cause is a mistyped domain on an otherwise valid-looking address. The regex
// the signup wizard used (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) happily accepts
// `someone@gmial.com`, which then bounces and counts against the project.
//
// This is a suggestion, never a block: unusual domains are real, and refusing
// to accept one would be worse than a bounce.
// ---------------------------------------------------------------------------
const DOMAIN_TYPOS = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.cm": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "yahho.com": "yahoo.com",
  "yaho.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
  "outlook.co": "outlook.com",
  "iclod.com": "icloud.com",
  "icloud.co": "icloud.com",
  "rediffmial.com": "rediffmail.com",
};

// Returns a corrected address to offer the user, or null when nothing looks off.
export function suggestEmail(value) {
  const v = String(value || "").trim().toLowerCase();
  const at = v.lastIndexOf("@");
  if (at < 1) return null;
  const domain = v.slice(at + 1);
  const fixed = DOMAIN_TYPOS[domain];
  return fixed ? v.slice(0, at + 1) + fixed : null;
}

// The one email check the app should use. Stricter than the old inline regex:
// it requires a real TLD and rejects the consecutive/leading/trailing dots that
// slip past a naive pattern.
export function isValidEmail(value) {
  const v = String(value || "").trim();
  if (v.length < 6 || v.length > 254) return false;
  if (!/^[^\s@]+@[^\s@]+$/.test(v)) return false;
  const domain = v.slice(v.lastIndexOf("@") + 1);
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(domain)) return false;
  if (/\.\./.test(v) || /^\./.test(v) || /\.@|@\./.test(v)) return false;
  return /\.[a-z]{2,}$/i.test(domain);
}
