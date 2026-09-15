/* =============================================================================
   Is the confirmation email actually going to send?

     node scripts/check-mail.mjs                  # check the setup only
     node scripts/check-mail.mjs you@example.com  # ...and send one real email

   Run it with the production key in the environment:

     RESEND_API_KEY=re_xxx node scripts/check-mail.mjs you@example.com

   Checks the three things that go wrong, in the order they go wrong: the key is
   missing, the key is rejected, or the domain is not verified — which is the one
   that fails quietly, because Resend accepts the request and then delivers to
   nobody except your own account address.
   ============================================================================= */

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.MAIL_FROM || 'RPS Cohorts <cohorts@rockpaperscissors.studio>';

const ok = (m) => console.log('  PASS  ' + m);
const bad = (m) => console.log('  FAIL  ' + m);
const info = (m) => console.log('        ' + m);

function fromDomain() {
  const m = FROM.match(/<([^>]+)>/);
  return (m ? m[1] : FROM).split('@')[1] || '';
}

async function api(path) {
  const res = await fetch('https://api.resend.com' + path, {
    headers: { Authorization: 'Bearer ' + KEY },
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

async function main() {
  const to = process.argv[2];
  console.log('\nResend setup check\n');

  // 1 -------------------------------------------------------------- the key
  if (!KEY) {
    bad('RESEND_API_KEY is not set in this shell.');
    info('Nothing will send. The app treats this as "skip" rather than an');
    info('error, so enrolling keeps working and each skipped mail is logged.');
    info('');
    info('  RESEND_API_KEY=re_xxx node scripts/check-mail.mjs you@example.com');
    return 1;
  }
  ok('RESEND_API_KEY is set (' + KEY.slice(0, 6) + '…).');

  // 2 ----------------------------------------------------------- the domain
  const domains = await api('/domains');

  // A bad key comes back 400 "API key is invalid", not the 401 you would
  // expect, so the message is what separates "wrong key" from "Resend is
  // having a bad day". The status alone does not.
  const authFailed =
    [401, 403].includes(domains.status) || /api key/i.test(domains.body?.message || '');

  if (authFailed) {
    bad('Resend rejected the key: ' + (domains.body?.message || domains.status));
    info('Wrong key, or it was revoked. Make a new one with Sending access.');
    return 1;
  }
  if (domains.status !== 200) {
    bad('Could not reach Resend (' + domains.status + ').');
    return 1;
  }
  ok('Resend accepted the key.');

  const want = fromDomain();
  const list = domains.body?.data || [];
  const match = list.find((d) => d.name === want);

  if (!match) {
    bad('"' + want + '" is not in this account’s Domains.');
    info('MAIL_FROM is ' + FROM);
    info(list.length ? 'This account has: ' + list.map((d) => d.name).join(', ') : 'No domains added yet.');
    info('');
    info('Until the domain is added AND verified, Resend delivers only to your');
    info('own Resend account address. Every other recipient fails silently.');
    return 1;
  }

  if (match.status !== 'verified') {
    bad('"' + want + '" is added, but its status is "' + match.status + '".');
    info('The DKIM/SPF records are not live yet — DNS can take a few hours.');
    info('This is the failure that looks like success: sends are accepted and');
    info('then arrive for nobody but your own account address.');
    return 1;
  }
  ok('"' + want + '" is verified. Mail can go to any address.');

  // 3 ------------------------------------------------------------ a real send
  if (!to) {
    console.log('\nSetup is good. Pass an address to send a real test:\n');
    console.log('  node scripts/check-mail.mjs you@example.com\n');
    return 0;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject: 'RPS Cohorts — mail setup test',
      text:
        'If you are reading this, the confirmation email will reach people who ' +
        'register for a workshop.\n\nSent by scripts/check-mail.mjs.',
    }),
  });

  if (!res.ok) {
    bad('Send failed (' + res.status + '): ' + (await res.text()).slice(0, 300));
    return 1;
  }
  ok('Sent to ' + to + '. Check the inbox, and the spam folder.');
  console.log('');
  return 0;
}

// exitCode rather than process.exit(), so the process winds down on its own
// with the fetch sockets closed. Exiting under them trips a libuv assertion on
// Windows and prints a stack trace over an otherwise clean result.
process.exitCode = await main();
