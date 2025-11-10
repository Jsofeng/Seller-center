
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

type ReadonlyCookieStore = Awaited<ReturnType<typeof cookies>>;
type MutableCookieStore = ReadonlyCookieStore & {
  set: (options: { name: string; value: string } & Partial<CookieOptions>) => void;
};

function getCookieStore(): MutableCookieStore {
  const storeOrPromise = cookies();

  if (storeOrPromise instanceof Promise) {
    throw new Error("Invariant: cookies() returned a Promise. Ensure edge runtime is disabled for this route.");
  }

  const store = storeOrPromise as Partial<MutableCookieStore>;
  if (typeof store.set !== "function") {
    throw new Error("Invariant: cookies() returned a read-only store. Ensure this is called inside a Server Action or Route Handler.");
  }

  return store as MutableCookieStore;
}

export function createSupabaseServerClient(): SupabaseClient {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return getCookieStore().get(name);
        },
        set(name: string, value: string, options: CookieOptions) {
          getCookieStore().set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          getCookieStore().set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    },
  );
}