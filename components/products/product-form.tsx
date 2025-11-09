"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, type Resolver, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/lib/validations/product";

const currencies = ["USD", "EUR", "GBP", "CAD", "AUD"];
const statuses: ProductFormValues["status"][] = ["draft", "published", "archived"];

type ProductFormInputs = {
  id?: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  status: ProductFormValues["status"];
  inventory: string;
  image_url: string;
};

interface ProductFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<ProductFormValues>;
  error?: string | null;
  isSubmitting?: boolean;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({
  mode,
  initialValues,
  error,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProductFormInputs>({
    resolver: zodResolver(productFormSchema) as unknown as Resolver<ProductFormInputs>,
    defaultValues: {
      id: initialValues?.id,
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      price: initialValues?.price?.toString() ?? "",
      currency: initialValues?.currency ?? "USD",
      status: initialValues?.status ?? "draft",
      inventory:
        initialValues?.inventory !== undefined && initialValues?.inventory !== null
          ? initialValues.inventory.toString()
          : "",
      image_url: initialValues?.image_url ?? "",
    },
  });

  useEffect(() => {
    reset({
      id: initialValues?.id,
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      price: initialValues?.price?.toString() ?? "",
      currency: initialValues?.currency ?? "USD",
      status: initialValues?.status ?? "draft",
      inventory:
        initialValues?.inventory !== undefined && initialValues?.inventory !== null
          ? initialValues.inventory.toString()
          : "",
      image_url: initialValues?.image_url ?? "",
    });
  }, [initialValues, reset]);

  const submitHandler = handleSubmit(async (values) => {
    const parsed = productFormSchema.parse(values);
    await onSubmit(parsed);
  });

  return (
    <form onSubmit={submitHandler} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Product name</Label>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input
                id="name"
                placeholder="Premium cotton t-shirt"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors?.name ? (
            <p className="text-xs text-red-600">{errors.name.message as string}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <Textarea
                id="description"
                placeholder="Highlight key details buyers should know."
                className="h-28"
                value={field.value ?? ""}
                onChange={(event) => field.onChange(event.target.value)}
              />
            )}
          />
          {errors?.description ? (
            <p className="text-xs text-red-600">
              {errors.description.message as string}
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Appears on the product detail page. Keep it concise and descriptive.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Controller
            control={control}
            name="price"
            render={({ field }) => (
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={Number.isFinite(field.value) ? field.value : ""}
                onChange={(event) => field.onChange(event.target.value)}
                placeholder="39.00"
                inputMode="decimal"
              />
            )}
          />
          {errors?.price ? (
            <p className="text-xs text-red-600">{errors.price.message as string}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Controller
            control={control}
            name="currency"
            render={({ field }) => (
              <select
                id="currency"
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
                value={field.value}
                onChange={field.onChange}
              >
                {currencies.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            )}
          />
          {errors?.currency ? (
            <p className="text-xs text-red-600">{errors.currency.message as string}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <select
                id="status"
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
                value={field.value}
                onChange={(event) => field.onChange(event.target.value as ProductFormValues["status"])}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            )}
          />
          {errors?.status ? (
            <p className="text-xs text-red-600">{errors.status.message as string}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="inventory">Inventory</Label>
          <Controller
            control={control}
            name="inventory"
            render={({ field }) => (
              <Input
                id="inventory"
                type="number"
                min="0"
                value={field.value ?? ""}
                onChange={(event) => field.onChange(event.target.value)}
                placeholder="Optional"
              />
            )}
          />
          {errors?.inventory ? (
            <p className="text-xs text-red-600">
              {errors.inventory.message as string}
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Leave empty if inventory is unlimited or managed elsewhere.
            </p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="image_url">Image URL</Label>
          <Controller
            control={control}
            name="image_url"
            render={({ field }) => (
              <Input
                id="image_url"
                type="url"
                placeholder="https://cdn.myshop.com/products/example.jpg"
                value={field.value ?? ""}
                onChange={(event) => field.onChange(event.target.value)}
              />
            )}
          />
          {errors?.image_url ? (
            <p className="text-xs text-red-600">
              {errors.image_url.message as string}
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Optional. Use a high-resolution image link.
            </p>
          )}
        </div>
      </div>

      {error ? <Alert variant="destructive">{error}</Alert> : null}

      <div className="flex flex-col-reverse items-stretch gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
          className="sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || (mode === "edit" && !isDirty)}
          className="sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              {mode === "edit" ? "Saving..." : "Creating..."}
            </>
          ) : mode === "edit" ? (
            "Save changes"
          ) : (
            "Create product"
          )}
        </Button>
      </div>
    </form>
  );
}

