import { expect, test } from "@playwright/test";

const sellerEmail = process.env.E2E_SELLER_EMAIL;
const sellerPassword = process.env.E2E_SELLER_PASSWORD;

test.describe("product management", () => {
  test.skip(!sellerEmail || !sellerPassword, "E2E credentials not configured");

  test("seller can create a product", async ({ page }) => {
    test.skip(true, "Product creation e2e needs seeded categories and storage fixtures");
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
    await page.getByLabel("MOQ (pieces)").fill("500");
    await page.getByLabel("Currency").selectOption("USD");
    await page.getByLabel("Price").fill("49.99");
    await page.getByLabel("Term").selectOption("FOB");
    await page.getByLabel("Port").selectOption("Ningbo Port");

    await page.getByRole("button", { name: "Create product" }).click();

    await expect(page.getByText(`${productName}`)).toBeVisible();
  });
});

