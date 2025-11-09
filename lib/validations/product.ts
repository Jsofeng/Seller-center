import { z } from "zod";

const StatusEnum = z.enum(["draft", "published", "archived"]);

export const productFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(120, "Product name cannot exceed 120 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : null;
    })
    .nullable(),
  price: z.preprocess(
    (value) => {
      if (typeof value === "string") {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : value;
      }
      return value;
    },
    z.number({ required_error: "Price is required" }).min(
      0,
      "Price must be greater than or equal to 0",
    ),
  ),
  currency: z
    .string()
    .trim()
    .length(3, "Currency must be a 3-letter code")
    .transform((value) => value.toUpperCase()),
  status: StatusEnum,
  inventory: z.preprocess(
    (value) => {
      if (value === "" || value === undefined) {
        return null;
      }
      if (typeof value === "string") {
        const parsed = parseInt(value, 10);
        return Number.isFinite(parsed) ? parsed : value;
      }
      return value;
    },
    z
      .union([
        z.number().min(0, "Inventory cannot be negative"),
        z.null(),
      ])
      .transform((value) => value ?? null),
  ),
  image_url: z
    .string()
    .trim()
    .url("Enter a valid image URL")
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed ? trimmed : null;
    })
    .nullable(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

