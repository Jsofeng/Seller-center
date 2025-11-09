import { expect, test } from "@playwright/test";

const sellerEmail = process.env.E2E_SELLER_EMAIL;
const sellerPassword = process.env.E2E_SELLER_PASSWORD;

test.describe("product management", () => {
  test.skip(!sellerEmail || !sellerPassword, "E2E credentials not configured");

  test("seller can create a product", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill(sellerEmail!);
    await page.getByLabel("Password").fill(sellerPassword!);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/dashboard\/products/);
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();

    await page.getByRole("button", { name: "Add product" }).click();

    const productName = `Test Product ${Date.now()}`;

    await page.getByLabel("Product name").fill(productName);
    await page.getByLabel("Description").fill("Automated test product description.");
    await page.getByLabel("Price").fill("49.99");
    await page.getByLabel("Currency").selectOption("USD");
    await page.getByLabel("Status").selectOption("published");
    await page.getByLabel("Inventory").fill("10");

    await page.getByRole("button", { name: "Create product" }).click();

    await expect(page.getByText(`${productName}`)).toBeVisible();
  });
});

