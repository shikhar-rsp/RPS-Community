"use client";

import { useEffect } from "react";
import { RawPage } from "@/components/RawPage";
import { TopBar } from "@/components/TopBar";
import { css } from "@/lib/css";
import { workshopHtml } from "./workshop-markup";

// Workshop starts Saturday, July 25, 2026 at 3:00 PM (local time).
const WORKSHOP_START = new Date(2026, 6, 25, 15, 0, 0);

function formatCountdown(ms) {
  if (ms <= 0) return "· Live now";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const pad = (n) => String(n).padStart(2, "0");
  const clock = `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  return days > 0 ? `· starts in ${days}d ${clock}` : `· starts in ${clock}`;
}

// Vars mirror the workshop root so the shared TopBar inherits the same theme.
const WORKSHOP_VARS =
  "--bg:#141312;--surface:#1d1c1b;--surface2:#242322;--border:rgba(255,255,255,0.09);--text:#ECEBE9;--muted:#9a9993;--faint:#6e6d6a;--accent:#F5330A;background:var(--bg);color:var(--text);font-family:'Geist',-apple-system,BlinkMacSystemFont,sans-serif;min-height:100vh";

// Landing page — the "Opencanvas Workshop" marketing page.
export default function WorkshopPage() {
  useEffect(() => {
    const el = document.getElementById("workshop-countdown");
    if (!el) return;
    const tick = () => {
      el.textContent = formatCountdown(WORKSHOP_START.getTime() - Date.now());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pg-workshop" style={css(WORKSHOP_VARS)}>
      <TopBar active="workshops" />
      <RawPage html={workshopHtml} />
    </div>
  );
}
