import { test, expect } from "@playwright/test";

test("Should display the dashboard correctly", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await expect(page.getByText("Monthly spend", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Yearly projection", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Active subscriptions", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Upcoming renewals (30 days)", { exact: true }),
  ).toBeVisible();
});
