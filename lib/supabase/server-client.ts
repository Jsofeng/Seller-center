
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function getMutableCookieStore() {
  const store = cookies();

  if (store instanceof Promise) {
    throw new Error(
      "Invariant: cookies() returned a Promise. Ensure this helper is not called in the edge runtime.",
    );
  }

  return store;
}

export function createSupabaseServerClient(): SupabaseClient {
  const cookieStore = getMutableCookieStore();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set?.({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set?.({ name, value: "", ...options, maxAge: 0 });
        },
      },
    },
  );
}