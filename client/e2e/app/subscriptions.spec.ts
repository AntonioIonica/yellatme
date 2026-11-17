import { test, expect } from "@playwright/test";

test("Should display the subscriptions page correctly", async ({ page }) => {
  await page.goto("/dashboard/subscriptions");

  await expect(
    page.getByRole("heading", { name: "Subscriptions" }),
  ).toBeVisible();
});

test("Should open the Add subscription dialog", async ({ page }) => {
  await page.goto("/dashboard/subscriptions");

  await page.getByRole("button", { name: "Add subscription" }).click();

  await expect(page.getByRole("dialog")).toBeVisible();
});

test("Should close the Add subscription dialog", async ({ page }) => {
  await page.goto("/dashboard/subscriptions");

  await page.getByRole("button", { name: "Add subscription" }).click();

  await expect(page.getByRole("dialog")).toBeVisible();

  await page.getByRole("button", { name: "Close" }).click();

  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("Should allow users to search subscriptions", async ({ page }) => {
  await page.goto("/dashboard/subscriptions");

  const searchInput = page.getByPlaceholder("Search subscriptions...");

  await searchInput.fill("Netflix");

  await expect(searchInput).toHaveValue("Netflix");
});
