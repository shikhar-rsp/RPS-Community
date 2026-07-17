import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Root entry point. Signed-out visitors land on the sign-in page; signed-in
// users go straight to their dashboard. The workshop marketing page lives at
// /workshop.
export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/dashboard" : "/signin");
}
