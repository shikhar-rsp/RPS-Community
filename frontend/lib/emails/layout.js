/* =============================================================================
   The frame every RPS Cohorts email sits in: the workshop's thumbnail across
   the top, a white card, and a quiet footer.

   Strings, tables and inline styles, because that is what Gmail and Outlook
   render reliably. Every image and link is absolute — an email is opened far
   away from the site, so a relative path is a broken image.
   ============================================================================= */

import { siteOrigin } from '@/lib/site-url';

export const ACCENT = '#FF630B';
export const INK = '#13100E';
export const MUTED = '#6B6259';
export const LINE = '#E8E2DA';
export const PAPER = '#FBF8F4';
export const FONT = 'Helvetica,Arial,sans-serif';

/* Production sets NEXT_PUBLIC_SITE_URL. If it ever isn't, the live domain is
   still the right answer for an email — never an empty origin, which would
   leave every image in the message pointing nowhere. */
const ORIGIN = siteOrigin() || 'https://cohorts.rockpaperscissors.studio';

export function abs(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return ORIGIN + (String(path).startsWith('/') ? path : '/' + path);
}

/* Anything typed by a person — a registrant's name, an admin's message —
   lands in this HTML. Escape everything interpolated, without exception. */
export function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function firstName(name) {
  const first = String(name || '').trim().split(/\s+/)[0];
  return first || 'there';
}

/* The thumbnail an email shows: a small JPG made for inboxes when there is
   one, otherwise the site's banner. */
export function emailBanner(w) {
  return abs(w?.emailBannerUrl || w?.bannerUrl || '');
}

export function button(href, label) {
  return (
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;">' +
    '<tr><td style="border-radius:8px;background:' + ACCENT + ';">' +
    '<a href="' + esc(href) + '" style="display:inline-block;padding:13px 26px;' +
    'font-family:' + FONT + ';font-size:15px;font-weight:600;color:#ffffff;' +
    'text-decoration:none;border-radius:8px;">' + esc(label) + '</a>' +
    '</td></tr></table>'
  );
}

export function p(html, { size = 16, color = INK, margin = '0 0 16px' } = {}) {
  return (
    '<p style="margin:' + margin + ';font-family:' + FONT + ';font-size:' + size + 'px;line-height:1.6;' +
    'color:' + color + ';">' + html + '</p>'
  );
}

export function h2(text) {
  return (
    '<p style="margin:0 0 12px;font-family:' + FONT + ';font-size:12px;font-weight:700;' +
    'letter-spacing:.08em;text-transform:uppercase;color:' + ACCENT + ';">' + esc(text) + '</p>'
  );
}

/* Plain text an admin typed, as email HTML: escaped first, then blank lines
   become paragraphs, single line breaks stay line breaks, and web addresses
   become links. Nothing they type can become markup. */
export function textToHtml(text) {
  const linkify = (s) =>
    s.replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])/g, (u) =>
      '<a href="' + u + '" style="color:' + ACCENT + ';text-decoration:underline;">' + u + '</a>'
    );
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => p(linkify(esc(para)).replace(/\n/g, '<br>')))
    .join('');
}

/* The whole message. `body` is HTML built from the pieces above. */
export function frame({ title, preview, banner, bannerHref, body, footer }) {
  return (
    '<!doctype html>\n<html><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + esc(title) + '</title></head>' +
    '<body style="margin:0;padding:0;background:' + PAPER + ';">' +
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0;">' + esc(preview || '') + '</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
    'style="background:' + PAPER + ';padding:32px 16px;"><tr><td align="center">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ' +
    'style="max-width:560px;background:#ffffff;border:1px solid ' + LINE + ';border-radius:14px;overflow:hidden;">' +

    (banner
      ? '<tr><td style="padding:0;line-height:0;font-size:0;">' +
        (bannerHref ? '<a href="' + esc(bannerHref) + '">' : '') +
        '<img src="' + esc(banner) + '" width="560" alt="" ' +
        'style="display:block;width:100%;max-width:560px;height:auto;border:0;border-radius:14px 14px 0 0;">' +
        (bannerHref ? '</a>' : '') +
        '</td></tr>'
      : '') +

    '<tr><td style="padding:30px 32px 8px;">' + body + '</td></tr>' +

    '<tr><td style="padding:20px 32px;border-top:1px solid ' + LINE + ';background:' + PAPER + ';">' +
    (footer || '') +
    '</td></tr>' +

    '</table></td></tr></table></body></html>'
  );
}
