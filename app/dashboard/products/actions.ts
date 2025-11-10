"use server";

import { revalidatePath } from "next/cache";

import { getCurrentServerUser } from "@/lib/auth/server";
import {
  createProduct,
  deleteProduct as deleteProductFromDb,
  updateProduct,
  type Product,
  type ProductInput,
} from "@/lib/products";
import { productFormSchema, type ProductFormValues } from "@/lib/validations/product";

type ProductActionResult =
  | { success: true; data: Product }
  | { error: string };

type DeleteProductResult = { success: true; id: string } | { error: string };

function toProductInput(values: ProductFormValues): ProductInput {
  return {
    name: values.name.trim(),
    description: values.description ?? null,
    price: values.price,
    currency: values.currency,
    status: values.status,
    inventory: values.inventory,
    image_url: values.image_url ?? null,
  };
}

export async function createProductAction(
  values: ProductFormValues,
): Promise<ProductActionResult> {
  const user = await getCurrentServerUser();
  if (!user) {
    return { error: "You must be signed in to create products." };
  }

  const parsed = productFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors.join(". ") || "Invalid product data." };
  }

  const { data, error } = await createProduct(user.id, toProductInput(parsed.data));

  if (error) {
    return { error: error.message };
  }

  if (!data) {
    return { error: "Unable to create product." };
  }

  revalidatePath("/dashboard/products");
  return { success: true, data };
}

export async function updateProductAction(
  values: ProductFormValues,
): Promise<ProductActionResult> {
  const user = await getCurrentServerUser();
  if (!user) {
    return { error: "You must be signed in to update products." };
  }

  if (!values.id) {
    return { error: "Missing product identifier." };
  }

  const parsed = productFormSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.flatten().formErrors.join(". ") || "Invalid product data." };
  }

  const { data, error } = await updateProduct(values.id, toProductInput(parsed.data));
  if (error) {
    return { error: error.message };
  }

  if (!data) {
    return { error: "Unable to update product." };
  }

  if (data.seller_id !== user.id) {
    return { error: "You are not allowed to update this product." };
  }

  revalidatePath("/dashboard/products");
  return { success: true, data };
}

export async function deleteProductAction(id: string): Promise<DeleteProductResult> {
  const user = await getCurrentServerUser();
  if (!user) {
    return { error: "You must be signed in to delete products." };
  }

  if (!id) {
    return { error: "Missing product identifier." };
  }

  const { error } = await deleteProductFromDb(id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/products");
  return { success: true, id };
}

