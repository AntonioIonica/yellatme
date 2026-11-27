import { test, expect } from "@playwright/test";

test("Should display the user's account informations", async ({ page }) => {
  await page.goto("/dashboard/settings");

  await expect(page.getByText("E2E Test User")).toBeVisible();
  await expect(page.locator("#payment").getByText("PRO plan")).toBeVisible();

  await expect(
    page.locator('[data-slot="card-title"]').getByText("Profile"),
  ).toBeVisible();
  await expect(
    page.locator('[data-slot="card-title"]').getByText("Subscription plan"),
  ).toBeVisible();
  await expect(
    page.locator('[data-slot="card-title"]').getByText("Payment method"),
  ).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Delete account" }),
  ).toBeEnabled();
});
