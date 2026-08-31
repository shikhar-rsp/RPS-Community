/* /internal — minimal content console (PRD §12)
   No CMS, no roles, no workflow. Create/edit forms over the models in §9,
   behind one credential. In production that credential is INTERNAL_EMAIL +
   bcrypt(INTERNAL_PASSWORD_HASH) checked server-side with a cookie session;
   here it is a demo check so the journey is walkable. */

(function () {
  const S = RPS.store;
  const esc = RPS.esc;
  RPS.boot('internal');

  const root = document.querySelector('[data-page]');

  /* ------------------------------------------------------------ date help */
  const toLocalInput = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const p = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(d).reduce((a, x) => ((a[x.type] = x.value), a), {});
    return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
  };
  const fromLocalInput = (v) => (v ? new Date(v + ':00+05:30').toISOString() : null);

  /* -------------------------------------------------------------- schemas */
  const SCHEMAS = {
    workshops: {
      label: 'Workshops',
      list: () => S.workshops(),
      title: (r) => r.title,
      sub: (r) =>
        `${RPS.fmt.metaLine(r, S.host(r.hostId))} · ${S.isPast(r) ? 'Past' : 'Upcoming'}`,
      blank: () => ({
        id: 'w_' + Date.now(), slug: '', title: '', summary: '', description: '',
        whoItsFor: [], curriculum: [], bannerArt: 'handoff',
        dateTime: new Date(Date.now() + 12096e5).toISOString(), capacity: 45,
        seededEnrollments: 0, meetLink: null, recordingUrl: null,
        hostId: (S.data.hosts[0] || {}).id, resources: [], cohortLabel: ''
      }),
      fields: [
        { k: 'title', label: 'Title' },
        { k: 'slug', label: 'Slug', hint: 'Used in the URL: /workshop.html?w=slug' },
        { k: 'cohortLabel', label: 'Cohort label', half: true },
        { k: 'bannerArt', label: 'Banner motif', type: 'select', half: true,
          options: [['handoff', 'Handoff'], ['proto', 'Prototyping'], ['portfolio', 'Portfolio'], ['landing', 'Landing page']] },
        { k: 'summary', label: 'Summary', hint: 'One line. Shows on cards and as the meta description.' },
        { k: 'description', label: 'Description', type: 'textarea' },
        { k: 'whoItsFor', label: 'This is for you if', type: 'lines', hint: 'One per line.' },
        { k: 'curriculum', label: 'What you’ll walk out with', type: 'lines', hint: 'One per line.' },
        { k: 'dateTime', label: 'Date & time (IST)', type: 'datetime', half: true },
        { k: 'capacity', label: 'Capacity', type: 'number', half: true },
        { k: 'seededEnrollments', label: 'Already enrolled', type: 'number', half: true,
          hint: 'Stands in for real enrollment rows.' },
        { k: 'hostId', label: 'Host', type: 'select', half: true,
          options: () => S.data.hosts.map((h) => [h.id, h.name]) },
        { k: 'meetLink', label: 'Google Meet link', hint: 'Set this before the session and it appears for registered members.' },
        { k: 'recordingUrl', label: 'Recording URL', hint: 'Add after the session to unlock the gated player.' }
      ]
    },

    hosts: {
      label: 'Hosts',
      list: () => S.data.hosts,
      title: (r) => r.name,
      sub: (r) => r.title,
      blank: () => ({ id: 'host_' + Date.now(), name: '', title: '', bio: '', photoUrl: null }),
      fields: [
        { k: 'name', label: 'Name', half: true },
        { k: 'title', label: 'Title', half: true },
        { k: 'bio', label: 'Bio', type: 'textarea', hint: 'One credibility line, one human line.' }
      ]
    },

    testimonials: {
      label: 'Testimonials',
      list: () => S.data.testimonials,
      title: (r) => '“' + r.quote.slice(0, 60) + (r.quote.length > 60 ? '…' : '') + '”',
      sub: (r) => `${r.name} · ${r.role}${r.featured ? ' · on the homepage' : ''}${r.placeholder ? ' · PLACEHOLDER' : ''}`,
      blank: () => ({ id: 't_' + Date.now(), name: '', role: '', quote: '', workshopId: null, featured: false }),
      fields: [
        { k: 'quote', label: 'Quote', type: 'textarea',
          hint: 'Ask attendees: “What can you do now that you couldn’t before?”' },
        { k: 'name', label: 'Name', half: true },
        { k: 'role', label: 'Role', half: true },
        { k: 'workshopId', label: 'From which workshop', type: 'select', half: true,
          options: () => [['', '—']].concat(S.workshops().map((w) => [w.id, w.title])) },
        { k: 'featured', label: 'Show on the homepage', type: 'checkbox', half: true }
      ]
    },

    faqs: {
      label: 'FAQ',
      list: () => S.faqs(),
      title: (r) => r.question,
      sub: (r) => r.answer,
      blank: () => ({ id: 'f_' + Date.now(), question: '', answer: '', order: S.data.faqs.length + 1 }),
      fields: [
        { k: 'question', label: 'Question' },
        { k: 'answer', label: 'Answer', type: 'textarea', hint: 'One or two lines. Longer belongs on a workshop page.' },
        { k: 'order', label: 'Order', type: 'number', half: true }
      ]
    }
  };

  /* ----------------------------------------------------------- login view */
  function renderLogin(error) {
    root.innerHTML = `
      <div class="wrap" style="display:grid;place-items:center;min-height:70vh;padding-block:56px">
        <div style="width:min(430px,100%)">
          <div class="modal" style="transform:none;box-shadow:var(--shadow-md);border:1px solid var(--line);text-align:left">
            <h3 style="text-align:center">Internal console</h3>
            <p style="text-align:center">Workshops, hosts, testimonials, FAQ.</p>
            ${error ? `<div class="banner" role="alert">That’s not it. Try again.</div>` : ''}
            <form data-form>
              <div class="field"><label for="ie">Email</label><input id="ie" name="email" type="email" autocomplete="username" required></div>
              <div class="field"><label for="ip">Password</label><input id="ip" name="password" type="password" autocomplete="current-password" required></div>
              <button class="btn full" type="submit">Log in</button>
            </form>
            <small>Prototype credential: <b>rps@internal.demo</b> / <b>cohorts</b>. The real console checks an env-var email and a bcrypt hash on the server.</small>
          </div>
        </div>
      </div>`;

    root.querySelector('[data-form]').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = new FormData(e.target);
      if (S.internalSignIn(f.get('email'), f.get('password'))) renderConsole('workshops');
      else renderLogin(true);
    });
  }

  /* --------------------------------------------------------- console view */
  let editing = null; // {type, record, isNew}

  const TABS = Object.keys(SCHEMAS).concat(['enrollments']);
  const tabLabel = (k) => (k === 'enrollments' ? 'Who’s coming' : SCHEMAS[k].label);

  function tabsHTML(active) {
    return `<div class="tabs" role="tablist">
      ${TABS.map((k) => `
        <button class="tab" role="tab" data-type="${k}" aria-selected="${k === active}">${esc(tabLabel(k))}</button>`).join('')}
    </div>`;
  }

  /* Read-only registration list — the reason we ask for a name, an email and a
     WhatsApp number at enrollment. Export is a CSV away in the real build. */
  function renderEnrollments() {
    const rows = S.allEnrollments()
      .filter((e) => e.status !== 'CANCELLED')
      .map((e) => Object.assign({}, e, { workshop: S.byId(e.workshopId) }))
      .filter((e) => e.workshop);

    const byWorkshop = {};
    rows.forEach((e) => {
      (byWorkshop[e.workshopId] = byWorkshop[e.workshopId] || []).push(e);
    });

    const groups = Object.keys(byWorkshop).map((id) => {
      const w = S.byId(id);
      const list = byWorkshop[id];
      const reg = list.filter((e) => e.status === 'REGISTERED').length;
      const wait = list.filter((e) => e.status === 'WAITLISTED').length;
      return `
        <h2 class="group-h">${esc(w.title)}
          <span class="count">${reg} registered${wait ? ` · ${wait} waitlisted` : ''}${w.capacity ? ` · ${w.capacity} seats` : ''}</span>
        </h2>
        ${list.map((e) => `
          <div class="arow">
            <div style="min-width:0">
              <div class="t">${esc(e.name || '—')}</div>
              <div class="s">${esc(e.email || '—')}${e.whatsapp ? ' · ' + esc(e.whatsapp) : ' · no number'}</div>
            </div>
            <div class="right">
              <span class="status ${e.status === 'WAITLISTED' ? 'wait' : e.status === 'ATTENDED' ? 'att' : 'reg'}">
                ${esc(S.statusLabel(e.status) || e.status)}
              </span>
            </div>
          </div>`).join('')}`;
    }).join('');

    root.innerHTML = `
      <div class="wrap page-top" style="padding-bottom:80px">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap">
          <div>
            <h1 style="font-size:clamp(2rem,4vw,2.8rem)">Who’s coming</h1>
            <p class="lede" style="margin-top:8px">Name, email and WhatsApp number, as given at enrollment.</p>
          </div>
          <button class="btn quiet sm" data-logout>Log out</button>
        </div>
        ${tabsHTML('enrollments')}
        ${groups || '<div class="callout plain"><p>Nobody’s enrolled yet.</p></div>'}
      </div>`;

    wireTabs();
  }

  function wireTabs() {
    root.querySelectorAll('[data-type]').forEach((t) =>
      t.addEventListener('click', () =>
        t.dataset.type === 'enrollments' ? renderEnrollments() : renderConsole(t.dataset.type)
      )
    );
    root.querySelector('[data-logout]').addEventListener('click', () => {
      S.internalSignOut();
      renderLogin(false);
    });
  }

  function renderConsole(type) {
    if (type === 'enrollments') return renderEnrollments();
    const schema = SCHEMAS[type];
    const rows = schema.list();

    root.innerHTML = `
      <div class="wrap page-top" style="padding-bottom:80px">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap">
          <div>
            <h1 style="font-size:clamp(2rem,4vw,2.8rem)">Internal console</h1>
            <p class="lede" style="margin-top:8px">Changes show up on the site immediately. No redeploy.</p>
          </div>
          <button class="btn quiet sm" data-logout>Log out</button>
        </div>

        ${tabsHTML(type)}

        <div style="display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:16px;flex-wrap:wrap">
          <span class="micro">${rows.length} ${esc(schema.label.toLowerCase())}</span>
          <button class="btn sm" data-new>+ New</button>
        </div>

        <div data-rows>
          ${rows.map((r) => `
            <div class="arow">
              <div style="min-width:0">
                <div class="t">${esc(schema.title(r))}</div>
                <div class="s">${esc(schema.sub(r))}</div>
              </div>
              <div class="right">
                <button class="btn quiet sm" data-edit="${esc(r.id)}">Edit</button>
                <button class="linkish" data-del="${esc(r.id)}">Delete</button>
              </div>
            </div>`).join('') || '<div class="callout plain"><p>Nothing here yet.</p></div>'}
        </div>

        <div data-editor style="margin-top:28px"></div>
      </div>`;

    wireTabs();
    root.querySelector('[data-new]').addEventListener('click', () => {
      editing = { type, record: schema.blank(), isNew: true };
      renderEditor();
    });
    root.querySelectorAll('[data-edit]').forEach((b) =>
      b.addEventListener('click', () => {
        const rec = schema.list().find((r) => r.id === b.dataset.edit);
        editing = { type, record: JSON.parse(JSON.stringify(rec)), isNew: false };
        renderEditor();
      })
    );
    root.querySelectorAll('[data-del]').forEach((b) =>
      b.addEventListener('click', () => {
        const arr = S.data[type];
        const i = arr.findIndex((r) => r.id === b.dataset.del);
        if (i < 0) return;
        if (!confirm('Delete “' + schema.title(arr[i]) + '”? This can’t be undone.')) return;
        arr.splice(i, 1);
        S.save();
        RPS.ui.toast('Deleted.');
        renderConsole(type);
      })
    );
  }

  /* ------------------------------------------------------------- editor */
  function fieldHTML(f, rec) {
    const v = rec[f.k];
    const id = 'f_' + f.k;
    const wrapOpen = `<div class="field" ${f.half ? '' : 'style="grid-column:1/-1"'}>`;
    let control;

    if (f.type === 'textarea') {
      control = `<textarea id="${id}" name="${f.k}">${esc(v || '')}</textarea>`;
    } else if (f.type === 'lines') {
      control = `<textarea id="${id}" name="${f.k}" rows="4">${esc((v || []).join('\n'))}</textarea>`;
    } else if (f.type === 'select') {
      const opts = typeof f.options === 'function' ? f.options() : f.options;
      control = `<select id="${id}" name="${f.k}">${opts
        .map(([val, lab]) => `<option value="${esc(val)}"${String(v || '') === String(val) ? ' selected' : ''}>${esc(lab)}</option>`)
        .join('')}</select>`;
    } else if (f.type === 'checkbox') {
      control = `<label style="display:flex;gap:10px;align-items:center;font-weight:500">
        <input id="${id}" name="${f.k}" type="checkbox"${v ? ' checked' : ''} style="width:20px;min-height:20px">
        <span>${esc(f.label)}</span></label>`;
      return `${wrapOpen}${control}</div>`;
    } else if (f.type === 'datetime') {
      control = `<input id="${id}" name="${f.k}" type="datetime-local" value="${esc(toLocalInput(v))}">`;
    } else if (f.type === 'number') {
      control = `<input id="${id}" name="${f.k}" type="number" value="${esc(v == null ? '' : v)}">`;
    } else {
      control = `<input id="${id}" name="${f.k}" type="text" value="${esc(v == null ? '' : v)}">`;
    }

    return `${wrapOpen}<label for="${id}">${esc(f.label)}</label>${control}
      ${f.hint ? `<div class="hint">${esc(f.hint)}</div>` : ''}</div>`;
  }

  function renderEditor() {
    const { type, record, isNew } = editing;
    const schema = SCHEMAS[type];
    const slot = root.querySelector('[data-editor]');

    slot.innerHTML = `
      <div class="card" style="padding:28px">
        <h3 style="margin-bottom:18px">${isNew ? 'New' : 'Edit'} ${esc(schema.label.replace(/s$/, ''))}</h3>
        <form data-edit-form class="form-grid">
          ${schema.fields.map((f) => fieldHTML(f, record)).join('')}
          <div style="grid-column:1/-1;display:flex;gap:10px;margin-top:8px">
            <button class="btn" type="submit">Save</button>
            <button class="btn quiet" type="button" data-cancel>Cancel</button>
          </div>
        </form>
      </div>`;

    slot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    slot.querySelector('[data-cancel]').addEventListener('click', () => {
      editing = null;
      renderConsole(type);
    });

    slot.querySelector('[data-edit-form]').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);

      schema.fields.forEach((f) => {
        const raw = fd.get(f.k);
        if (f.type === 'lines') {
          record[f.k] = String(raw || '').split('\n').map((s) => s.trim()).filter(Boolean);
        } else if (f.type === 'number') {
          record[f.k] = raw === '' ? null : Number(raw);
        } else if (f.type === 'checkbox') {
          record[f.k] = fd.get(f.k) != null;
        } else if (f.type === 'datetime') {
          record[f.k] = fromLocalInput(raw);
        } else {
          record[f.k] = raw === '' ? null : String(raw);
        }
      });

      if (type === 'workshops') {
        record.slug =
          (record.slug || record.title || '')
            .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ||
          'workshop-' + Date.now();
        record.resources = record.resources || [];
        record.placeholderFixed = true;
        delete record.needsCopy;
      }
      if (type === 'testimonials') delete record.placeholder;

      const arr = S.data[type];
      const i = arr.findIndex((r) => r.id === record.id);
      if (i < 0) arr.push(record);
      else arr[i] = record;
      S.save();

      RPS.ui.toast('Saved. It’s live on the site.', 'good');
      editing = null;
      renderConsole(type);
    });
  }

  /* ---------------------------------------------------------------- boot */
  if (S.internalSession()) renderConsole('workshops');
  else renderLogin(false);
})();
