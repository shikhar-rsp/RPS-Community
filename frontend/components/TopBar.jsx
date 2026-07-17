"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { css } from "@/lib/css";
import { Box } from "@/components/Box";
import { createClient } from "@/lib/supabase/client";

// Shared top navigation bar used by the Dashboard and the Workshop landing page.
// `active` marks which link is highlighted: "dashboard" | "workshops".
export function TopBar({ active = "dashboard" }) {
  const router = useRouter();
  const supabase = createClient();

  const onSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
    router.refresh();
  };

  const activeCls = "btn btn--secondary btn--sm";
  const inactiveCls = "btn btn--tertiary btn--sm";

  return (
    <nav style={css("position:sticky;top:0;z-index:50;background:rgba(19,18,17,0.82);backdrop-filter:blur(16px);border-bottom:1px solid var(--border)")}>
      <div style={css("max-width:1160px;margin:0 auto;padding:0 clamp(16px,3vw,24px);height:68px;display:flex;align-items:center;gap:clamp(16px,3vw,32px)")}>
        <Link href="/" style={css("display:flex;align-items:center;gap:10px;color:var(--text);flex:none")}>
          <img src="/assets/academy-logo-full.png" alt="Academy" style={css("height:36px;width:auto;object-fit:contain;display:block")} />
          <span style={css("font-weight:700;font-size:18px;letter-spacing:-0.02em")}>Academy</span>
        </Link>
        <div className="db-navlinks" style={css("display:flex;align-items:center;gap:6px;flex:none")}>
          <Link href="/dashboard" className={active === "dashboard" ? activeCls : inactiveCls}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
            Dashboard
          </Link>
          <Link href="/" className={active === "workshops" ? activeCls : inactiveCls}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" /></svg>
            Workshops
          </Link>
        </div>
        <div className="db-search" style={css("flex:1 1 auto;min-width:0;display:flex;justify-content:center")}>
          <div style={css("position:relative;width:100%;max-width:380px")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={css("position:absolute;left:14px;top:50%;transform:translateY(-50%);pointer-events:none")}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" placeholder="Search your workshops…" style={css("width:100%;background:var(--surface);border:1px solid var(--border);color:var(--text);font-size:14px;font-family:inherit;padding:10px 44px 10px 40px;border-radius:999px;transition:border-color .2s,box-shadow .2s")} />
            <span style={css("position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:11px;font-weight:600;color:var(--faint);background:var(--surface2);border:1px solid var(--border);padding:2px 7px;border-radius:6px")}>⌘K</span>
          </div>
        </div>
        <div style={css("display:flex;align-items:center;gap:12px;flex:none")}>
          <button type="button" aria-label="Theme" style={css("display:none;width:38px;height:38px;border-radius:999px;background:var(--surface);border:1px solid var(--border);color:var(--muted);align-items:center;justify-content:center;cursor:pointer;transition:border-color .2s,color .2s")}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.2" y1="4.2" x2="5.6" y2="5.6" /><line x1="18.4" y1="18.4" x2="19.8" y2="19.8" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.2" y1="19.8" x2="5.6" y2="18.4" /><line x1="18.4" y1="5.6" x2="19.8" y2="4.2" /></svg>
          </button>
          <Box as="button" type="button" aria-label="Notifications" style="width:38px;height:38px;border-radius:999px;background:var(--surface);border:1px solid var(--border);color:var(--muted);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:border-color .2s,color .2s" hover="border-color:rgba(255,255,255,0.28);color:var(--text)">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
          </Box>
          {/* Default user avatar (placeholder until real profile images are wired up) */}
          <span style={css("width:34px;height:34px;border-radius:999px;flex:none;border:1px solid var(--border);background:var(--surface);color:var(--muted);display:flex;align-items:center;justify-content:center")} aria-label="Profile">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </span>
          <button type="button" onClick={onSignOut} className="btn btn--tertiary btn--sm">Sign out</button>
        </div>
      </div>
    </nav>
  );
}
