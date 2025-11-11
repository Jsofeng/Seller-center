"use server";

import { revalidatePath } from "next/cache";

import { getCurrentServerUser } from "@/lib/auth/server";
import {
  createProduct,
  deleteProduct as deleteProductFromDb,
  updateProduct,
  type Product,
  type ProductIncotermInput,
  type ProductRecordInput,
} from "@/lib/products";
import { productFormSchema, type ProductFormValues } from "@/lib/validations/product";

type ProductActionResult =
  | { success: true; data: Product }
  | { error: string };

type DeleteProductResult = { success: true; id: string } | { error: string };

function normalizeDescription(value: string | null) {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toRecordInput(values: ProductFormValues): ProductRecordInput {
  const [primaryQuote] = values.incoterms;
  return {
    name: values.name.trim(),
    description: normalizeDescription(values.description),
    price: primaryQuote?.price ?? 0,
    currency: primaryQuote?.currency ?? "USD",
    status: values.status,
    inventory: values.inventory,
    category_id: values.categoryId,
    subcategory_id: values.subcategoryId,
    hs_code: values.hsCode,
    min_order_quantity: null,
    lead_time_days: null,
    packaging_length_cm: null,
    packaging_width_cm: null,
    packaging_height_cm: null,
    packaging_weight_kg: null,
    shipping_notes: null,
    moq: values.moq,
    cartons_per_moq: values.cartonsPerMoq ?? null,
    pallets_per_moq: values.palletsPerMoq ?? null,
    containers_20ft_per_moq: values.containers20ft ?? null,
    containers_40ft_per_moq: values.containers40ft ?? null,
  };
}

function toIncotermInputs(values: ProductFormValues): ProductIncotermInput[] {
  return values.incoterms.map((incoterm) => ({
    id: incoterm.id,
    term: incoterm.term,
    currency: incoterm.currency,
    price: incoterm.price,
    port: incoterm.port,
  }));
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

  const recordInput = toRecordInput(parsed.data);
  const incotermInputs = toIncotermInputs(parsed.data);

  if (!incotermInputs.length) {
    return { error: "Add at least one incoterm quote." };
  }

  const { data, error } = await createProduct(user.id, recordInput, incotermInputs);

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

  const recordInput = toRecordInput(parsed.data);
  const incotermInputs = toIncotermInputs(parsed.data);
  const removedIncotermIds = parsed.data.removedIncotermIds ?? [];

  if (!incotermInputs.length) {
    return { error: "Add at least one incoterm quote." };
  }

  const { data, error } = await updateProduct(
    values.id,
    recordInput,
    incotermInputs,
    removedIncotermIds,
  );
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

