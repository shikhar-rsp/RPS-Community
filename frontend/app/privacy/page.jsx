'use client';
import React from 'react';
import SiteShell from '@/components/community/SiteShell';
import { useReveal } from '@/lib/community/hooks';

export default function PrivacyPage() {
  useReveal([]);
  return (
    <SiteShell active="legal">
      <div className="wrap page-top legal">
        <span className="eyebrow reveal">Legal</span>
        <h1 className="reveal">Privacy &amp; cookie policy</h1>
        <p className="lede reveal">
          The short version: we ask for a name, an email and a WhatsApp number so we can hold your
          seat and send you the link. That&rsquo;s it.
        </p>

        <section className="reveal">
          <h2>What we collect</h2>
          <p>
            Your name and email address when you sign in, and your WhatsApp number when you take a
            seat. The number is the one thing we can&rsquo;t work out on our own, and it&rsquo;s
            where the reminder and the Meet link go.
          </p>
        </section>

        <section className="reveal">
          <h2>Why we collect it</h2>
          <p>
            To hold your seat, to send you the joining link and a reminder, and to let you back into
            the recordings and files afterwards. We do not sell it and we do not pass it to
            advertisers.
          </p>
        </section>

        <section className="reveal">
          <h2>Who else sees it</h2>
          <p>
            Google, because the sessions run on Google Meet and signing in with Google is an option.
            WhatsApp, because that&rsquo;s where the reminder goes. Each has its own policy covering
            what it does with that.
          </p>
        </section>

        <section id="cookies" className="reveal">
          <h2>Cookies and what&rsquo;s kept in your browser</h2>
          <p>
            This site does not run advertising or cross-site tracking cookies. What it keeps is
            stored in your own browser, on your own device:
          </p>
          <ul className="legal-list">
            <li>
              <b>Your session</b> — so you stay signed in between visits.
            </li>
            <li>
              <b>Your seats and enrolments</b> — so the site knows which workshops are yours.
            </li>
            <li>
              <b>Your cookie choice</b> — so the notice doesn&rsquo;t ask you twice.
            </li>
          </ul>
          <p>
            Clearing your browser&rsquo;s site data for this domain removes all of it. Nothing is
            left behind on our side when you do.
          </p>
        </section>

        <section className="reveal">
          <h2>Getting your data out, or deleted</h2>
          <p>
            Email <a href="mailto:cohorts@rockpaperscissors.studio">cohorts@rockpaperscissors.studio</a> and ask. We&rsquo;ll send
            you what we hold, or delete it, whichever you want.
          </p>
        </section>

        <section className="reveal">
          <h2>Changes</h2>
          <p>If what we collect changes, this page changes with it.</p>
        </section>
      </div>
    </SiteShell>
  );
}
