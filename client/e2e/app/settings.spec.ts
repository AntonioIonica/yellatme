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

test("Should allow a Pro user to open the cancellation dialog", async ({
  page,
}) => {
  await page.goto("/dashboard/settings");

  const planCard = page.locator("#payment");

  await expect(planCard.getByText("PRO plan")).toBeVisible();

  await planCard.getByRole("button", { name: "Manage plan" }).click();

  await expect(page.getByText("Switch to free plan")).toBeVisible();

  await expect(
    page.getByText(/Are you sure you want to cancel your subscription/),
  ).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Confirm change" }),
  ).toBeVisible();

  await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
});

test("Should close the cancellation dialog without changing the plan", async ({
  page,
}) => {
  await page.goto("/dashboard/settings");

  const planCard = page.locator("#payment");

  await planCard.getByRole("button", { name: "Manage plan" }).click();

  await expect(page.getByText("Switch to free plan")).toBeVisible();

  await page.getByRole("button", { name: "Cancel", exact: true }).click();

  await expect(page.getByText("Switch to free plan")).not.toBeVisible();

  await expect(planCard.getByText("PRO plan")).toBeVisible();
});
