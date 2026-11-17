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

test("Should display user's information", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page.getByText("E2E Test User")).toBeVisible();

  await expect(page.getByText("e2e-test@example.com")).toBeVisible();

  await expect(page.getByText("FREE plan")).toBeVisible();

  await expect(page.getByText("Tokens: 5")).toBeVisible();
});

test("Should open the Add subscription dialog", async ({ page }) => {
  await page.goto("/dashboard");

  await page.getByRole("button", { name: "Add subscription" }).click();

  await expect(page.getByRole("dialog")).toBeVisible();
});

test("Should close the Add subscription dialog", async ({ page }) => {
  await page.goto("/dashboard");

  await page.getByRole("button", { name: "Add subscription" }).click();

  await expect(page.getByRole("dialog")).toBeVisible();

  await page.getByRole("button", { name: "Close" }).click();

  await expect(page.getByRole("dialog")).not.toBeVisible();
});
