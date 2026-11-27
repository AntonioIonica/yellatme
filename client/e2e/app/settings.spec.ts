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

test("Should display the correct PRO plan details", async ({ page }) => {
  await page.goto("/dashboard/settings");

  const planCard = page.locator("#payment");

  await expect(planCard.getByText("PRO plan")).toBeVisible();
  await expect(planCard.getByText("Unlimited subscriptions")).toBeVisible();
  await expect(planCard.getByText("Advanced analytics")).toBeVisible();
  await expect(planCard.getByText("Priority support")).toBeVisible();
});
