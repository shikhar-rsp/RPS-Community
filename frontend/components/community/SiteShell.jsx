'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Nav from './Nav';
import Footer from './Footer';

/* ------------------------------------------------------------ cookie notice
   Shown once, then remembered. It sits at the bottom and does NOT block the
   page: nothing here sets a tracking cookie before consent, so trapping the
   visitor behind a modal would be theatre. Dismissing and accepting are the
   same action, which is why there is one button and a link to the policy. */
const COOKIE_KEY = 'rps.cookies';

function CookieNotice() {
  const [show, setShow] = useState(false);
  const [inState, setIn] = useState(false);
  const [out, setOut] = useState(false);

  useEffect(() => {
    let seen = null;
    try {
      seen = localStorage.getItem(COOKIE_KEY);
    } catch {
      return;
    }
    if (seen === 'accepted') return;
    setShow(true);
    requestAnimationFrame(() => setIn(true));
  }, []);

  if (!show) return null;

  const accept = () => {
    try {
      localStorage.setItem(COOKIE_KEY, 'accepted');
    } catch {
      /* private mode — the notice just comes back next visit */
    }
    setOut(true);
    setTimeout(() => setShow(false), 300);
  };

  return (
    <div
      id="cookiebar"
      role="region"
      aria-label="Cookie notice"
      className={(inState ? 'is-in' : '') + (out ? ' is-out' : '')}
    >
      <p>
        We keep a little of this site in your browser — your session, your seats, and the recordings
        you&rsquo;ve unlocked. Nothing is sold and nothing follows you elsewhere.{' '}
        <Link href="/privacy#cookies">Cookie policy</Link>
      </p>
      <button className="btn" type="button" onClick={accept}>
        Accept
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ toasts */
export function Toasts({ items }) {
  if (!items?.length) return null;
  return (
    <div id="toasts" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={'toast ' + (t.kind || '')}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* Nav + footer chrome around a page's own <main>. */
export default function SiteShell({ active, children, toasts }) {
  return (
    <>
      <Nav active={active} />
      <main id="main">{children}</main>
      <Footer />
      <CookieNotice />
      <Toasts items={toasts} />
    </>
  );
}
