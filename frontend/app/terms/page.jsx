'use client';
import React from 'react';
import SiteShell from '@/components/community/SiteShell';
import { useReveal } from '@/lib/community/hooks';

export default function TermsPage() {
  useReveal([]);
  return (
    <SiteShell active="legal">
      <div className="wrap page-top legal">
        <span className="eyebrow reveal">Legal</span>
        <h1 className="reveal">Terms &amp; conditions</h1>
        <p className="lede reveal">
          The short version: the workshops are free, the seats are first come first served, and the
          recordings are yours to learn from.
        </p>

        <p className="legal-note reveal">
          <strong>Placeholder.</strong> The wording below sets out the structure and the intent, but
          it has not been written or reviewed by a lawyer. Replace each section with real terms
          before this site goes live.
        </p>

        <section className="reveal">
          <h2>Who these terms are between</h2>
          <p>
            These terms cover your use of this site and any workshop you attend through it, between
            you and RPS. By taking a seat you accept them.
          </p>
        </section>

        <section className="reveal">
          <h2>Taking a seat</h2>
          <p>
            Seats are free and limited, and are allocated in the order they are confirmed.
            Registering does not guarantee attendance if a session is rescheduled or cancelled. We
            will tell you on the number you gave us if that happens.
          </p>
        </section>

        <section className="reveal">
          <h2>What we ask of you</h2>
          <p>
            Sessions are live and shared with other people. We ask that you do not disrupt them,
            record them yourself, or redistribute the recording, the files or the prompts we
            provide.
          </p>
        </section>

        <section className="reveal">
          <h2>The material we give you</h2>
          <p>
            Recordings, guides, briefs and prompt libraries stay the property of RPS. You may use
            them in your own work and your own portfolio. You may not resell them or present them as
            your own teaching material.
          </p>
        </section>

        <section className="reveal">
          <h2>Client work shown in sessions</h2>
          <p>
            We build real client work in front of you. Anything you see that has not yet been made
            public is shared in confidence and should not be published, screenshotted or discussed
            outside the session.
          </p>
        </section>

        <section className="reveal">
          <h2>No guarantees</h2>
          <p>
            The workshops are educational. We do not promise a job, a client, or a particular
            outcome, and we are not liable for decisions you make in your own work off the back of
            them.
          </p>
        </section>

        <section className="reveal">
          <h2>Changes</h2>
          <p>
            We may update these terms. The version on this page is the one that applies, and
            material changes will be flagged before your next session.
          </p>
        </section>

        <section className="reveal">
          <h2>Getting in touch</h2>
          <p>
            Questions about any of this: <a href="mailto:hello@rps.design">hello@rps.design</a>.
          </p>
        </section>
      </div>
    </SiteShell>
  );
}
