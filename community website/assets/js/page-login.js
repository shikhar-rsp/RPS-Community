/* /login — a real page, not a modal.
   Two ways in: Google, or an email address confirmed with a six-digit code.
   Whatever sent you here is remembered and resumed afterwards (PRD §11.2). */

(function () {
  const S = RPS.store;
  const esc = RPS.esc;
  RPS.boot('login');

  const box = document.querySelector('[data-loginbox]');
  const params = new URLSearchParams(location.search);
  const stored = RPS.intent.peek();

  const intentKey = params.get('intent') || (stored && stored.intent) || 'generic';
  const nextParam = params.get('next');

  function destination() {
    if (nextParam) return nextParam;
    const it = RPS.intent.take();
    if (it && it.url) return it.url;
    return 'index.html';
  }

  function finish() {
    RPS.intent.take();
    location.href = destination();
  }

  /* Already signed in — nothing to do here. */
  if (S.session()) {
    const me = S.session();
    box.innerHTML = `
      <h2 style="font-size:1.6rem">You’re already logged in</h2>
      <p>${esc(me.name)} · ${esc(me.email)}</p>
      <a class="btn full" href="${esc(destination())}">Carry on</a>
      <button class="linkish" data-switch style="margin-top:10px">Log in as someone else</button>`;
    box.querySelector('[data-switch]').addEventListener('click', () => {
      S.signOut();
      location.reload();
    });
    return;
  }

  /* ----------------------------------------------------------- step: choose */
  function renderChoose(error, prefillEmail) {
    box.innerHTML = `
      <h2 style="font-size:1.7rem">Log in to RPS Cohorts</h2>
      <p>${esc(RPS.intentCopy[intentKey] || RPS.intentCopy.generic)}</p>

      ${error ? `<div class="banner" role="alert" style="text-align:left">${esc(error)}</div>` : ''}

      <button class="oauth" data-google>${RPS.providerSvg.google}Continue with Google</button>

      <div class="or"><span>or</span></div>

      <form data-email-form novalidate>
        <div class="field">
          <label for="email">Your email</label>
          <input id="email" name="email" type="email" inputmode="email" autocomplete="email"
                 placeholder="you@email.com" value="${esc(prefillEmail || '')}">
          <div class="hint" data-err-email hidden></div>
        </div>
        <button class="btn full" type="submit">Email me a code</button>
      </form>

      <small>We use this to remember your seats. No marketing emails you didn’t ask for.</small>`;

    box.querySelector('[data-google]').addEventListener('click', googleLogin);
    box.querySelector('[data-email-form]').addEventListener('submit', (e) => {
      e.preventDefault();
      sendCode(e.target.email.value);
    });
    setTimeout(() => {
      const i = box.querySelector('#email');
      if (prefillEmail && i) i.focus();
    }, 40);
  }

  /* --------------------------------------------------------------- Google */
  function googleLogin() {
    const btn = box.querySelector('[data-google]');
    btn.disabled = true;
    btn.innerHTML = 'Talking to Google…';
    setTimeout(() => {
      if (S.flags.failNextLogin) {
        S.flags.failNextLogin = false;
        S.saveFlags();
        RPS.track('login_failed', { provider: 'GOOGLE' });
        renderChoose('That didn’t work. Try again, or use your email.');
        return;
      }
      S.signIn('google');
      RPS.ui.renderNavRight();
      RPS.ui.toast('Logged in.', 'good');
      finish();
    }, 700);
  }

  /* ----------------------------------------------------------- step: code */
  function sendCode(email) {
    const res = S.requestCode(email);
    if (res.error) {
      const err = box.querySelector('[data-err-email]');
      err.hidden = false;
      err.style.color = 'var(--sun-ink)';
      err.textContent = 'That email doesn’t look right.';
      box.querySelector('#email').focus();
      return;
    }
    renderCode(res.email, res.code, null);
  }

  function renderCode(email, code, error) {
    box.innerHTML = `
      <div class="lockicon" aria-hidden="true">✉️</div>
      <h2 style="font-size:1.7rem">Check your email</h2>
      <p>Six digits, sent to <b>${esc(email)}</b>. Good for ten minutes.</p>

      <div class="banner info" role="status" style="text-align:left">
        <span><b>Prototype:</b> no email actually goes out. Your code is
        <b style="letter-spacing:.12em">${esc(code)}</b>.</span>
      </div>

      ${error ? `<div class="banner" role="alert" style="text-align:left">${esc(error)}</div>` : ''}

      <form data-code-form novalidate>
        <div class="field">
          <label for="code">The code</label>
          <input id="code" name="code" class="code-input" type="text" inputmode="numeric"
                 autocomplete="one-time-code" maxlength="6" placeholder="000000">
        </div>
        <button class="btn full" type="submit">Confirm</button>
      </form>

      <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:6px">
        <button class="linkish" data-resend>Send it again</button>
        <button class="linkish" data-change>Use a different email</button>
      </div>`;

    const form = box.querySelector('[data-code-form]');
    const input = box.querySelector('#code');
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 6);
      if (input.value.length === 6) form.requestSubmit();
    });
    setTimeout(() => input.focus(), 60);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const res = S.verifyCode(input.value);
      if (res.error === 'wrong') {
        renderCode(email, code, 'That code’s not right. Have another go.');
        return;
      }
      if (res.error === 'expired') {
        renderCode(email, S.requestCode(email).code, 'That one timed out. Here’s a fresh code.');
        return;
      }
      if (res.error) {
        renderChoose('Something went sideways. Start again?', email);
        return;
      }
      RPS.ui.renderNavRight();
      RPS.ui.toast('Logged in.', 'good');
      finish();
    });

    box.querySelector('[data-resend]').addEventListener('click', () => {
      const fresh = S.requestCode(email);
      renderCode(email, fresh.code, null);
      RPS.ui.toast('New code sent.');
    });
    box.querySelector('[data-change]').addEventListener('click', () => renderChoose(null, email));
  }

  /* ---------------------------------------------------------------- boot */
  renderChoose(null, null);
  RPS.track('login_page_viewed', { intent: intentKey });
})();
