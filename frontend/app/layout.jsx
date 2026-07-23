import "./globals.css";

export const metadata = {
  title: "Cohorts",
  description: "Live workshops, an honest community, and assessments from senior designers.",
};

// Render on request, not at build time. These pages are auth-driven and use the
// Supabase client at runtime, so there's nothing to gain from static prerender —
// and prerendering would try to build a Supabase client before env vars exist.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
