import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Routes that require an authenticated user.
// Matched on a path boundary, not a bare prefix: "/workshop" is the members'
// page and stays gated, while the public listing at "/workshops" and the
// public detail pages under "/workshops/<slug>" must stay browsable — the
// gate there fires on the action (enrol, watch, download), not the page.
const PROTECTED = ["/dashboard", "/workshop"];
// Auth routes an already-signed-in user shouldn't see.
const AUTH_ROUTES = ["/signin"];

const matches = (pathname, base) => pathname === base || pathname.startsWith(base + "/");

export async function updateSession(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: refreshes the auth token; do not run other logic between
  // createServerClient and getUser.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.some((p) => matches(pathname, p));
  const isAuthRoute = AUTH_ROUTES.some((p) => matches(pathname, p));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    // Honour the ?next the gated action carried in, so someone who was already
    // signed in lands back on the workshop they were enrolling for rather than
    // being dropped on the dashboard. Relative paths only — an absolute URL
    // here would be an open redirect.
    const next = request.nextUrl.searchParams.get("next");
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      const target = new URL(next, request.url);
      url.pathname = target.pathname;
      url.search = target.search;
      url.hash = target.hash;
    }
    return NextResponse.redirect(url);
  }

  return response;
}
