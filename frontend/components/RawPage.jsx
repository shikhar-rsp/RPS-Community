"use client";

import { useEffect, useRef } from "react";

// Renders a verbatim HTML string (preserving inline styles + SVGs exactly) and
// re-implements the two bits of DC-runtime behaviour the markup relies on:
//   1. [data-reveal] scroll-in animations (IntersectionObserver)
//   2. [style-hover] hover-only extra styles
export function RawPage({ html, className, style }) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // --- [style-hover] hover styling -------------------------------------
    const hoverEls = Array.from(root.querySelectorAll("[style-hover]"));
    const hoverCleanups = hoverEls.map((el) => {
      const extra = el.getAttribute("style-hover") || "";
      const base = el.getAttribute("style") || "";
      const enter = () => el.setAttribute("style", base + ";" + extra);
      const leave = () => el.setAttribute("style", base);
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
      return () => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      };
    });

    // --- [data-reveal] scroll-in animation -------------------------------
    const els = Array.from(root.querySelectorAll("[data-reveal]"));
    els.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(26px)";
      el.style.transition =
        "opacity .8s cubic-bezier(.16,.84,.44,1), transform .8s cubic-bezier(.16,.84,.44,1)";
      const d = el.getAttribute("data-reveal-delay");
      if (d) el.style.transitionDelay = d + "ms";
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.style.opacity = "1";
            e.target.style.transform = "none";
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    els.forEach((el) => io.observe(el));

    // Safety: ensure nothing stays hidden (no-scroll / print).
    const fallback = setTimeout(() => {
      els.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    }, 2200);
    const revealAll = () =>
      els.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    window.addEventListener("beforeprint", revealAll);

    return () => {
      io.disconnect();
      clearTimeout(fallback);
      window.removeEventListener("beforeprint", revealAll);
      hoverCleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
