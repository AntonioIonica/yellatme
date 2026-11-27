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

test("Should initiate checkout when a Free plan user clicks Manage plan button", async ({
  page,
}) => {
  await page.goto("/dashboard/settings");

  await page.route("**/api/billing/checkout", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ url: "/dashboard?checkout=test" }),
    });
  });

  const checkoutRequest = page.waitForRequest(
    (request) =>
      request.url().includes("/api/billing/checkout") &&
      request.method() === "POST",
  );

  await page
    .locator("#payment")
    .getByRole("button", { name: "Manage plan" })
    .click();

  await checkoutRequest;

  await expect(page).toHaveURL(/checkout=test/);
});
