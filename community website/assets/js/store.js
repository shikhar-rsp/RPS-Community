/* =============================================================================
   RPS Cohorts — client store
   Stands in for Postgres + Prisma + Auth.js so the whole product is walkable
   without a backend. Every function here maps 1:1 to something the real build
   does on the server (PRD §9, §11).

   PROTOTYPE NOTE: session and enrollment live in localStorage. In production
   every mutating action re-checks the session server-side (PRD §11.3).
   ============================================================================= */

window.RPS = window.RPS || {};

(function () {
  const K = {
    data: 'rps.data',
    session: 'rps.session',
    enrollments: 'rps.enrollments',
    flags: 'rps.flags',
    events: 'rps.events',
    internal: 'rps.internal',
    users: 'rps.users',
    otp: 'rps.otp'
  };

  const read = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  };
  const write = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* private mode — the prototype still works, it just forgets */
    }
  };

  /* ---------------------------------------------------------------- content */
  let data = read(K.data, null);
  if (!data || data.version !== window.RPS_SEED.version) {
    data = JSON.parse(JSON.stringify(window.RPS_SEED));
    write(K.data, data);
  }
  /* config is site chrome — brand, logo, photography, the WhatsApp URL — not
     content /internal can edit. Always take it fresh from the seed, so editing
     seed.js shows up on the next reload instead of waiting for a version bump. */
  data.config = JSON.parse(JSON.stringify(window.RPS_SEED.config));

  const flags = Object.assign(
    { emptyUpcoming: false, recordingNotReady: false, failNextLogin: false },
    read(K.flags, {})
  );

  const store = {
    get data() {
      return data;
    },
    get config() {
      return data.config;
    },
    get flags() {
      return flags;
    },

    save() {
      write(K.data, data);
    },
    saveFlags() {
      write(K.flags, flags);
    },
    reset() {
      Object.keys(K).forEach((k) => localStorage.removeItem(K[k]));
    },

    /* ------------------------------------------------------------ workshops */
    workshops() {
      return data.workshops
        .slice()
        .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    },
    bySlug(slug) {
      return data.workshops.find((w) => w.slug === slug) || null;
    },
    byId(id) {
      return data.workshops.find((w) => w.id === id) || null;
    },

    /* Derived status, never a stored flag (PRD §8.2 acceptance criteria).
       Deviation from §9: the PRD derives "past" from dateTime AND recordingUrl,
       which parks a finished-but-unedited workshop back in Upcoming. We derive
       past from the date alone and treat the recording as separately ready.
       See README > "One correction to the spec". */
    isPast(w) {
      return new Date(w.dateTime) < new Date();
    },
    recordingReady(w) {
      return !!w.recordingUrl && !flags.recordingNotReady;
    },
    upcoming() {
      return flags.emptyUpcoming ? [] : store.workshops().filter((w) => !store.isPast(w));
    },
    past() {
      return store
        .workshops()
        .filter((w) => store.isPast(w))
        .reverse();
    },
    featuredPast() {
      const list = store.past();
      return list.find((w) => w.featured) || list[0] || null;
    },
    host(id) {
      return data.hosts.find((h) => h.id === id) || null;
    },
    faqs() {
      return data.faqs.slice().sort((a, b) => a.order - b.order);
    },
    testimonials(workshopId) {
      if (workshopId) return data.testimonials.filter((t) => t.workshopId === workshopId);
      return data.testimonials.filter((t) => t.featured);
    },

    /* ------------------------------------------------------------- capacity */
    enrolledCount(w) {
      const local = store
        .allEnrollments()
        .filter((e) => e.workshopId === w.id && e.status === 'REGISTERED').length;
      return (w.seededEnrollments || 0) + local;
    },
    seatsLeft(w) {
      if (!w.capacity) return null;
      return Math.max(0, w.capacity - store.enrolledCount(w));
    },
    isFull(w) {
      const left = store.seatsLeft(w);
      return left !== null && left === 0;
    },
    /* Copy deck §2 — "12 of 45 seats left" / "Full — waitlist open" */
    seatLabel(w) {
      if (!w.capacity) return 'Open to everyone';
      const left = store.seatsLeft(w);
      return left === 0 ? 'Full — waitlist open' : `${left} of ${w.capacity} seats left`;
    },

    /* ---------------------------------------------------------------- auth */
    session() {
      return read(K.session, null);
    },

    /* A tiny user table, so someone who logs back in with the same address
       keeps the name and WhatsApp number they gave us last time. */
    users() {
      return read(K.users, []);
    },
    userByEmail(email) {
      const e = String(email || '').trim().toLowerCase();
      return store.users().find((u) => u.email === e) || null;
    },
    upsertUser(patch) {
      const all = store.users();
      const i = all.findIndex((u) => u.email === patch.email);
      if (i < 0) all.push(patch);
      else all[i] = Object.assign({}, all[i], patch);
      write(K.users, all);
      const me = store.session();
      if (me && me.email === patch.email) {
        write(K.session, Object.assign({}, me, patch));
      }
      return store.userByEmail(patch.email);
    },

    /* -------- email + one-time code (no password, no sign-up step) -------- */
    /* Real build: POST the address, mail a short-lived code with Resend, and
       verify it server-side. Here the code is generated locally and shown on
       screen so the flow is walkable without a mail service. */
    requestCode(email) {
      const e = String(email || '').trim().toLowerCase();
      if (!store.validEmail(e)) return { error: 'bad-email' };
      const code = String(Math.floor(100000 + Math.random() * 900000));
      write(K.otp, { email: e, code, expiresAt: Date.now() + 10 * 60 * 1000, tries: 0 });
      RPS.track('login_code_requested', { email: e });
      return { code, email: e };
    },
    pendingCode() {
      return read(K.otp, null);
    },
    verifyCode(code) {
      const otp = read(K.otp, null);
      if (!otp) return { error: 'no-code' };
      if (Date.now() > otp.expiresAt) return { error: 'expired' };
      if (String(code).trim() !== otp.code) {
        otp.tries += 1;
        write(K.otp, otp);
        RPS.track('login_code_failed', {});
        return { error: 'wrong', tries: otp.tries };
      }
      localStorage.removeItem(K.otp);
      const known = store.userByEmail(otp.email);
      return { user: store.startSession({
        name: known ? known.name : store.nameFromEmail(otp.email),
        email: otp.email,
        phone: known ? known.phone : null,
        authProvider: 'EMAIL'
      }) };
    },
    validEmail(e) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim());
    },
    /* Tidy, not canonical — spacing is kept because a human reads this off a
       registration list. A real build would also store an E.164 form for
       de-duping and for whatever sends the WhatsApp reminder. */
    normalisePhone(p) {
      return String(p || '').trim().replace(/\s+/g, ' ');
    },
    /* Returns a {field: message} object, or null when everything's fine. */
    validateDetails(d) {
      const errors = {};
      if (!String(d.name || '').trim() || String(d.name).trim().length < 2) {
        errors.name = 'We need a name to put on the list.';
      }
      if (!store.validEmail(d.email)) {
        errors.email = 'That email doesn’t look right.';
      }
      const raw = String(d.whatsapp || '').trim();
      const digits = raw.replace(/\D/g, '');
      if (!digits) errors.whatsapp = 'We need a number for the reminder.';
      else if (!raw.startsWith('+')) errors.whatsapp = 'Add your country code, like +91.';
      else if (digits.length < 9 || digits.length > 15) errors.whatsapp = 'That’s not a whole number.';
      return Object.keys(errors).length ? errors : null;
    },
    nameFromEmail(email) {
      return String(email)
        .split('@')[0]
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();
    },

    /* Google — the one OAuth provider. LinkedIn was dropped in favour of the
       email code; re-adding it is another entry here plus a button. */
    signIn(providerKey) {
      const profile = data.demoAccounts[providerKey];
      if (!profile) return null;
      const known = store.userByEmail(profile.email);
      return store.startSession({
        name: known ? known.name : profile.name,
        email: profile.email,
        phone: known ? known.phone : null,
        authProvider: profile.authProvider
      });
    },

    startSession(profile) {
      const user = {
        id: 'u_' + profile.email.replace(/[^a-z0-9]/gi, ''),
        name: profile.name,
        email: profile.email,
        phone: profile.phone || null,
        authProvider: profile.authProvider,
        createdAt: new Date().toISOString()
      };
      write(K.session, user);
      store.upsertUser(user);

      /* PROTOTYPE ONLY: give a brand-new demo account the cohort-01 history it
         would have if they'd actually attended, so the "Been to" group and the
         "Watch it again" link in /account are walkable. Delete with the rest of
         the demo scaffolding — real attendance is set by RPS after a session. */
      const first = store.past().find((w) => w.featured);
      if (first && !store.allEnrollments().some((e) => e.userId === user.id)) {
        const all = store.allEnrollments();
        all.push({
          id: 'e_seed_' + user.id,
          userId: user.id,
          workshopId: first.id,
          status: 'ATTENDED',
          name: user.name,
          email: user.email,
          whatsapp: user.phone,
          enrolledAt: first.dateTime
        });
        write(K.enrollments, all);
      }

      RPS.track('login_succeeded', { provider: profile.authProvider });
      return user;
    },
    signOut() {
      localStorage.removeItem(K.session);
      RPS.track('signed_out', {});
    },
    initials(user) {
      if (!user) return '';
      return user.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0].toUpperCase())
        .join('');
    },

    /* --------------------------------------------------------- enrollments */
    allEnrollments() {
      return read(K.enrollments, []);
    },
    myEnrollments() {
      const me = store.session();
      if (!me) return [];
      return store
        .allEnrollments()
        .filter((e) => e.userId === me.id && e.status !== 'CANCELLED')
        .map((e) => Object.assign({}, e, { workshop: store.byId(e.workshopId) }))
        .filter((e) => e.workshop);
    },
    enrollmentFor(workshopId) {
      const me = store.session();
      if (!me) return null;
      return (
        store
          .allEnrollments()
          .find(
            (e) =>
              e.userId === me.id && e.workshopId === workshopId && e.status !== 'CANCELLED'
          ) || null
      );
    },
    /* Server-side equivalent: check capacity inside a transaction, then insert
       with status REGISTERED or WAITLISTED (PRD §8.3 step 3). */
    /* details = { name, email, whatsapp } — captured on the enrollment form,
       snapshotted onto the row (people change their profile; a registration
       list shouldn't change under RPS after the fact) and folded back into the
       user so the next enrollment is pre-filled. */
    enroll(workshopId, details) {
      const me = store.session();
      const w = store.byId(workshopId);
      if (!me || !w) return { error: 'no-session' };

      const d = details || {};
      const bad = store.validateDetails(d);
      if (bad) return { error: 'invalid', fields: bad };

      const existing = store.enrollmentFor(workshopId);
      if (existing) return { status: existing.status, already: true };

      const status = store.isFull(w) ? 'WAITLISTED' : 'REGISTERED';
      const all = store.allEnrollments();
      all.push({
        id: 'e_' + Date.now(),
        userId: me.id,
        workshopId,
        status,
        name: d.name.trim(),
        email: d.email.trim(),
        whatsapp: store.normalisePhone(d.whatsapp),
        enrolledAt: new Date().toISOString()
      });
      write(K.enrollments, all);
      store.upsertUser({
        email: me.email,
        name: d.name.trim(),
        phone: store.normalisePhone(d.whatsapp)
      });
      RPS.track(status === 'WAITLISTED' ? 'waitlisted' : 'enrollment_confirmed', {
        workshop: w.slug
      });
      return { status };
    },
    cancel(workshopId) {
      const me = store.session();
      if (!me) return;
      const all = store
        .allEnrollments()
        .filter((e) => !(e.userId === me.id && e.workshopId === workshopId));
      write(K.enrollments, all);
      RPS.track('enrollment_cancelled', { workshop: (store.byId(workshopId) || {}).slug });
    },
    /* Past workshops the signed-in user attended get ATTENDED treatment in the
       account view — derived here rather than stored. */
    statusLabel(status) {
      return { REGISTERED: 'Registered', WAITLISTED: 'Waitlisted', ATTENDED: 'Been there' }[
        status
      ];
    },

    /* ----------------------------------------------- internal console auth */
    internalSession() {
      return read(K.internal, null);
    },
    internalSignIn(email, password) {
      // Real build: INTERNAL_EMAIL + bcrypt(INTERNAL_PASSWORD_HASH) checked
      // server-side with a cookie session (PRD §12). Demo credential only.
      if (email.trim().toLowerCase() === 'rps@internal.demo' && password === 'cohorts') {
        write(K.internal, { email, at: new Date().toISOString() });
        return true;
      }
      return false;
    },
    internalSignOut() {
      localStorage.removeItem(K.internal);
    }
  };

  /* --------------------------------------------------- intent preservation */
  /* PRD §11.2 — carry "which workshop, which action" across the login trip. */
  RPS.intent = {
    set(obj) {
      try {
        sessionStorage.setItem('rps.intent', JSON.stringify(obj));
      } catch (e) {}
    },
    peek() {
      try {
        return JSON.parse(sessionStorage.getItem('rps.intent') || 'null');
      } catch (e) {
        return null;
      }
    },
    take() {
      const v = RPS.intent.peek();
      try {
        sessionStorage.removeItem('rps.intent');
      } catch (e) {}
      return v;
    }
  };

  /* ---------------------------------------------------------- analytics */
  /* PRD §10 — the funnel RPS cares about. Swap console for the real sink. */
  RPS.track = function (event, props) {
    const entry = { event, props: props || {}, at: new Date().toISOString() };
    const log = read(K.events, []);
    log.push(entry);
    write(K.events, log.slice(-60));
    if (window.console && console.debug) console.debug('[track]', event, entry.props);
    document.dispatchEvent(new CustomEvent('rps:track', { detail: entry }));
  };
  RPS.events = () => read(K.events, []);

  /* ------------------------------------------------------------ formatting */
  /* Everything renders in IST regardless of where the reader is, because the
     session runs at 6PM IST. Months are assembled by hand rather than left to
     a locale (en-GB abbreviates September as "Sept"). */
  const IST = 'Asia/Kolkata';
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const parts = (iso) =>
    new Intl.DateTimeFormat('en-US', {
      timeZone: IST, weekday: 'short', year: 'numeric', month: 'numeric',
      day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
    })
      .formatToParts(new Date(iso))
      .reduce((a, p) => ((a[p.type] = p.value), a), {});

  RPS.fmt = {
    // "Sat 12 Sep"
    dayShort(iso) {
      const p = parts(iso);
      return `${p.weekday} ${p.day} ${MON[Number(p.month) - 1]}`;
    },
    // "12 Jul 2026"
    dateFull(iso) {
      const p = parts(iso);
      return `${p.day} ${MON[Number(p.month) - 1]} ${p.year}`;
    },
    // "6PM IST" / "6:30PM IST"
    time(iso) {
      const p = parts(iso);
      const mins = p.minute === '00' ? '' : ':' + p.minute;
      return `${p.hour}${mins}${p.dayPeriod.toUpperCase()} IST`;
    },
    // Copy deck §3 meta line
    metaLine(w, host) {
      const who = host ? ` · with ${host.name}` : '';
      return RPS.store.isPast(w)
        ? `Held ${RPS.fmt.dateFull(w.dateTime)}${who}`
        : `${RPS.fmt.dayShort(w.dateTime)} · ${RPS.fmt.time(w.dateTime)} · Google Meet${who}`;
    }
  };

  RPS.store = store;
})();
