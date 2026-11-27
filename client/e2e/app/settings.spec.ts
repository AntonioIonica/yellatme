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

test("Should open and close the delete account dialog", async ({ page }) => {
  await page.goto("/dashboard/settings");

  await page.getByRole("button", { name: "Delete account" }).click();

  await expect(
    page.getByText("Delete your account", { exact: true }).first(),
  ).toBeVisible();

  await expect(
    page.getByText("Are you sure you want to delete your account?"),
  ).toBeVisible();

  await expect(
    page.getByRole("button", { name: "Delete account" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Cancel", exact: true }).click();

  await expect(
    page.getByText("Are you sure you want to delete your account?"),
  ).not.toBeVisible();
});

test("Should send a DELETE request when confirming delete account", async ({
  page,
}) => {
  let deleteRequested = false;

  await page.route("**/api/v1/users/*", async (route) => {
    if (route.request().method() !== "DELETE") {
      return route.continue();
    }

    deleteRequested = true;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "Account deleted successfully!",
        redirect: "/",
      }),
    });
  });

  await page.goto("/dashboard/settings");

  await page.getByRole("button", { name: "Delete account" }).click();

  await expect(
    page.getByText("Delete your account", { exact: true }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Delete account" }).last().click();

  await expect.poll(() => deleteRequested).toBe(true);

  await expect(page).toHaveURL("/");
});

test("Should modify account name", async ({ page }) => {
  await page.goto("/dashboard/settings");

  const accName = page.getByLabel("Name:", { exact: true });

  await accName.clear();

  await accName.fill("AntonioI");

  await expect(accName).toHaveValue("AntonioI");
});
