import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { Database } from "@/types/database";

export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
export type SubcategoryRow = Database["public"]["Tables"]["subcategories"]["Row"];

export interface CategoryWithChildren extends CategoryRow {
  subcategories: SubcategoryRow[];
}

export async function getAllCategories(): Promise<CategoryWithChildren[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*, subcategories(*)")
    .order("name", { ascending: true })
    .order("name", { foreignTable: "subcategories", ascending: true });

  if (error) {
    console.error("[getAllCategories] Failed to load categories", error);
    return [];
  }

  return (
    data?.map((category) => ({
      ...category,
      subcategories: category.subcategories ?? [],
    })) ?? []
  );
}

