"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/app/dashboard/products/actions";
import { ProductForm } from "@/components/products/product-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal } from "@/components/ui/dialog";
import type { Product } from "@/lib/products";
import type { ProductFormValues } from "@/lib/validations/product";

interface ProductsViewProps {
  initialProducts: Product[];
  sellerName: string | null;
}

type ProductFormMode = "create" | "edit";

const statusVariant: Record<Product["status"], "default" | "success" | "warning"> = {
  draft: "warning",
  published: "success",
  archived: "default",
};

export function ProductsView({ initialProducts, sellerName }: ProductsViewProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<ProductFormMode>("create");
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const heading = useMemo(() => {
    if (formMode === "edit" && activeProduct) {
      return `Edit ${activeProduct.name}`;
    }
    return "Add product";
  }, [formMode, activeProduct]);

  const openCreateForm = () => {
    setActiveProduct(null);
    setFormMode("create");
    setFormError(null);
    setFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setActiveProduct(product);
    setFormMode("edit");
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setActiveProduct(null);
    setFormError(null);
    setIsSubmitting(false);
  };

  const handleSubmit = async (values: ProductFormValues) => {
    setFormError(null);
    setIsSubmitting(true);
    const payload = formMode === "edit" ? { ...values, id: activeProduct?.id } : values;

    if (formMode === "edit" && !payload.id) {
      setFormError("Product ID is missing.");
      setIsSubmitting(false);
      return;
    }

    const result =
      formMode === "edit"
        ? await updateProductAction(payload)
        : await createProductAction(payload);

    if ("error" in result) {
      setFormError(result.error);
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }

    const product = result.data;

    if (formMode === "edit") {
      setProducts((prev) =>
        prev.map((item) => (item.id === product.id ? product : item)),
      );
      toast.success(`${product.name} updated.`);
    } else {
      setProducts((prev) => [product, ...prev]);
      toast.success(`${product.name} created.`);
    }

    setIsSubmitting(false);
    closeForm();
    router.refresh();
  };

  const handleDelete = (product: Product) => {
    setPendingDeleteId(product.id);
    startDeleteTransition(async () => {
      const result = await deleteProductAction(product.id);
      if ("error" in result) {
        toast.error(result.error);
        setPendingDeleteId(null);
        return;
      }
      setProducts((prev) => prev.filter((item) => item.id !== product.id));
      toast.success(`${product.name} deleted.`);
      setPendingDeleteId(null);
      router.refresh();
    });
  };

  const emptyState = products.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
          <p className="text-sm text-slate-600">
            Manage your catalog and keep your listings up to date, {sellerName}.
          </p>
        </div>
        <Button onClick={openCreateForm} className="self-start sm:self-auto">
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Add product
        </Button>
      </div>
      {emptyState ? (
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-xl">No products yet</CardTitle>
            <CardDescription>
              Start by adding your first product. You can always save as draft and publish later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={openCreateForm}>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Create a product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Inventory
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-900">{product.name}</p>
                      {product.description ? (
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {product.description}
                        </p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={statusVariant[product.status]}>{product.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {formatCurrency(product.price, product.currency)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {product.inventory ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditForm(product)}
                        className="text-slate-600 hover:text-slate-900"
                      >
                        <Pencil className="mr-1 h-4 w-4" aria-hidden="true" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product)}
                        disabled={isDeletePending && pendingDeleteId === product.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="mr-1 h-4 w-4" aria-hidden="true" />
                        {isDeletePending && pendingDeleteId === product.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={heading}
        description={
          formMode === "edit"
            ? "Update your listing details."
            : "Provide the details buyers will see on your listing."
        }
      >
        <ProductForm
          mode={formMode}
          initialValues={
            activeProduct
              ? {
                  id: activeProduct.id,
                  name: activeProduct.name,
                  description: activeProduct.description ?? "",
                  price: activeProduct.price,
                  currency: activeProduct.currency,
                  status: activeProduct.status,
                  inventory: activeProduct.inventory ?? null,
                  image_url: activeProduct.image_url ?? "",
                }
              : undefined
          }
          error={formError}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    }).format(amount ?? 0);
  } catch {
    return `$${amount?.toFixed(2) ?? "0.00"}`;
  }
}

