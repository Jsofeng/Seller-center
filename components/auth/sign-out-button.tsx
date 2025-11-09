"use client";

import { useMemo, useTransition } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export function SignOutButton() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await supabase.auth.signOut();
      router.replace("/login");
      router.refresh();
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      className="w-full justify-start gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      onClick={handleSignOut}
      disabled={isPending}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      Sign out
    </Button>
  );
}

