'use client';
import React from 'react';
import { artHTML, ART_BG, avatar as avatarSvg, qpattern as qpatternSvg } from '@/lib/community/art';

/* A frame renders a real photo when one exists, and falls back to the vector
   illustration. Supplying a photo also drops the "placeholder" badge and lets
   the frame hold the artwork's own ratio instead of a fixed height. */
export default function Frame({ kind, src, alt, note, className = '', style = {}, flat = false }) {
  const cls = ['frame', flat ? 'flat' : '', src ? 'has-photo' : '', className]
    .filter(Boolean)
    .join(' ');

  if (src) {
    return (
      <div className={cls} style={{ background: 'transparent', ...style }}>
        <img src={src} alt={alt || ''} loading="lazy" decoding="async" />
      </div>
    );
  }

  return (
    <div
      className={cls}
      style={{ background: ART_BG[kind] || undefined, ...style }}
      dangerouslySetInnerHTML={{
        __html: artHTML(kind) + (note ? `<span class="frame-note">${note}</span>` : ''),
      }}
    />
  );
}

/* The drawn figure on a feedback ticket — the same three marks as a figure in
   the About us illustration, at the scale of an avatar. */
export function Avatar({ i }) {
  return <span className="face" aria-hidden="true" dangerouslySetInnerHTML={{ __html: avatarSvg(i) }} />;
}

export function QPattern({ i }) {
  return <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: qpatternSvg(i) }} />;
}
