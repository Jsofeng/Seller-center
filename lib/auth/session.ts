import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export const getCurrentSession = cache(async () => {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
});

export const getCurrentUser = cache(async () => {
  const session = await getCurrentSession();
  return session?.user ?? null;
});

