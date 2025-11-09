"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Database } from "@/types/database";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const profileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .max(120, "Name cannot exceed 120 characters")
    .optional()
    .or(z.literal("")),
  company_name: z
    .string()
    .trim()
    .max(120, "Company cannot exceed 120 characters")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,20}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(500, "Bio cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

type ProfileValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name ?? "",
      company_name: profile.company_name ?? "",
      phone: profile.phone ?? "",
      website: profile.website ?? "",
      bio: profile.bio ?? "",
    },
  });

  const getValue = (value: string | undefined | null) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  };

  const onSubmit = (values: ProfileValues) => {
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: profile.id,
            full_name: getValue(values.full_name ?? ""),
            company_name: getValue(values.company_name ?? ""),
            phone: getValue(values.phone ?? ""),
            website: getValue(values.website ?? ""),
            bio: getValue(values.bio ?? ""),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );

      if (updateError) {
        setError(updateError.message);
        toast.error(updateError.message);
        return;
      }

      form.reset({
        full_name: values.full_name?.trim() ?? "",
        company_name: values.company_name?.trim() ?? "",
        phone: values.phone?.trim() ?? "",
        website: values.website?.trim() ?? "",
        bio: values.bio?.trim() ?? "",
      });

      setSuccess("Profile updated successfully.");
      toast.success("Profile updated.");
    });
  };

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" {...form.register("full_name")} placeholder="Jane Doe" />
          {form.formState.errors.full_name ? (
            <p className="text-xs text-red-600">{form.formState.errors.full_name.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="company_name">Company</Label>
          <Input
            id="company_name"
            {...form.register("company_name")}
            placeholder="Myshop LLC"
          />
          {form.formState.errors.company_name ? (
            <p className="text-xs text-red-600">
              {form.formState.errors.company_name.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...form.register("phone")} placeholder="+1 555 0100" />
          {form.formState.errors.phone ? (
            <p className="text-xs text-red-600">{form.formState.errors.phone.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            {...form.register("website")}
            placeholder="https://www.myshop.com"
          />
          {form.formState.errors.website ? (
            <p className="text-xs text-red-600">{form.formState.errors.website.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          className="h-32"
          {...form.register("bio")}
          placeholder="Tell buyers about your brand and what makes your products special."
        />
        {form.formState.errors.bio ? (
          <p className="text-xs text-red-600">{form.formState.errors.bio.message}</p>
        ) : null}
      </div>

      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {success ? <Alert variant="success">{success}</Alert> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

