import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProductsView } from "@/components/products/products-view";
import { getCurrentUser } from "@/lib/auth/session";
import { getProductsBySeller } from "@/lib/products";

export const metadata: Metadata = {
  title: "Products",
};

export default async function ProductsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { data: products, error } = await getProductsBySeller(user.id);

  if (error) {
    console.error("Failed to load products", error);
  }

  return (
    <ProductsView
      initialProducts={products ?? []}
      sellerName={user.user_metadata?.full_name ?? user.email}
    />
  );
}

