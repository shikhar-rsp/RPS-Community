'use client';
import React from 'react';
import Link from 'next/link';
import SiteShell from '@/components/community/SiteShell';

export default function NotFound() {
  return (
    <SiteShell active="">
      <div
        className="wrap"
        style={{
          display: 'grid',
          placeItems: 'center',
          minHeight: '66vh',
          paddingBlock: 64,
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '44ch' }}>
          <span className="pill plain" style={{ display: 'inline-block', marginBottom: 18 }}>
            404
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem,5vw,3.4rem)' }}>This one&rsquo;s not here.</h1>
          <p className="lede" style={{ marginInline: 'auto' }}>
            Try the workshops page.
          </p>
          <div className="cta-row" style={{ justifyContent: 'center' }}>
            <Link className="btn" href="/workshops">
              See workshops
            </Link>
            <Link className="btn ghost" href="/">
              Back home
            </Link>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
