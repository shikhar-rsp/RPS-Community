/* =============================================================================
   Sending through Google Workspace (Gmail SMTP), with no extra dependency.

   Used when the site has no Resend key but has a Workspace mailbox and an app
   password for it:

     GMAIL_USER          the mailbox that sends, e.g. cohorts@rockpaperscissors.studio
     GMAIL_APP_PASSWORD  a 16-letter app password for that mailbox (spaces fine)
     GMAIL_FROM_NAME     optional, defaults to "RPS Cohorts"

   Mail goes from GMAIL_USER itself. Gmail rewrites any other From address to
   the signed-in mailbox anyway, so saying so up front keeps the two in step.

   A small SMTP client over node:tls — implicit TLS on 465, AUTH PLAIN, one
   message per MAIL/RCPT/DATA, and RSET between messages so a whole list can
   go down one connection. Server only.
   ============================================================================= */

import tls from "node:tls";
import crypto from "node:crypto";

const HOST = "smtp.gmail.com";
const PORT = 465;
const TIMEOUT_MS = 20000;

export function gmailConfigured() {
  return !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function user() {
  return String(process.env.GMAIL_USER || "").trim();
}

function fromHeader() {
  const name = String(process.env.GMAIL_FROM_NAME || "RPS Cohorts").replace(/["\r\n]/g, "");
  return `${encodeWord(name)} <${user()}>`;
}

/* Non-ASCII header text as an RFC 2047 encoded word; plain ASCII untouched. */
function encodeWord(s) {
  const str = String(s || "");
  // eslint-disable-next-line no-control-regex
  if (/^[\x20-\x7e]*$/.test(str)) return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, "")}"` : str;
  return "=?UTF-8?B?" + Buffer.from(str, "utf8").toString("base64") + "?=";
}

function b64lines(s) {
  return Buffer.from(String(s || ""), "utf8").toString("base64").replace(/.{1,76}/g, "$&\r\n");
}

function cleanAddress(a) {
  const s = String(a || "").trim();
  return /^[^\s<>@"]+@[^\s<>@"]+$/.test(s) ? s : null;
}

function buildMessage({ to, subject, html, text, replyTo }) {
  const boundary = "rps-" + crypto.randomBytes(12).toString("hex");
  const domain = user().split("@")[1] || "localhost";
  const headers = [
    `From: ${fromHeader()}`,
    `To: <${to}>`,
    replyTo ? `Reply-To: <${replyTo}>` : null,
    `Subject: ${encodeWord(String(subject || "").replace(/[\r\n]+/g, " "))}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${domain}>`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ].filter(Boolean);

  const parts = [];
  if (text) {
    parts.push(
      `--${boundary}\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n` +
        b64lines(text)
    );
  }
  if (html) {
    parts.push(
      `--${boundary}\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n` +
        b64lines(html)
    );
  }
  const raw = headers.join("\r\n") + "\r\n\r\n" + parts.join("") + `--${boundary}--\r\n`;
  // Dot-stuffing: a line that starts with "." would otherwise end DATA early.
  return raw.replace(/\r\n\./g, "\r\n..");
}

/* One connection. `cmd()` writes a line and resolves with the server's whole
   reply ({ code, text }); a reply is complete when a line has a space after
   its three-digit code. */
function connect() {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({ host: HOST, port: PORT, servername: HOST });
    let buf = "";
    const waiting = [];
    let failed = null;

    const fail = (err) => {
      failed = failed || err;
      while (waiting.length) waiting.shift().reject(failed);
    };

    socket.setTimeout(TIMEOUT_MS, () => {
      fail(new Error("SMTP timed out"));
      socket.destroy();
    });
    socket.on("error", (e) => {
      fail(e);
      reject(e);
    });
    socket.on("close", () => fail(new Error("SMTP connection closed")));
    socket.on("data", (chunk) => {
      buf += chunk.toString("utf8");
      let m;
      // A complete reply: lines ending in CRLF, the last one "NNN text".
      while ((m = buf.match(/^((?:\d{3}-[^\r\n]*\r\n)*)(\d{3}) ([^\r\n]*)\r\n/))) {
        buf = buf.slice(m[0].length);
        const w = waiting.shift();
        if (w) w.resolve({ code: Number(m[2]), text: (m[1] + m[2] + " " + m[3]).trim() });
      }
    });

    const next = () =>
      new Promise((res, rej) => {
        if (failed) return rej(failed);
        waiting.push({ resolve: res, reject: rej });
      });

    const cmd = async (line, expect) => {
      const reply = next();
      if (line !== null) socket.write(line + "\r\n");
      const r = await reply;
      if (expect && !expect.includes(r.code)) {
        const e = new Error(`SMTP ${r.code}: ${r.text.slice(0, 200)}`);
        e.code = r.code;
        throw e;
      }
      return r;
    };

    socket.once("secureConnect", () => resolve({ socket, cmd }));
  });
}

/* Opens a signed-in session. `send()` resolves to { ok } or { ok:false, error }
   and never throws; `close()` is always safe to call. */
export async function openGmail() {
  const pass = String(process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");
  let conn;
  try {
    conn = await connect();
    await conn.cmd(null, [220]);
    await conn.cmd("EHLO cohorts.rockpaperscissors.studio", [250]);
    const token = Buffer.from(`\u0000${user()}\u0000${pass}`, "utf8").toString("base64");
    await conn.cmd("AUTH PLAIN " + token, [235]);
  } catch (e) {
    try { conn?.socket.destroy(); } catch { /* already gone */ }
    const why = e?.code === 535 ? "Google rejected the app password." : e?.message || "Could not reach Gmail.";
    console.error(`[mail] Gmail sign-in failed: ${why}`);
    return {
      ok: false,
      error: why,
      send: async () => ({ ok: false, error: why }),
      close: () => {},
    };
  }

  let dirty = false;
  return {
    ok: true,
    async send({ to, subject, html, text, replyTo }) {
      const rcpt = cleanAddress(to);
      if (!rcpt) return { ok: false, error: "Bad address." };
      try {
        if (dirty) await conn.cmd("RSET", [250]);
        dirty = true;
        await conn.cmd(`MAIL FROM:<${user()}>`, [250]);
        await conn.cmd(`RCPT TO:<${rcpt}>`, [250, 251]);
        await conn.cmd("DATA", [354]);
        await conn.cmd(buildMessage({ to: rcpt, subject, html, text, replyTo }) + "\r\n.", [250]);
        return { ok: true };
      } catch (e) {
        console.error(`[mail] Gmail could not send "${subject}" to ${rcpt}: ${e?.message}`);
        return { ok: false, error: e?.message || "Gmail refused it." };
      }
    },
    close() {
      try {
        conn.socket.write("QUIT\r\n");
        conn.socket.end();
      } catch { /* already closed */ }
    },
  };
}
