import { expect, test } from "@playwright/test";

test.describe("authentication", () => {
  test("redirects home to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  test("protects dashboard routes for unauthenticated users", async ({ page }) => {
    await page.goto("/dashboard/products");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });
});

